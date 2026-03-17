# Part VI: Gaps & Recommendations — Section Plan

## Overview

Part VI extends DDIA with 10 topics that the original book does not cover but that are critical for building a production SaaS platform like OpenAgency. These topics are organized into 3 chapters of 3-4 sections each, following a progression from platform foundations, through operational infrastructure, to business-layer concerns.

**Chapter numbering**: Chapters 13-15, continuing from DDIA's Chapters 1-12.
**Section ID format**: `{chapter}-{index}` (e.g., `13-0`, `13-1`, etc.)

---

## Chapter 13: Platform Architecture Patterns (4 sections)

*Covers the foundational architectural decisions that shape every layer of a multi-tenant SaaS platform: tenant isolation, workflow orchestration, billing integration, and multi-region deployment.*

---

### Section 13-0: Multi-Tenant SaaS Architecture

**Key Concepts**
- Tenant isolation models: silo (dedicated resources per tenant), pool (shared resources), and bridge (shared compute, isolated data) — tradeoffs between cost efficiency, noisy-neighbor risk, and operational complexity
- Data partitioning strategies for tenancy: schema-per-tenant, row-level tenant ID filtering, database-per-tenant — and how each maps to DDIA Ch. 6 (Partitioning)
- Tenant-aware connection pooling and query routing — how the control plane directs requests to the right data shard
- Onboarding and tenant lifecycle management: provisioning, configuration, migration between tiers, and eventual offboarding with data deletion

**Diagram**: CategoryExplorer
- Three selectable isolation models (Silo, Pool, Bridge) each showing a visual architecture sketch, pros/cons bullets, cost profile, and when to choose it
- Clicking a model highlights which database/compute layers are shared vs dedicated

**OpenAgency Connection**: OpenAgency serves agencies managing multiple advertiser accounts across networks. A bridge model (shared compute, per-tenant Postgres schemas) lets small agencies share infrastructure while large enterprise clients can be promoted to silo isolation for compliance or performance guarantees.

**Quiz**

1. A SaaS platform notices that one large tenant's analytics queries slow down the entire database for all other tenants. Which isolation model change would most directly address this?
   - A) Move from silo to pool model to spread the load
   - B) Add row-level security policies to the shared database
   - **C) Move the large tenant from pool to silo isolation with a dedicated database** ✓
   - D) Increase the connection pool size for all tenants equally

2. In a row-level tenant isolation model, a developer forgets to add `WHERE tenant_id = ?` to a query. What is the most likely consequence?
   - A) The query fails with a permission error
   - **B) The query returns data belonging to other tenants (data leak)** ✓
   - C) The database rejects the query at the schema level
   - D) The query runs but returns empty results

---

### Section 13-1: Temporal Workflow Patterns

**Key Concepts**
- Durable execution model: workflow code that survives process crashes because the runtime journals every decision — contrast with traditional saga choreography and orchestration
- Core primitives: activities (side-effectful operations with retries), signals (external events sent to a running workflow), queries (read-only state inspection), timers (durable sleeps that survive restarts)
- Patterns for long-running workflows: continue-as-new to avoid unbounded history, child workflows for modular decomposition, fan-out/fan-in for parallel batch operations
- Versioning strategies for workflows that are already in flight when you deploy new code — deterministic replay constraints and the patching API

**Diagram**: AnimatedGraph
- Step-through animation of a campaign launch workflow: Start -> Validate Budget (activity) -> Create Ads on Google (activity) -> Create Ads on Meta (activity, parallel) -> Wait for Approval Signal -> Activate Campaign -> Schedule Daily Check (timer) -> Continue-As-New
- Shows how a crash at any step replays from journal without re-executing completed activities

**OpenAgency Connection**: OpenAgency uses Temporal as its core orchestration layer. Every campaign lifecycle (creation, budget pacing, bid adjustment, pause/resume, cross-network sync) is a Temporal workflow. Understanding durable execution is essential for debugging why a campaign got stuck or why a retry storm hit a network API.

**Quiz**

1. A Temporal workflow calls an activity to create a Google Ads campaign. The activity succeeds, but the worker crashes before recording the result. What happens when the workflow replays?
   - A) The workflow starts over from the beginning
   - B) The activity is skipped because Google already created the campaign
   - **C) The activity is retried, potentially creating a duplicate unless the activity is idempotent** ✓
   - D) The workflow permanently fails and must be manually restarted

