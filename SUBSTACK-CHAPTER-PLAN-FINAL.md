# Final Chapter Plan: Site Restructure + SubStack Content

## Site Architecture Overview

The site will have two top-level content sources accessible from the sidebar:

```
📚 DDIA (Designing Data-Intensive Applications)
   Part I: Foundations of Data Systems (Ch 1-4)
   Part II: Distributed Data (Ch 5-9)
   Part III: Derived Data (Ch 10-12)
   Part IV: Cutting-Edge Architectures (Ch 13-15)
   Part V: Adjacent Subjects to Master (Ch 16-19)
   Part VI: Gaps & Recommendations (Ch 20-22)
   Part VII: The City Planner's Handbook (Ch 23-27)

📰 SubStack (System Design One — 114 Concepts)
   Part I: Fundamentals (Ch 28-30)
   Part II: Networking & Communication (Ch 31-33)
   Part III: Data Layer (Ch 34-36)
   Part IV: Distributed Systems Theory (Ch 37-39)
   Part V: Distributed Protocols & Transactions (Ch 40-42)
   Part VI: Real-Time & Architectural Patterns (Ch 43-45)
   Part VII: Operations & Observability (Ch 46-47)
   Part VIII: Specialized Systems & Security (Ch 48-50)
   Part IX: Internals & Processing (Ch 51-52)
```

---

## SubStack Chapter Details

### Part I: Fundamentals

#### Chapter 28: Foundations of System Design
**Concepts:** 1 (Scalability), 2 (Availability), 3 (Reliability), 4 (Latency vs Throughput vs Bandwidth)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 28-0 | Performance Metrics | #4 Latency vs Throughput vs Bandwidth |
| 28-1 | Scalability | #1 Scalability |
| 28-2 | Availability and Reliability | #2 Availability + #3 Reliability |

**DDIA Cross-Links:** Ch 1 (sec 1-1, 1-2), Ch 8 (sec 8-1)

---

#### Chapter 29: Authentication and Security
**Concepts:** 16 (Auth vs AuthZ), 17 (Session vs Token), 19 (JWT), 18 (OAuth/OIDC), 20 (Rate Limiting)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 29-0 | Authentication vs Authorization | #16 |
| 29-1 | Sessions, Tokens, and JWT | #17 + #19 |
| 29-2 | OAuth and OpenID Connect | #18 |
| 29-3 | Rate Limiting | #20 |

**DDIA Cross-Links:** Ch 17 (sec 17-0), Ch 21 (sec 21-0)

---

#### Chapter 30: Architecture Patterns
**Concepts:** 33 (Monolithic), 32 (Microservices), 34 (Serverless), 35 (Event-Driven)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 30-0 | Monoliths vs Microservices | #33 + #32 |
| 30-1 | Serverless Architecture | #34 |
| 30-2 | Event-Driven Architecture | #35 |

**DDIA Cross-Links:** Ch 4 (sec 4-1), Ch 11 (sec 11-0), Ch 13 (sec 13-3)

---

### Part II: Networking & Communication

#### Chapter 31: Client-Server Model and Networking
**Concepts:** 5 (Client-Server), 46 (OSI), 45 (TCP vs UDP), 13 (DNS), 44 (HTTP/HTTPS), 47 (TLS/SSL)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 31-0 | Client-Server Architecture | #5 |
| 31-1 | The Network Stack: OSI Model and Transport | #46 + #45 |
| 31-2 | DNS — Finding Servers | #13 |
| 31-3 | Securing Communication: HTTP/HTTPS and TLS | #44 + #47 |

**DDIA Cross-Links:** Ch 16 (sec 16-0), Ch 17 (sec 17-0)

---

#### Chapter 32: APIs and Communication Patterns
**Concepts:** 14 (API Design), 15 (REST), 38 (Sync vs Async), 39 (WebSockets)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 32-0 | API Design Principles | #14 |
| 32-1 | REST APIs | #15 |
| 32-2 | Synchronous vs Asynchronous Communication | #38 |
| 32-3 | WebSockets | #39 |

**DDIA Cross-Links:** Ch 4 (sec 4-1), Ch 17 (sec 17-1)

---

