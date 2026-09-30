import { createWorkspace, materialAliases } from '../data';
import en from '../../locales/en.json';
import zh from '../../locales/zh-CN.json';
export const STORAGE_KEY = 'oceanpower-manual-rebar-v2';
export const emptyFilter = { from: '', to: '', province: '', rebarType: '', status: '', ownerId: '', sourceId: '', priority: '' };
export const dictionaries = { en, 'zh-CN': zh };
export function translator(locale) { return key => dictionaries[locale][key] ?? key; }
export function display(value, t) { return value ? value.startsWith('@') ? t(value.slice(1)) : value : t('notProvided'); }
export function opportunityName(p, locale) { return (locale === 'zh-CN' ? p.nameZh : p.nameEn) || p.name; }
export function localDate(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function isDueSoon(p, now = new Date()) { const today = localDate(now); const end = new Date(now); end.setDate(end.getDate() + 7); return !['won', 'lost', 'archived'].includes(p.status) && !!p.deadline && p.deadline >= today && p.deadline <= localDate(end); }
export function filterOpportunities(items, filter, query = '') {
    return items.filter(p => {
        const values = [p.name, p.nameZh, p.nameEn, p.buyer, p.city, p.province, p.rebar.type, p.rebar.productName, 'rebar 钢筋 FRP筋 复合材料筋 非金属筋 纤维增强复合材料筋', ...(materialAliases[p.rebar.type] ?? [])];
        const haystack = [...values, ...values.flatMap(v => [display(v, translator('en')), display(v, translator('zh-CN'))]), translator('en')(p.province), translator('zh-CN')(p.province)].join(' ').toLowerCase();
        return query.toLowerCase().trim().split(/\s+/).every(q => haystack.includes(q)) && (!filter.province || p.province === filter.province) && (!filter.rebarType || p.rebar.type === filter.rebarType) && (!filter.status || p.status === filter.status) && (!filter.ownerId || p.ownerId === filter.ownerId) && (!filter.sourceId || p.sourceId === filter.sourceId) && (!filter.priority || p.priority === filter.priority) && (!filter.from || localDate(new Date(p.createdAt)) >= filter.from) && (!filter.to || localDate(new Date(p.createdAt)) <= filter.to);
    });
}
export function safeUrl(value) { try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
}
catch {
    return '';
} }
export function loadWorkspace() { try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
        return { workspace: createWorkspace(), issue: false };
    const parsed = JSON.parse(raw);
    if (parsed.version !== 2 || !Array.isArray(parsed.opportunities) || !Array.isArray(parsed.sources) || !Array.isArray(parsed.users) || !Array.isArray(parsed.competitors) || !Array.isArray(parsed.savedIds))
        throw new Error();
    return { workspace: parsed, issue: false };
}
catch {
    return { workspace: createWorkspace(), issue: true };
} }
export function saveWorkspace(workspace) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}
