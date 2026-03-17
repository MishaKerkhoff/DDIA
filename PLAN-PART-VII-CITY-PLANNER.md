# Part VII: The City Planner's Handbook

## Research Synthesis

Four research agents investigated gaps in the curriculum through the "City Planning" mental model lens. Here's what we found:

### Original 3 Missing Concepts (Confirmed)
1. **Legacy Migration** → "Historic Preservation" — Strangler Fig, blue-green, parallel runs, database migration strategies, API versioning, feature flags for migration, big bang anti-pattern, data reconciliation
2. **CI/CD & Deployment Pipelines** → "Permits & Inspections" — Pipeline stages, canary, rolling vs immutable, GitOps, IaC, safety mechanisms, database migrations in CI/CD, artifact management, environment parity
3. **Conway's Law & Team Topologies** → "Neighborhood Character" — Conway's Law, Inverse Conway, four team types, interaction modes, cognitive load, DDD boundaries, platform engineering, ownership models, fracture planes

### 4 Additional Gaps Discovered
4. **Feature Flags & Progressive Delivery** → "Traffic Light Systems" — Flag types (release, ops, experiment, permission), progressive rollout, A/B testing infrastructure, flag lifecycle/debt. *Decision: Fold into CI/CD chapter as its own section.*
5. **Capacity Planning & Load Testing** → "Utility Capacity Planning" — Load testing methodologies, capacity modeling, autoscaling strategies, headroom planning, graceful degradation tiers. *Decision: Standalone section — this is a critical gap between whiteboard design and production operation.*
6. **Supply Chain Security & Dependency Management** → "Import Controls" — SBOMs, lock files, supply chain attacks (SolarWinds, xz), vendoring strategies. *Decision: Fold into CI/CD chapter (build pipeline security).*
7. **Schema Evolution & Contract Testing** → "Building Codes Across Eras" — Schema registries, consumer-driven contracts (Pact), API versioning strategies, breaking change detection, event schema evolution. *Decision: Standalone section — bridges encoding (Ch4), API design (Ch17), and CDC (Ch14) in a unique operational way.*

---

## Chapter Plan

### Chapter 23: Legacy System Migration
*City Planning Analog: Historic Preservation — you can't demolish downtown to rebuild it while people live there*

#### Section 23-0: The Strangler Fig Pattern
**Concept (3 paragraphs):**
- The Strangler Fig pattern — named after the fig vine that gradually envelops a host tree — places a facade/proxy in front of the legacy system. New functionality is built in the new system, and the facade incrementally routes traffic away from legacy components. The key insight: there is never a "migration day," only a continuous, reversible process.
- How it works in practice: you start with 100% of traffic going to the old system through the facade. You pick the lowest-risk, best-understood slice of functionality and build it in the new system. You route that traffic to the new implementation. You monitor, verify, and iterate. Each step is independently deployable and reversible.
- The "Big Bang" rewrite anti-pattern — why Netscape-style full rewrites almost always fail. The new system must replicate every feature and edge case of the old system (which is poorly documented), receives no production feedback until launch day, and the team hits a moving target because the old system continues to evolve.
- **OpenAgency:** Temporal workflows serve as a natural strangler fig facade — new workflows call into legacy services during transition, then swap underlying calls without changing the workflow interface. Migration order: read-only/reporting paths first, new channels natively, existing channels one at a time, billing last.

**Diagram: AnimatedGraph**
- Nodes: Legacy System, Facade/Proxy, New Service A, New Service B, New Service C, Clients
- Animated flow showing traffic gradually shifting from Legacy → New services through the facade
- Stages: "Phase 1: 100% Legacy" → "Phase 2: Service A migrated" → "Phase 3: A+B migrated" → "Phase 4: Fully strangled"

**Quiz:**
1. Q: "A team is migrating a monolithic ad platform to microservices. They plan to spend 6 months building the complete new system, then switch all traffic on a single weekend. What is the primary risk of this approach?"
   - A: "This is the 'Big Bang' anti-pattern. The new system must replicate every edge case of the old system without production feedback, the team hits a moving target as the old system evolves, and a single cutover creates a single point of failure with no gradual validation."
   - Wrong: "The primary risk is running out of budget before the 6 months are up."

2. Q: "In the Strangler Fig pattern, what is the role of the facade/proxy layer?"
   - A: "The facade routes traffic between old and new systems, enabling incremental migration. It lets you move one slice of functionality at a time while keeping the rest on legacy, making each migration step independently reversible."
   - Wrong: "The facade translates between old and new API formats so both systems can share the same database."

---

#### Section 23-1: Data Migration Strategies
**Concept (3 paragraphs):**
- Code is stateless and replaceable; data has gravity. Database migration is the hardest part of any system migration. Four strategies ranked by safety: CDC-based migration (safest, decoupled), expand-and-contract schema evolution, online schema changes (gh-ost, pt-online-schema-change), and dual-write (most dangerous).
- CDC-based migration: a CDC system (Debezium) captures every change from the source database's WAL and replicates it to the target. The application only writes to one store. Pros: decoupled from app code, handles complex transformations. Cons: introduces replication lag, pipeline failures become critical.
- Dual-write: the application writes to both old and new stores simultaneously. Looks simple on a whiteboard, becomes a consistency nightmare in production. If write A succeeds on old and fails on new, you've diverged. Expand-and-contract: add new columns alongside old ones, migrate code, then remove old columns — each phase independently deployable.
- **OpenAgency:** For billing data migration, CDC is strongly preferred over dual-write — a partial failure could mean a charge recorded in one system but not the other. Data reconciliation jobs must verify that charge sums match to the penny between old and new systems.

