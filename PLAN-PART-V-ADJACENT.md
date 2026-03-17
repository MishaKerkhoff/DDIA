# Part V: Adjacent Subjects to Master — Section Plan

## Overview

Part V extends beyond DDIA's core material into 11 adjacent domains that every data-intensive application builder must understand. These are organized into 4 chapters of 3 sections each (except Chapter 16, which has 2), totaling 11 sections.

**Chapter numbering** continues from Part IV (assumed to be Chapters 13-14), so Part V starts at Chapter 15.

**Section ID format**: `"{chapter}-{index}"` (e.g., `"15-0"`, `"15-1"`, etc.)

---

## TOC Structure

```
Part V. Adjacent Subjects to Master

  Chapter 15: Infrastructure Foundations
    15-0  Networking: From Packets to Protocols (L3-L7)
    15-1  Operating Systems: What Every Backend Engineer Should Know
    15-2  Cloud Architecture: Designing for the Cloud

  Chapter 16: Protecting and Connecting Systems
    16-0  Security & Authentication
    16-1  API Design
    16-2  Observability

  Chapter 17: Architecture at Scale
    17-0  Distributed Systems Theory
    17-1  System Design
    17-2  Data Modeling

  Chapter 18: Operating Production Systems
    18-0  Site Reliability Engineering
    18-1  Cost Engineering & FinOps
```

---

## Chapter 15: Infrastructure Foundations

*The physical and virtual layers beneath your application. Networks carry your data, operating systems schedule your processes, and cloud platforms host it all.*

---

### Section 15-0: Networking — From Packets to Protocols

**Key Concepts:**
- The OSI/TCP-IP model: L3 (IP routing, subnets, CIDR), L4 (TCP vs UDP, connection management, congestion control), L7 (HTTP/1.1 vs HTTP/2 vs HTTP/3, gRPC, WebSockets)
- DNS resolution, TTLs, and how DNS failures cascade; CDN edge caching and anycast routing
- Load balancing strategies: L4 (connection-level, DSR) vs L7 (request-level, path-based routing, sticky sessions); health checks and drain connections
- TLS handshake overhead, connection pooling, keep-alive, head-of-line blocking in HTTP/2 vs QUIC's solution in HTTP/3

**Diagram:** `AnimatedGraph`
- Visualize a request's journey from client to server: DNS lookup -> TCP handshake -> TLS handshake -> HTTP request -> L7 load balancer -> backend server -> response. Step through each phase showing latency accumulation. Toggle between HTTP/1.1 (new connection per request), HTTP/2 (multiplexed streams), and HTTP/3 (QUIC, 0-RTT).

**OpenAgency Connection:** OpenAgency makes API calls to 8+ ad networks (Google, Meta, TikTok, Amazon, etc.) each with different endpoint latencies. Understanding connection pooling and HTTP/2 multiplexing is critical for reducing the overhead of thousands of daily API calls. L7 load balancing routes dashboard traffic separately from async Temporal workers.

**Quiz:**

**Q1:** Why does HTTP/2 still suffer from head-of-line blocking despite multiplexing multiple streams over a single connection?
- A) HTTP/2 requires each stream to complete before starting the next
- B) TCP treats all streams as a single byte stream, so a lost packet blocks all streams **(CORRECT)**
- C) HTTP/2 does not actually support multiplexing
- D) The TLS layer serializes all streams into one encrypted channel

**Q2:** An L4 load balancer distributes traffic based on IP/port, while an L7 load balancer inspects the application layer. Which scenario requires L7?
- A) Distributing TCP connections evenly across backend servers
- B) Routing `/api/campaigns` to the campaign service and `/api/billing` to the billing service **(CORRECT)**
- C) Performing Direct Server Return to reduce load balancer bandwidth
- D) Distributing UDP packets for a real-time video stream

---

### Section 15-1: Operating Systems — What Every Backend Engineer Should Know

