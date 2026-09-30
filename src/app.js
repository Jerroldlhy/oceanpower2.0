// Plain JavaScript application controller: state, DOM events and local persistence.
import { blankOpportunity } from './data.js';
import { loadWorkspace, saveWorkspace, emptyFilter, translator, display, localDate, safeUrl, filterOpportunities } from './lib/workspace.js';
import { createReportWorkbook, downloadFile } from './lib/reports.js';
import { e, button, modal } from './ui.js';
import { layout, pages, settingsView } from './views/layout.js';
import { dashboardView, kpiView, tableView, opportunityFormView, projectDetailView } from './views/opportunities.js';
import { sourcesView, sourceModalView } from './views/sources.js';
import { competitorsView, competitorModalView } from './views/competitors.js';
import { reportView } from './views/reports.js';

export function createApp(root, options = {}) {
  const loaded = loadWorkspace({keepDemo:options.keepDemo === true});
  let workspace = loaded.workspace;
  let locale = 'zh-CN';
  try { locale = JSON.parse(localStorage.getItem('op-language')) === 'en' ? 'en' : 'zh-CN'; } catch { /* Use the default language. */ }
  const state = {
    locale, page:'dashboard', mobile:false, notification:false, query:'', filter:{...emptyFilter}, tablePage:0,
    draft:null, editingId:'', dirty:false, pending:null, formError:'', modal:null,
    sourceMode:'all', reportFilter:{...emptyFilter}, reportLanguage:locale, reportSnapshot:null,
    employeeName:'', exporting:false, storageError:false, toast:'',
    live:{loading:false,error:'',lastSynced:'',count:0,warnings:[]},
  };
  let toastTimer;
  let deferredRenderTimer;
  let pendingRender = false;
  let destroyed = false;
  let modalTrigger = null;
  const originalOverflow = document.body.style.overflow;
  root.innerHTML = '<div data-region="alerts"></div><div data-region="page"></div><div data-region="modal"></div><div data-region="toast"></div>';
  const region = name => root.querySelector(`[data-region="${name}"]`);

  function context() {
    const t = translator(state.locale);
    return { state, workspace, t,
      ownerName: id => display(workspace.users.find(user => user.id === id)?.name, t),
      sourceName: id => {
        const source = workspace.sources.find(source => source.id === id);
        return source ? state.locale === 'zh-CN' ? source.name : source.englishName || t(source.labelKey) : t('notProvided');
      },
    };
  }

  // Remember a control by its data attributes rather than by a replaced DOM node.
  function controlKey(element) {
    if (!element || !root.contains(element)) return null;
    if (element.dataset.focus) return { focus:element.dataset.focus };
    if (element.dataset.action) return { action:element.dataset.action, value:element.dataset.value || '' };
    return null;
  }
  function findControl(key) {
    if (!key) return null;
    return [...root.querySelectorAll('[data-focus],[data-action]')].find(node => key.focus
      ? node.dataset.focus === key.focus
      : node.dataset.action === key.action && (node.dataset.value || '') === key.value);
  }

  function render() {
    if (destroyed) return;
    if (document.activeElement?.name === 'search') {
      pendingRender = true;
      return;
    }
    pendingRender = false;
    const active = document.activeElement;
    const focus = controlKey(active);
    const cursor = typeof active?.selectionStart === 'number' ? [active.selectionStart,active.selectionEnd] : null;
    const scrolls = [...root.querySelectorAll('.table-scroll,.detail-body')].map(node => [node.scrollLeft,node.scrollTop]);
    const c = context();
    const t = c.t;
    let content = '';
    if (state.page === 'dashboard') content = dashboardView(c);
    if (['opportunities','saved','tenders'].includes(state.page)) content = (state.page === 'tenders' ? kpiView(c) : '') + tableView(c);
    if (state.page === 'add') content = opportunityFormView(c);
    if (state.page === 'sources') content = sourcesView(c);
    if (state.page === 'competitors') content = competitorsView(c);
    if (state.page === 'reports') content = reportView(c);
    if (state.page === 'settings') content = settingsView(c);
    region('page').innerHTML = layout(c, content);
    let drawer = '';
    if (state.pending) drawer = modal(t,t('unsaved'),`<div class="detail-body"><p>${e(t('unsavedBody'))}</p><div class="form-actions">${button(t('keepEditing'),'keep-editing','',{outline:true})}${button(t('discard'),'discard')}</div></div>`);
    else if (state.modal?.type === 'project') drawer = projectDetailView(c);
    else if (state.modal?.type.startsWith('source-')) drawer = sourceModalView(c);
    else if (state.modal?.type === 'competitor') drawer = competitorModalView(c);
    region('modal').innerHTML = drawer;
    document.body.style.overflow = drawer ? 'hidden' : originalOverflow;
    document.documentElement.lang = state.locale;
    region('alerts').innerHTML = state.storageError || loaded.issue
      ? `<div class="storage-warning" role="alert">${e(t(state.storageError?'storageError':'loadError'))}</div>` : '';
    renderToast();
    [...root.querySelectorAll('.table-scroll,.detail-body')].forEach((node,i) => {
      if(scrolls[i]) [node.scrollLeft,node.scrollTop] = scrolls[i];
    });
    let control = findControl(focus);
    // Opening a drawer moves focus inside it; further edits retain their control.
    if (drawer && (!control || !region('modal').contains(control))) control = region('modal').querySelector('button');
    control?.focus({preventScroll:true});
    if (cursor && control?.setSelectionRange && ['text','search','url','tel','password','textarea'].includes(control.type)) {
      control.setSelectionRange(...cursor);
    }
  }

  function renderToast() {
    const t = translator(state.locale);
    region('toast').innerHTML = state.toast ? `<div class="toast" role="status">${e(t(state.toast))}<button type="button" data-action="dismiss-toast" aria-label="${e(t('close'))}">×</button></div>` : '';
  }
  function renderSearchResults() {
    const current = root.querySelector('.opportunity-card');
    if (!current) { render(); return; }
    const template = document.createElement('template');
    template.innerHTML = tableView(context()).trim();
    const next = template.content.firstElementChild;
    if (next) current.replaceWith(next);
    const clear = root.querySelector('[data-action="clear-search"]');
    if (clear) clear.hidden = !state.query;
  }
  function notify(key) {
    state.toast = key;
    clearTimeout(toastTimer);
    renderToast();
    toastTimer = setTimeout(() => { if(!destroyed){state.toast='';renderToast();} },4500);
  }
  function persist(next) {
    try {
      saveWorkspace(next);
      workspace = next;
      state.storageError = false;
      loaded.issue = false;
      return true;
    } catch {
      state.storageError = true;
      render();
      return false;
    }
  }
  function go(page) {
    if (!pages.includes(page)) return;
    state.page = page;
    state.mobile = false;
    state.query = '';
    state.filter = {...emptyFilter};
    state.tablePage = 0;
    state.modal = null;
    state.formError = '';
    if (page === 'add') {
      state.editingId = '';
      state.draft = {...blankOpportunity(),ownerId:workspace.currentUserId};
    }
    if (page === 'reports') {
      state.reportFilter = {...emptyFilter};
      state.reportLanguage = state.locale;
      state.reportSnapshot = null;
    }
    render();
  }
  function navigate(page) {
    if (state.dirty) { state.pending = page; render(); }
    else go(page);
  }
  function openProject(id) {
    if(!workspace.opportunities.some(p=>p.id===id))return;
    state.modal = {type:'project',id,tab:'overview',activityDate:localDate(),activityText:'',documentName:'',documentUrl:'',error:''};
    render();
  }
  function closeModal() {
    if (state.pending) state.pending = null;
    else state.modal = null;
    render();
    findControl(modalTrigger)?.focus({preventScroll:true});
  }
  function saveProject(record) {
    if (!persist({...workspace,opportunities:workspace.opportunities.map(p=>p.id===record.id?record:p)})) return false;
    notify('savedSuccess');
    render();
    return true;
  }
  function activityEntry(kind,text='',date=new Date().toISOString()) {
    return {id:crypto.randomUUID(),date,authorId:workspace.currentUserId,text,kind};
  }

  function toLiveOpportunity(item, fetchedAt) {
    const createdAt = item.publishedDate ? `${item.publishedDate}T00:00:00.000Z` : fetchedAt;
    return {
      ...blankOpportunity(), id:item.id, isLive:true, name:item.title, nameZh:item.title, nameEn:item.title,
      province:item.province, buyer:item.buyer, noticeTitle:item.title, sourceId:'ccgp', sourceUrl:item.sourceUrl,
      publishedDate:item.publishedDate, rebar:{...blankOpportunity().rebar,type:item.rebarType},
      priority:'medium', ownerId:workspace.currentUserId, status:'new', createdAt, updatedAt:fetchedAt, lastSeenAt:fetchedAt,
      technicalNotes:item.agency ? `Procurement agency: ${item.agency}` : '',
      activities:[{id:`${item.id}-discovered`,date:fetchedAt,authorId:workspace.currentUserId,text:'',kind:'created'}],
    };
  }

  async function syncLive() {
    if(state.live.loading)return;
    state.live={...state.live,loading:true,error:''};render();
    try {
      const response=await fetch('/api/live-opportunities',{headers:{accept:'application/json'}});
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.error||'Live source unavailable');
      const existing=new Map(workspace.opportunities.filter(p=>p.isLive).map(p=>[p.sourceUrl,p]));
      const incoming=payload.items.map(item=>{
        const fresh=toLiveOpportunity(item,payload.fetchedAt);
        const prior=existing.get(item.sourceUrl);
        return prior?{...prior,name:fresh.name,nameZh:fresh.nameZh,nameEn:fresh.nameEn,buyer:fresh.buyer,province:fresh.province||prior.province,publishedDate:fresh.publishedDate||prior.publishedDate,rebar:{...prior.rebar,type:fresh.rebar.type},updatedAt:payload.fetchedAt,lastSeenAt:payload.fetchedAt}:fresh;
      });
      const incomingUrls=new Set(incoming.map(item=>item.sourceUrl));
      const retained=workspace.opportunities.filter(item=>!item.isDemo&&!incomingUrls.has(item.sourceUrl));
      if(!persist({...workspace,opportunities:[...incoming,...retained]}))throw new Error('storage');
      state.live={loading:false,error:'',lastSynced:payload.fetchedAt,count:payload.items.length,warnings:payload.warnings||[]};
      notify(payload.items.length?'liveSyncComplete':'liveSyncEmpty');
    } catch(error) {
      state.live={...state.live,loading:false,error:error.message||'unavailable'};
    }
    render();
  }

  async function onClick(event) {
    const control=event.target.closest('[data-action]');
    if (!control || !root.contains(control) || control.disabled) return;
    event.preventDefault();
    const {action,value=''}=control.dataset;
    if (['open-project','source-check','source-edit','competitor-edit'].includes(action)) modalTrigger=controlKey(control);
    if (action==='navigate') return navigate(value);
    if (action==='language') {
      if(!['en','zh-CN'].includes(value))return;
      state.locale=value;
      try {localStorage.setItem('op-language',JSON.stringify(value));}catch{/* Language can still change for this session. */}
    }
    if (action==='mobile') state.mobile=!state.mobile;
    if (action==='notifications') state.notification=!state.notification;
    if (action==='dismiss-toast') {state.toast='';renderToast();return;}
    if (action==='sync-live') {syncLive();return;}
    if (action==='clear-search') {state.query='';state.tablePage=0;}
    if (action==='reset-filter') {
      if(value==='report'){state.reportFilter={...emptyFilter};state.reportSnapshot=null;}
      else {state.filter={...emptyFilter};state.tablePage=0;}
    }
    if (action==='pagination') state.tablePage=Math.max(0,state.tablePage+Number(value));
    if (action==='bookmark') persist({...workspace,savedIds:workspace.savedIds.includes(value)?workspace.savedIds.filter(id=>id!==value):[...workspace.savedIds,value]});
    if (action==='open-project') return openProject(value);
    if (action==='edit-project') {
      state.draft=structuredClone(workspace.opportunities.find(p=>p.id===value));
      state.editingId=value;state.page='add';state.modal=null;state.formError='';state.dirty=false;
    }
    if (action==='detail-tab' && state.modal?.type==='project') state.modal.tab=value;
    if (action==='close-modal') return closeModal();
    if (action==='keep-editing') state.pending=null;
    if (action==='discard') {const page=state.pending;state.pending=null;state.dirty=false;return go(page);}
    if (action==='source-mode') state.sourceMode=value;
    if (action==='source-check') state.modal={type:'source-check',id:value,checkedBy:workspace.currentUserId,found:'',error:''};
    if (action==='source-edit') state.modal={type:'source-edit',id:value,draft:structuredClone(workspace.sources.find(source=>source.id===value)),error:''};
    if (action==='competitor-edit') state.modal={type:'competitor',editing:!!value,error:'',draft:structuredClone(workspace.competitors.find(company=>company.id===value)||{id:crypto.randomUUID(),companyName:'',chineseName:'',country:'',website:'',rebarProducts:'',notes:'',relatedOpportunityIds:[],publicBidInformation:'',publicTenderResult:''})};
    if (action==='report-language') state.reportLanguage=value;
    if (action==='generate-report') {
      const f=state.reportFilter;
      if(f.from&&f.to&&f.from>f.to)return;
      state.reportSnapshot={workspace:structuredClone(workspace),date:new Date()};notify('reportReady');
    }
    if (action==='print') {window.print();return;}
    if (action==='backup') {
      downloadFile(JSON.stringify(workspace,null,2),'Oceanpower-Rebar-Workspace.json','application/json');notify('backupSaved');return;
    }
    if (action==='export-excel') {
      const snapshot=state.reportSnapshot;
      if(!snapshot || state.exporting)return;
      const records=filterOpportunities(snapshot.workspace.opportunities,state.reportFilter);
      const locales=state.reportLanguage==='both'?['zh-CN','en']:[state.reportLanguage];
      state.exporting=true;render();
      try {
        const bytes=await createReportWorkbook(records,snapshot.workspace,locales,snapshot.date);
        if(!destroyed){downloadFile(bytes,'Oceanpower-China-Rebar-Report.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');notify('exported');}
      } catch {if(!destroyed)notify('exportError');}
      finally {state.exporting=false;render();}
      return;
    }
    render();
  }

  // Editing forms updates the draft only, so typing never replaces the input node.
  function updateDraft(draft,name,control) {
    if (name.startsWith('rebar.')) {
      const key=name.slice(6);
      if(Object.hasOwn(draft.rebar,key)) draft.rebar[key]=control.value;
    } else if(Object.hasOwn(draft,name)) {
      if(control.type==='checkbox')draft[name]=control.checked?[...new Set([...draft[name],control.value])]:draft[name].filter(v=>v!==control.value);
      else draft[name]=control.value;
    }
  }
  function onInput(event) {
    const control=event.target;
    const name=control.name;
    if(!name)return;
    if(control.type==='checkbox' && event.type!=='change')return;
    if(name==='currentUser') {
      if(event.type==='change'&&workspace.users.some(u=>u.id===control.value)){persist({...workspace,currentUserId:control.value});render();}
      return;
    }
    if(name==='search'){state.query=control.value;state.tablePage=0;renderSearchResults();return;}
    if(name.startsWith('filter.')||name.startsWith('reportFilter.')) {
      const [group,key]=name.split('.');
      if(Object.hasOwn(state[group],key)){state[group][key]=control.value;state.tablePage=0;if(group==='reportFilter')state.reportSnapshot=null;render();}
      return;
    }
    if(name==='detail-products' && state.modal?.type==='project') {
      const p=workspace.opportunities.find(p=>p.id===state.modal.id);
      saveProject({...p,updatedAt:new Date().toISOString(),potentialProducts:control.checked?[...new Set([...p.potentialProducts,control.value])]:p.potentialProducts.filter(v=>v!==control.value),activities:[...p.activities,activityEntry('edited')]});
      return;
    }
    const form=control.closest('form')?.dataset.form;
    if(form==='opportunity'){updateDraft(state.draft,name,control);state.dirty=true;}
    if(form==='source-edit'||form==='competitor')updateDraft(state.modal.draft,name,control);
    if(['source-check','activity','document'].includes(form)&&Object.hasOwn(state.modal,name))state.modal[name]=control.value;
    if(form==='employee')state.employeeName=control.value;
  }

  function onFocusOut(event) {
    if (event.target.name !== 'search' || !pendingRender) return;
    clearTimeout(deferredRenderTimer);
    deferredRenderTimer = setTimeout(() => {
      if (!destroyed && pendingRender && document.activeElement?.name !== 'search') render();
    }, 0);
  }

  function onSubmit(event) {
    const form=event.target;
    const name=form.dataset.form;
    if(!name)return;
    event.preventDefault();
    if(!form.reportValidity())return;
    if(name==='opportunity') {
      const d=state.draft;
      const invalid=!d.name.trim()||!d.province||!d.ownerId||(d.sourceUrl&&!safeUrl(d.sourceUrl))||[d.budget,d.rebar.quantity].some(v=>v!==''&&(!Number.isFinite(Number(v))||Number(v)<0))||(d.publishedDate&&d.deadline&&d.publishedDate>d.deadline)||(d.bidOpeningDate&&d.deadline&&d.bidOpeningDate<d.deadline);
      if(invalid){state.formError='formError';render();return;}
      const record={...structuredClone(d),name:d.name.trim(),updatedAt:new Date().toISOString(),activities:[...d.activities,activityEntry(state.editingId?'edited':'created')]};
      const opportunities=state.editingId?workspace.opportunities.map(p=>p.id===record.id?record:p):[record,...workspace.opportunities];
      const competitors=workspace.competitors.map(company=>({...company,relatedOpportunityIds:record.competitorIds.includes(company.id)?[...new Set([...company.relatedOpportunityIds,record.id])]:company.relatedOpportunityIds.filter(id=>id!==record.id)}));
      if(persist({...workspace,opportunities,competitors})) {
        state.dirty=false;state.editingId='';state.page='opportunities';state.filter={...emptyFilter};state.query='';state.tablePage=0;notify('savedSuccess');openProject(record.id);
      }
      return;
    }
    if(name==='employee') {
      if(state.employeeName.trim()&&persist({...workspace,users:[...workspace.users,{id:crypto.randomUUID(),name:state.employeeName.trim()}]})){state.employeeName='';notify('savedSuccess');render();}return;
    }
    const m=state.modal;
    if(!m)return;
    if(name==='source-check') {
      if(!m.checkedBy||(m.found!==''&&(!Number.isInteger(Number(m.found))||Number(m.found)<0))){m.error='formError';render();return;}
      const source=workspace.sources.find(s=>s.id===m.id);
      const check={id:crypto.randomUUID(),checkedAt:new Date().toISOString(),checkedBy:m.checkedBy,opportunitiesFound:m.found===''?null:Number(m.found)};
      const updated={...source,lastChecked:check.checkedAt,checkedBy:check.checkedBy,opportunitiesFound:check.opportunitiesFound,checks:[...source.checks,check]};
      if(persist({...workspace,sources:workspace.sources.map(s=>s.id===source.id?updated:s)})){notify('sourceChecked');closeModal();}return;
    }
    if(name==='source-edit') {
      if(!safeUrl(m.draft.url)){m.error='invalidUrl';render();return;}
      if(persist({...workspace,sources:workspace.sources.map(source=>source.id===m.id?structuredClone(m.draft):source)})){notify('savedSuccess');closeModal();}return;
    }
    if(name==='competitor') {
      const d=m.draft;
      if(!d.companyName.trim()||(d.website&&!safeUrl(d.website))){m.error='formError';render();return;}
      const company=structuredClone(d);
      const companies=m.editing?workspace.competitors.map(item=>item.id===d.id?company:item):[...workspace.competitors,company];
      const opportunities=workspace.opportunities.map(p=>{
        const linked=d.relatedOpportunityIds.includes(p.id),wasLinked=p.competitorIds.includes(d.id);
        return linked===wasLinked?p:{...p,updatedAt:new Date().toISOString(),competitorIds:linked?[...p.competitorIds,d.id]:p.competitorIds.filter(id=>id!==d.id),activities:[...p.activities,activityEntry('edited')]};
      });
      if(persist({...workspace,competitors:companies,opportunities})){notify('savedSuccess');closeModal();}return;
    }
    const p=workspace.opportunities.find(p=>p.id===m.id);
    if(name==='activity') {
      if(!m.activityText.trim()||!m.activityDate)return;
      const entry=activityEntry('manual',m.activityText.trim(),new Date(m.activityDate+'T12:00:00').toISOString());
      if(saveProject({...p,updatedAt:new Date().toISOString(),activities:[...p.activities,entry]})){m.activityText='';render();}
    }
    if(name==='document') {
      if(!m.documentName.trim()||!safeUrl(m.documentUrl)){m.error='invalidUrl';render();return;}
      const document={id:crypto.randomUUID(),name:m.documentName.trim(),url:m.documentUrl};
      if(saveProject({...p,updatedAt:new Date().toISOString(),documents:[...p.documents,document]})){m.documentName='';m.documentUrl='';m.error='';render();}
    }
  }

  function onKeyDown(event) {
    const dialog=root.querySelector('[role="dialog"]');
    if(!dialog)return;
    if(event.key==='Escape'){event.preventDefault();closeModal();}
    if(event.key==='Tab') {
      const controls=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea,select,a[href]')];
      if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls.at(-1)?.focus();}
      else if(!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();controls[0]?.focus();}
    }
  }
  function beforeUnload(event) {if(state.dirty){event.preventDefault();event.returnValue='';}}
  root.addEventListener('click',onClick);
  root.addEventListener('input',onInput);
  root.addEventListener('change',onInput);
  root.addEventListener('focusout',onFocusOut);
  root.addEventListener('submit',onSubmit);
  document.addEventListener('keydown',onKeyDown);
  window.addEventListener('beforeunload',beforeUnload);
  render();
  return {
    syncLive,
    destroy() {
      destroyed=true;clearTimeout(toastTimer);clearTimeout(deferredRenderTimer);
      root.removeEventListener('click',onClick);root.removeEventListener('input',onInput);root.removeEventListener('change',onInput);root.removeEventListener('focusout',onFocusOut);root.removeEventListener('submit',onSubmit);
      document.removeEventListener('keydown',onKeyDown);window.removeEventListener('beforeunload',beforeUnload);
      document.body.style.overflow=originalOverflow;root.innerHTML='';
    },
  };
}