2. A workflow has been running for 6 months, processing daily budget adjustments. Its event history has grown to 50,000 events and is slowing down. What is the recommended pattern?
   - A) Increase the Temporal server's memory allocation
   - B) Delete old events from the history using the Temporal API
   - **C) Use continue-as-new to start a fresh execution with carried-over state** ✓
   - D) Split the workflow into hourly child workflows retroactively

---

### Section 13-2: Stripe Billing Architecture

**Key Concepts**
- Webhook-driven architecture: Stripe as the source of truth for subscription state, with your system reacting to events (invoice.paid, subscription.updated, payment_intent.failed) rather than polling
- Idempotency and exactly-once billing: using idempotency keys on Stripe API calls and deduplicating webhook deliveries to prevent double-charges
- Subscription lifecycle modeling: trials, upgrades/downgrades (proration), metered usage billing, dunning (failed payment retry logic), and graceful degradation when payment lapses
- Reconciliation patterns: nightly jobs that compare your local billing state against Stripe's records to catch webhook delivery failures or race conditions

**Diagram**: AnimatedGraph
- Step-through of a subscription upgrade flow: User Clicks Upgrade -> Create Checkout Session -> Stripe Webhook: checkout.session.completed -> Update Local DB -> Stripe Webhook: invoice.paid -> Provision New Tier -> Send Confirmation
- Shows idempotency key usage and what happens when a webhook is delivered twice

**OpenAgency Connection**: OpenAgency bills agencies on usage-based tiers (number of managed accounts, ad spend under management). Stripe handles subscription management and metered billing. A missed webhook could mean an agency runs on a higher tier without being charged, or worse, gets downgraded mid-campaign.

**Quiz**

1. Your system receives the same `invoice.paid` webhook from Stripe three times due to network retries. Without idempotency handling, what is the most likely negative outcome?
   - A) Stripe charges the customer three times automatically
   - **B) Your system provisions the same resource three times or credits the account multiple times** ✓
   - C) The third webhook fails because Stripe marks it as expired
   - D) Nothing happens because Stripe deduplicates on its end

2. A nightly reconciliation job discovers that your local database shows a customer on the Free tier, but Stripe shows an active Pro subscription. What is the most likely root cause?
   - A) The customer manipulated the Stripe dashboard directly
   - **B) A webhook for `subscription.updated` was lost or failed to process** ✓
   - C) A race condition where two users upgraded simultaneously
   - D) The Stripe API returned incorrect data due to eventual consistency

---

### Section 13-3: Multi-Region Deployment with Data Residency

**Key Concepts**
- Motivations for multi-region: latency reduction, disaster recovery, and legal data residency requirements (GDPR requires EU user data stay in EU, similar laws in Brazil, India, etc.)
- Architecture patterns: active-passive (one primary, read replicas elsewhere), active-active (writes in multiple regions with conflict resolution — ties to DDIA Ch. 5 multi-leader), and follow-the-sun (route traffic to the region where it is daytime)
- Data residency implementation: geo-aware routing at the load balancer, per-tenant region assignment stored in a global control plane, and cross-region replication with filtering (only non-PII or aggregated data crosses borders)
- Failover and split-brain risks: how to handle a region outage without violating data residency constraints — you cannot simply redirect EU traffic to US-East

**Diagram**: TradeoffSlider
- Slider: Number of active regions (1 to 4)
- Toggle: Data residency enforcement ON/OFF
- Computed metrics: Write latency (p50/p99), Failover time (RTO), Infrastructure cost multiplier, Compliance risk score
- Shows how adding regions reduces latency but increases cost and complexity, and how residency constraints limit failover options

**OpenAgency Connection**: OpenAgency serves agencies across North America and Europe. EU agencies managing campaigns with EU audience data must have that data stored in EU regions. The platform needs geo-aware tenant routing so that a Berlin agency's campaign data never leaves eu-west, while the US control plane can still show aggregated (non-PII) cross-region dashboards.

**Quiz**

1. An active-active multi-region system experiences a network partition between US-East and EU-West. Both regions continue accepting writes. When the partition heals, what challenge must be resolved?
   - A) All writes from the slower region must be discarded
   - **B) Conflicting writes to the same records must be detected and resolved** ✓
   - C) Both regions must halt writes until a leader election completes
   - D) The system must replay all writes in timestamp order, which is always deterministic