#### Chapter 33: Load Balancing and Traffic Management
**Concepts:** 43 (Proxy/Reverse Proxy), 8 (Load Balancing), 9 (LB Algorithms), 40 (API Gateways), 48 (DNS LB), 49 (Anycast)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 33-0 | Proxies and Reverse Proxies | #43 |
| 33-1 | Load Balancing and Algorithms | #8 + #9 |
| 33-2 | API Gateways | #40 |
| 33-3 | Global Traffic: DNS Load Balancing and Anycast | #48 + #49 |

**DDIA Cross-Links:** Ch 6 (sec 6-3), Ch 16 (sec 16-0)

---

### Part III: Data Layer

#### Chapter 34: Databases and Data Modeling
**Concepts:** 6 (Databases), 7 (SQL vs NoSQL), 54 (ACID vs BASE), 31 (Indexing), 30 (Denormalization)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 34-0 | Database Fundamentals | #6 |
| 34-1 | SQL vs NoSQL | #7 |
| 34-2 | ACID vs BASE | #54 |
| 34-3 | Indexing and Denormalization | #31 + #30 |

**DDIA Cross-Links:** Ch 2 (sec 2-0), Ch 3 (sec 3-0, 3-1), Ch 7 (sec 7-0)

---

#### Chapter 35: Caching
**Concepts:** 10 (Caching), 11 (Cache Invalidation), 42 (Eviction Policies), 41 (Distributed Cache)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 35-0 | Caching Fundamentals | #10 |
| 35-1 | Cache Invalidation | #11 |
| 35-2 | Cache Eviction Policies | #42 |
| 35-3 | Distributed Caching | #41 |

**DDIA Cross-Links:** Ch 3, Ch 5 (sec 5-1), Ch 11

---

#### Chapter 36: Data Distribution and Scaling
**Concepts:** 25 (Replication), 26 (Read Replicas), 28 (Partitioning), 27 (Sharding), 29 (Consistent Hashing)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 36-0 | Data Replication and Read Replicas | #25 + #26 |
| 36-1 | Data Partitioning and Sharding | #28 + #27 |
| 36-2 | Consistent Hashing | #29 |

**DDIA Cross-Links:** Ch 5 (all), Ch 6 (all)

---

### Part IV: Distributed Systems Theory

#### Chapter 37: Failure Modes and Resilience
**Concepts:** 21 (SPOF), 22 (HA vs FT), 57 (Heartbeats), 55 (Network Partitions), 56 (Split Brain)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 37-0 | Single Points of Failure and Redundancy | #21 + #22 |
| 37-1 | Failure Detection: Heartbeats | #57 |
| 37-2 | Network Partitions and Split Brain | #55 + #56 |

**DDIA Cross-Links:** Ch 1 (sec 1-1), Ch 5 (sec 5-0), Ch 8 (sec 8-1, 8-3)

---

#### Chapter 38: CAP, Consistency, and Theorems
**Concepts:** 23 (CAP), 24 (Consistency Models), 101 (PACELC)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 38-0 | The CAP Theorem | #23 |
| 38-1 | Consistency Models: Strong vs Eventual | #24 |
| 38-2 | The PACELC Theorem | #101 |

**DDIA Cross-Links:** Ch 5 (sec 5-1), Ch 9 (sec 9-0)

---

#### Chapter 39: Asynchronous Messaging
**Concepts:** 36 (Message Queue), 37 (Pub/Sub)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 39-0 | Message Queues | #36 |
| 39-1 | Publish-Subscribe | #37 |

**DDIA Cross-Links:** Ch 11 (sec 11-0)

---

### Part V: Distributed Protocols & Transactions

#### Chapter 40: Consensus and Coordination
**Concepts:** 60 (Quorum), 58 (Leader Election), 59 (Consensus Algorithms), 61 (Paxos), 62 (Raft)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 40-0 | Quorum-Based Agreement | #60 |
| 40-1 | Leader Election | #58 |
| 40-2 | Consensus Protocols: Paxos and Raft | #59 + #61 + #62 |

**DDIA Cross-Links:** Ch 5 (sec 5-3), Ch 9 (sec 9-2)

---