**Key Concepts:**
- Process vs thread vs coroutine: scheduling, context switching costs, and why async I/O (epoll/kqueue/io_uring) matters for high-concurrency servers
- Virtual memory, page faults, memory-mapped files, and how databases exploit mmap (and why some avoid it)
- File systems and I/O: buffered vs direct I/O, fsync semantics, write-ahead logging from the OS perspective, why SSDs change everything (random reads become cheap, write amplification)
- CPU caches, NUMA topology, and how data locality affects performance at scale; cgroups and namespaces as the foundation of containers

**Diagram:** `CategoryExplorer`
- Categories: "Process Model" (fork, threads, async), "Memory" (virtual memory, page cache, OOM killer), "I/O" (buffered, direct, mmap, fsync), "Containers" (cgroups, namespaces, overlay FS). Each category expands to show the concept with a brief explanation of when it matters for data systems.

**OpenAgency Connection:** When Temporal workers process campaign sync workflows, understanding OS-level resource isolation matters. Each worker container has cgroup limits on CPU and memory. If a worker OOMs during a large campaign import, the OS kills it, and Temporal retries the activity. Knowing how the page cache works explains why repeated reads of campaign data are fast without explicit application caching.

**Quiz:**

**Q1:** A database uses `fsync()` after writing to its write-ahead log. What does this guarantee?
- A) The data is replicated to another server
- B) The data has been flushed from the OS page cache to durable storage **(CORRECT)**
- C) The data is visible to other processes reading the same file
- D) The data has been compressed and optimized on disk

**Q2:** Why do high-concurrency web servers (like nginx) use event-driven I/O with epoll instead of spawning one thread per connection?
- A) Threads cannot handle network I/O
- B) Epoll provides built-in encryption for connections
- C) Context switching thousands of threads wastes CPU time, while epoll handles many connections in a single thread **(CORRECT)**
- D) The operating system limits each process to 256 threads

---

### Section 15-2: Cloud Architecture — Designing for the Cloud

**Key Concepts:**
- Cloud-native design principles: cattle-not-pets, design for failure, immutable infrastructure, infrastructure as code (Terraform/Pulumi)
- Compute spectrum: VMs (EC2) vs containers (ECS/EKS) vs serverless (Lambda) — cost, cold start, scaling characteristics, and when each fits
- Managed services vs self-hosted: RDS vs self-managed Postgres, managed Kafka vs self-run, ElastiCache vs Redis on EC2 — operational overhead tradeoffs
- Multi-region architecture: active-passive vs active-active, data residency requirements, cross-region replication latency, global load balancing

**Diagram:** `TradeoffSlider`
- Two sliders: "Operational Control" (fully managed <-> self-hosted) and "Workload Burstiness" (steady <-> spiky). The visualization shows how different combinations favor different compute models (serverless, containers, VMs) with cost and latency projections. A bar chart shows relative cost at different scales.

**OpenAgency Connection:** OpenAgency runs on AWS with ECS for Temporal workers, RDS Postgres for transactional data, and Lambda for lightweight webhook handlers from ad network callbacks. The decision of managed vs self-hosted directly impacts the team's operational burden. Choosing RDS over self-managed Postgres means trading control over pg_hba.conf for never worrying about failover again.

**Quiz:**

**Q1:** You have a workload that runs for 2 minutes every hour processing ad network webhooks. Which compute model is most cost-effective?
- A) A dedicated EC2 instance running 24/7
- B) A containerized service on ECS with minimum 1 task always running
- C) A serverless function (Lambda) triggered by the webhook events **(CORRECT)**
- D) A reserved instance with a 3-year commitment

**Q2:** What is the primary risk of an active-active multi-region database deployment compared to active-passive?
- A) Higher network bandwidth costs
- B) Write conflicts when the same record is modified in two regions simultaneously **(CORRECT)**
- C) Inability to serve read traffic from both regions
- D) DNS failover takes longer to propagate

---

## Chapter 16: Protecting and Connecting Systems

*How systems authenticate users, expose functionality to consumers, and make their internal behavior visible to operators.*

---

### Section 16-0: Security & Authentication

