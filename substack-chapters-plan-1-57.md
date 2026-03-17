# SubStack Section: Chapter Plan for Concepts 1-57

This document proposes the chapter organization for the first 57 system design concepts from the SubStack source material. Concepts 58-114 are handled separately.

---

## Chapter 1: Foundations of System Design

**Concepts:**
1. Scalability
2. Availability
3. Reliability
4. Latency vs Throughput vs Bandwidth

**Order:** 4 -> 1 -> 2 -> 3

**Section grouping:**
- Section 1.1: "Performance Metrics" — Concept 4 (Latency vs Throughput vs Bandwidth). Establishes the vocabulary for measuring system performance before discussing how to improve it.
- Section 1.2: "Scalability" — Concept 1. Vertical vs horizontal scaling as the primary response to growing load.
- Section 1.3: "Availability and Reliability" — Concepts 2 and 3 combined. These are closely related (uptime vs correctness) and are best taught together so learners understand the distinction. Availability measures whether the system responds; reliability measures whether it responds correctly.

**Rationale:** These four concepts are the non-negotiable starting vocabulary for system design. Every subsequent chapter builds on these ideas. A learner who understands latency/throughput/bandwidth, scaling strategies, and the availability-reliability distinction can engage meaningfully with all other topics. Placing performance metrics first gives learners the measurement framework before discussing what to optimize.

---

## Chapter 2: Client-Server Model and Networking Fundamentals

**Concepts:**
5. Client-Server Architecture
13. Domain Name System (DNS)
44. HTTP vs HTTPS
47. TLS/SSL
45. TCP vs UDP
46. OSI Model

**Order:** 5 -> 46 -> 45 -> 13 -> 44 -> 47

**Section grouping:**
- Section 2.1: "Client-Server Architecture" — Concept 5. The basic model of how all web systems work.
- Section 2.2: "The Network Stack" — Concept 46 (OSI Model) and Concept 45 (TCP vs UDP) combined. The OSI model provides the framework; TCP vs UDP are the two transport protocols learners need to understand. Teaching them together avoids the OSI model feeling abstract.
- Section 2.3: "DNS — Finding Servers on the Internet" — Concept 13. How clients discover server IP addresses.
- Section 2.4: "Securing Communication: HTTP/HTTPS and TLS" — Concepts 44 and 47 combined. HTTPS is HTTP + TLS, so these are naturally one section. Covers plaintext vs encrypted communication and the TLS handshake.

**Rationale:** Before diving into system internals, learners need to understand the network plumbing. Client-server is the starting architecture for every system. The networking concepts (OSI, TCP/UDP, DNS, HTTP/HTTPS, TLS) form a coherent "how does data get from A to B?" chapter. Grouping HTTP/HTTPS with TLS avoids redundancy since HTTPS is literally HTTP over TLS.

---

## Chapter 3: APIs and Communication Patterns

**Concepts:**
14. API Design
15. REST API
39. WebSockets
38. Synchronous vs Asynchronous Communication

**Order:** 14 -> 15 -> 38 -> 39

**Section grouping:**
- Section 3.1: "API Design Principles" — Concept 14. Covers resource naming, versioning, error handling, pagination — the universal principles.
- Section 3.2: "REST APIs" — Concept 15. The dominant API style, taught as the concrete application of API design principles.
- Section 3.3: "Synchronous vs Asynchronous Communication" — Concept 38. Establishes the fundamental distinction between blocking (request-response) and non-blocking (fire-and-forget) patterns.
- Section 3.4: "WebSockets — Real-Time Bidirectional Communication" — Concept 39. Introduced after sync/async because WebSockets are the primary mechanism for async server-to-client push.

**Rationale:** After understanding the network layer, learners need to understand how services talk to each other. API design and REST are the bread-and-butter of system communication. Sync vs async is a critical design decision that affects every system. WebSockets round out the chapter by showing how real-time communication works when plain HTTP is insufficient.

---

## Chapter 4: Authentication and Security

**Concepts:**
16. Authentication vs Authorization
17. Session-Based vs Token-Based Authentication
18. OAuth/OAuth2/OpenID Connect
19. JWT (JSON Web Token)
20. Rate Limiting

**Order:** 16 -> 17 -> 19 -> 18 -> 20

