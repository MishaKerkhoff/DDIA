# SubStack-to-DDIA Cross-Reference Analysis

This document maps the 114 SubStack system design concepts against the 27 DDIA chapters, identifying overlaps, extensions, gaps, and recommended cross-links.

---

## DDIA Chapter Summary (for reference)

| Ch | Title | Part |
|----|-------|------|
| 1 | Reliable, Scalable, and Maintainable Applications | I: Foundations |
| 2 | Data Models and Query Languages | I: Foundations |
| 3 | Storage and Retrieval | I: Foundations |
| 4 | Encoding and Evolution | I: Foundations |
| 5 | Replication | II: Distributed Data |
| 6 | Partitioning | II: Distributed Data |
| 7 | Transactions | II: Distributed Data |
| 8 | The Trouble with Distributed Systems | II: Distributed Data |
| 9 | Consistency and Consensus | II: Distributed Data |
| 10 | Batch Processing | III: Derived Data |
| 11 | Stream Processing | III: Derived Data |
| 12 | The Future of Data Systems | III: Derived Data |
| 13 | The Modern Storage Landscape | IV: Cutting-Edge |
| 14 | Data Ownership and Movement | IV: Cutting-Edge |
| 15 | Infrastructure Reimagined | IV: Cutting-Edge |
| 16 | Infrastructure Foundations | V: Adjacent Subjects |
| 17 | Protecting and Connecting Systems | V: Adjacent Subjects |
| 18 | Architecture at Scale | V: Adjacent Subjects |
| 19 | Operating Production Systems | V: Adjacent Subjects |
| 20 | Platform Architecture Patterns | VI: Gaps & Recs |
| 21 | Operational Infrastructure | VI: Gaps & Recs |
| 22 | Data Pipeline & Analytics Patterns | VI: Gaps & Recs |
| 23 | Legacy System Migration | VII: City Planner's |
| 24 | Deployment Pipelines & Delivery | VII: City Planner's |
| 25 | Organizational Architecture | VII: City Planner's |
| 26 | Production Readiness | VII: City Planner's |
| 27 | System Resilience & Lifecycle | VII: City Planner's |

---

## 1. Direct Overlaps

These SubStack concepts are substantially covered by existing DDIA chapters. The SubStack version is generally more concise and interview-oriented; the DDIA version is deeper and more principled.

