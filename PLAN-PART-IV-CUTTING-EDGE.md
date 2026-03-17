# Part IV: Cutting-Edge Architectures — Table of Contents & Section Plan

> **Context**: This Part extends beyond the original DDIA (2017) into architectures and technologies that have matured between 2018-2026. It assumes familiarity with Parts I-III and frequently references foundational concepts from those chapters. Chapters are numbered 13-16, continuing from Part III.

---

## Chapter Overview

| Chapter | Title | Sections | Topics Covered |
|---------|-------|----------|----------------|
| 13 | The Modern Storage Landscape | 4 | Lakehouse Architecture, Real-Time OLAP, Vector Databases & Embeddings, Serverless / Edge Databases |
| 14 | Data Ownership and Movement | 3 | Data Mesh, CDC Maturation, Workflow Orchestration |
| 15 | Infrastructure Reimagined | 3 | eBPF for Observability, Rust in Data Infrastructure, Privacy-Enhancing Tech |

---

## Chapter 13: The Modern Storage Landscape

*Where DDIA Ch. 3 left off: B-trees, LSM-trees, columnar storage, OLTP vs OLAP. This chapter covers the new storage paradigms that emerged when cloud object storage became cheap and fast enough to rethink everything.*

---

### Section 13-0: Lakehouse Architecture

**Key Concepts**
- The data lake problem: cheap storage but no transactions, no schema enforcement, no quality guarantees ("data swamp")
- The lakehouse thesis: ACID transactions on top of open file formats (Parquet/ORC) in object storage (S3/GCS)
- Open table formats: Apache Iceberg, Delta Lake, Apache Hudi — what they add (time travel, schema evolution, partition evolution, snapshot isolation)
- Why Iceberg emerged as the dominant standard by 2024-2025 and what "format wars" teach about data system adoption

**Diagram**: **CategoryExplorer**
Visualize the three open table format options (Iceberg, Delta Lake, Hudi) as selectable categories. Each card shows: origin (Netflix/Databricks/Uber), key differentiator, supported compute engines, and a comparison row for ACID guarantees, time travel depth, schema evolution flexibility, and community momentum. A toggle switches between "data lake" (no format layer — shows the pain points) and "lakehouse" (format layer added — shows the guarantees gained).

**OpenAgency Connection**: OpenAgency ingests raw ad performance data from 8+ networks into cloud storage. A lakehouse layer with Iceberg would provide ACID guarantees on that raw data, enable time-travel queries for auditing spend discrepancies, and allow schema evolution as ad networks change their API response shapes — without migrating to a new warehouse.

**Quiz**

1. What problem does a lakehouse architecture primarily solve compared to a traditional data lake?
   - A) It replaces the need for any OLTP database
   - B) It adds transactional guarantees and schema enforcement to cheap object storage **[CORRECT]**
   - C) It eliminates the need for ETL pipelines entirely
   - D) It provides faster query performance than any data warehouse

2. Which capability do open table formats like Apache Iceberg add on top of Parquet files in object storage?
   - A) Row-level encryption of individual columns
   - B) Automatic data replication across regions
   - C) Snapshot isolation and time-travel queries **[CORRECT]**
   - D) Built-in machine learning model training

---

### Section 13-1: Real-Time OLAP

**Key Concepts**
- The gap between batch analytics (Ch. 10) and stream processing (Ch. 11): users want dashboards that are both fast AND fresh
- Architecture of real-time OLAP engines: columnar storage + vectorized execution + materialized views + near-real-time ingestion (ClickHouse, Apache Doris/StarRocks, Apache Druid)
- DuckDB and the embedded analytics revolution: bringing OLAP to the edge, to laptops, to serverless functions
- Materialized views vs. pre-aggregation vs. raw-scan tradeoffs — freshness vs. query latency vs. storage cost

**Diagram**: **TradeoffSlider**
Two sliders: "Data Freshness" (batch/hourly to real-time) and "Query Concurrency" (low to high). As sliders move, a computed metrics panel shows which engine category fits best (traditional warehouse, real-time OLAP, or embedded OLAP) along with estimated cost tier, typical query latency, and ingestion complexity. A threshold warning appears when both sliders are maxed: "Real-time + high concurrency = expensive; consider tiered materialized views."