**Section grouping:**
- Section 4.1: "Authentication vs Authorization" — Concept 16. The foundational distinction (who are you? vs what can you do?).
- Section 4.2: "Implementing Authentication: Sessions vs Tokens" — Concept 17 and Concept 19 combined. Sessions and tokens are two approaches to authentication; JWT is the dominant token format. Teaching JWT inside the session-vs-token comparison makes it concrete rather than abstract.
- Section 4.3: "Delegated Authentication with OAuth and OpenID Connect" — Concept 18. Builds on tokens by showing how third-party authentication works (Sign in with Google).
- Section 4.4: "Rate Limiting — Protecting Your APIs" — Concept 20. While not purely an auth concept, rate limiting is the front-line defense for API protection and is tightly coupled with API keys and auth tokens in practice.

**Rationale:** Security concepts form a natural progression: first understand the auth vs authz distinction, then learn how to implement auth (sessions vs tokens/JWT), then how to delegate auth (OAuth), then how to protect the system from abuse (rate limiting). Rate limiting fits here because it is commonly enforced alongside authentication at the API gateway level.

---

## Chapter 5: Load Balancing and Traffic Management

**Concepts:**
8. Load Balancing
9. Load Balancing Algorithms
43. Proxy vs Reverse Proxy
40. API Gateways
48. DNS Load Balancing
49. Anycast Routing

**Order:** 43 -> 8 -> 9 -> 40 -> 48 -> 49

**Section grouping:**
- Section 5.1: "Proxies and Reverse Proxies" — Concept 43. Establishes the concept of intermediaries in network traffic, which is the foundation for everything else in the chapter.
- Section 5.2: "Load Balancing and Algorithms" — Concepts 8 and 9 combined. Load balancing and its algorithms are inseparable — the "what" and the "how" of request distribution. Covers Round Robin, Least Connections, IP Hash, Weighted.
- Section 5.3: "API Gateways" — Concept 40. A specialized reverse proxy that adds routing, auth, rate limiting, and response aggregation for microservices.
- Section 5.4: "Global Traffic Routing: DNS Load Balancing and Anycast" — Concepts 48 and 49 combined. Both are mechanisms for geographic traffic distribution — DNS operates at the application layer while Anycast operates at the network layer. Teaching them together highlights their complementary roles.

**Rationale:** This chapter covers everything that sits between clients and backend servers. The progression moves from the general concept (proxies) to specific applications (load balancing, API gateways) to global-scale solutions (DNS load balancing, Anycast). Combining load balancing with its algorithms avoids a chapter that is too thin. Combining DNS load balancing with Anycast shows two approaches to the same problem (geo-routing) at different network layers.

---

## Chapter 6: Databases and Data Modeling

**Concepts:**
6. Databases
7. SQL vs NoSQL
31. Indexing
30. Denormalization
54. ACID vs BASE

**Order:** 6 -> 7 -> 54 -> 31 -> 30

**Section grouping:**
- Section 6.1: "Database Fundamentals" — Concept 6. The starting point: what databases are, DBMS architecture, types of databases.
- Section 6.2: "SQL vs NoSQL" — Concept 7. The first major decision: relational vs non-relational, and when to use each.
- Section 6.3: "Consistency Guarantees: ACID vs BASE" — Concept 54. Directly follows SQL vs NoSQL because SQL databases default to ACID and many NoSQL databases follow BASE. This is the transactional model decision.
- Section 6.4: "Query Optimization: Indexing and Denormalization" — Concepts 31 and 30 combined. Both are techniques for improving read performance. Indexing adds data structures; denormalization restructures data. Teaching them together lets learners compare two approaches to the same problem.

**Rationale:** Databases are the backbone of every system. This chapter gives learners the full foundation: what databases are, how to choose between SQL and NoSQL, what consistency guarantees to expect, and how to optimize query performance. ACID vs BASE fits here rather than in the distributed systems chapter because it is fundamentally about database transaction semantics.

---

## Chapter 7: Caching

**Concepts:**
10. Caching
11. Cache Invalidation
41. Distributed Cache
42. Cache Eviction Policies

**Order:** 10 -> 11 -> 42 -> 41

**Section grouping:**
- Section 7.1: "Caching Fundamentals" — Concept 10. Cache hit/miss, why caching works, where to cache (client, CDN, application, database).
- Section 7.2: "Cache Invalidation Strategies" — Concept 11. Write-through, write-around, write-back, TTL. The hardest problem in caching, taught immediately after the basics.
- Section 7.3: "Cache Eviction Policies" — Concept 42. LRU, LFU, FIFO, TTL. What to remove when the cache is full.
- Section 7.4: "Distributed Caching" — Concept 41. Scaling caches across multiple nodes using consistent hashing, replication, and failover.