**Diagram: TradeoffSlider**
- Axis: "Migration Safety" ↔ "Migration Speed"
- Strategies positioned along the spectrum:
  - CDC-Based (safest, slowest to set up)
  - Expand-and-Contract (safe, multiple deployments)
  - Online Schema Change (medium, tooling-dependent)
  - Dual-Write (fastest to implement, most dangerous)
- Each position shows risk factors and when to use

**Quiz:**
1. Q: "A team is migrating their billing database from one schema to another. They implement dual-write, where the application writes to both old and new databases. The write to the new database occasionally fails due to network timeouts. What is the most likely consequence?"
   - A: "Data divergence — the old database has records the new one is missing. This can lead to billing discrepancies, missed charges, or duplicate charges depending on which database is treated as authoritative."
   - Wrong: "The application will automatically retry and both databases will eventually become consistent."

2. Q: "What advantage does CDC-based migration have over dual-write for database migration?"
   - A: "CDC decouples the migration from application code — the app writes to one store, and the CDC pipeline handles replication. This eliminates the partial-failure consistency problem of dual-write, where one write succeeds and the other fails."
   - Wrong: "CDC is faster because it writes to both databases in parallel using the database's internal replication."

---

#### Section 23-2: Parallel Runs & Verification
**Concept (3 paragraphs):**
- Parallel run (shadow traffic): both old and new systems process the same requests simultaneously, but only the old system's responses are returned to users. The new system's outputs are captured and compared for correctness. GitHub's "Scientist" library is the canonical example — they found hundreds of edge cases when rewriting their permissions system.
- Critical constraint: the new system must be side-effect-free during shadow phase. You cannot shadow-run anything that mutates external state — you can't create duplicate ad campaigns or double-charge through Stripe. Pattern works well for read/reporting paths, must be carefully scoped away from write paths.
- Data reconciliation and verification: automated processes that continuously compare old and new data stores during migration. Row-by-row or aggregate-level checks (record counts, checksums, monetary sums). Deciding what constitutes "close enough" vs "broken" requires domain knowledge. Observability-driven migration: metrics, tracing, and structured logging comparing behavior in real time — latency distributions, error rates, business metrics.
- **OpenAgency:** Shadow-run new Meta Ads API integration alongside old one, comparing campaign performance data. But never shadow-run write paths (creating campaigns, adjusting bids, processing payments). Reconciliation jobs verify impression/click/spend totals match between systems.

**Diagram: CategoryExplorer**
- Categories: "Shadow Traffic", "Data Reconciliation", "Rollback Strategies", "Contract Testing"
- Shadow Traffic items: side-effect-free requirement, read-path safety, GitHub Scientist approach, discrepancy analysis
- Data Reconciliation items: aggregate checks (row counts, sums), sampled detailed comparison, reconciliation frequency, tolerance thresholds
- Rollback Strategies items: circuit breakers, feature flag rollback, compensating transactions for irreversible actions
- Contract Testing items: consumer-driven contracts (Pact), Hyrum's Law (implicit contracts), provider verification

**Quiz:**
1. Q: "A team is using parallel runs to validate a new campaign reporting service. The new service calculates ad spend metrics. During the parallel run, they discover the new service reports 2% less total spend than the old service. What should they do?"
   - A: "Investigate the discrepancy before proceeding. A 2% difference in ad spend could represent millions of dollars. The root cause might be a rounding difference, a missing data source, or a timezone handling bug. The parallel run caught exactly the kind of issue it was designed for."
   - Wrong: "A 2% difference is within acceptable tolerance for parallel runs, so they should proceed with the migration."

2. Q: "Why must parallel runs be restricted to read-only operations when validating a new system?"
   - A: "If the new system executes write operations (creating campaigns, charging cards, calling external APIs), it produces real side effects — duplicate ad campaigns, double charges, or conflicting state. The parallel run would cause production damage instead of safely validating correctness."
   - Wrong: "Write operations are too slow to run in parallel, so they would increase latency beyond acceptable thresholds."

---

### Chapter 24: Deployment Pipelines & Delivery
*City Planning Analog: Permits & Inspections — code must pass checks before reaching production, just as buildings must pass inspections before occupancy*

#### Section 24-0: The Deployment Pipeline
**Concept (3 paragraphs):**
- A deployment pipeline is a series of automated gates: Build → Test → Stage → Canary → Rollout. Each stage increases confidence and is progressively more expensive and realistic, so you fail fast and cheaply at early stages. The key principle: make the safe path also the fast path.
- Canary deployments route 1-5% of production traffic to the new version while monitoring error rates, latency, and business metrics. Automated canary analysis (Kayenta) statistically compares canary vs baseline. Rolling deployments update instances in-place; immutable deployments launch new instances alongside old ones, shift traffic, then terminate old — never mutating a running server.
- Deployment safety mechanisms: automatic rollback triggers (error rate spikes), deployment freezes (end-of-quarter for ad platforms), bake time (minimum canary duration), blast radius controls (one region first). Environment parity — keeping dev/staging/production as similar as possible to prevent "works on staging, breaks in production."
- **OpenAgency:** End-of-quarter deployment freezes protect peak ad spend. Blast radius scoped per-channel: deploy TikTok integration changes first (lowest revenue), then Amazon, then Meta, then Google (highest revenue). Temporal workers need version-aware task queues for canary — workflows started on canary may execute activities on old workers.