**OpenAgency Connection**: OpenAgency's reporting dashboard needs sub-second query response on campaign performance data that refreshes every few minutes. A real-time OLAP engine like ClickHouse could power the cross-network analytics view, replacing slow warehouse queries while keeping data fresh enough for same-day budget optimization decisions.

**Quiz**

1. What distinguishes a real-time OLAP engine like ClickHouse from a traditional data warehouse?
   - A) It uses row-oriented storage instead of columnar
   - B) It optimizes for near-real-time data ingestion alongside fast analytical queries **[CORRECT]**
   - C) It can only handle structured data, not semi-structured
   - D) It requires data to be fully denormalized before ingestion

2. When would an embedded OLAP engine like DuckDB be preferred over a server-based OLAP engine?
   - A) When you need thousands of concurrent users querying the same dataset
   - B) When query latency must be under 1 millisecond
   - C) When analytics can run locally or in a serverless function against moderately sized datasets **[CORRECT]**
   - D) When data must be replicated across multiple continents

---

### Section 13-2: Vector Databases & Embeddings

**Key Concepts**
- What embeddings are: high-dimensional numeric representations of semantic meaning (text, images, user behavior) produced by ML models
- Why traditional indexes (B-trees, hash indexes from Ch. 3) fail for similarity search: the "curse of dimensionality"
- Approximate Nearest Neighbor (ANN) index structures: HNSW (Hierarchical Navigable Small World graphs), IVF (Inverted File Index), product quantization — tradeoff between recall accuracy and query speed
- Purpose-built vector DBs (Pinecone, Weaviate, Milvus, Qdrant) vs. vector extensions in existing DBs (pgvector, Elasticsearch kNN) — when to use which

**Diagram**: **AnimatedGraph**
Animate a query flowing through an HNSW index structure. Show a multi-layer graph where the top layer has few, widely-spaced nodes and each lower layer has more nodes with shorter edges. Step through: (1) query vector enters at top layer, (2) greedy search finds closest node, (3) drops to next layer, (4) refines search in denser neighborhood, (5) returns top-K nearest neighbors. Contrast with a brute-force scan step that touches every vector.

**OpenAgency Connection**: OpenAgency could use vector embeddings to power semantic ad creative search ("find campaigns with visuals similar to this top-performing ad"), audience similarity matching across networks, and RAG-powered AI assistants that retrieve relevant campaign context. pgvector in the existing Postgres stack is the natural starting point before evaluating a dedicated vector DB.

**Quiz**

1. Why can't a standard B-tree index efficiently support nearest-neighbor search on 768-dimensional embedding vectors?
   - A) B-trees cannot store floating point numbers
   - B) B-trees rely on total ordering, which does not exist in high-dimensional space **[CORRECT]**
   - C) B-trees are too slow for any read operation above 100 dimensions
   - D) Embedding vectors exceed the maximum key size of B-tree nodes

2. What tradeoff does an HNSW index make compared to a brute-force scan of all vectors?
   - A) It guarantees finding the exact nearest neighbor but uses more memory
   - B) It uses less memory but cannot handle more than 1 million vectors
   - C) It sacrifices perfect recall accuracy for dramatically faster query speed **[CORRECT]**
   - D) It requires vectors to be reduced to 2 dimensions before indexing

---

### Section 13-3: Serverless and Edge Databases

**Key Concepts**
- Storage-compute separation as the enabling architecture: decouple the storage layer (on object storage or shared distributed storage) from compute nodes that can scale to zero
- Serverless Postgres: Neon's architecture (pageserver, safekeepers, WAL-based branching), Aurora Serverless v2 (proxy fleet, ACU scaling)
- Database branching: Neon's copy-on-write branches for dev/test/preview environments — a genuinely novel primitive with no DDIA equivalent
- Edge databases: Turso (libSQL/SQLite at the edge), Cloudflare D1 — pushing reads (and sometimes writes) to the network edge for latency reduction

