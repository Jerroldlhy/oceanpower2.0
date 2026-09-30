import { e, button, field, select, facts, link, modal } from '../ui.js';
import { localDate } from '../lib/workspace.js';
import { sourceCategories } from '../models.js';

export function sourcesView(c) {
  const {t,state:s,workspace:w}=c;
  const checkedToday=source=>!!source.lastChecked&&localDate(new Date(source.lastChecked))===localDate();
  const count=w.sources.filter(checkedToday).length;
  const sources=w.sources.filter(source=>s.sourceMode==='all'||(s.sourceMode==='today'?checkedToday(source):!checkedToday(source)));
  return `<section class="card source-controls"><div class="segmented">${[['all','allSources',w.sources.length],['today','checkedToday',count],['pending','needsChecking',w.sources.length-count]].map(([value,key,n])=>`<button type="button" data-action="source-mode" data-value="${value}" class="${s.sourceMode===value?'selected':''}">${e(t(key))} <b>${n}</b></button>`).join('')}</div><p>${e(t('sourceNote'))}</p></section><div class="source-grid">${sources.map(source=>`<section class="card source-card"><div class="card-heading"><div><h2>${e(c.sourceName(source.id))}</h2>${s.locale==='en'?`<p>${e(source.name)}</p>`:''}</div><span class="badge ${checkedToday(source)?'high':'medium'}">${e(t(checkedToday(source)?'checkedToday':'needsChecking'))}</span></div><div class="source-card-body">${facts(t,[['category',t(source.category)],['priority',source.priority?t(source.priority):''],['status',t(source.status)],['lastChecked',source.lastChecked?new Date(source.lastChecked).toLocaleString(s.locale):t('neverChecked')],['checkedBy',source.checkedBy?c.ownerName(source.checkedBy):''],['found',source.opportunitiesFound===null?'':String(source.opportunitiesFound)],['notes',source.notes]])}${link(t,source.url)}<div class="source-actions">${button(t('markChecked'),'source-check',source.id,{small:true,icon:'check'})}${button(t('edit'),'source-edit',source.id,{small:true,outline:true,icon:'pencil'})}</div></div></section>`).join('')}</div>${!sources.length?`<div class="empty-state"><p>${e(t('emptySection'))}</p></div>`:''}`;
}

export function sourceModalView(c) {
  const {t,state:s,workspace:w}=c;
  const m=s.modal;
  const source=w.sources.find(item=>item.id===m.id);
  if(m.type==='source-check')return modal(t,c.sourceName(source.id),`<div class="detail-body"><p>${e(t('checkHint'))}</p><form data-form="source-check" class="inline-form">${select(t,'checkedBy','checkedBy',m.checkedBy,w.users.map(u=>[u.id,c.ownerName(u.id)]),{required:true})}${field(t,'found','found',m.found,{type:'number',integer:true})}${m.error?`<p role="alert">${e(t(m.error))}</p>`:''}${button(t('confirmCheck'),null,'',{submit:true,icon:'check'})}</form><h3>${e(t('checkHistory'))}</h3>${!source.checks.length?`<p>${e(t('neverChecked'))}</p>`:''}<div class="timeline">${[...source.checks].reverse().map(check=>`<article><small>${e(new Date(check.checkedAt).toLocaleString(s.locale))} · ${e(c.ownerName(check.checkedBy))}</small><p>${e(t('found'))}: ${e(check.opportunitiesFound??t('notProvided'))}</p></article>`).join('')}</div></div>`);
  const draft=m.draft;
  return modal(t,t('edit'),`<form data-form="source-edit" class="detail-body inline-form">${facts(t,[['platformName',source.name]])}${field(t,'englishName','englishName',draft.englishName)}${field(t,'website','url',draft.url,{type:'url',required:true})}${select(t,'category','category',draft.category,sourceCategories.map(v=>[v,t(v)]),{empty:false})}${select(t,'priority','priority',draft.priority,['high','medium','low'].map(v=>[v,t(v)]))}${select(t,'sourceStatus','status',draft.status,['notConfigured','active','inactive'].map(v=>[v,t(v)]),{empty:false})}${field(t,'notes','notes',draft.notes,{multiline:true})}${m.error?`<p role="alert">${e(t(m.error))}</p>`:''}${button(t('saveChanges'),null,'',{submit:true})}</form>`);
}