**Key Concepts:**
- Authentication vs authorization: OAuth 2.0 flows (authorization code, client credentials, PKCE), OpenID Connect for identity, JWTs (claims, signing, expiration, refresh tokens), session management
- Zero trust architecture: never trust the network, always verify, least privilege, microsegmentation; contrast with perimeter security
- Common vulnerabilities: OWASP Top 10 (injection, broken auth, SSRF, etc.), secrets management (Vault, AWS Secrets Manager, rotation), supply chain security
- TLS everywhere, certificate management, mTLS for service-to-service, RBAC vs ABAC for fine-grained authorization

**Diagram:** `AnimatedGraph`
- Visualize an OAuth 2.0 authorization code flow with PKCE: User -> Client App -> Authorization Server -> Resource Server. Step through: (1) user clicks login, (2) redirect to auth server with code challenge, (3) user authenticates, (4) auth server redirects with code, (5) client exchanges code + verifier for tokens, (6) client calls API with access token, (7) token expires, refresh flow. Highlight where each security boundary sits.

**OpenAgency Connection:** OpenAgency users authenticate via OAuth 2.0 / OIDC. The platform then uses stored OAuth tokens to access ad network APIs on behalf of users (Google Ads API, Meta Marketing API, etc.) — this is a delegated authorization pattern. Secrets like API keys and refresh tokens must be encrypted at rest and rotated. SOC 2 compliance requires audit logging of every authentication event and permission change.

**Quiz:**

**Q1:** In OAuth 2.0, why does the authorization code flow use an intermediate code instead of returning the access token directly in the redirect URL?
- A) The code is shorter than a token and fits in the URL
- B) Redirecting the token in the URL exposes it in browser history and server logs; the code is exchanged server-side over a secure channel **(CORRECT)**
- C) Authorization codes can be used multiple times, making them more versatile
- D) The browser cannot store access tokens in memory

**Q2:** A zero trust architecture assumes which of the following?
- A) All traffic inside the corporate network is trustworthy
- B) The firewall is sufficient to protect internal services
- C) Every request must be authenticated and authorized regardless of network location **(CORRECT)**
- D) VPN access grants full trust to all internal resources

---

### Section 16-1: API Design

**Key Concepts:**
- REST principles (resources, verbs, status codes, HATEOAS), GraphQL (schema, resolvers, N+1 problem, federation), gRPC (protobuf, streaming, code generation) — when each style fits
- API versioning strategies: URL path (/v1/, /v2/), header-based, query parameter; backward compatibility and deprecation policies
- Pagination (cursor vs offset), filtering, rate limiting (token bucket, sliding window), idempotency keys for safe retries
- API gateway patterns: authentication, rate limiting, request transformation, circuit breaking; BFF (Backend for Frontend) pattern

**Diagram:** `CategoryExplorer`
- Three categories: "REST" (resource-oriented, HTTP verbs, caching-friendly, over-fetching risk), "GraphQL" (client-driven queries, single endpoint, schema introspection, complexity management), "gRPC" (binary protobuf, bidirectional streaming, code-gen, not browser-native). Each expands with strengths, weaknesses, and best-fit scenarios.

**OpenAgency Connection:** OpenAgency exposes a REST API for its dashboard and a webhook receiver for ad network callbacks. Internally, Temporal workers communicate via gRPC. Each ad network has its own API style (Google Ads uses gRPC, Meta uses REST with GraphQL-like batch endpoints, Amazon uses REST). Understanding API design helps build a unified internal abstraction over these diverse external APIs. Idempotency keys are essential when retrying failed campaign update calls.

**Quiz:**

**Q1:** A client needs to fetch a campaign with its ad groups and ads in a single request. Which API style handles this most efficiently without over-fetching?
- A) REST with nested resource endpoints
- B) GraphQL, where the client specifies exactly which fields and nested objects to return **(CORRECT)**
- C) gRPC with a GetCampaign RPC
- D) REST with query parameter `?include=adGroups,ads`

**Q2:** An API uses offset-based pagination (`?offset=1000&limit=50`). What problem occurs if new records are inserted while the client paginates?
- A) The API server runs out of memory
- B) Records can be duplicated or skipped because the offset shifts as new data is inserted **(CORRECT)**
- C) The response time increases exponentially with higher offsets
- D) The client receives records in random order

---

