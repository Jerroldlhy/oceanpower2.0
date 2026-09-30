import { e, icon, button, field, select, checkboxes, facts, link, modal } from '../ui.js';
import { provinces, rebarTypes, productCatalog } from '../data.js';
import { statuses } from '../models.js';
import { display, filterOpportunities, opportunityName, isDueSoon, safeUrl } from '../lib/workspace.js';

export const rebarFields = ['productName','diameter','quantity','unit','length','tensileStrength','shearStrength','elasticityModulus','resinType','technicalStandard','surfaceType','environment','otherRequirements'];

export function filtersView(c, report = false) {
  const {t, workspace:w} = c;
  const filter = report ? c.state.reportFilter : c.state.filter;
  const prefix = report ? 'reportFilter.' : 'filter.';
  const groups = [
    ['province','province',provinces.map(v=>[v,t(v)])],
    ['rebarType','rebarType',rebarTypes.map(v=>[v,t(v)])],
    ['status','status',statuses.map(v=>[v,t(v)])],
    ['owner','ownerId',w.users.map(u=>[u.id,c.ownerName(u.id)])],
    ['source','sourceId',w.sources.map(s=>[s.id,c.sourceName(s.id)])],
    ['priority','priority',['high','medium','low'].map(v=>[v,t(v)])],
  ];
  return `<div class="filter-bar manual-filters">${report?['from','to'].map(k=>field(t,k,prefix+k,filter[k],{type:'date'})).join(''):''}${groups.map(([label,key,options])=>select(t,label,prefix+key,filter[key],options,{all:true})).join('')}${button(t('reset'),'reset-filter',report?'report':'table',{outline:true})}</div>`;
}

export function tableView(c) {
  const {t, state:s, workspace:w}=c;
  const items=filterOpportunities(w.opportunities,s.filter,s.query).filter(p=>s.page!=='saved'||w.savedIds.includes(p.id));
  const size=5;
  s.tablePage=Math.min(s.tablePage,Math.max(0,Math.ceil(items.length/size)-1));
  const visible=items.slice(s.tablePage*size,(s.tablePage+1)*size);
  const columns=['project','province','city','buyer','rebarType','diameter','quantity','deadline','source','priority','status','owner','lastUpdated'];
  const liveStatus=s.live.loading?t('liveFetching'):s.live.error?t('liveUnavailable'):s.live.lastSynced?`${t('liveUpdated')} ${new Date(s.live.lastSynced).toLocaleString(s.locale)} · ${s.live.count} ${t('recordsFound')}`:t('liveNotChecked');
  const liveStatusView=s.live.loading?`<small class="live-status-loading"><span class="sr-only">${e(liveStatus)}</span><span aria-hidden="true"></span><span aria-hidden="true"></span></small>`:`<small>${e(liveStatus)}</small>`;
  return `<section class="card opportunity-card" aria-busy="${s.live.loading}"><div class="card-heading"><div><h2>${e(t('latest'))}</h2><p>${e(t('latestSub'))}</p></div>${s.page==='dashboard'?`<button type="button" class="text-link" data-action="navigate" data-value="opportunities">${e(t('viewAll'))}${icon('right',14)}</button>`:''}</div><div class="live-data-bar ${s.live.error?'has-error':''}" role="status" aria-live="polite"><div><span class="live-indicator"></span><strong>${e(t('officialFeed'))}</strong>${liveStatusView}</div>${button(t('refreshLive'),'sync-live','',{outline:true,small:true,disabled:s.live.loading})}</div>${filtersView(c)}
  <div class="table-scroll" tabindex="0" aria-label="${e(t('opportunities'))}"><table class="opportunity-table rebar-table"><thead><tr><th><span class="sr-only">${e(t('save'))}</span></th>${columns.map(k=>`<th>${e(t(k))}</th>`).join('')}</tr></thead><tbody>${visible.map(p=>{
    const saved=w.savedIds.includes(p.id);
    const sourceName=c.sourceName(p.sourceId);
    const noticeUrl=safeUrl(p.sourceUrl);
    const sourceCell=noticeUrl?`<a class="tender-source-link" href="${e(noticeUrl)}" target="_blank" rel="noopener noreferrer">${e(sourceName)}${icon('external',13)}</a>`:e(sourceName);
    return `<tr><td><button type="button" class="bookmark-button ${saved?'is-saved':''}" data-action="bookmark" data-value="${e(p.id)}" aria-label="${e(t(saved?'unsave':'save')+' '+opportunityName(p,s.locale))}">${icon('saved',16)}</button></td><td><button type="button" class="project-name" data-action="open-project" data-value="${e(p.id)}">${e(opportunityName(p,s.locale))}<small>${e(p.id)} · ${e(t(p.isLive?'liveRecord':p.isDemo?'demo':'manual'))}</small></button></td>${[p.province?t(p.province):t('notProvided'),display(p.city,t),display(p.buyer,t),t(p.rebar.type),display(p.rebar.diameter,t),p.rebar.quantity?`${p.rebar.quantity} ${p.rebar.unit}`:t('notProvided'),display(p.deadline,t)].map(v=>`<td>${e(v)}</td>`).join('')}<td>${sourceCell}</td><td><span class="badge ${e(p.priority)}">${e(t(p.priority))}</span></td><td><span class="badge neutral">${e(t(p.status))}</span></td><td>${e(c.ownerName(p.ownerId))}</td><td>${e(new Date(p.updatedAt).toLocaleDateString(s.locale))}</td></tr>`;
  }).join('')}</tbody></table></div>${!items.length?`<div class="empty-state"><h3>${e(t('noResults'))}</h3><p>${e(t('noResultsBody'))}</p></div>`:''}<div class="table-footer"><span>${e(t('showing'))} ${items.length?s.tablePage*size+1:0}–${Math.min((s.tablePage+1)*size,items.length)} ${e(t('of'))} ${items.length} ${e(t('projects'))}</span><div><button type="button" data-action="pagination" data-value="-1" aria-label="${e(t('previous'))}" ${s.tablePage===0?'disabled':''}>${icon('left',14)}</button><span>${s.tablePage+1}</span><button type="button" data-action="pagination" data-value="1" aria-label="${e(t('next'))}" ${(s.tablePage+1)*size>=items.length?'disabled':''}>${icon('right',14)}</button></div></div></section>`;
}