**Diagram: AnimatedGraph**
- Nodes: Code Commit, Build, Unit Tests, Integration Tests, Staging, Canary (2%), Rollout (25%), Rollout (100%), Production
- Animated flow showing code progressing through gates
- Failed gates show rollback arrows
- Labels on edges: "~2 min", "~5 min", "~10 min", "~30 min bake"

**Quiz:**
1. Q: "A team deploys a new version of their ad spend optimizer using a 2% canary. The canary's p99 latency is 40% higher than baseline after 10 minutes. What should happen?"
   - A: "The canary should be automatically rolled back. A 40% increase in p99 latency indicates a performance regression. Automated canary analysis should detect this statistical divergence and trigger rollback before the remaining 98% of traffic is affected."
   - Wrong: "Wait 30 minutes for the JVM to warm up — p99 latency often spikes during canary startup and stabilizes."

2. Q: "Why do immutable deployments (blue-green) make rollback simpler than rolling deployments?"
   - A: "In immutable deployments, the old instances are still running unchanged during the transition. Rollback is just shifting traffic back to them. In rolling deployments, old instances have been terminated and replaced in-place, so there is nothing to roll back to without a redeployment."
   - Wrong: "Immutable deployments store a snapshot of the database state, allowing both code and data to be rolled back together."

---

#### Section 24-1: Infrastructure as Code & GitOps
**Concept (3 paragraphs):**
- Infrastructure as Code (IaC) defines cloud resources in version-controlled configuration files rather than console clicking. Terraform (declarative, multi-cloud), Pulumi (imperative, real programming languages), CloudFormation (AWS-native). The infrastructure becomes reviewable, testable, and reproducible. State management is the central challenge — state file drift from manual changes creates invisible inconsistencies.
- GitOps uses a Git repository as the single source of truth for infrastructure and application state. An operator (ArgoCD, Flux) continuously reconciles live cluster state with what's declared in Git. Every production change goes through a Git commit — providing audit trail, code review, and rollback via git revert. Struggles with imperative operations (database migrations, secret rotation).
- Secrets management in pipelines: credentials must never be stored in Git or build logs. Tools like Vault, AWS Secrets Manager inject secrets at deploy time with audit trails. Artifact management: Docker images tagged with Git SHA, signed with cosign/sigstore, promoted through environments (the same image tested in staging is deployed to production, never rebuilt).
- **OpenAgency:** Four ad platform API credentials, Stripe keys, Temporal Cloud certificates across multiple environments. IaC ensures staging Stripe webhook points to staging server. GitOps provides audit trail of exactly when workflow logic changed — critical for debugging budget misallocation.

**Diagram: TradeoffSlider**
- Axis: "Flexibility" ↔ "Reproducibility"
- Positions:
  - Manual Console (most flexible, least reproducible, no audit trail)
  - Scripts/Ansible (imperative, some reproducibility)
  - Terraform/CloudFormation (declarative, state-managed, reviewable)
  - GitOps + ArgoCD (fully declarative, Git-audited, auto-reconciled)
- Each position shows tradeoffs

**Quiz:**
1. Q: "A team uses Terraform to manage their AWS infrastructure. An engineer manually adds a security group rule through the AWS console to fix an urgent issue. What problem does this create?"
   - A: "State drift — Terraform's state file no longer matches reality. The next 'terraform plan' may try to remove the manually-added rule (reverting the fix), or may show unexpected diffs. The manual change also bypasses code review and audit trail."
   - Wrong: "Terraform will automatically detect the change and update its state file on the next 'terraform refresh' with no issues."

2. Q: "In a GitOps workflow, how is a production rollback performed?"
   - A: "Revert the Git commit that introduced the change. The GitOps operator (ArgoCD/Flux) detects the revert, sees the cluster state no longer matches the desired state in Git, and automatically reconciles by rolling back the deployment."
   - Wrong: "SSH into the production server and manually replace the container with the previous version."

---

#### Section 24-2: Feature Flags & Progressive Delivery
**Concept (3 paragraphs):**
- Feature flags decouple deployment (pushing code to production) from release (exposing functionality to users). Code can be deployed but gated behind a flag, enabling targeted rollouts by user segment, percentage, or geography. Four flag types: release toggles (short-lived, for deployment), ops toggles (operational control), experiment toggles (A/B testing), permission toggles (premium features).
- Progressive delivery extends canary deployments to the feature level: deploy to everyone, but enable only for 1% → 5% → 25% → 100%. Combined with observability, this enables data-driven rollout decisions. A/B testing infrastructure adds statistical rigor — ensuring sample sizes are sufficient and metrics are causally linked to the change, not confounded by time-of-day effects.
- Flag debt is the hidden cost: flags never cleaned up after migration create a combinatorial explosion of code paths. Each flag is a branch in your code; interactions between flags create untested states. Organizations need flag lifecycle management — expiration dates, ownership tracking, automated cleanup. Supply chain security (SBOMs, lock files, dependency auditing) is the build-time complement to runtime feature flags.
- **OpenAgency:** Feature flags enable rolling out new TikTok Ads integration to beta tenants while others remain on existing integration. Temporal workflows check flags to determine integration path. Experimentation validates that a new bidding algorithm actually improves outcomes before full rollout.