**Diagram**: **ExpandableCards**
Four cards representing the spectrum of serverless database architectures: (1) "Traditional Provisioned" — always-on, you manage capacity; (2) "Auto-Scaling Serverless" — Aurora Serverless v2, scales within bounds; (3) "Scale-to-Zero Serverless" — Neon, PlanetScale, fully suspends when idle; (4) "Edge-Distributed" — Turso, D1, replicas at CDN edge. Each card expands to show: architecture diagram description, cold-start characteristics, cost model, consistency guarantees, and ideal use case.

**OpenAgency Connection**: OpenAgency's multi-tenant architecture could benefit from Neon-style database branching for staging environments per customer, scale-to-zero for dev/test databases that are only used during business hours, and edge read replicas via Turso for geographically distributed advertisers who need low-latency dashboard access.

**Quiz**

1. What architectural principle enables a database like Neon to "scale to zero" when there are no active connections?
   - A) Sharding data across multiple nodes that can be individually shut down
   - B) Separating storage from compute so the compute layer can fully suspend while data persists independently **[CORRECT]**
   - C) Caching all data in memory so disk storage can be turned off
   - D) Replicating data to a standby node before shutting down the primary

2. What does "database branching" in Neon provide that traditional database snapshots do not?
   - A) Faster backup speeds through incremental compression
   - B) Instant, copy-on-write forks that share unchanged pages and can diverge independently **[CORRECT]**
   - C) Automatic schema migration when creating the branch
   - D) Cross-region replication of the branch for disaster recovery

---

## Chapter 14: Data Ownership and Movement

*Where DDIA Ch. 11-12 left off: CDC, event sourcing, dataflow architectures, unbundling databases. This chapter covers the organizational and orchestration patterns that matured after the book — how data moves between teams, systems, and workflows at scale.*

---

### Section 14-0: Data Mesh

**Key Concepts**
- The problem with centralized data teams: bottleneck between domain expertise (in product teams) and data engineering skill (in the data team)
- Zhamak Dehghani's four principles: domain-oriented data ownership, data as a product, self-serve data platform, federated computational governance
- Data products: SLOs for data quality, discoverability, interoperability — treating datasets with the same rigor as microservice APIs
- Practical challenges: organizational resistance, the "who owns cross-domain data?" problem, governance vs. autonomy tension, and why most organizations adopt a hybrid approach

**Diagram**: **TradeoffSlider**
A slider from "Fully Centralized Data Team" to "Fully Decentralized Data Mesh." As the slider moves, a panel shows: number of data team bottleneck tickets (decreasing), domain expertise in data pipelines (increasing), governance complexity (increasing), infrastructure duplication risk (increasing), and time-to-insight for domain teams (decreasing). Key insight box changes at different positions to explain the tradeoff at that point on the spectrum.

**OpenAgency Connection**: OpenAgency integrates data from 8+ ad networks, each with distinct schemas and semantics. A data mesh mindset means the team owning the Meta integration owns the "Meta campaign performance" data product with defined SLOs, rather than a central data team trying to understand every network's nuances. The self-serve platform principle maps to building shared ingestion and transformation infrastructure that each integration team can use independently.

**Quiz**

1. Which of the four Data Mesh principles most directly addresses the problem of a central data team becoming a bottleneck?
   - A) Federated computational governance
   - B) Self-serve data platform
   - C) Domain-oriented data ownership **[CORRECT]**
   - D) Data as a product

2. What does "data as a product" mean in practice?
   - A) Selling raw datasets to external customers for revenue
   - B) Treating datasets with defined SLOs, documentation, and discoverability — like an internal API **[CORRECT]**
   - C) Building a marketplace UI where teams can browse and purchase data access
   - D) Packaging all company data into a single product catalog for analytics

---

### Section 14-1: CDC Maturation