export function kpiView(c) {
  const {t,workspace:w}=c;
  const cards=[['newTenders',w.opportunities.filter(p=>p.status==='new').length,'opportunities','blue','new'],['following',w.opportunities.filter(p=>['worthFollowing','contacted','quotationPreparing','negotiating'].includes(p.status)).length,'competitors','green','followingHint'],['deadlineSoon',w.opportunities.filter(p=>isDueSoon(p)).length,'clock','amber','next7'],['quotationSubmitted',w.opportunities.filter(p=>p.status==='quotationSubmitted').length,'reports','purple','recordCount']];
  return `<div class="kpi-grid">${cards.map(([key,count,image,color,hint])=>`<div class="kpi-card"><div class="kpi-top"><span>${e(t(key))}</span><div class="kpi-icon ${color}">${icon(image,19)}</div></div><div class="kpi-value"><strong>${count}</strong></div><div class="kpi-foot">${e(t(hint))}</div></div>`).join('')}</div>`;
}

export function dashboardView(c) {
  const {t,workspace:w}=c;
  const counts=new Map();
  w.opportunities.forEach(p=>counts.set(p.province,(counts.get(p.province)||0)+1));
  const maximum=Math.max(1,...counts.values());
  return `${kpiView(c)}<div class="dashboard-grid"><div class="dashboard-left">${tableView(c)}<section class="manual-banner"><div class="manual-orb">${icon('tenders',25)}</div><div class="manual-banner-copy"><span>${e(t('scope'))}</span><h2>${e(t('checkSources'))}</h2><p>${e(t('sourcesSubtitle'))}</p></div><button type="button" data-action="navigate" data-value="sources">${e(t('sources'))}${icon('right',15)}</button></section></div><div class="dashboard-right"><section class="card chart-card"><div class="card-heading"><div><h2>${e(t('provinceChart'))}</h2><p>${e(t('chartSubtitle'))}</p></div></div><div class="chart-wrap"><div class="province-bars" role="img" aria-label="${e(t('provinceChart')+': '+[...counts].map(([key,value])=>t(key)+' '+value).join(', '))}">${[...counts].map(([key,value])=>`<div class="province-bar"><span>${value}</span><div class="bar-track"><div class="bar-fill" style="height:${value/maximum*100}%"></div></div><small>${e(t(key))}</small></div>`).join('')}</div></div></section><section class="card competitor-card"><div class="card-heading"><h2>${e(t('recentUpdates'))}</h2><button type="button" class="text-link" data-action="navigate" data-value="competitors">${e(t('viewAllShort'))}${icon('right',13)}</button></div><div class="competitor-list">${w.competitors.slice(0,3).map(item=>`<article><span class="competitor-dot"></span><div><div class="competitor-title"><h3>${e(item.companyName)}</h3></div><p>${e(t('notes'))}: ${e(display(item.notes,t))}</p></div></article>`).join('')}</div><div class="competitor-footer">${e(t('manual'))}</div></section></div></div><section class="card workflow"><div class="card-heading"><div><h2>${e(t('workflow'))}</h2><p>${e(t('workflowSub'))}</p></div><span class="small-label">01 — 05</span></div><div class="workflow-steps">${[['checkSources','sources'],['enterTender','pencil'],['followUp','competitors'],['prepareReport','reports'],['teamReview','shield']].map(([key,image],i)=>`<div class="workflow-step"><div class="step-icon">${icon(image,19)}<span>${i+1}</span></div><div><h4>${e(t(key))}</h4><p>${e(t(key+'Desc'))}</p></div>${i<4?icon('right',15):''}</div>`).join('')}</div></section>`;
}

