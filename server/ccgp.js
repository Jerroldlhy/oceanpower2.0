import { createHash } from 'node:crypto';
import { load } from 'cheerio';

export const CCGP_SOURCE = {
  id: 'ccgp',
  name: '中国政府采购网',
  englishName: 'China Government Procurement Network',
  url: 'https://www.ccgp.gov.cn/',
};

const SEARCH_URL = 'https://search.ccgp.gov.cn/bxsearch';
const DEFAULT_KEYWORDS = ['玻璃纤维筋', 'FRP筋', '玄武岩纤维筋', '复合材料筋'];
const REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_CACHE_MS = 15 * 60 * 1000;
const PROVINCES = {
  '北京':'beijing','天津':'tianjin','河北':'hebei','山西':'shanxi','内蒙古':'innerMongolia','辽宁':'liaoning','吉林':'jilin','黑龙江':'heilongjiang','上海':'shanghai','江苏':'jiangsu','浙江':'zhejiang','安徽':'anhui','福建':'fujian','江西':'jiangxi','山东':'shandong','河南':'henan','湖北':'hubei','湖南':'hunan','广东':'guangdong','广西':'guangxi','海南':'hainan','重庆':'chongqing','四川':'sichuan','贵州':'guizhou','云南':'yunnan','西藏':'tibet','陕西':'shaanxi','甘肃':'gansu','青海':'qinghai','宁夏':'ningxia','新疆':'xinjiang',
};

let cache = null;
let pending = null;

const compact = (value = '') => value.replace(/\s+/g, ' ').trim();
function isoDate(value = '') {
  const match = value.match(/(20\d{2})[.\/-](\d{2})[.\/-](\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
}
function inferRebarType(text) {
  if (/GFRP|玻璃纤维/i.test(text)) return 'GFRP';
  if (/BFRP|玄武岩纤维/i.test(text)) return 'BFRP';
  if (/CFRP|碳纤维/i.test(text)) return 'CFRP';
  if (/FRP/i.test(text)) return 'FRP';
  if (/复合材料筋|非金属筋/.test(text)) return 'composite';
  return 'unknown';
}
const inferProvince = text => Object.entries(PROVINCES).find(([name]) => text.includes(name))?.[1] || '';
function absoluteUrl(value) {
  try { return new URL(value, 'https://www.ccgp.gov.cn/').href.replace(/^http:/, 'https:'); }
  catch { return ''; }
}

export function parseCcgpSearch(html, keyword = '') {
  if (/访问过于频繁|请稍后再试/.test(html)) throw new Error('The official source temporarily rate-limited this request.');
  const $ = load(html);
  return $('.vT-srch-result-list-bid > li').map((_, node) => {
    const item = $(node);
    const anchor = item.find('a').first();
    const title = compact(anchor.text());
    const metadata = compact(item.find('span').first().text());
    const allText = compact(item.text());
    const sourceUrl = absoluteUrl(anchor.attr('href'));
    if (!title || !sourceUrl) return null;
    const buyer = metadata.match(/采购人：([^|]+)/)?.[1]?.trim() || '';
    const agency = metadata.match(/代理机构：([^|]+)/)?.[1]?.trim() || '';
    return {
      id:`CCGP-${createHash('sha256').update(sourceUrl).digest('hex').slice(0,12).toUpperCase()}`,
      title, buyer, agency, province:inferProvince(allText), rebarType:inferRebarType(`${title} ${keyword}`),
      publishedDate:isoDate(metadata), sourceUrl, keyword,
    };
  }).get().filter(Boolean);
}

export function buildCcgpSearchUrl(keyword, { startDate, endDate } = {}) {
  const end = endDate || new Date().toISOString().slice(0,10);
  const start = startDate || new Date(Date.now()-30*864e5).toISOString().slice(0,10);
  const params = new URLSearchParams({
    searchtype:'2',page_index:'1',bidSort:'0',buyerName:'',projectId:'',pinMu:'0',bidType:'0',dbselect:'bidx',kw:keyword,
    start_time:start.replaceAll('-',':'),end_time:end.replaceAll('-',':'),timeType:'6',displayZone:'',zoneId:'',pppStatus:'0',agentName:'',
  });
  return `${SEARCH_URL}?${params}`;
}

async function fetchKeyword(keyword, dates, fetchImpl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(buildCcgpSearchUrl(keyword, dates), {
      signal:controller.signal,
      headers:{accept:'text/html,application/xhtml+xml','accept-language':'zh-CN,zh;q=0.9','user-agent':'OceanpowerTenderMonitor/1.0 (low-frequency public procurement research)'},
    });
    if (!response.ok) throw new Error(`Official source returned HTTP ${response.status}.`);
    return parseCcgpSearch(await response.text(), keyword);
  } finally { clearTimeout(timer); }
}

export async function collectCcgp({ force = false, fetchImpl = fetch } = {}) {
  const now = Date.now();
  if (!force && cache && cache.expiresAt > now) return {...cache.value,cached:true};
  if (!force && pending) return pending;
  pending = (async () => {
    const lookback = Math.max(1,Math.min(180,Number(process.env.CCGP_LOOKBACK_DAYS)||30));
    const keywords = (process.env.CCGP_KEYWORDS||DEFAULT_KEYWORDS.join(',')).split(',').map(value=>value.trim()).filter(Boolean).slice(0,8);
    const endDate = new Date().toISOString().slice(0,10);
    const startDate = new Date(Date.now()-lookback*864e5).toISOString().slice(0,10);
    const warnings=[]; const batches=[];
    for (const keyword of keywords) {
      try { batches.push(...await fetchKeyword(keyword,{startDate,endDate},fetchImpl)); }
      catch (error) { warnings.push(`${keyword}: ${error.message}`); }
    }
    if (!batches.length && warnings.length===keywords.length) throw new Error(warnings.join(' '));
    const items=[...new Map(batches.map(item=>[item.sourceUrl,item])).values()]
      .sort((a,b)=>b.publishedDate.localeCompare(a.publishedDate))
      .slice(0,Math.max(1,Math.min(200,Number(process.env.CCGP_MAX_RESULTS)||100)));
    const value={source:CCGP_SOURCE,items,keywords,lookbackDays:lookback,fetchedAt:new Date().toISOString(),warnings,cached:false};
    const cacheMs=Math.max(60_000,Number(process.env.CCGP_CACHE_MS)||DEFAULT_CACHE_MS);
    cache={value,expiresAt:Date.now()+cacheMs};
    return value;
  })();
  try { return await pending; }
  finally { pending=null; }
}

export function clearCcgpCache() { cache=null; pending=null; }