2. A data residency regulation requires that EU customer PII must not leave the EU region. During a full EU-West outage, which is the correct response?
   - A) Failover EU customer traffic to US-East temporarily and replicate back later
   - B) Serve cached EU data from US-East in read-only mode
   - **C) EU customer data operations become unavailable until EU-West recovers; non-PII features may continue from other regions** ✓
   - D) Encrypt EU data and send it to US-East, since encryption satisfies residency requirements

---

## Chapter 14: Operational Infrastructure (3 sections)

*Covers the cross-cutting operational concerns that keep a production system observable, compliant, and resilient: rate limiting at scale, audit logging for compliance, and detecting the subtle failures that don't trigger alarms.*

---

### Section 14-0: Distributed Rate Limiting

**Key Concepts**
- Why local rate limiting fails in distributed systems: N servers each allowing K requests per second means the actual limit is N*K — and rebalancing or scaling changes the effective limit
- Algorithms: token bucket (smooth, allows bursts), sliding window log (precise but memory-heavy), sliding window counter (approximate, low memory) — and when each is appropriate
- Centralized vs distributed approaches: Redis-based global counter (simple but adds latency + single point of failure), gossip-based approximate counters (eventual consistency), and hierarchical (local fast-path with periodic global sync)
- Rate limiting across external APIs: respecting per-network rate limits (Google Ads API, Meta Marketing API each with different quota schemes), backpressure propagation, and adaptive throttling with exponential backoff

**Diagram**: TradeoffSlider
- Slider: Request volume (100 to 100,000 RPS)
- Toggle: Algorithm (Token Bucket / Sliding Window / Distributed Gossip)
- Computed metrics: Memory usage, Accuracy (% deviation from target limit), Latency overhead (ms), Burst tolerance
- Shows how algorithms trade precision for performance at scale

**OpenAgency Connection**: OpenAgency integrates with 8+ ad network APIs, each with unique rate limits (Google Ads: 15,000 operations/day per MCC, Meta: 200 calls/hour per ad account). A distributed rate limiter must track per-tenant, per-network, per-endpoint quotas and propagate backpressure to Temporal workflows that orchestrate bulk campaign operations.

**Quiz**

1. A platform runs 10 API servers, each with a local token bucket allowing 100 requests/second per client. A client sends requests through a load balancer. What is the effective rate limit the client experiences?
   - A) 100 requests/second, since each server enforces the limit independently
   - **B) Up to 1,000 requests/second, since each server tracks its own bucket** ✓
   - C) 10 requests/second, since the limit is divided across servers
   - D) Exactly 100 requests/second, because the load balancer coordinates

2. An ad platform uses a centralized Redis counter for rate limiting Google Ads API calls. During a Redis failover (3 seconds), what is the safest behavior?
   - A) Allow all requests through with no limit until Redis recovers
   - B) Reject all requests until Redis recovers
   - **C) Fall back to a conservative local rate limit per server to avoid exceeding the API quota** ✓
   - D) Queue all requests and replay them after Redis recovers

---

### Section 14-1: SOC 2 Audit Logging

**Key Concepts**
- What SOC 2 requires: logging of access to customer data, changes to security-relevant configuration, authentication events, and data export — with tamper-evidence and retention guarantees
- Append-only log architecture: why audit logs must be immutable (write once, read many), how to implement tamper detection with hash chains or Merkle trees, and separation of the audit log store from the operational database
- Structured logging schema design: who (actor identity + IP + session), what (action type + resource), when (server timestamp + client timestamp), outcome (success/failure + reason), and context (tenant, request ID for correlation)
- Retention, search, and access patterns: hot (recent, fast query) vs cold (archived to object storage), time-based partitioning, and building a compliance dashboard without making the audit log a performance bottleneck

**Diagram**: ExpandableCards
- Four cards: "Authentication Events", "Data Access Logging", "Configuration Changes", "Data Export & Deletion"
- Each card expands to show: what events are captured, the log schema for that category, retention requirements, and an example log entry
- OpenAgency callout within each card relating it to a specific compliance scenario

**OpenAgency Connection**: OpenAgency handles advertiser financial data (spend, billing) and PII (contact info, audience segments). SOC 2 Type II auditors will ask to see proof that every access to customer data is logged, that admin configuration changes are tracked, and that logs cannot be retroactively altered. The audit log is also the foundation for building a customer-facing activity feed.

**Quiz**