**Diagram: ExpandableCards**
- Cards for each flag type:
  - **Release Toggles**: short-lived, gate new features during deployment, remove after full rollout
  - **Ops Toggles**: runtime operational control, circuit breakers, kill switches, graceful degradation
  - **Experiment Toggles**: A/B testing, statistical significance, metric pipelines, experiment ownership
  - **Permission Toggles**: premium features, tenant-level entitlements, plan-based access control

**Quiz:**
1. Q: "A codebase has accumulated 47 feature flags over 2 years, many for migrations that completed long ago. Why is this a problem?"
   - A: "Each flag creates a code branch, and interactions between flags create a combinatorial explosion of untested states. 47 flags means 2^47 possible combinations — most were never tested. Stale flags make the codebase harder to understand and increase the risk of bugs from unexpected flag interactions."
   - Wrong: "Feature flags consume memory at runtime, and 47 flags will cause the application to run out of heap space."

2. Q: "How do feature flags complement canary deployments?"
   - A: "Canary deployments operate at the infrastructure level (which instances serve traffic), while feature flags operate at the feature level (which users see new behavior). Combined, you can deploy code to all instances (eliminating deployment risk) but enable features gradually per-tenant, decoupling deployment from release."
   - Wrong: "Feature flags replace canary deployments — you don't need both because feature flags can route traffic to different server instances."

---

### Chapter 25: Organizational Architecture
*City Planning Analog: Neighborhood Character — who builds which zone matters as much as the technical choices, and the city's layout will mirror the planning department's org chart*

#### Section 25-0: Conway's Law & the Inverse Conway Maneuver
**Concept (3 paragraphs):**
- Conway's Law (1967): organizations design systems that mirror their communication structures. This is not a suggestion but a sociological force — if three teams build a compiler, you get a three-pass compiler. If you have separate frontend, backend, and database teams, you get a three-tier architecture with thick API boundaries, even when a domain-based decomposition would serve users better.
- The Inverse Conway Maneuver: rather than accepting that org structure dictates architecture, deliberately restructure teams to produce the architecture you want. Design the target architecture first, then organize teams to match. This is one of the most powerful levers a technical leader has — but reorgs are expensive, disruptive, and political. A partial Inverse Conway (reorg teams but leave incentives unchanged) is worse than none.
- Domain-Driven Design boundaries: within a Bounded Context, terms have precise meaning. Across contexts, "campaign" means different things to different teams. Fracture planes — natural lines along which systems and teams can be split: business domain, regulatory compliance, change cadence, technology stack, user persona, risk profile. Choosing the right fracture plane determines whether decomposition feels natural or forced.
- **OpenAgency:** If you have one team per ad channel (Google team, Meta team), Conway's Law predicts four separate implementations with duplicated billing logic. Splitting by business domain (campaign lifecycle, billing, analytics) instead of by channel produces a more coherent architecture. "Campaign" means different things: to Meta it has ad sets, to Google it has ad groups, to billing it's a billable entity.

**Diagram: TradeoffSlider**
- Axis: "Team Autonomy" ↔ "System Coherence"
- Positions:
  - Siloed Channel Teams (high autonomy, duplicated logic, inconsistent behavior)
  - Matrix Organization (medium autonomy, coordination overhead, unclear ownership)
  - Domain-Aligned Teams (balanced autonomy, clear boundaries, explicit interfaces)
  - Monolithic Team (high coherence, communication bottleneck, cognitive overload)

**Quiz:**
1. Q: "A company has separate teams for Google Ads integration, Meta Ads integration, and Amazon Ads integration. Each team builds its own campaign management, billing, and reporting logic. What does Conway's Law predict about their system?"
   - A: "The system will have three separate, largely duplicated implementations with inconsistent billing logic, divergent error handling, and incompatible data models — because the system mirrors the team communication structure, not the business domain."
   - Wrong: "Conway's Law predicts the three systems will naturally converge toward a unified architecture as teams discover common patterns."

2. Q: "What is the Inverse Conway Maneuver?"
   - A: "Deliberately restructuring teams to match your desired system architecture, rather than letting the org chart dictate the architecture. You design the target architecture first, then organize teams so their communication boundaries align with the desired service boundaries."
   - Wrong: "Designing your system architecture to match your existing org chart, ensuring every team has a corresponding service to maintain."

---

