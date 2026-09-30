import { e, button, field, checkboxes, facts, link, modal } from '../ui.js';
import { opportunityName } from '../lib/workspace.js';

export function competitorsView(c) {
  const {t,workspace:w,state:s}=c;
  return `<div class="report-actions"><p class="scope-note">${e(t('competitorHint'))}</p>${button(t('addCompetitor'),'competitor-edit')}</div><div class="source-grid">${w.competitors.map(company=>`<section class="card source-card"><div class="card-heading"><h2>${e(company.companyName)}</h2>${button(t('edit'),'competitor-edit',company.id,{outline:true,small:true})}</div><div class="source-card-body">${facts(t,['chineseName','country','rebarProducts','notes','publicBidInformation','publicTenderResult'].map(k=>[k,company[k]]))}${link(t,company.website)}<h3>${e(t('relatedOpportunities'))}</h3>${company.relatedOpportunityIds.length?company.relatedOpportunityIds.map(id=>{const p=w.opportunities.find(p=>p.id===id);return p?`<button type="button" class="text-link" data-action="open-project" data-value="${e(id)}">${e(opportunityName(p,s.locale))}</button>`:'';}).join(''):`<p>${e(t('notProvided'))}</p>`}</div></section>`).join('')}</div>`;
}

export function competitorModalView(c) {
  const {t,workspace:w,state:s}=c;
  const m=s.modal;
  const d=m.draft;
  return modal(t,t(m.editing?'editCompetitor':'addCompetitor'),`<form data-form="competitor" class="detail-body inline-form"><p>${e(t('competitorHint'))}</p>${['companyName','chineseName','country','website','rebarProducts','notes','publicBidInformation','publicTenderResult'].map(k=>field(t,k,k,d[k],{required:k==='companyName',type:k==='website'?'url':'text',multiline:['notes','publicBidInformation','publicTenderResult'].includes(k)})).join('')}${checkboxes(t,'relatedOpportunities','relatedOpportunityIds',d.relatedOpportunityIds,w.opportunities.map(p=>[p.id,opportunityName(p,s.locale)]))}${m.error?`<p role="alert">${e(t(m.error))}</p>`:''}${button(t('saveChanges'),null,'',{submit:true})}</form>`);
}