### Section 16-2: Observability

**Key Concepts:**
- The three pillars: metrics (counters, gauges, histograms — Prometheus, Datadog), logs (structured logging, log aggregation, ELK/Loki), traces (distributed tracing, span context propagation, Jaeger/Tempo)
- OpenTelemetry as the convergence standard: auto-instrumentation, SDK, collector architecture, OTLP protocol
- SLOs, SLIs, and error budgets: defining reliability targets, measuring them, and using error budgets to balance feature velocity with reliability
- Alerting strategy: symptom-based vs cause-based alerts, alert fatigue, runbooks, on-call practices; dashboards that answer questions vs dashboards that look pretty

**Diagram:** `AnimatedGraph`
- Trace a single user request through a distributed system: Browser -> API Gateway -> Campaign Service -> Database + Cache -> Ad Network API -> back through the chain. At each hop, show how a trace span is created and how metrics are emitted. Animate a failure scenario where the ad network call times out, showing how the trace pinpoints the bottleneck and how the error rate SLI ticks up.

**OpenAgency Connection:** OpenAgency must observe Temporal workflow executions, ad network API latencies per platform, Stripe webhook processing times, and dashboard response times. An SLO like "99.5% of campaign sync workflows complete within 5 minutes" drives alerting. When Meta's API degrades, distributed tracing shows exactly which step in the workflow is slow, rather than hunting through logs.

**Quiz:**

**Q1:** Your team has an SLO of 99.9% availability (43.8 minutes of downtime per month). You have consumed 30 minutes of your error budget. What should this signal?
- A) Immediately halt all deployments until next month
- B) The team should slow down on risky changes and prioritize reliability work, as the budget is nearly exhausted **(CORRECT)**
- C) 99.9% is too aggressive; lower the SLO to 99%
- D) Error budgets are only theoretical and should not influence engineering decisions

**Q2:** A user reports that the dashboard is slow. You check metrics and see normal CPU/memory. What observability tool is most useful next?
- A) Check application logs for error messages
- B) Look at a distributed trace for a slow request to identify which service or dependency is the bottleneck **(CORRECT)**
- C) Increase the number of dashboard replicas
- D) Check the disk I/O metrics on the database server

---

## Chapter 17: Architecture at Scale

*The theory and practice of designing systems that work correctly under distribution, high load, and evolving requirements.*

---

### Section 17-0: Distributed Systems Theory

**Key Concepts:**
- CAP theorem and its practical successor PACELC: understanding that the real tradeoff is latency vs consistency during normal operation, not just during partitions
- Consensus protocols beyond DDIA's coverage: Raft (leader election, log replication, safety proof), Paxos family, and why ZooKeeper/etcd exist; practical implications for leader election and configuration management
- CRDTs (Conflict-free Replicated Data Types): G-counters, PN-counters, LWW-registers, OR-sets; how they enable eventual consistency without coordination; local-first software
- The FLP impossibility result, failure detectors (perfect vs eventually perfect), and the spectrum from strong consistency to eventual consistency; vector clocks and causal ordering in practice

**Diagram:** `TradeoffSlider`
- A slider from "Strong Consistency" to "Eventual Consistency" with stops at linearizable, sequential, causal, and eventual. At each position, show the latency cost, availability characteristics, and example systems (e.g., Spanner at linearizable, DynamoDB at eventual). A second toggle for "Network Partition Active: Yes/No" that shifts the available options per CAP/PACELC.

**OpenAgency Connection:** OpenAgency's campaign state must be consistent (you cannot spend budget on a paused campaign), but cross-network analytics can be eventually consistent. Understanding the consistency spectrum helps decide: use strong consistency for budget/billing (Postgres with serializable isolation), eventual consistency for dashboard analytics (materialized views refreshed every few seconds), and CRDTs if building collaborative campaign editing.

**Quiz:**

**Q1:** PACELC extends CAP by adding a tradeoff that applies even when there is no network partition. What is that tradeoff?
- A) Consistency vs Availability
- B) Latency vs Consistency **(CORRECT)**
- C) Throughput vs Durability
- D) Scalability vs Simplicity