| # | SubStack Concept | DDIA Chapter(s) | Redundancy Level |
|---|-----------------|-----------------|-----------------|
| 1 | Scalability | Ch 1 (sec 1-2: Scalability) | **High** — Ch 1 covers vertical/horizontal scaling, load parameters, percentiles. SubStack adds interview framing but no new substance. |
| 2 | Availability | Ch 1 (Reliability), Ch 8 (Faults), Ch 9 | **Moderate** — DDIA discusses availability through the lens of fault tolerance and CAP. SubStack provides the "nines" framing and SLA specifics more explicitly. |
| 3 | Reliability | Ch 1 (sec 1-1: Reliability) | **High** — Ch 1 defines reliability, fault types (hardware, software, human). SubStack is a simplified retelling. |
| 4 | Latency vs Throughput vs Bandwidth | Ch 1 (sec 1-2: Scalability), Ch 8 (sec 8-1: Unreliable Networks) | **Moderate** — DDIA covers latency distributions and percentiles deeply. SubStack adds bandwidth as a distinct concept. |
| 6 | Databases (overview) | Ch 2 (Data Models), Ch 3 (Storage) | **High** — DDIA covers database internals far more deeply. SubStack is a surface-level overview. |
| 7 | SQL vs NoSQL | Ch 2 (sec 2-0: Relational vs Document Model) | **High** — Ch 2 is a thorough treatment. SubStack is a simplified comparison. |
| 23 | CAP Theorem | Ch 9 (sec 9-0: Linearizability) | **High** — Ch 9 provides rigorous treatment of CAP and its nuances. SubStack gives the standard simplified version. |
| 24 | Consistency Models (Strong vs Eventual) | Ch 5 (sec 5-1: Replication Lag), Ch 9 (Linearizability) | **High** — DDIA covers read-after-write, monotonic reads, causal consistency, linearizability. SubStack is a condensed version. |
| 25 | Data Replication | Ch 5 (Replication — entire chapter) | **High** — Ch 5 is a comprehensive treatment of leader/follower, multi-leader, leaderless replication. SubStack is an overview. |
| 26 | Read Replicas | Ch 5 (sec 5-0: Leaders and Followers, sec 5-1: Replication Lag) | **High** — Fully covered in Ch 5. |
| 27 | Sharding | Ch 6 (Partitioning — entire chapter) | **High** — Ch 6 covers key-range, hash partitioning, secondary indexes, rebalancing. SubStack is a summary. |
| 28 | Data Partitioning | Ch 6 (Partitioning — entire chapter) | **High** — Same as #27; Ch 6 is the definitive treatment. |
| 29 | Consistent Hashing | Ch 6 (sec 6-0: Partitioning of Key-Value Data) | **High** — Covered in partitioning strategies. |
| 31 | Indexing | Ch 3 (sec 3-0: Data Structures That Power Your Database) | **High** — Ch 3 covers hash indexes, SSTables, LSM-trees, B-trees. SubStack is surface-level. |
| 54 | ACID vs BASE | Ch 7 (sec 7-0: The Slippery Concept of a Transaction) | **High** — Ch 7 provides rigorous ACID definitions and critiques BASE. |
| 55 | Network Partitions | Ch 8 (sec 8-1: Unreliable Networks) | **High** — Ch 8 is a thorough treatment of network faults. |
| 56 | Split Brain Problem | Ch 5 (sec 5-0: Leaders and Followers), Ch 8 (sec 8-3: Knowledge, Truth, and Lies) | **High** — Covered in leader election and fencing token discussions. |
| 57 | Heartbeats | Ch 8 (sec 8-1: Unreliable Networks — timeouts and failure detection) | **Moderate** — DDIA discusses failure detection but doesn't isolate "heartbeats" as a standalone topic. SubStack is more explicit. |
| 58 | Leader Election | Ch 9 (sec 9-2: Distributed Transactions and Consensus) | **High** — Covered as a consensus application. |
| 59 | Consensus Algorithms | Ch 9 (sec 9-2: Distributed Transactions and Consensus) | **High** — Ch 9 covers Paxos, Raft, ZAB in depth. |
| 60 | Quorum | Ch 5 (sec 5-3: Leaderless Replication) | **High** — DDIA covers quorum reads/writes, sloppy quorums. |
| 64 | Clock Synchronization Problem | Ch 8 (sec 8-2: Unreliable Clocks) | **High** — Ch 8 is a thorough treatment. |
| 65 | Logical Clock | Ch 8 (sec 8-2), Ch 9 (sec 9-1: Ordering Guarantees) | **High** — Covered in ordering and causality discussions. |
| 66 | Lamport Timestamp | Ch 9 (sec 9-1: Ordering Guarantees) | **High** — Explicitly covered. |
| 67 | Vector Clock | Ch 5 (sec 5-3: Leaderless Replication — detecting concurrent writes) | **High** — Covered in version vectors discussion. |
| 68 | Distributed Transactions | Ch 7 (Transactions), Ch 9 (sec 9-2: Distributed Transactions) | **High** — Comprehensive DDIA treatment. |
| 69 | Two-Phase Commit (2PC) | Ch 9 (sec 9-2: Distributed Transactions and Consensus) | **High** — Explicitly covered with failure modes. |
| 73 | Delivery Semantics | Ch 11 (sec 11-2: Processing Streams) | **High** — Covered in stream processing exactly-once discussion. |
| 107 | B-Trees and B+ Trees | Ch 3 (sec 3-0: Data Structures That Power Your Database) | **High** — Ch 3 has detailed B-tree coverage. |
| 108 | LSM Tree | Ch 3 (sec 3-0: Data Structures — SSTables and LSM-Trees) | **High** — Core topic of Ch 3. |
| 111 | Batch vs Stream Processing | Ch 10 (Batch Processing), Ch 11 (Stream Processing) | **High** — Two full chapters dedicated to this. |
| 113 | MapReduce | Ch 10 (sec 10-1: MapReduce and Distributed Filesystems) | **High** — Core topic of Ch 10. |