#### Section 25-1: Team Topologies & Interaction Modes
**Concept (3 paragraphs):**
- Four fundamental team types (Skelton & Pais): Stream-aligned teams (aligned to business change flow — the primary type, most teams should be this), Enabling teams (help stream-aligned teams overcome obstacles, then step back), Complicated-subsystem teams (own areas requiring deep specialist knowledge), Platform teams (provide self-service internal capabilities, reducing cognitive load).
- Three interaction modes: Collaboration (two teams work closely for discovery — high-bandwidth but high-cost, should be temporary), X-as-a-Service (one team consumes another's output through a clear API — low coupling, steady state), Facilitating (one team coaches another, then disengages). Modes should evolve: collaboration during discovery, then X-as-a-Service for steady state.
- Platform Engineering and the "golden path": internal developer platforms provide opinionated, well-supported defaults for common tasks without mandating them. The platform team's product is developer productivity. The test: can a new engineer deploy a change to production without asking the platform team for help? Brooks' Law reminds us that communication overhead grows quadratically with team size — platforms convert O(n²) communication into O(n) service consumption.
- **OpenAgency:** Stream-aligned: Campaign Management, Billing & Monetization. Complicated-subsystem: Ad API Integration (deep expertise in 4+ ad platform APIs). Platform: Temporal infrastructure, observability, deployment pipelines. When integrating new TikTok channel, start in Collaboration mode with Campaign Management, shift to X-as-a-Service once the adapter interface stabilizes.

**Diagram: CategoryExplorer**
- Categories: "Stream-Aligned", "Enabling", "Complicated-Subsystem", "Platform"
- Stream-Aligned items: aligned to business flow, owns end-to-end delivery, most teams should be this type, example: Campaign Management
- Enabling items: helps other teams adopt new practices, temporary engagement, then steps back, example: helping teams adopt Temporal
- Complicated-Subsystem items: deep specialist knowledge required, justified by genuine complexity, example: Ad Platform API integration
- Platform items: self-service internal capabilities, golden paths, reduces cognitive load, example: deployment pipelines, observability

**Quiz:**
1. Q: "A platform team provides deployment pipelines, but teams must file a ticket and wait 3 days for pipeline changes. What's wrong with this interaction model?"
   - A: "The platform team has become a bottleneck, not an enabler. Platform teams should provide self-service capabilities (X-as-a-Service). If teams must wait for platform changes, the platform has recreated the traditional ops ticket queue, negating the benefits of team autonomy."
   - Wrong: "Three days is a reasonable SLA for infrastructure changes, and the ticket system ensures proper change management."

2. Q: "When should two teams shift from Collaboration mode to X-as-a-Service mode?"
   - A: "When the interface between them becomes well-understood and stable. Collaboration is appropriate during discovery (building a new integration, defining a new API), but once the boundary is clear, X-as-a-Service reduces coupling and lets both teams work independently."
   - Wrong: "Teams should always be in Collaboration mode to ensure maximum communication and alignment."

---

#### Section 25-2: Cognitive Load & Ownership
**Concept (3 paragraphs):**
- Cognitive load theory applied to teams: intrinsic load (inherent problem complexity), extraneous load (complexity from bad tooling, poor docs, organizational friction), germane load (productive learning effort). A team can only handle so much total load. Platform teams exist primarily to reduce extraneous load on stream-aligned teams. The "full-stack team" anti-pattern: a team nominally owns everything end-to-end but actually does nothing well.
- "You build it, you run it" (Werner Vogels, Amazon): the team that writes the code operates it in production, including on-call. This creates a direct feedback loop — if your code pages you at 3 AM, you fix the underlying cause. Service ownership means one team has unambiguous accountability. Shared ownership is effectively no ownership. Google's SRE variation: dedicated SRE team can "hand back the pager" if the service doesn't meet operational standards.
- Sociotechnical architecture: the recognition that architecture decisions are inseparable from organizational decisions. Choosing Temporal implies you need a team with deep Temporal expertise. Team APIs: each team documents what they provide, what they expect, preferred communication channels, and SLOs — making team boundaries a first-class interface. Sensing signals for wrong topology: rising cross-team dependencies, increasing lead time, mounting cognitive load, frequent incidents at boundaries.
- **OpenAgency:** Campaign Management team shouldn't own campaigns AND billing AND infrastructure — that exceeds cognitive load capacity. Each ad channel adapter has a clear owner. Temporal workflows owned by the team whose domain they orchestrate. Critical question: who gets paged at 2 AM when Meta API returns 500s? If "it depends," you have an ownership gap.

**Diagram: AnimatedGraph**
- Nodes: Campaign Mgmt Team, Billing Team, Ad API Team (Complicated Subsystem), Platform Team, External: Google, External: Meta, External: Stripe, External: Temporal
- Edges showing ownership boundaries and interaction modes
- Color-coding: green for X-as-a-Service interfaces, yellow for Collaboration, red for bottleneck/shared-ownership anti-patterns
- Animated to show flow of responsibility

**Quiz:**
1. Q: "A team of 6 engineers owns the campaign management service, the billing service, the Google Ads integration, and the Temporal workflow infrastructure. They are falling behind on features and their on-call rotation is burning people out. What is the root cause?"
   - A: "Cognitive overload — the team's responsibilities exceed their cognitive load capacity. They own four distinct domains, each with significant intrinsic complexity. The solution is to split responsibilities: move billing to a dedicated team, the Google integration to a complicated-subsystem team, and Temporal infrastructure to a platform team."
   - Wrong: "The team needs to hire 2-3 more engineers to handle the workload."

2. Q: "What does 'shared ownership is no ownership' mean in practice?"
   - A: "When multiple teams share responsibility for a service, no one feels accountable. Bugs get attributed to 'the other team,' on-call responses are slow because everyone assumes someone else will handle it, and technical debt accumulates because nobody's roadmap includes paying it down."
   - Wrong: "Shared ownership distributes the on-call burden more evenly, which is actually beneficial for team health."

---

### Chapter 26: Production Readiness
*City Planning Analog: Municipal Services & Building Codes — the infrastructure that keeps the city running day-to-day and the standards that ensure buildings stand the test of time*

#### Section 26-0: Capacity Planning & Load Testing
**Concept (3 paragraphs):**
- The gap between "I can design a system on a whiteboard" and "I can run it in production" is capacity planning. How you forecast resource needs, validate forecasts with load testing, and configure autoscaling. Capacity misses cause both outages (under-provisioned) and budget blowouts (over-provisioned). Three estimation approaches: back-of-envelope from requirements, forecasting from historical trends, and load testing against reality.
- Load testing methodologies: synthetic load generation (k6, Locust, Gatling), replay-based testing (recording production traffic and replaying at scale), and chaos-adjacent stress testing (pushing past expected capacity to find breaking points). Autoscaling strategies: reactive (scale on CPU/memory metrics — always behind), predictive/scheduled (scale before known traffic patterns — requires predictable load), and their failure modes (cold start latency, thrashing, scaling too slowly for burst traffic).
- Graceful degradation tiers: what to shed first when capacity is exceeded. Not all features are equally important. Tier 1: core transaction processing (never shed). Tier 2: real-time analytics (degrade to eventual). Tier 3: non-critical background jobs (pause). Headroom planning: the ratio between current usage and capacity limits. The industry standard is 60-70% steady-state utilization, leaving 30-40% for spikes.
- **OpenAgency:** Ad platforms face extreme traffic spikiness (campaign launches, seasonal peaks, end-of-quarter spend surges). Multi-tenant SaaS adds complexity: one large tenant's traffic spike shouldn't degrade service for others. Capacity planning for external API rate limits (Google Ads, Meta) is equally critical — you can't autoscale past an API rate limit.

**Diagram: TradeoffSlider**
- Axis: "Cost Efficiency" ↔ "Reliability Buffer"
- Positions:
  - Minimal (90%+ utilization — cheap but one spike away from outage)
  - Lean (70-80% — cost-effective with some buffer)
  - Standard (50-60% — industry recommended, handles most spikes)
  - Conservative (30-40% — expensive but handles extreme bursts)
- Overlay showing "Danger Zone" and "Waste Zone"

**Quiz:**
1. Q: "A team runs load tests that show their service handles 10,000 RPS. In production, steady-state traffic is 7,500 RPS. Is this safe?"
   - A: "No — 75% utilization leaves only 25% headroom, and load tests in controlled environments often overestimate real capacity. Production has background jobs, GC pauses, noisy neighbors, and correlated traffic spikes. Industry recommendation is 50-60% steady-state utilization for reliable headroom."
   - Wrong: "Yes — they have 2,500 RPS of headroom, which is a comfortable 25% buffer for traffic spikes."

2. Q: "A multi-tenant SaaS platform uses reactive autoscaling based on CPU utilization. During a major client's campaign launch, traffic spikes 5x in 30 seconds. What is the likely outcome?"
   - A: "Degraded service or outage. Reactive autoscaling has lag — it takes time to detect the spike, provision new instances, and pass health checks. For 30-second spikes, the new capacity arrives after the damage is done. Predictive scaling or pre-provisioned headroom would handle this better."
   - Wrong: "The autoscaler will handle it seamlessly because cloud providers can provision new instances in under a second."

---

#### Section 26-1: Schema Evolution & Contract Testing
**Concept (3 paragraphs):**
- The hardest part of API design isn't the initial design — it's changing it later without breaking consumers you may not even know about. Schema registries (Confluent Schema Registry with Avro/Protobuf) enforce compatibility rules: backward compatible (new schema can read old data), forward compatible (old schema can read new data), full compatible (both directions). Breaking change detection can be automated in CI pipelines.
- Consumer-driven contract testing (Pact): each client service defines its expectations of the provider, and the provider verifies it meets all contracts. This prevents subtle breaking changes that integration tests might miss. Hyrum's Law: with sufficient users, every observable behavior of your API will be depended upon by somebody — including undocumented behaviors, response ordering, and timing characteristics.
- Event schema evolution in event-driven architectures: when CDC events or streaming events change shape, every downstream consumer must handle both old and new formats. The expand-contract pattern applies here too: add new fields, migrate consumers, then remove old fields. API versioning strategies: URL path (/v1, /v2), header-based, date-based (Stripe-style), each with different tradeoffs for discoverability, caching, and maintenance burden.
- **OpenAgency:** Multi-tenant SaaS with external API consumers cannot make breaking changes without migration strategy. Internal event schemas flowing through CDC must evolve without breaking analytics pipelines. Attribution model changes (Ch 22) require evolving event shapes across the system.

**Diagram: CategoryExplorer**
- Categories: "Schema Compatibility Modes", "Contract Testing", "API Versioning Strategies", "Event Evolution"
- Schema Compatibility: backward, forward, full, none — with examples of what breaks
- Contract Testing: consumer-driven (Pact), provider-driven, Hyrum's Law, automated checks in CI
- API Versioning: URL path, header, date-based (Stripe), content negotiation — tradeoffs
- Event Evolution: expand-contract for events, schema registry enforcement, dead letter queues for incompatible events

**Quiz:**
1. Q: "A team adds a required field to their API response without incrementing the API version. What happens to existing clients?"
   - A: "If clients strictly validate responses, they may crash on the unexpected field. If the field is required on requests too, existing clients immediately break because they don't send it. This is a backward-incompatible change that should have been gated behind a new version or made optional with a default."
   - Wrong: "Nothing — adding a field is always a backward-compatible change because clients can ignore fields they don't recognize."

2. Q: "What problem does consumer-driven contract testing (Pact) solve that integration tests don't?"
   - A: "Integration tests verify the system works with known test scenarios, but they can't cover every consumer's specific usage patterns. Pact lets each consumer declare exactly which fields and behaviors it depends on, so the provider knows exactly what it cannot break — catching subtle breaking changes that test scenarios might miss."
   - Wrong: "Pact tests run faster than integration tests because they don't require deploying the full system."

---

### Chapter 27: System Resilience & Lifecycle
*City Planning Analog: Disaster Drills, Land Registry, and Permitting Office — the proactive practices, record-keeping, and lifecycle management that keep a city running safely*

#### Section 27-0: Chaos Engineering & Resilience Testing
**Concept (3 paragraphs):**
- Observability tells you what IS happening. SRE tells you how to respond. Chaos engineering asks: "do our detection, failover, and recovery mechanisms actually work?" It is the discipline of deliberately injecting failures — network partitions, latency spikes, process kills, disk fills, clock skew — into production or staging systems to discover weaknesses before real disasters do. The key principle: form a hypothesis ("if Redis goes down, the app degrades gracefully to DB-direct reads"), then test it.
- Chaos experiment design follows a scientific method: define steady-state metrics (request success rate, p99 latency), form a hypothesis, define blast radius and abort conditions, inject the failure, observe. Tools like Litmus and Chaos Mesh (Kubernetes-native), AWS Fault Injection Simulator, and Gremlin provide structured ways to inject faults. Game days are organization-wide scheduled resilience exercises where teams practice incident response against simulated failures.
- Chaos engineering for data pipelines is especially important: what happens when a Kafka broker dies mid-rebalance? When a batch job fails halfway through processing 10 million records? When a CDC pipeline has 30 minutes of lag? These are not hypothetical — they happen regularly in production, and the only question is whether you discover the failure mode in a controlled experiment or during a customer-facing incident.
- **OpenAgency:** If the real-time bidding service loses connectivity to the campaign data cache during a chaos experiment, does it gracefully degrade to a simpler bidding strategy, or does it return errors and lose revenue? If the Temporal cluster has a network partition, do in-flight workflows resume correctly? Chaos engineering validates these scenarios before production does.

**Diagram: AnimatedGraph**
- Nodes: Production System, Chaos Controller, Failure Injection Point, Monitoring/Metrics, Abort Trigger, Steady State Baseline
- Flow showing: Baseline measurement → Hypothesis formed → Failure injected → Metrics compared → Pass/Fail determination
- Animated to show failure propagation and detection/recovery response

**Quiz:**
1. Q: "A team's chaos experiment hypothesis is: 'If we kill one of three Redis replicas, read latency will increase by no more than 20% and no requests will fail.' During the experiment, latency increases by 15% but 2% of requests fail. What should they conclude?"
   - A: "The hypothesis is partially falsified — latency is within bounds but request failures indicate a resilience gap. The Redis client is not properly handling the failover. This is exactly the kind of issue chaos engineering is designed to surface before it affects real users."
   - Wrong: "The experiment is a success because the latency increase was within the 20% threshold, and 2% error rate is acceptable for a cache failure."

2. Q: "Why is chaos engineering particularly important for data pipelines compared to stateless web services?"
   - A: "Data pipelines have state — partially processed batches, consumer offsets, in-flight messages. A failure mid-processing can cause data loss, duplication, or corruption that may not be detected for hours or days. Stateless services simply retry requests, but a failed data pipeline needs recovery logic for its processing state."
   - Wrong: "Data pipelines are more important than web services, so they deserve more testing effort."

---

#### Section 27-1: Data Governance, Lineage & Cataloging
**Concept (3 paragraphs):**
- Data governance answers: where did this data come from, how was it transformed, who owns it, and can it be trusted? The curriculum covers data mesh (organizational ownership), privacy tech (anonymization), and audit logging (compliance events), but is missing the connective tissue. Data lineage tracks the full journey of data — column-level lineage through ETL/ELT pipelines — using tools like OpenLineage and Marquez. This is increasingly a regulatory requirement (GDPR Article 30, CCPA).
- Data catalogs (Amundsen, DataHub, Atlan) make data findable and understandable — they are the "search engine for your data lake." Data quality contracts define SLAs: schema enforcement, freshness guarantees, anomaly detection (Great Expectations, Monte Carlo). A data quality contract between a producer and consumer is the data equivalent of an API contract — it specifies what the consumer can expect and what will trigger an alert when violated.
- The practical impact: when an advertiser disputes an attribution report, or a regulator asks "show me everywhere this user's data was processed," you need column-level lineage from impression ingestion through the attribution model to the final billing record. Without governance, data becomes a liability rather than an asset — teams don't trust numbers, reports conflict, and compliance is a manual, error-prone process.
- **OpenAgency:** When a Meta conversion postback flows through CDC into the analytics pipeline, through the attribution model, and into a billing invoice, lineage tracks every transformation. If spend numbers look wrong, lineage shows exactly where the discrepancy was introduced. Data quality contracts ensure upstream schema changes in a partner's click-stream feed don't silently corrupt downstream reports.

**Diagram: CategoryExplorer**
- Categories: "Data Lineage", "Data Catalogs", "Quality Contracts", "Regulatory Requirements"
- Data Lineage items: column-level tracking, OpenLineage/Marquez, transformation provenance, impact analysis ("if I change this column, what breaks downstream?")
- Data Catalogs items: discoverability, ownership metadata, usage statistics, freshness indicators, Amundsen/DataHub
- Quality Contracts items: schema enforcement, freshness SLAs, anomaly detection (Great Expectations), producer-consumer contracts
- Regulatory items: GDPR Article 30 records of processing, CCPA data mapping, right-to-deletion verification, audit evidence generation

**Quiz:**
1. Q: "An analytics team discovers that their attribution report shows 15% more conversions than the billing system. Both systems pull from the same raw event stream. How does data lineage help diagnose this?"
   - A: "Data lineage traces the transformation path of each system from the shared event stream. It reveals where they diverge — perhaps the analytics pipeline counts all conversions while the billing pipeline deduplicates by user, or one applies a different time-window filter. Without lineage, debugging requires manually tracing code across multiple systems."
   - Wrong: "Data lineage automatically fixes the discrepancy by synchronizing both systems to the same transformation logic."

2. Q: "What is a data quality contract, and how does it differ from a schema definition?"
   - A: "A schema definition specifies structure (field names, types). A data quality contract specifies behavior: freshness guarantees (data arrives within 5 minutes), completeness requirements (no more than 0.1% null values in required fields), and anomaly bounds (daily row count within 2 standard deviations of the 30-day average). It is the SLA between a data producer and consumer."
   - Wrong: "A data quality contract is a legal agreement between the data provider and the company using the data."

---

#### Section 27-2: State Machine Design & Workflow Correctness
**Concept (3 paragraphs):**
- Temporal (Ch 14, 20) is an execution engine for workflows. But the upstream design discipline — correctly modeling business processes as state machines — is a distinct skill. The hardest bugs in data-intensive applications are state management bugs: orders stuck in "processing," subscriptions that can't be cancelled, ad campaigns that transition from "paused" to "billing" without going through "active." Explicit state machine modeling (state charts, transition tables, guard conditions) prevents these by making every legal and illegal transition visible.
- Compensation and saga correctness: beyond the mechanics of sagas, how do you verify a multi-step saga handles every failure path? If step 3 of 5 fails, do steps 1 and 2 compensate correctly? What if the compensation itself fails? Idempotency at the state transition level (not just the API level) is critical — processing the same event twice should not cause a double transition. Dead letter states and stuck-entity detection: every state machine needs monitoring for entities that remain in a transient state beyond an expected duration.
- Testing state machines: property-based testing (generating random sequences of events and verifying no illegal state is reachable), model checking for workflow correctness, and explicit enumeration of failure paths. The composability problem: when two state machines interact (campaign lifecycle × subscription lifecycle), the correctness of the composed behavior is where real bugs live — a campaign that is "active" but whose subscription is "past-due" creates an ambiguous state that must be explicitly handled.
- **OpenAgency:** An ad campaign lifecycle (draft → review → active → paused → completed → archived) has billing implications at each transition. A Stripe subscription has its own lifecycle (trialing → active → past_due → canceled). When these interact — campaign active but subscription past-due — the composed behavior must be explicitly designed. Temporal workflows should enforce these transitions, but the state machine design comes first.

**Diagram: AnimatedGraph**
- Nodes representing campaign states: Draft, Review, Active, Paused, Completed, Archived, ERROR (illegal)
- Edges showing legal transitions with guard conditions
- Animated to show: happy path (Draft→Review→Active→Completed→Archived), pause/resume cycle, and an illegal transition attempt (Paused→Billing) that gets caught
- Color coding: green for legal transitions, red for illegal, yellow for transitions requiring guard conditions

**Quiz:**
1. Q: "A campaign management system allows campaigns to transition from 'paused' directly to 'completed.' After deployment, the billing team discovers that paused-to-completed campaigns are not generating final invoices. What design flaw caused this?"
   - A: "The state machine has an implicit transition that bypasses the billing guard. The 'completed' transition should always pass through a billing checkpoint regardless of the previous state. Explicit state machine modeling with guard conditions on every transition would have caught this — the transition table would show 'paused → completed' requires 'generate_final_invoice' as a side effect."
   - Wrong: "The billing service should poll for campaigns in the 'completed' state and generate invoices retroactively."

2. Q: "Two state machines interact: a campaign lifecycle (draft → active → completed) and a subscription lifecycle (active → past_due → canceled). A campaign is 'active' but the subscription transitions to 'past_due.' What is the design challenge?"
   - A: "This is the state composition problem — the valid behavior depends on the combined state of both machines. Should the campaign continue running (accumulating unpaid charges), pause automatically (losing ad delivery), or enter a grace period? Each option has business implications, and the composed behavior must be explicitly designed and tested, not left to emerge accidentally."
   - Wrong: "The campaign should automatically cancel because the subscription is past due — this is a simple business rule."

---

## Summary: New Content Map

| Chapter | City Analog | Sections | Diagram Types |
|---------|------------|----------|---------------|
| Ch 23: Legacy System Migration | Historic Preservation | 3 sections (Strangler Fig, Data Migration, Parallel Runs) | AnimatedGraph, TradeoffSlider, CategoryExplorer |
| Ch 24: Deployment Pipelines & Delivery | Permits & Inspections | 3 sections (Pipeline, IaC/GitOps, Feature Flags) | AnimatedGraph, TradeoffSlider, ExpandableCards |
| Ch 25: Organizational Architecture | Neighborhood Character | 3 sections (Conway's Law, Team Topologies, Cognitive Load) | TradeoffSlider, CategoryExplorer, AnimatedGraph |
| Ch 26: Production Readiness | Municipal Services | 2 sections (Capacity Planning, Schema Evolution) | TradeoffSlider, CategoryExplorer |
| Ch 27: System Resilience & Lifecycle | Disaster Drills & Land Registry | 3 sections (Chaos Engineering, Data Governance, State Machines) | AnimatedGraph, CategoryExplorer, AnimatedGraph |

**Totals:**
- 5 new chapters (Ch 23-27)
- 14 new sections
- 28 new quiz questions
- All 4 reusable diagram primitives utilized
- OpenAgency connections in every section