**Q2:** A CRDT G-Counter allows multiple nodes to increment a counter without coordination. How does it resolve concurrent increments?
- A) It uses a central coordinator to serialize increments
- B) Each node maintains its own count, and the total is the sum of all node counts — concurrent increments never conflict **(CORRECT)**
- C) It uses vector clocks to determine which increment happened first
- D) It randomly picks one increment and discards the other

---

### Section 17-1: System Design

**Key Concepts:**
- The system design process: requirements gathering (functional and non-functional), back-of-envelope estimation (QPS, storage, bandwidth), high-level design, then deep dives on critical components
- Key building blocks: load balancers, caches (CDN, application, database query cache), message queues, databases, blob storage, search indexes — and how they compose
- Caching strategies in depth: cache-aside, write-through, write-behind, read-through; cache invalidation (TTL, event-driven, versioned keys); thundering herd and cache stampede; Redis vs Memcached
- Rate limiting and back-pressure: token bucket, leaky bucket, sliding window log, sliding window counter; client-side vs server-side; distributed rate limiting with Redis

**Diagram:** `ExpandableCards`
- Cards for the core building blocks: "Load Balancer", "Cache Layer", "Message Queue", "Primary Database", "Search Index", "Blob Storage", "CDN". Each card expands to show: what it does, when to introduce it, scaling characteristics, failure modes, and an example configuration for a system handling 10K RPS.

**OpenAgency Connection:** OpenAgency's system design composes all of these building blocks: CloudFront CDN for static dashboard assets, Redis for caching frequently-accessed campaign data and rate limit counters, SQS/Temporal for async processing, Postgres for transactional data, S3 for ad creative assets, and Elasticsearch for campaign search. Rate limiting is critical when OpenAgency must respect per-account API rate limits imposed by Google Ads (15K operations/day) and Meta Marketing API.

**Quiz:**

**Q1:** Your cache has a TTL of 5 minutes. A popular campaign's cache entry expires and 1,000 concurrent requests hit the database simultaneously. What is this problem called?
- A) Cache poisoning
- B) Cache stampede (thundering herd) **(CORRECT)**
- C) Cache partitioning
- D) Write amplification

**Q2:** You need to rate-limit API calls to 100 requests per minute per user. Which algorithm allows brief bursts above the average rate while still enforcing the overall limit?
- A) Fixed window counter
- B) Token bucket **(CORRECT)**
- C) Leaky bucket
- D) Strict FIFO queue

---

### Section 17-2: Data Modeling

**Key Concepts:**
- Normalization vs denormalization: 1NF through 3NF and BCNF, when to denormalize for read performance, the cost of joins vs the cost of data anomalies
- Schema design patterns: single-table design (DynamoDB), polymorphic associations, EAV (Entity-Attribute-Value) and why it is usually a mistake, JSON columns in relational databases, time-series data modeling
- Event sourcing and CQRS: storing events as the source of truth, deriving read models, temporal queries ("what was the state at time T?"), compaction and snapshots
- Multi-tenant data modeling: shared database with tenant_id column, schema-per-tenant, database-per-tenant — isolation, cost, and complexity tradeoffs

**Diagram:** `CategoryExplorer`
- Categories: "Normalized Relational" (3NF, joins, no anomalies), "Denormalized / Document" (embedded data, fast reads, update anomalies), "Event Sourced" (append-only events, derived views, temporal queries), "Single-Table NoSQL" (access-pattern-driven, composite keys, GSIs). Each category shows the same "campaign with ad groups" data modeled in that style, with pros and cons.

**OpenAgency Connection:** OpenAgency is multi-tenant SaaS — every query must be scoped by tenant. Campaign data uses a relational model in Postgres with tenant_id on every table, plus JSON columns for platform-specific ad creative payloads that vary across Google, Meta, TikTok. Billing events are modeled as an append-only event log (event sourcing pattern) so that any invoice can be reconstructed from the event history, which is critical for SOC 2 audit trails.

**Quiz:**

