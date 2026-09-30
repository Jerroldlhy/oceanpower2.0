# Manual China rebar workflow

This update modifies the existing prototype. The interface now uses native HTML templates, plain JavaScript DOM events and ordinary CSS, with no React or JSX. It retains the Oceanpower sidebar, page shell, typography, cards, table, drawer, chart and report visual system. Navigation remains state-based; there are no new URL routes.

## Current workflow

1. Choose the recording employee in the header. Staff identities are local labels, not authenticated accounts.
2. The dashboard checks China Government Procurement Network on startup; use **Refresh official data** for an explicit cached refresh. Open **Tender Sources** to inspect the remaining platforms manually and record each check.
3. Use **Add Opportunity** to enter a China rebar tender. Required fields are project name, province and owner. Technical fields may remain blank; the detail view then displays “Not provided.”
4. Assign a manual priority and status. Select potential Oceanpower rebar products only when appropriate. No selection is made automatically. Final suitability requires engineering review.
5. Open the opportunity drawer to review tender information, rebar requirements, manually linked competitors, document links, follow-up history and notes. Use **Edit** to change the record. Staff must explicitly record any won/lost outcome.
6. Generate a report using date-added, province, rebar type, status, owner, source and priority filters. Reports use a snapshot of matching stored records. Export via browser Print / Save as PDF or Excel.

## Models and storage

`src/models.js` documents JavaScript data shapes with JSDoc for `Opportunity`, `RebarRequirement`, `TenderSource`, `SourceCheck`, `Competitor`, `ActivityLog`, `DocumentReference`, `User` / `Owner`, `ReportFilter` and the versioned `Workspace`.

The v2 workspace is stored under `oceanpower-manual-rebar-v2` in localStorage. New workspaces start without fictional tenders. Existing demo rows are removed when the live application loads. Official discoveries and manual records are then persisted locally; deadline-soon calculations use the current date. Dashboard metrics use all stored records; table filters affect only the table.

Writes are persisted before being reported as successful. Storage failures show an error. Settings provides a JSON backup download. This is local prototype storage, not a shared database. Closing the browser does not erase saved records, but clearing browser data does. Document references store URLs only, not files. User-authored free text is retained as written; interface switching does not translate or fabricate user-entered facts.

## Sources and provenance

China Government Procurement Network is connected through `server/ccgp.js`. Search responses are cached for 15 minutes, deduplicated by official notice URL and stored with their source URL and retrieval time. The other nine identified sources remain manual. No access-control or rate-limit bypass is attempted.

| Source | Configured website | Identification evidence |
| --- | --- | --- |
| 中交招采网 | https://sp.iccec.cn/ | [Platform](https://sp.iccec.cn/) and [migration notice](https://ec.ccccltd.cn/PMS/upload/Notice/descDoc.html) |
| 中国电建阳光采购网 | https://bid.powerchina.cn/ | [POWERCHINA platform page](https://www.powerchina.cn/djwq/ygcgw/index.html) |
| 云筑网 | https://www.yzw.cn/ | [Platform about page](https://www.yzw.cn/home/about) |
| 海关统计数据查询平台 | http://stats.customs.gov.cn/ | [China Customs query guide](https://chinacustoms.gmcmonline.com/202405/c/19717.shtml) |
| 中铁鲁班商务网 | https://www.crecgec.com/ | [China Railway company supplier response](https://www.crecic.com/index/refer/reply.html) |
| 陕建华山云采平台 | https://zb.sjyunc.com/gjc/base/main.do/ | [Platform](https://zb.sjyunc.com/gjc/base/main.do/) |
| 铁建云链门户网站 | https://www.crccep.com/ | [CRCC procurement notice identifying the platform](https://ece.crcc.cn/homepage/inviteInfo.jhtml?id=16470&type=1) |
| 中国电力招标网 | https://www.dlzb.com/ | [Domain and platform identification](https://www.zhaobiaobaike.com/wangzhan/805.html); direct homepage fetch returned HTTP 502 during verification |
| 中国招标投标公共服务平台 | http://www.cebpubservice.com/ | [Operator profile](https://gitee.com/cebpubservice?force_mobile=true) and [platform introduction](https://publicity.cebpubservice.com/publicity/Introduction.html) |

These are manually verified reference identities, not a claim that every portal is reachable or continuously monitored. The customs source is trade data, not a tender procurement portal. Category labels are internal classifications based on the platform purpose, not operator-supplied metadata.

The existing repository contained no competitor research spreadsheet. Only the company names supplied by the user are seeded; countries, websites, rebar products, public bid information, tender results and opportunity links remain empty until entered by staff.

## Removed or postponed

Visible relevance scoring, analysis summaries, automatic product suggestions, competitor-monitoring updates and Market Insights were removed. Non-rebar products were removed. Apart from the conservative CCGP public-search collector, there is no automated portal collection, AI integration, automatic alerts or email sending.

Only optional documented `aiSummary`, `aiRelevanceScore` and `aiExtractedRequirements` fields are reserved for a later phase. Phase 1 does not read or write them. The separate market registry, product catalog, translations and versioned repository boundary can support later extensions. Asia, global markets and other FRP products are not enabled.

## Verification

The interaction suite covers locale parity, all navigation destinations, mixed-language search, combined filters, create/edit/persist/bookmark, date validation, unsaved-form navigation, missing requirement values, source-check attribution/history, document links, activity logs, manual competitor links, filtered bilingual reports, the browser-print action, mobile-navigation toggling and storage-failure messaging. It also checks that no visible analysis or non-rebar product claims appear and captures JavaScript console errors during navigation.

An actual Excel write/read test confirms filtered row counts, Chinese text, report sections and absence of excluded opportunities. Production JavaScript bundling with Vite are included in validation. Responsive CSS retains the existing breakpoints and adds single-column forms and source cards, with horizontal overflow contained inside the wide opportunity table. No connected browser was available for screenshot-based layout verification or a real browser-console inspection; DOM interaction tests are not a replacement for that visual check.