---

## 2. SubStack Concepts That Extend DDIA

These concepts overlap with DDIA content but add new angles, practical depth, or modern context.

| # | SubStack Concept | Extends DDIA Chapter | What's New |
|---|-----------------|---------------------|-----------|
| 5 | Client-Server Architecture | Ch 4 (Modes of Dataflow) | SubStack covers basic client-server patterns explicitly; DDIA assumes this knowledge. |
| 8 | Load Balancing | Ch 6 (sec 6-3: Request Routing) | DDIA touches on routing but not load balancing algorithms in depth. SubStack covers L4/L7 balancing, health checks. |
| 9 | Load Balancing Algorithms | Ch 6 (sec 6-3: Request Routing) | Round-robin, least connections, weighted — not covered in DDIA. |
| 10 | Caching | Ch 3 (Storage), Ch 11 (materialized views) | DDIA mentions caching peripherally. SubStack provides a dedicated treatment of caching layers, strategies (write-through, write-back, write-around). |
| 11 | Cache Invalidation | Ch 3, Ch 11 | A dedicated practical topic not isolated in DDIA. |
| 21 | Single Point of Failure (SPOF) | Ch 1 (Reliability), Ch 5 (Replication) | SubStack isolates SPOF as its own design principle. DDIA addresses it implicitly throughout. |
| 22 | High Availability vs Fault Tolerance | Ch 1, Ch 8 | SubStack distinguishes HA vs FT explicitly. DDIA treats them as interrelated concerns without a clear boundary. |
| 30 | Denormalization | Ch 2 (sec 2-0), Ch 3 (sec 3-1: OLAP) | SubStack discusses denormalization as a performance pattern. DDIA mentions it in context of document model and analytics. |
| 35 | Event-Driven Architecture | Ch 11 (Stream Processing) | SubStack frames event-driven as an architecture pattern; DDIA covers it as stream processing mechanics. |
| 36 | Message Queue | Ch 11 (sec 11-0: Transmitting Event Streams) | DDIA covers message brokers (Kafka, AMQP). SubStack gives a simpler standalone treatment. |
| 37 | Publish-Subscribe (Pub/Sub) | Ch 11 (sec 11-0: Transmitting Event Streams) | Similar to above — SubStack isolates pub/sub as a pattern. |
| 38 | Synchronous vs Asynchronous Communication | Ch 4 (Modes of Dataflow), Ch 11 | SubStack frames sync/async as a design decision. DDIA discusses it in dataflow and stream contexts. |
| 53 | Data Compression | Ch 3 (sec 3-2: Column-Oriented Storage), Ch 4 (Encoding) | DDIA covers column compression and encoding formats. SubStack adds general compression algorithms (gzip, snappy, zstd). |
| 61 | Paxos Algorithm | Ch 9 (sec 9-2) | SubStack gives a standalone tutorial. DDIA covers Paxos conceptually but notes its difficulty. |
| 62 | Raft Algorithm | Ch 9 (sec 9-2) | SubStack gives a dedicated Raft explainer. DDIA covers it as a consensus approach. |
| 63 | Gossip Protocol | Ch 5 (sec 5-3: Leaderless), Ch 6 (sec 6-3: Request Routing) | SubStack isolates gossip as a protocol. DDIA mentions it in service discovery and failure detection. |
| 70 | SAGA Pattern | Ch 7 (Transactions), Ch 9 | SubStack covers sagas as a distributed transaction alternative. DDIA mentions the concept but focuses more on 2PC/consensus. |
| 71 | Outbox Pattern | Ch 11 (sec 11-1: Databases and Streams) | SubStack gives a dedicated treatment. DDIA covers the concept in CDC/log-based messaging. |
| 72 | Three-Phase Commit (3PC) | Ch 9 (sec 9-2) | SubStack has a standalone entry. DDIA mentions 3PC briefly as a non-blocking alternative to 2PC. |
| 74 | Change Data Capture (CDC) | Ch 11 (sec 11-1: Databases and Streams), Ch 14 (sec 14-1: CDC Maturation) | SubStack gives a standalone treatment. DDIA covers CDC in both the original and new chapters. |
| 79 | CQRS | Ch 11 (sec 11-1: Databases and Streams), Ch 12 (sec 12-1: Unbundling Databases) | SubStack isolates CQRS. DDIA discusses the idea of deriving read-optimized views from write logs. |
| 80 | Event Sourcing | Ch 11 (sec 11-1: Databases and Streams) | SubStack has a dedicated entry. DDIA discusses event sourcing in the context of stream processing and immutable logs. |
| 96 | Materialized Views | Ch 3 (sec 3-1: OLAP), Ch 11 | SubStack gives a standalone treatment. DDIA covers them in analytics and stream contexts. |
| 101 | PACELC Theorem | Ch 9 (Consistency and Consensus) | SubStack extends CAP with the PACELC formulation. DDIA critiques CAP but doesn't use the PACELC framing. |
| 106 | Bloom Filter | Ch 3 (sec 3-0: SSTables/LSM-Trees) | SubStack has a dedicated entry. DDIA mentions Bloom filters in LSM-tree optimization. |
| 109 | Merkle Trees | Ch 5 (sec 5-3: Leaderless — anti-entropy) | SubStack gives a standalone treatment. DDIA mentions Merkle trees in anti-entropy repair. |
| 110 | HyperLogLog | Ch 3 (sec 3-2: Column-Oriented Storage) | SubStack has a dedicated entry. DDIA mentions it peripherally in probabilistic data structures. |
| 112 | ETL Pipeline | Ch 10 (Batch Processing), Ch 22 (Data Pipeline Patterns) | SubStack gives a standalone treatment. DDIA covers ETL concepts across batch processing and the new pipeline chapter. |
| 114 | Erasure Coding | Ch 5 (Replication) | SubStack covers erasure coding as an alternative to replication. DDIA focuses on replication but doesn't cover erasure coding. |