**Q1:** In a multi-tenant SaaS application using a shared database with a `tenant_id` column, what is the biggest risk if a query accidentally omits the tenant_id filter?
- A) The query will return an empty result set
- B) Data from other tenants is exposed, creating a security and privacy breach **(CORRECT)**
- C) The database will reject the query automatically
- D) The query will only be slower but still return correct results

**Q2:** Event sourcing stores every state change as an immutable event. What problem does this create as the event log grows, and how is it typically solved?
- A) Events become inconsistent; solved by periodic validation
- B) Replaying all events to rebuild state becomes slow; solved by periodic snapshots **(CORRECT)**
- C) Events consume too much network bandwidth; solved by compression
- D) Events cannot be queried; solved by adding indexes to the event log

---

## Chapter 18: Operating Production Systems

*Building software is only half the job. Operating it reliably and cost-effectively is the other half.*

---

### Section 18-0: Site Reliability Engineering

**Key Concepts:**
- SRE principles: embracing risk with error budgets, eliminating toil through automation, SLOs as the contract between product and infrastructure, blameless postmortems
- Incident management: detection, triage, mitigation, resolution, follow-up; the incident commander role; communication during outages; status pages
- Capacity planning and load testing: synthetic benchmarks vs production load replay, autoscaling policies (target tracking, step scaling, predictive), load shedding and graceful degradation
- Chaos engineering: intentionally injecting failures (Netflix Chaos Monkey, Gremlin, Litmus); game days; building confidence in fault tolerance mechanisms; progressive failure injection (start in staging, then canary)

**Diagram:** `AnimatedGraph`
- Animate an incident lifecycle: (1) SLI breach triggers alert, (2) on-call engineer paged, (3) triage — check dashboards and traces, (4) identify root cause (database connection pool exhausted), (5) mitigation (increase pool, restart pods), (6) resolution confirmed via SLI recovery, (7) postmortem scheduled. Show the error budget impact at each step.

**OpenAgency Connection:** When a Meta API outage causes campaign sync failures, OpenAgency's SRE practices kick in: the SLI ("campaign sync success rate") drops below the SLO threshold, PagerDuty alerts the on-call engineer, the incident commander coordinates, and Temporal's built-in retry with backoff provides automatic mitigation. The postmortem might reveal that the circuit breaker threshold was too aggressive, blocking retries after Meta recovered.

**Quiz:**

**Q1:** Your SLO allows 0.1% error rate (99.9%). This month you have already hit 0.08%. The product team wants to deploy a risky new feature. What does SRE practice recommend?
- A) Deploy immediately — 0.02% budget remaining is plenty
- B) Delay the deploy or add extra safeguards (canary, feature flag) because the remaining error budget is thin and a failure could breach the SLO **(CORRECT)**
- C) Lower the SLO to 99.5% to accommodate the deploy
- D) Deploy to production but disable monitoring temporarily

**Q2:** Chaos engineering involves intentionally causing failures in production. Why is this considered a reliability practice rather than reckless?
- A) Failures in production never actually affect users
- B) It is only done in staging environments, never in real production
- C) Controlled, scoped failure injection reveals weaknesses before uncontrolled outages do, and builds confidence in recovery mechanisms **(CORRECT)**
- D) The chaos tools automatically fix any problems they create

---

### Section 18-1: Cost Engineering & FinOps

**Key Concepts:**
- Cloud cost anatomy: compute, storage, data transfer (the hidden killer), managed service premiums, cross-AZ and cross-region transfer costs; understanding your cloud bill
- Pricing models: on-demand, reserved instances (1yr/3yr), savings plans, spot/preemptible instances; commitment strategies and break-even analysis
- Cost optimization levers: right-sizing (CPU/memory utilization analysis), scheduling (dev environments off at night), storage tiering (S3 Standard -> Infrequent Access -> Glacier), data transfer minimization (same-AZ placement, VPC endpoints, caching)
- FinOps as a practice: cost allocation and tagging, showback/chargeback models, unit economics (cost per API call, cost per tenant, cost per campaign sync), anomaly detection on spend