#### Chapter 41: Gossip, Clocks, and Ordering
**Concepts:** 63 (Gossip), 64 (Clock Sync), 65 (Logical Clock), 66 (Lamport), 67 (Vector Clock)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 41-0 | Gossip Protocol | #63 |
| 41-1 | The Clock Synchronization Problem | #64 |
| 41-2 | Logical Clocks: Lamport and Vector Clocks | #65 + #66 + #67 |

**DDIA Cross-Links:** Ch 5 (sec 5-3), Ch 8 (sec 8-2), Ch 9 (sec 9-1)

---

#### Chapter 42: Distributed Transactions and Delivery
**Concepts:** 68 (Distributed Txns), 69 (2PC), 72 (3PC), 70 (SAGA), 71 (Outbox), 73 (Delivery Semantics)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 42-0 | The Distributed Transaction Problem | #68 |
| 42-1 | Commit Protocols: 2PC and 3PC | #69 + #72 |
| 42-2 | Sagas and the Outbox Pattern | #70 + #71 |
| 42-3 | Delivery Semantics | #73 |

**DDIA Cross-Links:** Ch 7, Ch 9 (sec 9-2), Ch 11 (sec 11-1, 11-2)

---

### Part VI: Real-Time & Architectural Patterns

#### Chapter 43: Real-Time Communication
**Concepts:** 74 (CDC), 75 (Long Polling), 76 (SSE), 77 (Webhooks), 78 (WebRTC)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 43-0 | Change Data Capture | #74 |
| 43-1 | Long Polling and Server-Sent Events | #75 + #76 |
| 43-2 | Webhooks | #77 |
| 43-3 | WebRTC | #78 |

**DDIA Cross-Links:** Ch 11 (sec 11-1), Ch 14 (sec 14-1), Ch 16 (sec 16-0)

---

#### Chapter 44: Advanced Architectural Patterns
**Concepts:** 79 (CQRS), 80 (Event Sourcing), 85 (BFF), 84 (Strangler Fig)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 44-0 | CQRS and Event Sourcing | #79 + #80 |
| 44-1 | Backend for Frontend | #85 |
| 44-2 | Strangler Fig Pattern | #84 |

**DDIA Cross-Links:** Ch 11 (sec 11-1), Ch 12 (sec 12-1), Ch 23 (sec 23-0)

---

#### Chapter 45: Resilience Patterns and Service Infrastructure
**Concepts:** 81 (Service Discovery), 82 (Circuit Breaker), 83 (Bulkhead), 86 (Sidecar), 87 (Service Mesh)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 45-0 | Service Discovery | #81 |
| 45-1 | Circuit Breaker and Bulkhead Patterns | #82 + #83 |
| 45-2 | Sidecar Pattern and Service Mesh | #86 + #87 |

**DDIA Cross-Links:** Ch 6 (sec 6-3), Ch 8, Ch 15, Ch 27 (sec 27-0)

---

### Part VII: Operations & Observability

#### Chapter 46: Observability
**Concepts:** 88 (Observability), 89 (Logging), 90 (Metrics), 91 (Distributed Tracing), 92 (Correlation IDs)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 46-0 | The Three Pillars of Observability | #88 |
| 46-1 | Logs and Metrics | #89 + #90 |
| 46-2 | Distributed Tracing and Correlation IDs | #91 + #92 |

**DDIA Cross-Links:** Ch 15 (sec 15-0), Ch 17 (sec 17-2)

---

#### Chapter 47: Content Delivery and Storage
**Concepts:** 12 (CDN), 52 (Block/File/Object), 50 (Object Storage), 51 (Distributed FS), 53 (Compression)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 47-0 | Content Delivery Networks | #12 |
| 47-1 | Block vs File vs Object Storage | #52 |
| 47-2 | Object Storage and Distributed File Systems | #50 + #51 |
| 47-3 | Data Compression | #53 |

**DDIA Cross-Links:** Ch 3 (sec 3-2), Ch 4 (sec 4-0), Ch 10 (sec 10-1), Ch 13 (sec 13-0)

---

### Part VIII: Specialized Systems & Security

#### Chapter 48: Specialized Storage Systems
**Concepts:** 93 (Search), 94 (Time Series DB), 95 (Vector DB), 96 (Materialized Views)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 48-0 | Full-Text Search Engines | #93 |
| 48-1 | Time Series Databases | #94 |
| 48-2 | Vector Databases | #95 |
| 48-3 | Materialized Views | #96 |