**Rationale:** Caching is pervasive enough to merit its own chapter. The four concepts form a tight progression: what caching is, when to update cached data, what to evict, and how to scale caches. Distributed caching comes last because it builds on all three prior concepts plus consistent hashing (from Chapter 8).

---

## Chapter 8: Data Distribution and Scaling

**Concepts:**
25. Data Replication
26. Read Replicas
27. Sharding
28. Data Partitioning
29. Consistent Hashing

**Order:** 25 -> 26 -> 28 -> 27 -> 29

**Section grouping:**
- Section 8.1: "Data Replication" — Concepts 25 and 26 combined. Replication and read replicas are closely related — replication is the mechanism, read replicas are the most common application (scaling reads). Teaching them together avoids redundancy. Covers synchronous vs asynchronous replication, failover, and replication lag.
- Section 8.2: "Data Partitioning and Sharding" — Concepts 28 and 27 combined. Partitioning is the general concept (horizontal, vertical, range, list); sharding is horizontal partitioning across machines. Teaching partitioning first, then sharding as the distributed application of partitioning, provides the right conceptual foundation.
- Section 8.3: "Consistent Hashing" — Concept 29. The algorithm that makes both sharding and distributed caching work at scale. Placed last because it is the technique that ties the chapter together — it is how data is distributed across replicas, shards, and cache nodes.

**Rationale:** This chapter answers "how do you scale your data layer?" — the natural follow-up to the database and caching chapters. Replication scales reads; sharding scales writes and storage. Consistent hashing is the glue. The progression from replication to partitioning to consistent hashing mirrors how systems evolve as they grow.

---

## Chapter 9: Distributed Systems Theory

**Concepts:**
21. Single Point of Failure (SPOF)
22. High Availability vs Fault Tolerance
23. CAP Theorem
24. Consistency Models (Strong vs Eventual)
55. Network Partitions
56. Split Brain Problem
57. Heartbeats

**Order:** 21 -> 22 -> 57 -> 55 -> 23 -> 24 -> 56

**Section grouping:**
- Section 9.1: "Single Points of Failure and Redundancy" — Concepts 21 and 22 combined. SPOFs are the problem; HA and FT are the solutions at different levels of rigor. The active-passive vs active-active distinction naturally follows from the SPOF discussion.
- Section 9.2: "Failure Detection: Heartbeats and Network Partitions" — Concepts 57 and 55 combined. Heartbeats are how you detect failures; network partitions are the failures you are trying to detect. Teaching heartbeats first (the mechanism) then partitions (what they detect) provides the operational foundation before the theoretical concepts.
- Section 9.3: "The CAP Theorem and Consistency Models" — Concepts 23 and 24 combined. CAP defines the fundamental tradeoff (consistency vs availability during partitions); consistency models (strong vs eventual) are the spectrum of options within that tradeoff. These are inseparable in practice.
- Section 9.4: "The Split Brain Problem" — Concept 56. A specific, dangerous consequence of network partitions in leader-based systems. Placed last because understanding it requires all prior concepts: partitions cause it, heartbeats fail to prevent it, and the resolution involves choosing between consistency and availability.

**Rationale:** These seven concepts form the theoretical backbone of distributed systems. They answer: what can go wrong (SPOF, partitions, split brain), how do you detect it (heartbeats), and what fundamental tradeoffs must you accept (CAP, consistency models, HA vs FT). This chapter is more conceptual and is placed after the concrete data chapters so learners have practical context for the theory.

---

## Chapter 10: Content Delivery and Storage

**Concepts:**
12. Content Delivery Network (CDN)
50. Object Storage
51. Distributed File Systems
52. Block vs File vs Object Storage
53. Data Compression

**Order:** 12 -> 52 -> 50 -> 51 -> 53

**Section grouping:**
- Section 10.1: "Content Delivery Networks" — Concept 12. How static content is cached and served globally from edge locations.
- Section 10.2: "Storage Types: Block vs File vs Object" — Concept 52. The three fundamental storage paradigms, when to use each, and their tradeoffs.
- Section 10.3: "Object Storage and Distributed File Systems" — Concepts 50 and 51 combined. Both are solutions for storing unstructured data at scale, but with different access models (HTTP API vs file system semantics). Teaching them together highlights when to use each.
- Section 10.4: "Data Compression" — Concept 53. Lossless vs lossy, algorithm choices, and when to compress. Placed last as an optimization technique that applies to CDNs, object storage, and file systems alike.