**Diagram:** `TradeoffSlider`
- Slider for "Workload Duration" (minutes to years) and a toggle for "Interruptible: Yes/No". The visualization shows cost per compute-hour across on-demand, reserved, savings plan, and spot. A stacked bar chart shows a sample monthly bill breakdown (compute 40%, storage 20%, data transfer 25%, managed services 15%) that updates as you adjust the sliders.

**OpenAgency Connection:** OpenAgency's largest costs are likely Temporal worker compute (ECS tasks running 24/7), RDS Postgres (multi-AZ), and data transfer from ad network API calls. FinOps practices like tagging costs by tenant enable unit economics: "it costs $0.03 to sync one campaign from Meta." This informs pricing tiers. Reserved instances for the always-on database and Temporal workers, spot instances for batch analytics jobs, and right-sizing workers based on actual CPU utilization during campaign syncs.

**Quiz:**

**Q1:** Your monthly AWS bill shows $8,000 for data transfer. Investigation reveals most of it is cross-AZ traffic between your application servers and database. What is the most effective fix?
- A) Upgrade to a larger database instance
- B) Move the application servers and database into the same Availability Zone **(CORRECT)**
- C) Enable compression on the database
- D) Switch from RDS to DynamoDB

**Q2:** A FinOps team reports that the "cost per campaign sync" has doubled in the last month. Which investigation approach best identifies the cause?
- A) Check if AWS raised their prices
- B) Analyze tagged cost data to identify which resource category (compute, storage, data transfer) increased and correlate with campaign sync volume changes **(CORRECT)**
- C) Reduce the number of Temporal workers to lower costs
- D) Switch all instances to spot pricing immediately

---

## Summary Table

| Ch  | Section | Title | Diagram Type | Quiz Qs |
|-----|---------|-------|-------------|---------|
| 15  | 15-0 | Networking (L3-L7) | AnimatedGraph | 2 |
| 15  | 15-1 | Operating Systems | CategoryExplorer | 2 |
| 15  | 15-2 | Cloud Architecture | TradeoffSlider | 2 |
| 16  | 16-0 | Security & Authentication | AnimatedGraph | 2 |
| 16  | 16-1 | API Design | CategoryExplorer | 2 |
| 16  | 16-2 | Observability | AnimatedGraph | 2 |
| 17  | 17-0 | Distributed Systems Theory | TradeoffSlider | 2 |
| 17  | 17-1 | System Design | ExpandableCards | 2 |
| 17  | 17-2 | Data Modeling | CategoryExplorer | 2 |
| 18  | 18-0 | Site Reliability Engineering | AnimatedGraph | 2 |
| 18  | 18-1 | Cost Engineering & FinOps | TradeoffSlider | 2 |

**Totals:** 4 chapters, 11 sections, 22 quiz questions, 4 AnimatedGraph diagrams, 3 CategoryExplorer diagrams, 3 TradeoffSlider diagrams, 1 ExpandableCards diagram.

---

## TOC Array Addition (for App.jsx)

```js
{
  part: "V",
  title: "Adjacent Subjects to Master",
  chapters: [
    {
      num: 15, title: "Infrastructure Foundations", page: null, ready: false,
      sections: [
        { id: "15-0", title: "Networking: From Packets to Protocols", page: null },
        { id: "15-1", title: "Operating Systems for Backend Engineers", page: null },
        { id: "15-2", title: "Cloud Architecture", page: null },
      ],
    },
    {
      num: 16, title: "Protecting and Connecting Systems", page: null, ready: false,
      sections: [
        { id: "16-0", title: "Security & Authentication", page: null },
        { id: "16-1", title: "API Design", page: null },
        { id: "16-2", title: "Observability", page: null },
      ],
    },
    {
      num: 17, title: "Architecture at Scale", page: null, ready: false,
      sections: [
        { id: "17-0", title: "Distributed Systems Theory", page: null },
        { id: "17-1", title: "System Design", page: null },
        { id: "17-2", title: "Data Modeling", page: null },
      ],
    },
    {
      num: 18, title: "Operating Production Systems", page: null, ready: false,
      sections: [
        { id: "18-0", title: "Site Reliability Engineering", page: null },
        { id: "18-1", title: "Cost Engineering & FinOps", page: null },
      ],
    },
  ],
}
```