---

## 3. Completely New Topics

These SubStack concepts have NO substantial coverage in the existing 27 DDIA chapters.

### Networking & Protocols
| # | Concept | Notes |
|---|---------|-------|
| 12 | Content Delivery Network (CDN) | Ch 16 mentions networking but CDNs are not covered in depth |
| 13 | Domain Name System (DNS) | Ch 16 (Networking) is adjacent but DNS gets no dedicated treatment in existing content |
| 39 | WebSockets | No DDIA coverage |
| 43 | Proxy vs Reverse Proxy | No DDIA coverage |
| 44 | HTTP vs HTTPS | No DDIA coverage (Ch 17 Security is adjacent) |
| 45 | TCP vs UDP | No DDIA coverage (Ch 16 Networking is adjacent) |
| 46 | OSI Model | No DDIA coverage (Ch 16 is adjacent) |
| 47 | TLS/SSL | No DDIA coverage (Ch 17 Security is adjacent) |
| 48 | DNS Load Balancing | No DDIA coverage |
| 49 | Anycast Routing | No DDIA coverage |
| 75 | Long Polling | No DDIA coverage |
| 76 | Server-Sent Events (SSE) | No DDIA coverage |
| 77 | Webhooks | No DDIA coverage |
| 78 | WebRTC | No DDIA coverage |

### API Design & Architecture Patterns
| # | Concept | Notes |
|---|---------|-------|
| 14 | API Design | Ch 17 (sec 17-1: API Design) is a match — but this is a new DDIA chapter, so the SubStack content may predate it |
| 15 | REST API | Ch 4 (Modes of Dataflow) touches on REST peripherally |
| 32 | Microservices Architecture | Ch 4 (dataflow via services) touches on it, but no dedicated treatment |
| 33 | Monolithic Architecture | No DDIA coverage |
| 34 | Serverless Architecture | Ch 13 (sec 13-3: Serverless and Edge Databases) covers serverless DBs, not serverless compute |
| 40 | API Gateways | No DDIA coverage |
| 85 | Backend for Frontend (BFF) | No DDIA coverage |