**Key Concepts**
- CDC recap and what changed since DDIA Ch. 11: from experimental pattern to production-critical infrastructure (Debezium as the standard, Kafka Connect ecosystem)
- The outbox pattern: writing domain events to an outbox table within the same ACID transaction as the business data, then using CDC to publish them — solving the dual-write problem
- Kafka ecosystem maturation: KRaft (removing ZooKeeper dependency), tiered storage (hot/cold separation on object storage), Redpanda (C++ alternative with lower latency), WarpStream (object-storage-native streaming)
- CDC as the backbone of derived data: feeding search indexes, caches, analytics, and audit logs from a single source of truth

**Diagram**: **AnimatedGraph**
Animate the outbox pattern flow: (1) Application writes business data + outbox event in a single transaction to Postgres, (2) Debezium CDC connector reads the WAL, (3) Event published to Kafka topic, (4) Multiple consumers derive downstream state (search index, cache, analytics warehouse, audit log). Highlight the single-transaction boundary in step 1 with a gold border. Show what goes wrong without the outbox pattern (dual-write failure where the DB write succeeds but the message publish fails).

**OpenAgency Connection**: When a campaign budget changes in OpenAgency, that event must reliably propagate to the Temporal workflow engine (to adjust pacing), the analytics warehouse (for reporting), and the billing system (for Stripe metering). The outbox pattern with Debezium CDC ensures none of these downstream systems miss an update, even if Kafka is temporarily unavailable — the outbox table acts as a durable buffer.

**Quiz**

1. What problem does the outbox pattern solve that writing directly to both a database and a message broker does not?
   - A) It reduces network latency by batching messages
   - B) It ensures atomicity — the business data and the event are written in a single ACID transaction, eliminating dual-write inconsistencies **[CORRECT]**
   - C) It compresses messages more efficiently than direct publishing
   - D) It allows the message broker to read directly from the database's memory

2. What architectural change did KRaft bring to the Kafka ecosystem?
   - A) Replaced the Kafka protocol with gRPC for faster communication
   - B) Removed the dependency on ZooKeeper by moving metadata management into Kafka itself **[CORRECT]**
   - C) Added built-in exactly-once delivery guarantees for all consumers
   - D) Enabled Kafka to store data in columnar format for analytics queries

---

### Section 14-2: Workflow Orchestration

**Key Concepts**
- The problem: distributed sagas (Ch. 7, Ch. 9) and message-driven choreography are hard to reason about, debug, and monitor — state is scattered across queues and databases
- Durable execution model (Temporal, Restate): workflow logic as regular code with automatic state persistence at every await point — if the worker crashes, it replays from the last checkpoint
- Key patterns: long-running workflows (days/weeks), fan-out/fan-in (parallel child workflows), signals and queries (external interaction with running workflows), continue-as-new (bounding history size), workflow versioning (patching in-flight workflows)
- Task queue architecture: how workers pull tasks, sizing for throughput vs. latency, and the difference between workflow tasks and activity tasks

**Diagram**: **AnimatedGraph**
Animate a Temporal workflow for an ad campaign launch: (1) "LaunchCampaign" workflow starts, (2) fan-out to 3 parallel activities: "CreateGoogleCampaign," "CreateMetaCampaign," "CreateTikTokCampaign," (3) each activity may retry on transient failure (show retry arrow), (4) fan-in: all results collected, (5) "ActivateBudgetPacing" child workflow started, (6) workflow receives a signal "PauseCampaign" mid-flight and handles it gracefully. Show the Temporal server persisting state at each step with a small database icon.

**OpenAgency Connection**: Temporal is OpenAgency's orchestration backbone. Every multi-network campaign operation (launch, pause, budget change, creative rotation) is a Temporal workflow. Understanding durable execution is essential because it replaces fragile chains of API calls and retry logic with deterministic, replayable workflow code — turning a distributed systems problem into a programming model problem.

**Quiz**

1. How does Temporal's durable execution model handle a worker process crashing mid-workflow?
   - A) The workflow is marked as failed and must be manually restarted
   - B) The workflow replays its history on a new worker, re-executing activities only if their results are not already recorded **[CORRECT]**
   - C) The workflow resumes from the beginning, re-executing all activities
   - D) A standby worker takes over using leader election and continues from the crash point

