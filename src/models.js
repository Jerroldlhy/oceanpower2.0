/** @typedef {'zh-CN' | 'en'} Locale */
/** @typedef {'high' | 'medium' | 'low'} Priority */
/** @typedef {'GFRP' | 'BFRP' | 'CFRP' | 'FRP' | 'composite' | 'unknown'} RebarType */
/** @typedef {'new'|'reviewing'|'worthFollowing'|'contacted'|'quotationPreparing'|'quotationSubmitted'|'negotiating'|'won'|'lost'|'archived'} OpportunityStatus */
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 */
/** @typedef {User} Owner */
/**
 * @typedef {Object} RebarRequirement
 * @property {RebarType} type
 * @property {string} productName
 * @property {string} diameter
 * @property {string} quantity
 * @property {string} unit
 * @property {string} length
 * @property {string} tensileStrength
 * @property {string} shearStrength
 * @property {string} elasticityModulus
 * @property {string} resinType
 * @property {string} surfaceType
 * @property {string} technicalStandard
 * @property {string} environment
 * @property {string} otherRequirements
 */
/**
 * @typedef {Object} ActivityLog
 * @property {string} id
 * @property {string} date
 * @property {string} authorId
 * @property {string} text
 * @property {'created' | 'edited' | 'manual'} kind
 */
/**
 * @typedef {Object} DocumentReference
 * @property {string} id
 * @property {string} name
 * @property {string} url
 */
/**
 * @typedef {Object} Opportunity
 * @property {string} id
 * @property {'CN'} market
 * @property {boolean} isDemo
 * @property {string} name
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {string} province
 * @property {string} city
 * @property {string} buyer
 * @property {string} projectType
 * @property {string} application
 * @property {string} noticeTitle
 * @property {string} tenderNumber
 * @property {string} sourceId
 * @property {string} sourceUrl
 * @property {string} publishedDate
 * @property {string} deadline
 * @property {string} bidOpeningDate
 * @property {string} budget
 * @property {string} currency
 * @property {RebarRequirement} rebar
 * @property {Priority} priority
 * @property {string} ownerId
 * @property {string[]} competitorIds
 * @property {string} businessNotes
 * @property {string} technicalNotes
 * @property {string} missingInformation
 * @property {OpportunityStatus} status
 * @property {string[]} potentialProducts
 * @property {ActivityLog[]} activities
 * @property {DocumentReference[]} documents
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} [aiSummary]
 * @property {number} [aiRelevanceScore]
 * @property {Partial<RebarRequirement>} [aiExtractedRequirements]
 */
/**
 * @typedef {Object} SourceCheck
 * @property {string} id
 * @property {string} checkedAt
 * @property {string} checkedBy
 * @property {number | null} opportunitiesFound
 */
/**
 * @typedef {Object} TenderSource
 * @property {string} id
 * @property {string} name
 * @property {string} englishName
 * @property {string} labelKey
 * @property {string} category
 * @property {string} url
 * @property {Priority | ''} priority
 * @property {'notConfigured' | 'active' | 'inactive'} status
 * @property {string} lastChecked
 * @property {string} checkedBy
 * @property {number | null} opportunitiesFound
 * @property {string} notes
 * @property {SourceCheck[]} checks
 */
/**
 * @typedef {Object} Competitor
 * @property {string} id
 * @property {string} companyName
 * @property {string} chineseName
 * @property {string} country
 * @property {string} website
 * @property {string} rebarProducts
 * @property {string} notes
 * @property {string[]} relatedOpportunityIds
 * @property {string} publicBidInformation
 * @property {string} publicTenderResult
 */
/**
 * @typedef {Object} ReportFilter
 * @property {string} from
 * @property {string} to
 * @property {string} province
 * @property {string} rebarType
 * @property {string} status
 * @property {string} ownerId
 * @property {string} sourceId
 * @property {string} priority
 */
/**
 * @typedef {Object} Workspace
 * @property {2} version
 * @property {Opportunity[]} opportunities
 * @property {TenderSource[]} sources
 * @property {Competitor[]} competitors
 * @property {User[]} users
 * @property {string[]} savedIds
 * @property {string} currentUserId
 */
// Optional ai* properties are reserved documentation only; Phase 1 does not use them.

export const statuses = ['new', 'reviewing', 'worthFollowing', 'contacted', 'quotationPreparing', 'quotationSubmitted', 'negotiating', 'won', 'lost', 'archived'];
export const sourceCategories = ['generalTender', 'governmentProcurement', 'constructionProcurement', 'railwayProcurement', 'powerInfrastructure', 'buildingMaterials', 'supplyChain', 'tradeData'];
