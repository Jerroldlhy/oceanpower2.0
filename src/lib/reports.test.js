import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';
import { createWorkspace } from '../data';
import { createReportWorkbook, reportSections } from './reports';
import { emptyFilter, filterOpportunities } from './workspace';
describe('manual report export', () => {
    it('exports only filtered records and preserves Chinese text and real summary totals', async () => {
        const workspace = createWorkspace();
        const records = filterOpportunities(workspace.opportunities, { ...emptyFilter, province: 'guangdong' });
        const now = new Date('2026-09-30T01:00:00Z');
        const bytes = await createReportWorkbook(records, workspace, ['zh-CN', 'en'], now);
        const book = new ExcelJS.Workbook();
        await book.xlsx.load(bytes);
        expect(book.worksheets).toHaveLength(4);
        expect(book.getWorksheet('en').rowCount).toBe(2);
        expect(book.getWorksheet('zh-CN').getCell('A2').value).toBe('广东某地铁工程玻璃纤维复合筋采购');
        expect(book.getWorksheet('en').getCell('A2').value).toBe('Guangdong metro GFRP rebar procurement');
        const sections = reportSections(records, workspace, 'en', now);
        expect(sections.find(s => s.key === 'totalOpportunities').rows[0][1]).toBe('1');
        expect(sections.find(s => s.key === 'deadlineSoon').rows).toHaveLength(1);
        expect(sections.find(s => s.key === 'recordedCompetitors').rows).toEqual([]);
        expect(JSON.stringify(book.model)).not.toContain('Zhejiang coastal');
    });
});