### Security & Authentication
| # | Concept | Notes |
|---|---------|-------|
| 16 | Authentication vs Authorization | Ch 17 (sec 17-0: Security & Authentication) is adjacent |
| 17 | Session-Based vs Token-Based Auth | No DDIA coverage |
| 18 | OAuth/OAuth2/OpenID Connect | No DDIA coverage |
| 19 | JWT (JSON Web Token) | No DDIA coverage |
| 102 | Security Secrets Management | No DDIA coverage |
| 103 | Role-Based Access Control (RBAC) | No DDIA coverage |
| 104 | Single Sign-On (SSO) | No DDIA coverage |

### Caching (Advanced)
| # | Concept | Notes |
|---|---------|-------|
| 41 | Distributed Cache | No dedicated DDIA coverage |
| 42 | Cache Eviction Policies | No DDIA coverage |
| 99 | Cache Stampede | No DDIA coverage |
| 100 | Cache Warming | No DDIA coverage |

### Storage (Specialized)
| # | Concept | Notes |
|---|---------|-------|
| 50 | Object Storage | Ch 13 (Modern Storage) is adjacent |
| 51 | Distributed File Systems | Ch 10 (sec 10-1: Distributed Filesystems) covers HDFS but SubStack may cover modern DFS |
| 52 | Block vs File vs Object Storage | No DDIA coverage |
| 93 | Full-Text Search Engine | No DDIA coverage (Elasticsearch, Solr) |
| 94 | Time Series Database | Ch 13 (sec 13-1: Real-Time OLAP) is adjacent |
| 95 | Vector Databases | Ch 13 (sec 13-2: Vector Databases & Embeddings) is a match |
| 97 | Query Optimization | Ch 3 (sec 3-0) touches on it; Ch 2 discusses query languages |
| 98 | Connection Pooling | No DDIA coverage |
| 105 | Checksums | Ch 8 mentions data integrity but not checksums as a standalone topic |

### Operational Patterns
| # | Concept | Notes |
|---|---------|-------|
| 20 | Rate Limiting | Ch 21 (sec 21-0: Distributed Rate Limiting) is a match |
| 81 | Service Discovery | No DDIA coverage (Ch 6 sec 6-3 Request Routing is tangential) |
| 82 | Circuit Breaker Pattern | No DDIA coverage |
| 83 | Bulkhead Pattern | No DDIA coverage |
| 84 | Strangler Fig Pattern | Ch 23 (sec 23-0: The Strangler Fig Pattern) is a match |
| 86 | Sidecar Pattern | No DDIA coverage |
| 87 | Service Mesh | No DDIA coverage |

### Observability
| # | Concept | Notes |
|---|---------|-------|
| 88 | Observability | Ch 17 (sec 17-2: Observability), Ch 15 (sec 15-0: eBPF) are matches |
| 89 | Logging | Ch 17 (sec 17-2) is adjacent |
| 90 | Metrics | Ch 17 (sec 17-2) is adjacent |
| 91 | Distributed Tracing | Ch 17 (sec 17-2) is adjacent |
| 92 | Correlation IDs | No DDIA coverage |

---

## 4. Recommended Cross-Links

For each SubStack concept, the DDIA chapters that should be linked as "Related DDIA Reading."