1. A SOC 2 auditor asks to verify that no one has tampered with the audit logs from the past 90 days. Which architectural property makes this verification possible?
   - A) The logs are stored in a SQL database with row-level locking
   - B) The logs are encrypted at rest using AES-256
   - **C) Each log entry includes a cryptographic hash of the previous entry, forming a verifiable chain** ✓
   - D) The logs are replicated to three availability zones

2. An engineer needs to debug a production issue and runs a query that reads customer campaign data directly from the database. From a SOC 2 perspective, what should the audit system capture?
   - A) Only the query results, so the auditor can verify what data was accessed
   - B) Nothing, because the engineer has production database access
   - **C) The engineer's identity, the query executed, the data resources accessed, and the timestamp** ✓
   - D) Only the fact that a login occurred, not the specific data accessed

---

### Section 14-2: Gray Failure Detection

**Key Concepts**
- What gray failures are: the system is not fully down but is degraded in ways that health checks miss — elevated latency, partial packet loss, one CPU core stuck, a disk that serves reads but corrupts writes, a network path that works for small packets but drops large ones
- Why traditional monitoring misses them: binary health checks (pass/fail), threshold-based alerts that miss slow degradation, and aggregated metrics that hide per-tenant or per-shard anomalies
- Detection strategies: differential observability (comparing the view of the system from the client vs the server), multi-dimensional anomaly detection (latency percentiles, error rates, and throughput together), canary requests, and application-level liveness probes that exercise real code paths
- Response patterns: automatic traffic draining from gray-failed nodes, circuit breakers with graduated states (closed -> half-open -> open), and correlation engines that connect gray failure symptoms to root causes

**Diagram**: AnimatedGraph
- Step-through of a gray failure scenario: Normal Operation -> Disk develops intermittent latency (health check still passes) -> p99 latency rises but p50 stays normal -> A few tenants on affected shard report slowness -> Differential probe detects client-observed latency vs server-reported latency mismatch -> Node is drained, traffic reroutes -> Degraded node flagged for investigation
- Highlights at each step what traditional monitoring sees vs what differential observability reveals

**OpenAgency Connection**: A gray failure on a node serving Meta API sync workflows could cause a subset of agencies to see stale campaign data while dashboards report all systems healthy. Differential observability (comparing expected sync freshness vs actual per-tenant data age) catches this before customers report it.

**Quiz**

1. A server passes all TCP health checks and returns HTTP 200 on its health endpoint, yet 5% of requests to this server time out after 30 seconds. What type of failure is this?
   - A) A Byzantine fault, because the server is lying about its health
   - **B) A gray failure, because the server is partially degraded but not detected by binary health checks** ✓
   - C) A network partition, because some packets are being dropped
   - D) A cascading failure, because the timeouts will spread to other services

2. Which detection approach is most effective at catching a scenario where a database replica serves stale reads (30 seconds behind the leader) but all health checks pass?
   - A) Increasing the frequency of TCP health checks from 10s to 1s
   - B) Adding a CPU and memory utilization alert at 80% threshold
   - **C) Canary queries that write a timestamped value to the leader and read it back from the replica, alerting on staleness** ✓
   - D) Enabling verbose query logging and reviewing logs daily

---

## Chapter 15: Data Pipeline & Analytics Patterns (3 sections)

*Covers the data engineering challenges specific to ad tech and multi-network platforms: normalizing disparate data sources, handling high-volume time-series metrics, and modeling attribution across channels.*

---

### Section 15-0: Cross-Network Data Normalization

**Key Concepts**
- The schema heterogeneity problem: each ad network (Google, Meta, Amazon, TikTok, LinkedIn, Pinterest, Snapchat, Microsoft) uses different terminology (campaign/ad group/ad vs campaign/ad set/ad), different metric definitions (impressions, clicks, conversions measured differently), different time zones, and different currency handling
- Canonical data model design: defining an internal unified schema that all network data maps into — the tradeoffs between a thin wrapper (preserves source fidelity, harder to query across networks) and a fat canonical model (easier cross-network queries, lossy transformation)
- ETL vs ELT approaches: transform on ingestion (ETL — simpler downstream, but pipeline failures lose data) vs load raw then transform (ELT — preserves raw data, more complex queries, better for debugging)
- Handling schema drift: when a network API adds, renames, or removes fields — versioned adapters, schema registry, and backward-compatible evolution (ties to DDIA Ch. 4)