export function opportunityFormView(c) {
  const {t,state:s,workspace:w}=c;
  const d=s.draft;
  const text=(key,options={})=>field(t,key==='name'?'project':key,key,d[key]?.startsWith('@')?display(d[key],t):d[key],options);
  const section=(key,body)=>`<section class="card form-section"><h2>${e(t(key))}</h2>${body}</section>`;
  const grid=body=>`<div class="form-grid">${body}</div>`;
  return `<form data-form="opportunity" class="opportunity-form"><p class="scope-note">${e(t('requiredHint'))}</p>${d.isDemo?`<p class="demo-notice">${e(t('demo'))}</p>`:''}${s.formError?`<p role="alert" class="form-error">${e(t(s.formError))}</p>`:''}
    ${section('basicInformation',grid(text('name',{required:true})+text('nameZh')+text('nameEn')+select(t,'province','province',d.province,provinces.map(v=>[v,t(v)]),{required:true})+['city','buyer','projectType','application'].map(k=>text(k)).join('')))}
    ${section('tenderInformation',grid(text('noticeTitle')+text('tenderNumber')+select(t,'sourceId','sourceId',d.sourceId,w.sources.map(item=>[item.id,c.sourceName(item.id)]))+text('sourceUrl',{type:'url'})+['publishedDate','deadline','bidOpeningDate'].map(k=>text(k,{type:'date'})).join('')+text('budget',{type:'number'})+text('currency')))}
    ${section('rebarInformation',grid(select(t,'rebarType','rebar.type',d.rebar.type,rebarTypes.map(v=>[v,t(v)]),{empty:false})+rebarFields.map(k=>field(t,k,'rebar.'+k,d.rebar[k],{type:k==='quantity'?'number':'text',multiline:k==='otherRequirements'})).join(''))+`<h3>${e(t('productReference'))}</h3><p>${e(t('humanSelected'))}</p>`+checkboxes(t,'potentialProducts','potentialProducts',d.potentialProducts,productCatalog.map(p=>[p,t(p)]))+`<p class="engineering-note">${e(t('disclaimer'))}</p>`)}
    ${section('businessInformation',grid(select(t,'priority','priority',d.priority,['high','medium','low'].map(v=>[v,t(v)]),{empty:false})+select(t,'owner','ownerId',d.ownerId,w.users.map(u=>[u.id,c.ownerName(u.id)]),{required:true})+['businessNotes','technicalNotes','missingInformation'].map(k=>text(k,{multiline:true})).join(''))+checkboxes(t,'competitors','competitorIds',d.competitorIds,w.competitors.map(item=>[item.id,item.companyName])))}
    ${section('status',select(t,'status','status',d.status,statuses.map(v=>[v,t(v)]),{empty:false})+`<p>${e(t('outcomeHint'))}</p>`)}
    <div class="form-actions">${button(t('cancel'),'navigate','opportunities',{outline:true})}${button(t(s.editingId?'saveChanges':'saveOpportunity'),null,'',{submit:true})}</div>
  </form>`;
}