**Rationale:** This chapter covers how data is stored and delivered at scale. CDNs are the delivery mechanism; the storage concepts cover where data lives. Compression ties them together as an optimization applicable everywhere. This chapter is placed late because it builds on caching (Chapter 7) and distribution concepts (Chapter 8).

---

## Chapter 11: Architecture Patterns

**Concepts:**
32. Microservices Architecture
33. Monolithic Architecture
34. Serverless Architecture
35. Event-Driven Architecture

**Order:** 33 -> 32 -> 34 -> 35

**Section grouping:**
- Section 11.1: "Monoliths vs Microservices" — Concepts 33 and 32 combined. These are best taught as a pair because the decision between them is the first major architectural choice. Starting with monoliths (simpler, the default starting point) then introducing microservices (the evolution when monoliths hit limits) mirrors real-world progression.
- Section 11.2: "Serverless Architecture" — Concept 34. An alternative execution model that complements both monoliths and microservices.
- Section 11.3: "Event-Driven Architecture" — Concept 35. A communication pattern that is especially important in microservices and serverless systems. Placed last because it builds on the service architectures introduced earlier.

**Rationale:** Architecture patterns answer "how should I structure my system?" This chapter naturally follows the theory chapter because architectural decisions are informed by the tradeoffs discussed there. The monolith-to-microservices progression is the most common evolution path. Serverless and event-driven round out the options.

---

## Chapter 12: Asynchronous Messaging

**Concepts:**
36. Message Queue
37. Publish-Subscribe (Pub/Sub)

**Order:** 36 -> 37

**Section grouping:**
- Section 12.1: "Message Queues" — Concept 36. Point-to-point messaging, buffering, and competing consumers.
- Section 12.2: "Publish-Subscribe" — Concept 37. Broadcast messaging, fan-out, and topic-based routing.
- Section 12.3 (optional synthesis): "Queues vs Pub/Sub — Choosing the Right Pattern" — A brief comparison section (not a separate concept) that summarizes when to use each: queue for one-consumer-per-message work distribution, pub/sub for multi-consumer event broadcasting.

**Rationale:** Message queues and pub/sub are the two fundamental asynchronous messaging patterns. They build directly on the sync-vs-async distinction from Chapter 3 and the event-driven architecture from Chapter 11. While this is a shorter chapter (2 concepts), the depth of each concept (delivery semantics, failure handling, dead letter queues, idempotency) justifies a dedicated chapter. These concepts are critical infrastructure that every subsequent design discussion may reference.

---

## Summary: Chapter Order and Learning Progression

| Chapter | Title | Concepts | Count |
|---------|-------|----------|-------|
| 1 | Foundations of System Design | 1, 2, 3, 4 | 4 |
| 2 | Client-Server Model and Networking Fundamentals | 5, 13, 44, 45, 46, 47 | 6 |
| 3 | APIs and Communication Patterns | 14, 15, 38, 39 | 4 |
| 4 | Authentication and Security | 16, 17, 18, 19, 20 | 5 |
| 5 | Load Balancing and Traffic Management | 8, 9, 40, 43, 48, 49 | 6 |
| 6 | Databases and Data Modeling | 6, 7, 30, 31, 54 | 5 |
| 7 | Caching | 10, 11, 41, 42 | 4 |
| 8 | Data Distribution and Scaling | 25, 26, 27, 28, 29 | 5 |
| 9 | Distributed Systems Theory | 21, 22, 23, 24, 55, 56, 57 | 7 |
| 10 | Content Delivery and Storage | 12, 50, 51, 52, 53 | 5 |
| 11 | Architecture Patterns | 32, 33, 34, 35 | 4 |
| 12 | Asynchronous Messaging | 36, 37 | 2 |
| **Total** | | **1-57** | **57** |

### Learning Progression Rationale

The chapter order follows this logic:

1. **Chapters 1-2** establish the language and plumbing (metrics, networking, protocols).
2. **Chapters 3-4** cover how services communicate and authenticate (APIs, auth, security).
3. **Chapter 5** covers the infrastructure that sits between clients and servers (proxies, load balancers, gateways).
4. **Chapters 6-8** cover data: how to store it (databases), speed it up (caching), and scale it (replication, sharding).
5. **Chapter 9** provides the theoretical framework for distributed systems (CAP, consistency, failure modes).
6. **Chapter 10** covers delivery and storage infrastructure (CDN, object/file/block storage).
7. **Chapters 11-12** cover high-level architecture decisions (monolith vs microservices, messaging patterns).

This progression ensures that foundational concepts are always available before they are referenced by later chapters.
