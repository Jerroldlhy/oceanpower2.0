import { display, isDueSoon, opportunityName, translator } from './workspace';
export function reportSections(items, workspace, locale, now = new Date()) {
    const t = translator(locale);
    const sourceName = (id) => { const s = workspace.sources.find(s => s.id === id); return s ? locale === 'zh-CN' ? s.name : s.englishName || t(s.labelKey) : t('notProvided'); };
    const group = (get) => Object.entries(items.reduce((out, p) => { const key = get(p); out[key] = (out[key] ?? 0) + 1; return out; }, {})).map(([key, n]) => [key, String(n)]);
    const list = (data) => data.map(p => [opportunityName(p, locale), `${t(p.status)} · ${display(p.deadline, t)} · ${t(p.isDemo ? 'demo' : 'manual')}`]);
    const related = workspace.competitors.filter(c => items.some(p => p.competitorIds.includes(c.id) || c.relatedOpportunityIds.includes(p.id)));
    return [
        { key: 'totalOpportunities', rows: [[t('totalOpportunities'), String(items.length)], [t('demo'), String(items.filter(p => p.isDemo).length)], [t('manual'), String(items.filter(p => !p.isDemo).length)]] },
        { key: 'byStatus', rows: group(p => t(p.status)) }, { key: 'byProvince', rows: group(p => t(p.province) || t('notProvided')) }, { key: 'byRebarType', rows: group(p => t(p.rebar.type)) },
        { key: 'deadlineSoon', rows: list(items.filter(p => isDueSoon(p, now))) }, { key: 'activeNegotiations', rows: list(items.filter(p => p.status === 'negotiating')) }, { key: 'outcomes', rows: list(items.filter(p => p.status === 'won' || p.status === 'lost')) },
        { key: 'mainSources', rows: group(p => sourceName(p.sourceId)) },
        { key: 'recordedCompetitors', rows: related.map(c => [c.companyName, `${t('publicBidInformation')}: ${display(c.publicBidInformation, t)}; ${t('publicTenderResult')}: ${display(c.publicTenderResult, t)}; ${t('notes')}: ${display(c.notes, t)}`]) }
    ];
}
export function downloadFile(body, name, type) { const url = URL.createObjectURL(new Blob([body], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
export async function createReportWorkbook(items, workspace, locales, now) {
    const { default: ExcelJS } = await import('exceljs');
    const wb = new ExcelJS.Workbook();
    for (const locale of locales) {
        const t = translator(locale);
        const summary = wb.addWorksheet(`${locale}-Report`);
        summary.addRow([t('reportsTitle')]);
        summary.addRow([t('generated'), now.toLocaleString(locale)]);
        summary.addRow([t('reportScope')]);
        for (const section of reportSections(items, workspace, locale, now)) {
            summary.addRow([]);
            summary.addRow([t(section.key)]);
            if (!section.rows.length)
                summary.addRow([t('emptySection')]);
            section.rows.forEach(row => summary.addRow(row));
        }
        summary.columns = [{ width: 50 }, { width: 100 }];
        summary.eachRow(r => { r.alignment = { wrapText: true, vertical: 'top' }; });
        const sheet = wb.addWorksheet(locale);
        const headers = ['project', 'nameZh', 'nameEn', 'province', 'city', 'buyer', 'rebarType', 'diameter', 'quantity', 'unit', 'deadline', 'source', 'priority', 'status', 'owner', 'lastUpdated', 'dataKind', 'businessNotes', 'technicalNotes', 'missingInformation', 'potentialProducts'];
        sheet.addRow(headers.map(t));
        items.forEach(p => { const s = workspace.sources.find(s => s.id === p.sourceId); const user = workspace.users.find(u => u.id === p.ownerId); sheet.addRow([opportunityName(p, locale), p.nameZh, p.nameEn, t(p.province), display(p.city, t), display(p.buyer, t), t(p.rebar.type), display(p.rebar.diameter, t), display(p.rebar.quantity, t), display(p.rebar.unit, t), display(p.deadline, t), s ? locale === 'zh-CN' ? s.name : s.englishName || t(s.labelKey) : t('notProvided'), t(p.priority), t(p.status), display(user?.name, t), new Date(p.updatedAt).toLocaleString(locale), t(p.isDemo ? 'demo' : 'manual'), display(p.businessNotes, t), display(p.technicalNotes, t), display(p.missingInformation, t), p.potentialProducts.map(t).join(', ')]); });
        sheet.columns.forEach(c => { c.width = 26; });
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF245594' } };
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
        sheet.autoFilter = { from: 'A1', to: 'U1' };
    }
    return wb.xlsx.writeBuffer();
}