2. Why does Temporal distinguish between "workflow tasks" and "activity tasks"?
   - A) Workflow tasks are for synchronous operations and activity tasks are for asynchronous operations
   - B) Workflow tasks execute deterministic orchestration logic, while activity tasks execute non-deterministic side effects like API calls and database writes **[CORRECT]**
   - C) Workflow tasks run on the Temporal server and activity tasks run on external workers
   - D) Workflow tasks have higher priority in the task queue than activity tasks

---

## Chapter 15: Infrastructure Reimagined

*Where DDIA Ch. 8 and Ch. 12 left off: fault detection, the future of data systems, doing the right thing. This chapter covers the new tools and paradigms that are reshaping how data infrastructure is built, observed, and protected — from kernel-level observability to memory-safe systems languages to cryptographic privacy guarantees.*

---

### Section 15-0: eBPF for Observability

**Key Concepts**
- The observability gap DDIA identified (Ch. 8): detecting faults in distributed systems is hard, and traditional approaches require code instrumentation (logging, metrics libraries, tracing SDKs)
- What eBPF is: sandboxed programs that run inside the Linux kernel, attached to events (syscalls, network packets, function calls) — observability without modifying application code
- The eBPF observability stack: Cilium (network observability and security), Pixie (auto-instrumented distributed tracing), Falco (runtime security detection), Hubble (network flow visibility)
- Tradeoffs: kernel-version dependency, Linux-only, complexity of writing eBPF programs, the "too much data" problem — when zero-instrumentation observability produces more data than you can usefully consume

**Diagram**: **CategoryExplorer**
Four categories representing eBPF observability use cases: (1) "Network Flows" — see every TCP connection, DNS lookup, HTTP request between services without service mesh overhead (Cilium/Hubble); (2) "Application Tracing" — auto-capture function calls, latency, errors without SDK instrumentation (Pixie); (3) "Security Detection" — detect unexpected syscalls, file access, network connections at runtime (Falco); (4) "Performance Profiling" — continuous CPU/memory profiling with negligible overhead (Parca). Each category shows: what data is captured, what kernel hooks are used, overhead characteristics, and limitations.

**OpenAgency Connection**: OpenAgency runs distributed services communicating via gRPC and HTTP. eBPF-based observability with Pixie could automatically trace requests across the campaign management service, Temporal workers, and ad network API adapters without adding OpenTelemetry instrumentation to every service — critical for a small team that cannot afford to maintain extensive instrumentation code.

**Quiz**

1. What fundamental advantage does eBPF-based observability have over traditional instrumentation-based approaches?
   - A) It produces less data, making it cheaper to store
   - B) It captures telemetry at the kernel level without requiring changes to application code **[CORRECT]**
   - C) It works on all operating systems including Windows and macOS
   - D) It provides stronger consistency guarantees for distributed traces

2. What is a significant limitation of eBPF-based observability tools?
   - A) They can only monitor network traffic, not application-level events
   - B) They require root access and only work on Linux with sufficiently recent kernel versions **[CORRECT]**
   - C) They add 10-20% CPU overhead to every monitored process
   - D) They cannot distinguish between different microservices running on the same host

---

### Section 15-1: Rust in Data Infrastructure

**Key Concepts**
- Why data infrastructure is being rewritten in Rust: memory safety without garbage collection eliminates an entire class of bugs (use-after-free, buffer overflows) while providing predictable latency (no GC pauses)
- The Rust data infrastructure ecosystem: DataFusion/Ballista (query engine/distributed compute), Polars (DataFrames), TiKV (distributed KV store), Neon (serverless Postgres storage layer), Turso/libSQL, Quickwit (search), Restate (durable execution)
- Apache Arrow as the unifying layer: language-agnostic columnar in-memory format, Arrow Flight for high-speed data transfer, zero-copy interoperability between Rust and Python
- The adoption tradeoff: Rust's steep learning curve and slower development velocity vs. the performance and reliability payoff — when rewriting in Rust makes sense vs. when it does not