export function projectDetailView(c) {
  const {t,state:s,workspace:w}=c;
  const p=w.opportunities.find(item=>item.id===s.modal.id);
  if(!p)return '';
  const m=s.modal;
  let body='';
  if(m.tab==='overview') body=facts(t,[['project',p.name],['nameZh',p.nameZh],['nameEn',p.nameEn],['province',p.province?'@'+p.province:''],['city',p.city],['buyer',p.buyer],['projectType',p.projectType],['application',p.application],['owner',c.ownerName(p.ownerId)],['createdAt',new Date(p.createdAt).toLocaleString(s.locale)],['lastUpdated',new Date(p.updatedAt).toLocaleString(s.locale)]])+`<div class="human-review"><h3>${e(t('productReference'))}</h3><p>${e(t('humanSelected'))}</p>${checkboxes(t,'potentialProducts','detail-products',p.potentialProducts,productCatalog.map(v=>[v,t(v)]))}</div>`;
  if(m.tab==='tenderInformation') body=facts(t,['noticeTitle','tenderNumber','publishedDate','deadline','bidOpeningDate','budget','currency'].map(k=>[k,p[k]]))+`<h3>${e(t('source'))}</h3><p>${e(c.sourceName(p.sourceId))}</p><h3>${e(t('sourceUrl'))}</h3>${link(t,p.sourceUrl)}`;
  if(m.tab==='rebarRequirements') body=facts(t,[['rebarType',t(p.rebar.type)],...rebarFields.map(k=>[k,p.rebar[k]])]);
  if(m.tab==='competitors') {
    const companies=w.competitors.filter(item=>p.competitorIds.includes(item.id)||item.relatedOpportunityIds.includes(p.id));
    body=companies.length?companies.map(item=>`<section class="detail-competitor"><h3>${e(item.companyName)}</h3>${facts(t,['rebarProducts','publicBidInformation','publicTenderResult','notes'].map(k=>[k,item[k]]))}</section>`).join(''):`<p>${e(t('noCompetitors'))}</p>`;
  }
  if(m.tab==='notes')body=facts(t,['businessNotes','technicalNotes','missingInformation'].map(k=>[k,p[k]]));
  if(m.tab==='documents')body=`<p>${e(t('documentHint'))}</p>${p.documents.length?p.documents.map(d=>`<div class="document-link"><strong>${e(d.name)}</strong>${link(t,d.url)}</div>`).join(''):`<p class="muted-note">${e(t('noDocuments'))}</p>`}<form data-form="document" class="inline-form">${field(t,'documentName','documentName',m.documentName,{required:true})}${field(t,'documentUrl','documentUrl',m.documentUrl,{required:true,type:'url'})}${m.error?`<p role="alert">${e(t(m.error))}</p>`:''}${button(t('addDocument'),null,'',{submit:true})}</form>`;
  if(m.tab==='activity')body=`<div class="timeline">${[...p.activities].sort((a,b)=>b.date.localeCompare(a.date)).map(a=>`<article><small>${e(new Date(a.date).toLocaleDateString(s.locale))} · ${e(c.ownerName(a.authorId))}</small><p>${e(a.kind==='manual'?a.text:t(a.kind))}</p></article>`).join('')}</div><form data-form="activity" class="inline-form">${field(t,'activityDate','activityDate',m.activityDate,{type:'date',required:true})}${field(t,'activityText','activityText',m.activityText,{multiline:true,required:true})}<p>${e(t('checkedBy'))}: ${e(c.ownerName(w.currentUserId))}</p>${button(t('addActivity'),null,'',{submit:true})}</form>`;
  return modal(t,opportunityName(p,s.locale),`<div class="detail-actions"><span class="badge neutral">${e(t(p.status))}</span><span class="badge ${e(p.priority)}">${e(t('priority'))}: ${e(t(p.priority))}</span><span class="badge neutral">${e(t(p.isDemo?'demo':'manual'))}</span>${button(t('edit'),'edit-project',p.id,{small:true})}</div><div class="detail-meta manual-detail-meta"><span>${e(t('owner'))}: ${e(c.ownerName(p.ownerId))}</span><span>${e(t('deadline'))}: ${e(display(p.deadline,t))}</span></div><div class="detail-tabs" role="tablist">${['overview','tenderInformation','rebarRequirements','competitors','documents','activity','notes'].map(k=>`<button type="button" role="tab" aria-selected="${m.tab===k}" class="${m.tab===k?'active':''}" data-action="detail-tab" data-value="${k}">${e(t(k))}</button>`).join('')}</div><div class="detail-body" role="tabpanel">${body}</div><footer class="detail-footer">${e(t('disclaimer'))}</footer>`);
}