| SubStack # | Concept | Related DDIA Chapters |
|---|---------|----------------------|
| 1 | Scalability | **Ch 1** (sec 1-2) |
| 2 | Availability | **Ch 1** (sec 1-1), **Ch 8**, **Ch 9** |
| 3 | Reliability | **Ch 1** (sec 1-1), **Ch 8** |
| 4 | Latency vs Throughput | **Ch 1** (sec 1-2), **Ch 8** (sec 8-1) |
| 5 | Client-Server | **Ch 4** (sec 4-1) |
| 6 | Databases | **Ch 2**, **Ch 3** |
| 7 | SQL vs NoSQL | **Ch 2** (sec 2-0) |
| 8 | Load Balancing | **Ch 6** (sec 6-3) |
| 9 | Load Balancing Algorithms | **Ch 6** (sec 6-3) |
| 10 | Caching | **Ch 3**, **Ch 11** |
| 11 | Cache Invalidation | **Ch 5** (sec 5-1), **Ch 11** |
| 12 | CDN | **Ch 16** (sec 16-0) |
| 13 | DNS | **Ch 16** (sec 16-0) |
| 14 | API Design | **Ch 4** (sec 4-1), **Ch 17** (sec 17-1) |
| 15 | REST API | **Ch 4** (sec 4-1), **Ch 17** (sec 17-1) |
| 16 | Auth vs Authz | **Ch 17** (sec 17-0) |
| 17 | Session vs Token Auth | **Ch 17** (sec 17-0) |
| 18 | OAuth/OIDC | **Ch 17** (sec 17-0) |
| 19 | JWT | **Ch 17** (sec 17-0) |
| 20 | Rate Limiting | **Ch 21** (sec 21-0) |
| 21 | SPOF | **Ch 1** (sec 1-1), **Ch 5**, **Ch 8** |
| 22 | HA vs Fault Tolerance | **Ch 1** (sec 1-1), **Ch 8** |
| 23 | CAP Theorem | **Ch 9** (sec 9-0) |
| 24 | Consistency Models | **Ch 5** (sec 5-1), **Ch 9** (sec 9-0) |
| 25 | Data Replication | **Ch 5** (all sections) |
| 26 | Read Replicas | **Ch 5** (sec 5-0, 5-1) |
| 27 | Sharding | **Ch 6** (all sections) |
| 28 | Data Partitioning | **Ch 6** (all sections) |
| 29 | Consistent Hashing | **Ch 6** (sec 6-0) |
| 30 | Denormalization | **Ch 2** (sec 2-0), **Ch 3** (sec 3-1) |
| 31 | Indexing | **Ch 3** (sec 3-0) |
| 32 | Microservices | **Ch 4** (sec 4-1) |
| 33 | Monolithic Architecture | **Ch 4** (sec 4-1) |
| 34 | Serverless | **Ch 13** (sec 13-3) |
| 35 | Event-Driven Architecture | **Ch 11** (sec 11-0) |
| 36 | Message Queue | **Ch 11** (sec 11-0) |
| 37 | Pub/Sub | **Ch 11** (sec 11-0) |
| 38 | Sync vs Async | **Ch 4** (sec 4-1), **Ch 11** |
| 39 | WebSockets | **Ch 16** (sec 16-0) |
| 40 | API Gateways | **Ch 17** (sec 17-1) |
| 41 | Distributed Cache | **Ch 5** (sec 5-1), **Ch 6** |
| 42 | Cache Eviction Policies | **Ch 3** (sec 3-0) |
| 43 | Proxy vs Reverse Proxy | **Ch 16** (sec 16-0) |
| 44 | HTTP vs HTTPS | **Ch 16** (sec 16-0), **Ch 17** (sec 17-0) |
| 45 | TCP vs UDP | **Ch 16** (sec 16-0) |
| 46 | OSI Model | **Ch 16** (sec 16-0) |
| 47 | TLS/SSL | **Ch 17** (sec 17-0) |
| 48 | DNS Load Balancing | **Ch 6** (sec 6-3), **Ch 16** (sec 16-0) |
| 49 | Anycast Routing | **Ch 16** (sec 16-0) |
| 50 | Object Storage | **Ch 13** (sec 13-0) |
| 51 | Distributed File Systems | **Ch 10** (sec 10-1) |
| 52 | Block vs File vs Object | **Ch 13** (sec 13-0) |
| 53 | Data Compression | **Ch 3** (sec 3-2), **Ch 4** (sec 4-0) |
| 54 | ACID vs BASE | **Ch 7** (sec 7-0) |
| 55 | Network Partitions | **Ch 8** (sec 8-1) |
| 56 | Split Brain | **Ch 5** (sec 5-0), **Ch 8** (sec 8-3) |
| 57 | Heartbeats | **Ch 8** (sec 8-1) |
| 58 | Leader Election | **Ch 9** (sec 9-2) |
| 59 | Consensus Algorithms | **Ch 9** (sec 9-2) |
| 60 | Quorum | **Ch 5** (sec 5-3) |
| 61 | Paxos | **Ch 9** (sec 9-2) |
| 62 | Raft | **Ch 9** (sec 9-2) |
| 63 | Gossip Protocol | **Ch 5** (sec 5-3), **Ch 6** (sec 6-3) |
| 64 | Clock Synchronization | **Ch 8** (sec 8-2) |
| 65 | Logical Clock | **Ch 8** (sec 8-2), **Ch 9** (sec 9-1) |
| 66 | Lamport Timestamp | **Ch 9** (sec 9-1) |
| 67 | Vector Clock | **Ch 5** (sec 5-3) |
| 68 | Distributed Transactions | **Ch 7**, **Ch 9** (sec 9-2) |
| 69 | Two-Phase Commit | **Ch 9** (sec 9-2) |
| 70 | SAGA Pattern | **Ch 7**, **Ch 9** |
| 71 | Outbox Pattern | **Ch 11** (sec 11-1) |
| 72 | Three-Phase Commit | **Ch 9** (sec 9-2) |
| 73 | Delivery Semantics | **Ch 11** (sec 11-2) |
| 74 | CDC | **Ch 11** (sec 11-1), **Ch 14** (sec 14-1) |
| 75 | Long Polling | **Ch 16** (sec 16-0) |
| 76 | SSE | **Ch 16** (sec 16-0) |
| 77 | Webhooks | **Ch 4** (sec 4-1), **Ch 11** |
| 78 | WebRTC | — (no strong DDIA match) |
| 79 | CQRS | **Ch 11** (sec 11-1), **Ch 12** (sec 12-1) |
| 80 | Event Sourcing | **Ch 11** (sec 11-1) |
| 81 | Service Discovery | **Ch 6** (sec 6-3) |
| 82 | Circuit Breaker | **Ch 8**, **Ch 27** (sec 27-0) |
| 83 | Bulkhead Pattern | **Ch 8**, **Ch 27** (sec 27-0) |
| 84 | Strangler Fig | **Ch 23** (sec 23-0) |
| 85 | BFF | **Ch 17** (sec 17-1) |
| 86 | Sidecar Pattern | **Ch 15** |
| 87 | Service Mesh | **Ch 15**, **Ch 16** |
| 88 | Observability | **Ch 17** (sec 17-2), **Ch 15** (sec 15-0) |
| 89 | Logging | **Ch 17** (sec 17-2) |
| 90 | Metrics | **Ch 17** (sec 17-2) |
| 91 | Distributed Tracing | **Ch 17** (sec 17-2) |
| 92 | Correlation IDs | **Ch 17** (sec 17-2) |
| 93 | Full-Text Search | **Ch 3** (sec 3-0) |
| 94 | Time Series Database | **Ch 13** (sec 13-1) |
| 95 | Vector Databases | **Ch 13** (sec 13-2) |
| 96 | Materialized Views | **Ch 3** (sec 3-1), **Ch 11** |
| 97 | Query Optimization | **Ch 2** (sec 2-1), **Ch 3** |
| 98 | Connection Pooling | — (no strong DDIA match) |
| 99 | Cache Stampede | — (no strong DDIA match) |
| 100 | Cache Warming | — (no strong DDIA match) |
| 101 | PACELC Theorem | **Ch 9** (sec 9-0) |
| 102 | Secrets Management | **Ch 17** (sec 17-0) |
| 103 | RBAC | **Ch 17** (sec 17-0) |
| 104 | SSO | **Ch 17** (sec 17-0) |
| 105 | Checksums | **Ch 8** |
| 106 | Bloom Filter | **Ch 3** (sec 3-0) |
| 107 | B-Trees and B+ Trees | **Ch 3** (sec 3-0) |
| 108 | LSM Tree | **Ch 3** (sec 3-0) |
| 109 | Merkle Trees | **Ch 5** (sec 5-3) |
| 110 | HyperLogLog | **Ch 3** (sec 3-2) |
| 111 | Batch vs Stream | **Ch 10**, **Ch 11** |
| 112 | ETL Pipeline | **Ch 10**, **Ch 22** |
| 113 | MapReduce | **Ch 10** (sec 10-1) |
| 114 | Erasure Coding | **Ch 5** |