**Diagram**: **TradeoffSlider**
Slider: "Development Velocity" vs. "Runtime Performance." As the slider moves toward performance, show the language/runtime landscape: Python/Java (high velocity, GC pauses, higher memory), Go (good velocity, small GC pauses, moderate memory), Rust (slower development, zero GC, minimal memory, predictable tail latency). A second toggle switches between "Application Service" (where Go/Java win on velocity) and "Data Infrastructure Component" (where Rust wins because p99 latency and memory efficiency compound over millions of operations). Computed metrics: p99 latency, memory per connection, crash-safety surface area.

**OpenAgency Connection**: OpenAgency does not need to write Rust, but benefits from Rust-based infrastructure. Using DataFusion as an embedded query engine could power the in-app analytics layer. Polars could replace Pandas in data processing pipelines for 10-100x speedup. Understanding why these tools are faster helps make informed technology choices — the performance comes from zero-copy Arrow buffers and no GC pauses, not magic.

**Quiz**

1. Why does Rust's lack of a garbage collector matter specifically for data infrastructure systems?
   - A) Garbage collection uses too much disk space for database storage
   - B) GC pauses cause unpredictable tail latency spikes, which compound when processing millions of operations per second **[CORRECT]**
   - C) Garbage collectors cannot manage memory for columnar data formats
   - D) Rust without GC uses exactly half the memory of equivalent Java programs

2. What role does Apache Arrow play in the Rust data infrastructure ecosystem?
   - A) It is a distributed consensus protocol for coordinating Rust services
   - B) It is a standardized columnar memory format enabling zero-copy data exchange between tools like DataFusion, Polars, and DuckDB **[CORRECT]**
   - C) It is a Rust-specific serialization format that replaces Protocol Buffers
   - D) It is a build system for compiling Rust programs that process data

---

### Section 15-2: Privacy-Enhancing Technologies

**Key Concepts**
- The privacy challenge DDIA Ch. 12 raised: data systems collect and process vast amounts of personal data, but the book predates practical solutions beyond "be careful"
- Differential privacy: adding calibrated noise to query results so individual records cannot be inferred — used by Apple (telemetry), Google (Chrome), and the US Census. The epsilon parameter and the privacy budget concept.
- Computation on encrypted data: homomorphic encryption (compute on ciphertext, get encrypted results), secure multi-party computation (multiple parties jointly compute without revealing their inputs), confidential computing (Intel SGX, AMD SEV — process data in hardware enclaves)
- Federated learning and analytics: training models or computing aggregates across distributed datasets without centralizing the raw data — practical applications in ad measurement (Google's Privacy Sandbox, Apple's SKAdNetwork)

**Diagram**: **ExpandableCards**
Four cards for privacy-enhancing techniques: (1) "Differential Privacy" — how noise injection works, epsilon budget visualization, real-world deployments; (2) "Homomorphic Encryption" — encrypt-compute-decrypt flow, current performance limitations (1000x+ overhead), where it is practical today; (3) "Secure Multi-Party Computation" — the millionaires' problem illustration, how secret sharing works conceptually, practical use in ad attribution; (4) "Confidential Computing" — hardware enclave concept, attestation, how it differs from encryption at rest/in transit. Each card includes a maturity rating (experimental/emerging/production-ready) and performance overhead estimate.

**OpenAgency Connection**: Privacy-enhancing tech directly impacts OpenAgency's ad measurement capabilities. As third-party cookies disappear, conversion attribution increasingly relies on privacy-preserving protocols: Google's Privacy Sandbox uses aggregated reporting with differential privacy, Apple's SKAdNetwork uses crowd anonymity. Understanding these technologies is essential for building accurate cross-network attribution that complies with evolving privacy regulations and platform restrictions.

**Quiz**

1. What does the "epsilon" parameter control in differential privacy?
   - A) The encryption key strength used to protect individual records
   - B) The tradeoff between privacy protection and statistical accuracy — lower epsilon means stronger privacy but noisier results **[CORRECT]**
   - C) The maximum number of queries allowed before the dataset must be refreshed
   - D) The percentage of records that are randomly removed before analysis