**DDIA Cross-Links:** Ch 3 (sec 3-0, 3-1), Ch 13 (sec 13-1, 13-2)

---

#### Chapter 49: Database Performance and Caching Techniques
**Concepts:** 97 (Query Optimization), 98 (Connection Pooling), 99 (Cache Stampede), 100 (Cache Warming)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 49-0 | Query Optimization and Connection Pooling | #97 + #98 |
| 49-1 | Cache Stampede and Cache Warming | #99 + #100 |

**DDIA Cross-Links:** Ch 2 (sec 2-1), Ch 3

---

#### Chapter 50: Security and Access Control
**Concepts:** 102 (Secrets Management), 103 (RBAC), 104 (SSO), 105 (Checksums)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 50-0 | Secrets Management | #102 |
| 50-1 | RBAC and Single Sign-On | #103 + #104 |
| 50-2 | Checksums and Data Integrity | #105 |

**DDIA Cross-Links:** Ch 8, Ch 17 (sec 17-0)

---

### Part IX: Internals & Processing

#### Chapter 51: Data Structures That Power Systems
**Concepts:** 107 (B-Trees), 108 (LSM Tree), 106 (Bloom Filter), 110 (HyperLogLog), 109 (Merkle Trees)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 51-0 | B-Trees and LSM Trees | #107 + #108 |
| 51-1 | Bloom Filters and HyperLogLog | #106 + #110 |
| 51-2 | Merkle Trees | #109 |

**DDIA Cross-Links:** Ch 3 (sec 3-0), Ch 5 (sec 5-3)

---

#### Chapter 52: Data Processing Pipelines
**Concepts:** 111 (Batch vs Stream), 112 (ETL), 113 (MapReduce), 114 (Erasure Coding)

| Section ID | Section Title | Concepts |
|------------|--------------|----------|
| 52-0 | Batch vs Stream Processing | #111 |
| 52-1 | ETL Pipelines | #112 |
| 52-2 | MapReduce | #113 |
| 52-3 | Erasure Coding | #114 |

**DDIA Cross-Links:** Ch 5, Ch 10 (sec 10-1), Ch 11, Ch 22

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **SubStack Parts** | 9 |
| **SubStack Chapters** | 25 (Ch 28-52) |
| **SubStack Sections** | 82 |
| **Total Concepts Covered** | 114 (all accounted for) |
| **Combined Site Chapters** | 52 (27 DDIA + 25 SubStack) |
| **Combined Site Sections** | ~141 (59 DDIA + 82 SubStack) |

## Chapter Number Mapping

The existing DDIA chapters are 1-27. SubStack chapters start at 28 to maintain unique chapter numbers across the entire site.

| Range | Source | Parts |
|-------|--------|-------|
| Ch 1-27 | DDIA | Parts I-VII |
| Ch 28-52 | SubStack | Parts I-IX |

## TOC Data Structure Change Required

The current TOC is a flat array of Parts. To support DDIA vs SubStack as top-level sections, we need to either:

**Option A: Wrapper object (Recommended)**
```javascript
const SOURCES = [
  {
    source: "DDIA",
    label: "Designing Data-Intensive Applications",
    icon: "📚",
    toc: [ /* existing TOC array */ ]
  },
  {
    source: "SubStack",
    label: "System Design One — 114 Concepts",
    icon: "📰",
    toc: [ /* new SubStack TOC array */ ]
  }
];
```

**Option B: Single array with source tag**
```javascript
const TOC = [
  { part: "I", title: "Foundations of Data Systems", source: "DDIA", chapters: [...] },
  // ... existing parts ...
  { part: "I", title: "Fundamentals", source: "SubStack", chapters: [...] },
  // ... new parts ...
];
```

Option A is cleaner because it avoids part number collisions (both sources have "Part I") and lets the sidebar render two distinct collapsible sections.

## Cross-Reference Summary

| Category | Count | Notes |
|----------|-------|-------|
| Direct overlaps (SubStack ≈ DDIA) | 33 | SubStack provides interview-oriented quick reference |
| Extensions (SubStack adds to DDIA) | 31 | Practical angles, modern patterns |
| Completely new (no DDIA coverage) | ~50 | Networking, auth, caching, resilience, observability |