---

## 5. Suggested Navigation UX

### 5.1 Bidirectional Cross-Links

Every SubStack concept page should include a "Deeper in DDIA" sidebar or footer section listing the relevant DDIA chapters (from the table in Section 4 above). Conversely, each DDIA chapter should include a "Quick Reference" section listing the SubStack concepts that relate to it.

Example for Ch 5 (Replication):
> **Related Quick Concepts:** #25 Data Replication, #26 Read Replicas, #60 Quorum, #67 Vector Clock, #63 Gossip Protocol, #109 Merkle Trees, #114 Erasure Coding

Example for SubStack #27 (Sharding):
> **Deeper in DDIA:** Chapter 6: Partitioning — covers key-range partitioning, hash partitioning, secondary index strategies, rebalancing, and request routing.

### 5.2 Content Hierarchy

Position the two content types as complementary:

- **SubStack concepts** = "Quick Reference Cards" — 5-minute reads, interview prep, breadth coverage
- **DDIA chapters** = "Deep Dives" — 30-60 minute reads, principled understanding, implementation depth

The site navigation should make this hierarchy clear. Suggested labels:
- "Quick Concepts (114)" — the SubStack section
- "Deep Dives (27)" — the DDIA section

### 5.3 Overlap Handling

For highly overlapping topics (Section 1 above), do NOT duplicate or merge content. Instead:

