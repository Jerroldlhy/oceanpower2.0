import { e, icon, button, select, field } from '../ui.js';

export const pages = ['dashboard', 'opportunities', 'add', 'tenders', 'competitors', 'sources', 'reports', 'saved', 'settings'];

export function languageSwitcher(c) {
  return `<div class="language-switch" aria-label="${e(c.t('language'))}">${['zh-CN', 'en'].map(locale => `<button type="button" data-action="language" data-value="${locale}" class="${c.state.locale === locale ? 'selected' : ''}">${e(c.t(locale === 'en' ? 'enLabel' : 'zhLabel'))}</button>`).join('<span></span>')}</div>`;
}

export function layout(c, content) {
  const { t, state: s, workspace: w } = c;
  const titles = { dashboard:'greeting', opportunities:'opportunities', add:s.editingId?'editTitle':'addTitle', tenders:'tenderTitle', competitors:'competitors', sources:'sourcesTitle', reports:'reportsTitle', saved:'savedTitle', settings:'settingsTitle' };
  const subtitles = { dashboard:'subtitle', opportunities:'latestSub', add:'addSubtitle', tenders:'tenderSubtitle', competitors:'competitorSubtitle', sources:'sourcesSubtitle', reports:'reportSubtitle', saved:'savedSubtitle', settings:'settingsSubtitle' };
  const navigation = page => `<button type="button" data-action="navigate" data-value="${page}" class="nav-item ${s.page === page ? 'active' : ''}">${icon(page,19)}<span>${e(t(page))}</span>${page === 'opportunities' ? `<em>${w.opportunities.length}</em>` : page === 'saved' && w.savedIds.length ? `<em>${w.savedIds.length}</em>` : ''}</button>`;
  return `<div class="app-shell">
    <aside class="sidebar ${s.mobile ? 'mobile-open' : ''}">
      <a href="#" class="brand" data-action="navigate" data-value="dashboard"><div class="brand-icon">${icon('waves',29)}</div><div><strong>OCEANPOWER<span>®</span></strong><small>${e(t('brandSub'))}</small></div></a>
      <div class="workspace-label"><span class="status-dot"></span>${e(t('workspace'))}</div>
      <nav aria-label="${e(t('workspace'))}">${pages.filter(p=>p!=='settings').map(navigation).join('')}</nav>
      <div class="sidebar-bottom"><div class="side-help">${icon('pencil',21)}<h4>${e(t('helpTitle'))}</h4><p>${e(t('helpText'))}</p><button type="button" data-action="navigate" data-value="add">${e(t('helpLink'))}${icon('external',15)}</button></div>${navigation('settings')}<div class="profile"><div class="avatar">OP</div><div><strong>${e(t('team'))}</strong><small>${e(t('role'))}</small></div>${icon('down',15)}</div></div>
    </aside>
    ${s.mobile ? '<div class="mobile-scrim" data-action="mobile"></div>' : ''}
    <div class="main-shell"><header class="topbar"><button type="button" class="mobile-toggle icon-only" data-action="mobile" aria-label="${e(t('menu'))}">${icon('menu',22)}</button><div class="breadcrumb">${e(t('workspace'))}<span>/</span><b>${e(t(s.page))}</b></div><div class="topbar-right"><span class="demo-pill">${e(t('mock'))}</span>${languageSwitcher(c)}<div class="notification-wrap"><button class="notification-button" type="button" data-action="notifications" aria-label="${e(t('notifications'))}">${icon('bell')}</button>${s.notification ? `<div class="notification-popover"><h3>${e(t('notice'))}</h3><p>${e(t('notificationText'))}</p></div>` : ''}</div><select class="current-user" name="currentUser" data-focus="header-user" aria-label="${e(t('currentUser'))}">${w.users.map(u=>`<option value="${e(u.id)}" ${u.id===w.currentUserId?'selected':''}>${e(c.ownerName(u.id))}</option>`).join('')}</select></div></header>
    <main><div class="page-heading"><div><div class="eyebrow">${e(t('eyebrow'))}</div><h1>${e(t(titles[s.page]))}</h1><p>${e(t(subtitles[s.page]))}</p></div><div class="heading-actions"><span>${e(t('scope'))}</span>${!['add','reports','settings'].includes(s.page) ? button(t('add'),'navigate','add',{icon:'add'}) : ''}</div></div>
    ${['dashboard','opportunities','tenders','saved'].includes(s.page) ? `<div class="search-toolbar"><div class="search-field">${icon('search')}<input name="search" data-focus="search" value="${e(s.query)}" placeholder="${e(t('search'))}" aria-label="${e(t('search'))}"><button type="button" class="icon-only" data-action="clear-search" aria-label="${e(t('clearSearch'))}" ${s.query?'':'hidden'}>${icon('close',16)}</button></div><div class="market-chip"><span class="china-flag">★</span>${e(t('china'))}</div>${button(t('generate'),'navigate','reports',{outline:true,icon:'reports'})}</div>` : ''}
    ${content}<footer class="page-footer"><div>${icon('shield',15)}<span>${e(t('disclaimer'))}</span></div><p>${e(t('demoNote'))}</p></footer></main></div>
  </div>`;
}

export function settingsView(c) {
  const { t, workspace: w } = c;
  return `<div class="settings-grid"><section class="card settings-card"><h2>${e(t('language'))}</h2>${languageSwitcher(c)}<h2>${e(t('currentPhase'))}</h2><p>${e(t('storageNote'))}</p><h2>${e(t('dataSources'))}</h2><p>${e(t('dataSourcesBody'))}</p><h2>${e(t('backup'))}</h2><p>${e(t('backupHint'))}</p>${button(t('backup'),'backup','',{outline:true})}</section><section class="card settings-card"><h2>${e(t('currentUser'))}</h2>${select(t,'currentUser','currentUser',w.currentUserId,w.users.map(u=>[u.id,c.ownerName(u.id)]),{empty:false})}<h2>${e(t('addEmployee'))}</h2><form data-form="employee">${field(t,'employeeName','employeeName',c.state.employeeName,{required:true})}${button(t('addEmployee'),null,'',{submit:true})}</form></section></div>`;
}