**Diagram**: CategoryExplorer
- Selectable ad networks (Google, Meta, Amazon, TikTok) each showing their native terminology and schema
- A central "Canonical Model" panel shows the unified representation
- Clicking a network highlights the field mappings (e.g., Meta "Ad Set" -> Canonical "Ad Group") with color-coded transformation complexity (green = direct map, yellow = computation needed, red = no equivalent)

**OpenAgency Connection**: This is a core daily challenge for OpenAgency. When an agency views a unified dashboard showing performance across Google and Meta, the platform must have already normalized "Cost Per Result" (Meta) and "Cost/Conv." (Google) into a single "Cost Per Conversion" metric with consistent attribution windows.

**Quiz**

1. Google Ads reports conversions using a 30-day click attribution window, while Meta defaults to a 7-day click / 1-day view window. An agency sees combined "Total Conversions" on a unified dashboard. What is the primary risk?
   - A) The total will always be lower than the real number
   - **B) Conversions are double-counted (the same real-world conversion attributed by both networks) and the windows make metrics non-comparable** ✓
   - C) Google conversions will always appear higher because of the longer window
   - D) The data will fail to load because the schemas are incompatible

2. A canonical data model uses a "thin wrapper" approach that preserves each network's raw field names alongside normalized fields. What is the main advantage over a "fat canonical" model?
   - A) It uses less storage space
   - B) Cross-network queries are simpler to write
   - **C) No source data is lost during normalization, enabling debugging and reprocessing when mapping logic changes** ✓
   - D) It eliminates the need for network-specific API adapters

---

### Section 15-1: High-Cardinality Time-Series Data

**Key Concepts**
- What makes ad tech time-series hard: the cardinality explosion from combining dimensions (tenant * network * campaign * ad group * ad * metric * hour = billions of unique series), versus typical infrastructure monitoring which has low cardinality
- Storage engine design for time-series: columnar storage with time-based partitioning, downsampling and rollups (raw 1-minute data -> hourly -> daily aggregates), and compression techniques (delta-of-delta, gorilla encoding, dictionary encoding for tags)
- Query patterns and indexing: fast range scans over time, tag-based filtering (WHERE network='meta' AND tenant_id='abc'), pre-aggregation vs on-the-fly aggregation tradeoffs
- Retention tiers: hot data (recent, fast SSD, full resolution) -> warm data (weeks old, cheaper storage, hourly rollups) -> cold data (months old, object storage, daily rollups) — automated tiering policies

**Diagram**: TradeoffSlider
- Slider: Data retention resolution (1-minute raw, 5-minute, Hourly rollup, Daily rollup)
- Slider: Number of dimension combinations (cardinality: 1K, 10K, 100K, 1M, 10M)
- Computed metrics: Storage cost/month, Query latency (p50), Data fidelity (% of detail preserved), Ingest throughput capacity
- Shows the storage-fidelity-cost triangle as cardinality and resolution change

**OpenAgency Connection**: OpenAgency ingests hourly performance metrics (impressions, clicks, spend, conversions) for every ad across every network for every tenant. At scale, this produces millions of time-series. The platform needs sub-second dashboard queries over recent data (hot) while retaining months of historical data for trend analysis (cold) without bankrupting the infrastructure budget.

**Quiz**

1. A time-series database stores ad performance metrics with dimensions: tenant_id (1,000 values), network (8), campaign_id (50,000), and metric_type (20). What is the maximum number of unique time-series?
   - A) 59,028 (sum of all dimension values)
   - B) 1,000,000 (tenant_id * tenant_id)
   - **C) 8,000,000,000 (1,000 * 8 * 50,000 * 20 = product of all dimension values)** ✓
   - D) 51,028 (largest dimension squared)

2. A platform stores raw minute-level metrics for 90 days but queries older than 7 days are almost always at daily granularity. Which optimization gives the best cost-performance tradeoff?
   - A) Delete all data older than 7 days
   - B) Move all data to object storage after 7 days
   - **C) Downsample data older than 7 days to hourly rollups, and data older than 30 days to daily rollups, deleting the raw data** ✓
   - D) Keep all raw data but move it to slower disks after 7 days

---

### Section 15-2: Attribution Modeling