1. On the SubStack concept page, add a prominent callout:
   > "This concept is covered in depth in **DDIA Chapter X**. Read the quick version here, or dive deep there."

2. On the DDIA chapter page, add a "Key Concepts Covered" list at the top linking to the relevant SubStack concept cards for quick review.

### 5.4 Gap-Filling Navigation

For SubStack concepts with NO DDIA coverage (Section 3 above), these stand alone as the site's only treatment. They should be visually distinguished (e.g., a "SubStack Exclusive" badge or different accent color) so users know there is no deeper dive available.

### 5.5 Unified Search

Both content pools should be searchable from a single search bar. Results should indicate whether a match is a "Quick Concept" or "Deep Dive" so users can choose their depth.

### 5.6 Learning Paths

Create curated learning paths that interleave SubStack and DDIA content. Example:

**"Distributed Systems Foundations" path:**
1. SubStack #1: Scalability (quick intro)
2. DDIA Ch 1: Reliable, Scalable, Maintainable (deep dive)
3. SubStack #23: CAP Theorem (quick intro)
4. SubStack #24: Consistency Models (quick intro)
5. DDIA Ch 9: Consistency and Consensus (deep dive)
6. SubStack #59: Consensus Algorithms (quick recap)

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **Direct overlaps** (SubStack largely redundant with DDIA) | 33 |
| **Extensions** (SubStack adds new angle to DDIA topic) | 31 |
| **Completely new** (no DDIA coverage) | ~50 |
| **Total SubStack concepts** | 114 |
| **DDIA chapters with strong SubStack overlap** | Ch 1, 3, 5, 6, 7, 8, 9, 10, 11 |
| **DDIA chapters with minimal SubStack overlap** | Ch 13-15, 19-27 (newer chapters) |

The SubStack collection's greatest value-add is in networking/protocols (12 concepts), security/auth (7 concepts), caching patterns (4 concepts), operational resilience patterns (6 concepts), and observability (5 concepts) — areas where DDIA is thinner. Meanwhile, DDIA's greatest unique depth is in storage internals (Ch 3), replication theory (Ch 5), transaction isolation (Ch 7), distributed systems failure modes (Ch 8), and consensus (Ch 9) — areas where SubStack offers only surface-level treatments.