2. Why is federated learning particularly relevant to cross-platform ad measurement?
   - A) It allows ad networks to share their raw user data more efficiently
   - B) It enables computing aggregate conversion metrics across platforms without any party revealing their individual user data **[CORRECT]**
   - C) It replaces the need for cookies by storing user profiles in a shared blockchain
   - D) It compresses ad performance data so it can be transferred between platforms faster

---

## Appendix: Section ID Mapping and TOC Array Addition

When implementing, add the following to the TOC array:

```
Part: "IV"
Title: "Cutting-Edge Architectures"

Chapter 13: "The Modern Storage Landscape"
  13-0: Lakehouse Architecture
  13-1: Real-Time OLAP
  13-2: Vector Databases & Embeddings
  13-3: Serverless and Edge Databases

Chapter 14: "Data Ownership and Movement"
  14-0: Data Mesh
  14-1: CDC Maturation
  14-2: Workflow Orchestration

Chapter 15: "Infrastructure Reimagined"
  15-0: eBPF for Observability
  15-1: Rust in Data Infrastructure
  15-2: Privacy-Enhancing Technologies
```

## Appendix: Diagram Primitive Usage Summary

| Section | Primitive | Rationale |
|---------|-----------|-----------|
| 13-0 Lakehouse | CategoryExplorer | Comparing 3 table formats with multiple dimensions — natural category selection |
| 13-1 Real-Time OLAP | TradeoffSlider | Freshness vs. concurrency is a continuous spectrum with computed outcomes |
| 13-2 Vector DBs | AnimatedGraph | HNSW traversal is a multi-step graph algorithm — ideal for step-through animation |
| 13-3 Serverless/Edge DBs | ExpandableCards | Four distinct architecture tiers to compare — accordion layout fits naturally |
| 14-0 Data Mesh | TradeoffSlider | Centralized-to-decentralized is a spectrum with multiple changing metrics |
| 14-1 CDC Maturation | AnimatedGraph | The outbox pattern is a data flow with distinct steps and failure modes |
| 14-2 Workflow Orchestration | AnimatedGraph | Temporal workflow execution is a multi-step process with fan-out/fan-in |
| 15-0 eBPF | CategoryExplorer | Four distinct observability use cases to explore independently |
| 15-1 Rust in Infrastructure | TradeoffSlider | Velocity vs. performance is a classic tradeoff with measurable metrics |
| 15-2 Privacy-Enhancing Tech | ExpandableCards | Four independent techniques to learn — each needs its own detail expansion |

**Primitive distribution**: AnimatedGraph (3), TradeoffSlider (3), CategoryExplorer (2), ExpandableCards (2) — balanced usage across all four primitives.

## Appendix: DDIA Chapter Cross-References

| Part IV Section | Extends DDIA Chapter | Connection |
|-----------------|---------------------|------------|
| 13-0 Lakehouse | Ch. 3 (Storage), Ch. 10 (Batch) | Adds ACID to object-storage-based batch pipelines |
| 13-1 Real-Time OLAP | Ch. 3 (Column Storage), Ch. 10-11 (Batch/Stream) | Bridges the batch-stream gap for analytics |
| 13-2 Vector DBs | Ch. 3 (Index Structures) | New index types (HNSW, IVF) beyond B-trees and LSM-trees |
| 13-3 Serverless/Edge | Ch. 5 (Replication), Ch. 9 (Consensus) | Storage-compute separation built on replication and consensus |
| 14-0 Data Mesh | Ch. 12 (Data Integration) | Organizational answer to the data integration problem |
| 14-1 CDC Maturation | Ch. 11 (Databases and Streams) | Production hardening of CDC concepts from Ch. 11 |
| 14-2 Workflow Orchestration | Ch. 7 (Transactions), Ch. 9 (Consensus) | Durable execution as alternative to distributed transactions |
| 15-0 eBPF | Ch. 8 (Fault Detection) | Kernel-level tooling for the fault detection problem |
| 15-1 Rust in Infrastructure | Ch. 3 (Storage Engines) | Systems language enabling new storage engine performance |
| 15-2 Privacy-Enhancing Tech | Ch. 12 (Doing the Right Thing) | Concrete solutions to the ethics problems Ch. 12 raised |
