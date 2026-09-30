// Small HTML helpers. All staff-entered values are escaped before entering HTML.
import { display, safeUrl } from './lib/workspace.js';

export function escapeHtml(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}
export const e = escapeHtml;

// Inline SVGs keep the existing outline-icon style without a UI framework.
const paths = {
  waves: 'M2 6c4 4 6-4 10 0s6-4 10 0M2 12c4 4 6-4 10 0s6-4 10 0M2 18c4 4 6-4 10 0s6-4 10 0',
  dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  opportunities: 'M3 7h18v14H3zM8 7V3h8v4M3 12c6 4 12 4 18 0M12 12v3',
  add: 'M12 5v14M5 12h14', tenders: 'M8 4H4v17h16V4h-4M8 2h8v4H8zM8 11h8M8 16h5',
  competitors: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M18 8a3 3 0 0 1 0 6M22 21v-2a4 4 0 0 0-3-4M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  sources: 'M3 5c0-4 18-4 18 0s-18 4-18 0v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0',
  reports: 'M14 2H4v20h16V8zM14 2v6h6M8 12h8M8 16h8',
  saved: 'M5 3h14v18l-7-4-7 4z', settings: 'M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  close: 'M6 6l12 12M6 18 18 6', menu: 'M3 6h18M3 12h18M3 18h18',
  right: 'M5 12h14M13 6l6 6-6 6', left: 'M19 12H5M11 6l-6 6 6 6',
  down: 'M6 9l6 6 6-6', external: 'M15 3h6v6M21 3 9 15M10 3H3v18h18v-7',
  check: 'M5 12l4 4L19 6', shield: 'M12 2 3 6v7c0 5 9 9 9 9s9-4 9-9V6zM8 12l3 3 5-6',
  pencil: 'm16 3 5 5-13 13H3v-5zM14 5l5 5', clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M12 6v6l4 2',
  print: 'M6 8V2h12v6M6 17H2V8h20v9h-4M6 14h12v8H6z',
};
export function icon(name, size = 18) {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name] || paths.reports}"/></svg>`;
}
export function button(label, action, value = '', options = {}) {
  return `<button type="${options.submit ? 'submit' : 'button'}" class="ui-button ${options.outline ? 'outline' : 'primary'} ${options.small ? 'small' : ''}" ${action ? `data-action="${e(action)}" data-value="${e(value)}"` : ''} ${options.disabled ? 'disabled' : ''}>${options.icon ? icon(options.icon, 16) : ''}${e(label)}</button>`;
}
export function field(t, label, name, value = '', options = {}) {
  const attributes = `name="${e(name)}" data-focus="${e(name)}" aria-label="${e(t(label))}" ${options.required ? 'required' : ''}`;
  const control = options.multiline
    ? `<textarea ${attributes}>${e(value)}</textarea>`
    : `<input ${attributes} type="${options.type || 'text'}" value="${e(value)}" ${options.type === 'number' ? `min="0" step="${options.integer ? '1' : 'any'}"` : ''}>`;
  return `<label class="form-field"><span>${e(t(label))}${options.required ? ' *' : ''}</span>${control}</label>`;
}
export function select(t, label, name, value, options, settings = {}) {
  return `<label class="form-field"><span>${e(t(label))}${settings.required ? ' *' : ''}</span><select name="${e(name)}" data-focus="${e(name)}" aria-label="${e(t(label))}" ${settings.required ? 'required' : ''}>
    ${settings.empty === false ? '' : `<option value="">${e(t(settings.all ? 'all' : 'notProvided'))}</option>`}
    ${options.map(([key, text]) => `<option value="${e(key)}" ${value === key ? 'selected' : ''}>${e(text)}</option>`).join('')}
  </select></label>`;
}
export function checkboxes(t, label, name, selected, options) {
  return `<fieldset class="checkbox-group"><legend>${e(t(label))}</legend>${options.map(([value, text]) => `<label><input type="checkbox" name="${e(name)}" value="${e(value)}" data-focus="${e(name + value)}" ${selected.includes(value) ? 'checked' : ''}>${e(text)}</label>`).join('')}</fieldset>`;
}
export function facts(t, rows) {
  return `<dl class="detail-facts">${rows.map(([label, value]) => `<div><dt>${e(t(label))}</dt><dd>${e(display(value, t))}</dd></div>`).join('')}</dl>`;
}
export function link(t, url) {
  return safeUrl(url) ? `<a class="text-link wrap-link" href="${e(safeUrl(url))}" target="_blank" rel="noreferrer">${e(url)}</a>` : `<span>${e(t('notProvided'))}</span>`;
}
export function modal(t, title, body) {
  return `<div class="modal-overlay"><section class="detail-panel" role="dialog" aria-modal="true" aria-label="${e(title)}"><header class="detail-header"><h2>${e(title)}</h2><button type="button" class="icon-only" data-action="close-modal" aria-label="${e(t('close'))}">${icon('close',22)}</button></header>${body}</section></div>`;
}
