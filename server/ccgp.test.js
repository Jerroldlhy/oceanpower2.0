import { afterEach, describe, expect, it } from 'vitest';
import { buildCcgpSearchUrl, clearCcgpCache, collectCcgp, parseCcgpSearch } from './ccgp.js';

const fixture = `
<ul class="vT-srch-result-list-bid">
  <li>
    <a href="http://www.ccgp.gov.cn/cggg/dfgg/gkzb/202609/t20260928_1.htm">广东某工程玻璃纤维筋采购公告</a>
    <span>2026.09.28 19:30:01 | 采购人：广州市某单位 | 代理机构：某代理公司</span>
  </li>
</ul>`;

afterEach(() => clearCcgpCache());

describe('CCGP collector', () => {
  it('parses official search rows into normalized live records', () => {
    expect(parseCcgpSearch(fixture,'玻璃纤维筋')[0]).toMatchObject({
      title:'广东某工程玻璃纤维筋采购公告',buyer:'广州市某单位',agency:'某代理公司',province:'guangdong',
      rebarType:'GFRP',publishedDate:'2026-09-28',sourceUrl:'https://www.ccgp.gov.cn/cggg/dfgg/gkzb/202609/t20260928_1.htm',
    });
  });

  it('uses the official endpoint, deduplicates records and caches repeated collection', async () => {
    let calls=0;
    const fetchImpl=async url=>{calls++;expect(url).toContain('https://search.ccgp.gov.cn/bxsearch?');return{ok:true,text:async()=>fixture};};
    const first=await collectCcgp({fetchImpl});
    const second=await collectCcgp({fetchImpl});
    expect(first.items).toHaveLength(1);
    expect(second.cached).toBe(true);
    expect(calls).toBe(4);
    expect(buildCcgpSearchUrl('FRP筋',{startDate:'2026-09-01',endDate:'2026-09-30'})).toContain('start_time=2026%3A09%3A01');
  });

  it('rejects the source rate-limit page', () => {
    expect(()=>parseCcgpSearch('<h1>您的访问过于频繁,请稍后再试。</h1>')).toThrow(/rate-limited/);
  });
});
