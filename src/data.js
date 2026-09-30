export const markets = [{ code: 'CN', enabled: true, locales: ['zh-CN', 'en'], currency: 'CNY' }];
export const productCatalog = ['GFRP Rebar', 'BFRP Rebar', 'CFRP Rebar'];
export const rebarTypes = ['GFRP', 'BFRP', 'CFRP', 'FRP', 'composite', 'unknown'];
export const provinces = ['beijing', 'tianjin', 'hebei', 'shanxi', 'innerMongolia', 'liaoning', 'jilin', 'heilongjiang', 'shanghai', 'jiangsu', 'zhejiang', 'anhui', 'fujian', 'jiangxi', 'shandong', 'henan', 'hubei', 'hunan', 'guangdong', 'guangxi', 'hainan', 'chongqing', 'sichuan', 'guizhou', 'yunnan', 'tibet', 'shaanxi', 'gansu', 'qinghai', 'ningxia', 'xinjiang'];
export const emptyRebar = { type: 'unknown', productName: '', diameter: '', quantity: '', unit: '', length: '', tensileStrength: '', shearStrength: '', elasticityModulus: '', resinType: '', surfaceType: '', technicalStandard: '', environment: '', otherRequirements: '' };
// Identified platforms only. No check history, business priorities or English legal names are invented.
const sourceDefinitions = [
    ['ccgp', '中国政府采购网', 'sourceCcgp', 'governmentProcurement', 'https://www.ccgp.gov.cn/'],
    ['s2', '中交招采网', 'source2', 'constructionProcurement', 'https://sp.iccec.cn/'],
    ['s3', '中国电建阳光采购网', 'source3', 'powerInfrastructure', 'https://bid.powerchina.cn/'],
    ['s4', '云筑网', 'source4', 'constructionProcurement', 'https://www.yzw.cn/'],
    ['s6', '海关统计数据查询平台', 'source6', 'tradeData', 'http://stats.customs.gov.cn/'],
    ['s7', '中铁鲁班商务网', 'source7', 'railwayProcurement', 'https://www.crecgec.com/'],
    ['s8', '陕建华山云采平台', 'source8', 'constructionProcurement', 'https://zb.sjyunc.com/gjc/base/main.do/'],
    ['s9', '铁建云链门户网站', 'source9', 'railwayProcurement', 'https://www.crccep.com/'],
    ['s11', '中国电力招标网', 'source11', 'powerInfrastructure', 'https://www.dlzb.com/'],
    ['s12', '中国招标投标公共服务平台', 'source12', 'generalTender', 'http://www.cebpubservice.com/']
];
export const initialSources = sourceDefinitions.map(([id, name, labelKey, category, url]) => ({ id, name, englishName: '', labelKey, category, url, priority: '', status: 'notConfigured', lastChecked: '', checkedBy: '', opportunitiesFound: null, notes: '', checks: [] }));
// User-supplied company names only; unknown factual fields stay blank.
export const initialCompetitors = ['Pulwell', 'Dextra', 'Schöck Combar', 'Pultrall / V-ROD', 'TUF-BAR'].map((companyName, i) => ({ id: `c${i + 1}`, companyName, chineseName: '', country: '', website: '', rebarProducts: '', notes: '', relatedOpportunityIds: [], publicBidInformation: '', publicTenderResult: '' }));
export const materialAliases = {
    GFRP: ['玻璃纤维筋', '玻璃纤维复合筋', 'GFRP筋', '玻璃纤维增强复合材料筋'],
    BFRP: ['玄武岩纤维筋', 'BFRP筋'], CFRP: ['碳纤维筋', 'CFRP筋'],
    FRP: ['FRP筋'], composite: ['复合材料筋', '非金属筋', '纤维增强复合材料筋'], unknown: []
};
export function blankOpportunity() {
    const now = new Date().toISOString();
    return { id: crypto.randomUUID(), market: 'CN', isDemo: false, name: '', nameZh: '', nameEn: '', province: '', city: '', buyer: '', projectType: '', application: '', noticeTitle: '', tenderNumber: '', sourceId: '', sourceUrl: '', publishedDate: '', deadline: '', bidOpeningDate: '', budget: '', currency: 'CNY', rebar: { ...emptyRebar }, priority: 'medium', ownerId: '', competitorIds: [], businessNotes: '', technicalNotes: '', missingInformation: '', status: 'new', potentialProducts: [], activities: [], documents: [], createdAt: now, updatedAt: now };
}
const samples = [
    ['广东某地铁工程玻璃纤维复合筋采购', 'Guangdong metro GFRP rebar procurement', 'guangdong', '@cityGuangzhou', 'GFRP', 's7', 'reviewing', '16 mm', '5000', 'm'],
    ['浙江沿海桥梁玄武岩纤维筋采购', 'Zhejiang coastal bridge BFRP rebar procurement', 'zhejiang', '@cityNingbo', 'BFRP', 's2', 'worthFollowing', '20 mm', '3200', 'm'],
    ['上海隧道工程玻璃纤维筋采购', 'Shanghai tunnel GFRP rebar procurement', 'shanghai', '@shanghai', 'GFRP', 's9', 'quotationSubmitted', '25 mm', '8000', 'm'],
    ['陕西市政工程复合材料筋采购', 'Shaanxi municipal composite rebar procurement', 'shaanxi', '@cityXian', 'composite', 's8', 'contacted', '', '', ''],
    ['湖北水利工程碳纤维筋采购', 'Hubei waterworks CFRP rebar procurement', 'hubei', '@cityWuhan', 'CFRP', 's3', 'negotiating', '12 mm', '1200', 'm'],
    ['江苏地下工程FRP筋采购', 'Jiangsu underground FRP rebar procurement', 'jiangsu', '@cityNanjing', 'FRP', 's4', 'new', '16 mm', '2400', 'm'],
    ['山东桥梁非金属筋采购', 'Shandong bridge non-metallic rebar procurement', 'shandong', '@cityQingdao', 'unknown', 's12', 'quotationPreparing', '', '', ''],
    ['四川建筑工程玻璃纤维筋采购', 'Sichuan construction GFRP rebar procurement', 'sichuan', '@cityChengdu', 'GFRP', 's11', 'new', '18 mm', '3600', 'm']
];
export function createWorkspace() {
    return { version: 2, opportunities: [], sources: structuredClone(initialSources), competitors: structuredClone(initialCompetitors), users: [{ id: 'employeeA', name: '@employeeA' }, { id: 'employeeB', name: '@employeeB' }], savedIds: [], currentUserId: 'employeeA' };
}
// Retained only for deterministic tests and explicit development fixtures.
export function createDemoWorkspace() {
    const opportunities = samples.map((row, i) => ({ ...blankOpportunity(), id: `CN-REBAR-${String(i + 1).padStart(3, '0')}`, isDemo: true, name: row[0], nameZh: row[0], nameEn: row[1], province: row[2], city: row[3], buyer: `@demoBuyer${i + 1}`, projectType: '@procurement', application: i === 0 || i === 2 ? '@tunnel' : '@civilEngineering', noticeTitle: row[0], sourceId: row[5], status: row[6], rebar: { ...emptyRebar, type: row[4], diameter: row[7], quantity: row[8], unit: row[9] }, priority: i % 3 === 0 ? 'high' : 'medium', ownerId: i % 2 === 0 ? 'employeeA' : 'employeeB', publishedDate: `2026-09-${String(22 + i).padStart(2, '0')}`, deadline: `2026-10-${String(2 + i * 3).padStart(2, '0')}`, businessNotes: '@demoBusinessNote', missingInformation: '@demoMissing', createdAt: `2026-09-${String(22 + i).padStart(2, '0')}T01:00:00.000Z`, updatedAt: `2026-09-${String(22 + i).padStart(2, '0')}T01:00:00.000Z`, activities: [{ id: `seed-${i}`, date: `2026-09-${String(22 + i).padStart(2, '0')}T01:00:00.000Z`, authorId: i % 2 === 0 ? 'employeeA' : 'employeeB', text: '', kind: 'created' }] }));
    return { version: 2, opportunities, sources: structuredClone(initialSources), competitors: structuredClone(initialCompetitors), users: [{ id: 'employeeA', name: '@employeeA' }, { id: 'employeeB', name: '@employeeB' }], savedIds: [], currentUserId: 'employeeA' };
}
