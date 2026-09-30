import { e, icon, button } from '../ui.js';
import { display, filterOpportunities, opportunityName, translator } from '../lib/workspace.js';
import { reportSections } from '../lib/reports.js';
import { filtersView } from './opportunities.js';

export function reportView(c) {
  const {t,state:s}=c;
  const f=s.reportFilter;
  const invalid=!!f.from&&!!f.to&&f.from>f.to;
  const snapshot=s.reportSnapshot;
  let html=`<section class="card report-filters"><div class="card-heading"><p>${e(t('filterHint'))}</p></div>${filtersView(c,true)}${invalid?`<p class="form-error" role="alert">${e(t('formError'))}</p>`:''}</section><section class="card report-controls"><div><span class="field-label">${e(t('reportLanguage'))}</span><div class="segmented">${[['zh-CN','chineseReport'],['en','englishReport'],['both','bilingualReport']].map(([value,key])=>`<button type="button" class="${s.reportLanguage===value?'selected':''}" data-action="report-language" data-value="${value}">${e(t(key))}</button>`).join('')}</div></div>${button(t('generate'),'generate-report','',{disabled:invalid,icon:'reports'})}</section>`;
  if(!snapshot)return html+`<section class="card empty-state report-empty">${icon('reports',36)}<h2>${e(t('reportEmpty'))}</h2><p>${e(t('reportEmptyBody'))}</p></section>`;
  const rows=filterOpportunities(snapshot.workspace.opportunities,f);
  html+=`<div class="report-actions"><span>${e(t('totalOpportunities'))}: ${rows.length}</span><div>${button(t('pdf'),'print','',{outline:true,icon:'print'})}${button(t(s.exporting?'exporting':'excel'),'export-excel','',{outline:true,disabled:s.exporting,icon:'reports'})}</div></div><div class="report-document" id="print-report">`;
  const locales=s.reportLanguage==='both'?['zh-CN','en']:[s.reportLanguage];
  html+=locales.map(locale=>{
    const rt=translator(locale);
    return `<article lang="${locale}"><div class="report-brand">${icon('waves')}OCEANPOWER<span>${e(rt('brandSub'))}</span></div><div class="report-title"><h1>${e(rt('reportsTitle'))}</h1><p>${e(rt('generated'))}: ${e(snapshot.date.toLocaleString(locale))}</p><p>${e(rt('reportScope'))}</p><p>${e(rt('from'))}: ${e(f.from||rt('all'))} · ${e(rt('to'))}: ${e(f.to||rt('all'))}</p></div>${reportSections(rows,snapshot.workspace,locale,snapshot.date).map((section,i)=>`<section><h2>${String(i+1).padStart(2,'0')} / ${e(rt(section.key))}</h2>${section.rows.length?`<table class="report-table"><tbody>${section.rows.map(([name,value])=>`<tr><td>${e(name)}</td><td>${e(value)}</td></tr>`).join('')}</tbody></table>`:`<p>${e(rt('emptySection'))}</p>`}</section>`).join('')}<h2>${e(rt('reportRegister'))}</h2>${rows.map(p=>`<section class="report-opportunity"><h3>${e(opportunityName(p,locale))}</h3><p>${e(rt(p.isDemo?'demo':'manual'))} · ${e(rt(p.province))} · ${e(rt(p.status))} · ${e(rt('priority'))}: ${e(rt(p.priority))}</p><p>${e(rt('buyer'))}: ${e(display(p.buyer,rt))} · ${e(rt('deadline'))}: ${e(display(p.deadline,rt))}</p><p>${e(rt('rebarType'))}: ${e(rt(p.rebar.type))} · ${e(rt('diameter'))}: ${e(display(p.rebar.diameter,rt))} · ${e(rt('quantity'))}: ${e(display(p.rebar.quantity,rt))} ${e(p.rebar.unit)}</p><p>${e(rt('potentialProducts'))}: ${e(p.potentialProducts.map(rt).join(', ')||rt('notProvided'))}</p><p>${e(rt('missingInformation'))}: ${e(display(p.missingInformation,rt))}</p></section>`).join('')}<div class="report-caution">${e(rt('disclaimer'))}<br>${e(rt('demoNote'))}</div></article>`;
  }).join('');
  return html+'</div>';
}