**Key Concepts**
- The attribution problem: a user sees a TikTok video ad, clicks a Google search ad, then converts via a Meta retargeting ad — which channel gets credit for the conversion? This is fundamentally a data systems problem (collecting touchpoints, joining them to conversions, applying a model)
- Attribution models: last-click (simple, biased toward bottom-funnel), first-click (biased toward awareness), linear (equal credit, ignores timing), time-decay (recent touchpoints weighted more), and data-driven/algorithmic (ML-based, requires volume)
- Technical infrastructure: cross-device identity resolution, click/impression event collection at scale, conversion postback ingestion from each network, and the join operation that connects a conversion to its touchpoint chain (a variant of stream-table join from DDIA Ch. 11)
- Privacy constraints and the deprecation of third-party cookies: how server-side conversion APIs (Meta CAPI, Google Enhanced Conversions), first-party data strategies, and privacy-preserving measurement (aggregated reporting, differential privacy) are reshaping what attribution data is even available

**Diagram**: Custom (Interactive Attribution Flow)
- A visual user journey timeline showing touchpoints across networks (TikTok impression -> Google click -> Meta click -> Conversion)
- Toggle between attribution models (Last Click, First Click, Linear, Time Decay, Data-Driven)
- Each model redistributes credit percentages across the touchpoints with animated bar charts
- Shows how the "winning" channel changes depending on the model chosen

**OpenAgency Connection**: Attribution modeling directly affects how OpenAgency reports ROI to agencies and how budget allocation recommendations are generated. If the platform only supports last-click attribution, it systematically undervalues awareness campaigns on TikTok and overvalues retargeting on Meta, leading agencies to misallocate spend.

**Quiz**

1. An agency runs campaigns on Google (search), Meta (retargeting), and TikTok (awareness video). Under last-click attribution, which channel will consistently receive the most conversion credit?
   - A) TikTok, because it generates the first touchpoint
   - B) Google, because search ads have the highest intent
   - **C) Meta retargeting, because retargeting ads are typically the last click before conversion** ✓
   - D) Credit will be distributed equally because all channels contributed

2. A platform collects user touchpoint data using third-party cookies to track cross-site behavior. With browser vendors deprecating third-party cookies, which approach preserves attribution capability?
   - A) Switch to fingerprinting techniques to track users without cookies
   - B) Ask users to disable cookie-blocking browser extensions
   - **C) Implement server-side conversion APIs (e.g., Meta CAPI, Google Enhanced Conversions) using first-party data** ✓
   - D) Rely entirely on last-click attribution since it does not require cross-site tracking

---

## Summary: Full TOC at a Glance

```
Part VI: Gaps & Recommendations

Chapter 13: Platform Architecture Patterns
  13-0  Multi-Tenant SaaS Architecture           [CategoryExplorer]
  13-1  Temporal Workflow Patterns                [AnimatedGraph]
  13-2  Stripe Billing Architecture               [AnimatedGraph]
  13-3  Multi-Region with Data Residency          [TradeoffSlider]

Chapter 14: Operational Infrastructure
  14-0  Distributed Rate Limiting                 [TradeoffSlider]
  14-1  SOC 2 Audit Logging                       [ExpandableCards]
  14-2  Gray Failure Detection                    [AnimatedGraph]

Chapter 15: Data Pipeline & Analytics Patterns
  15-0  Cross-Network Data Normalization          [CategoryExplorer]
  15-1  High-Cardinality Time-Series Data         [TradeoffSlider]
  15-2  Attribution Modeling                      [Custom]
```

**Totals**: 3 chapters, 10 sections, 20 quiz questions, 10 OpenAgency connections, 10 interactive diagrams.

**Diagram primitive usage**:
- AnimatedGraph: 3 (Temporal workflows, Stripe billing, Gray failure detection)
- CategoryExplorer: 2 (Multi-tenant models, Cross-network normalization)
- TradeoffSlider: 3 (Multi-region, Rate limiting, Time-series)
- ExpandableCards: 1 (SOC 2 audit logging)
- Custom: 1 (Attribution modeling — interactive timeline with model toggling)

---

## Implementation Notes

- Section IDs follow existing convention: `13-0` through `15-2`
- TOC entry for Part VI should use `part: "VI"` with `title: "Gaps & Recommendations"`
- Each chapter object needs `ready: true` and the corresponding `Ch13Content`, `Ch14Content`, `Ch15Content` content objects
- The Custom diagram for Attribution Modeling (15-2) is the only new component type — it combines a horizontal timeline with animated bar charts, both of which have precedents in existing primitives
- Quiz questions target conceptual understanding of tradeoffs, not terminology recall, consistent with the spec's content authoring guidelines
