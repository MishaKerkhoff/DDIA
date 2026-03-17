# DDIA Interactive Learning App — SPEC

## Project Overview

An interactive, browser-based learning companion for Martin Kleppmann's *Designing Data-Intensive Applications* (DDIA). The app serves as a visual, hands-on study tool built for a learner who is a visual thinker and retains concepts best through animated diagrams, interactive explorations, and spaced repetition — not by re-reading text.

The user is a performance marketing professional building an AI-powered ad management platform called **OpenAgency**. Every chapter section should include an "OpenAgency Connection" callout that ties abstract data systems concepts to concrete decisions in that platform (multi-network ad integrations, Temporal workflow orchestration, Stripe billing, SOC 2 compliance, etc.).

### Target Runtime

Single-file React `.jsx` artifact rendered in Claude.ai's artifact viewer. Constraints:

- **No localStorage / sessionStorage** — use `window.storage` API (async, key-value, persistent across sessions)
- **No `<form>` tags** — use `onClick` / `onChange` handlers
- All code in a single file (no separate CSS/JS)
- Available libraries: React (with hooks), lucide-react, recharts, d3, Three.js (r128), lodash, mathjs, Tailwind utility classes (pre-compiled only), shadcn/ui, Chart.js, Tone, Papaparse, SheetJS
- Fonts loaded via Google Fonts CDN in a `<style>` block

---

## Current State (What's Built)

### Architecture

The app is a single React component (`DDIAApp`) with:

1. **Sidebar navigation** — full TOC for all 12 chapters with collapsible sections
2. **Main content pane** — renders section content with concept text, interactive diagram, and quiz
3. **Spaced repetition engine** — SM-2 algorithm implementation with persistent storage
4. **Progress tracking** — per-section confidence ratings (Struggled/Okay/Got It) stored via `window.storage`

### Data Structures

#### TOC Array
```js
const TOC = [
  {
    part: "I",           // Part number
    title: "...",        // Part title
    chapters: [
      {
        num: 1,          // Chapter number
        title: "...",    // Chapter title  
        page: 3,         // Book page number
        ready: true,     // Whether interactive content exists
        sections: [
          { id: "1-0", title: "...", page: 4 }  // Section ID format: "{chapter}-{index}"
        ]
      }
    ]
  }
]
```

#### Content Objects (per chapter)
```js
const Ch1Content = {
  "1-0": {
    title: "Section Title",
    concept: `Multi-paragraph string with core knowledge...`,
    diagram: DiagramComponent,     // React component reference (or null)
    quiz: [
      {
        question: "...",
        options: ["A", "B", "C", "D"],
        correct: 1,                // 0-indexed
        explanation: "..."
      }
    ]
  }
}
```

#### Progress State (persisted via `window.storage` under key `"ddia-progress"`)
```js
{
  "1-0": {
    repetitions: 2,
    interval: 6,
    easeFactor: 2.6,
    lastReview: "2026-03-13T...",
    quality: 5               // Last self-rating (2-5)
  }
}
```

### Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#0a0e14` | App background |
| `--bg-surface` | `#0d1117` | Cards, sidebar, diagram backgrounds |
| `--bg-elevated` | `#161b22` | Buttons, inputs, nested cards |
| `--bg-hover` | `#1c2333` | Hover states |
| `--border` | `#2d3548` | Default borders |
| `--text-primary` | `#e6edf3` | Headings |
| `--text-secondary` | `#c9d1d9` | Body text |
| `--text-muted` | `#8b949e` | Descriptions |
| `--text-faint` | `#6e7681` | Labels, hints |
| `--accent-gold` | `#c9a227` | Primary accent, active states, section labels |
| `--accent-gold-text` | `#e6d089` | Gold text on dark backgrounds |
| `--success` | `#3fb950` | Correct answers, good status |
| `--warning` | `#d29922` | Due reviews, caution |
| `--error` | `#f85149` | Wrong answers, failures, alerts |
| `--info` | `#58a6ff` | Explanations, info callouts |
| `--purple` | `#a371f7` / `#d2a8ff` | Tertiary accent |
| Font (code/labels) | `'JetBrains Mono'` | Monospace |
| Font (body) | `'Nunito Sans'` | Body text |

### Interactive Component Patterns (Established in Ch1)

**Four visualization types have been built:**

1. **Animated Step-Through Diagram** (`DataSystemDiagram`)
   - SVG-based node/edge graph
   - Play/Pause/Reset controls
   - Step dots for manual navigation
   - Active nodes glow gold, flow lines animate with moving dots
   - Step label at bottom describes current state
   - Pattern: define `nodes[]`, `edges[]`, `steps[]` — steps reference node/edge IDs

2. **Fault Injection Simulator** (`ReliabilityDiagram`)
   - Click-to-select between fault categories
   - Expandable mitigation + OpenAgency callout
   - Pattern: define fault map with `title`, `icon`, `color`, `desc`, `mitigation`, `example`

3. **Interactive Slider Explorer** (`ScalabilityExplorer`)
   - Range input controls a variable (RPS)
   - Toggle between approaches (vertical vs horizontal)
   - Computed metrics displayed as animated bar charts
   - Saturation warning at thresholds
   - Key Insight box at bottom changes based on selections

4. **Expandable Pillar/Card Set** (`MaintainabilityPillars`)
   - Accordion-style expand/collapse
   - Each card has bullet points + OpenAgency callout
   - Color-coded per pillar

**Reusable Components:**

5. **Quiz** (`Quiz`)
   - Props: `questions[]`, `sectionId`, `onComplete(score)`
   - Single question at a time, reveal correct/wrong on click
   - Explanation shown after answer
   - Results screen with retry
   - Score feeds into spaced repetition via `onComplete`

### Chapter 1 — COMPLETE

All four sections implemented with full content, diagrams, and quizzes:

| Section ID | Title | Diagram Type | Quiz Qs |
|------------|-------|-------------|---------|
| `1-0` | Thinking About Data Systems | Animated step-through (7 steps) | 2 |
| `1-1` | Reliability | Fault injection simulator (3 faults) | 2 |
| `1-2` | Scalability | Interactive slider + approach toggle | 2 |
| `1-3` | Maintainability | Expandable pillars (3 pillars) | 2 |

### Known Issues / Bugs

1. **Quiz `onComplete` score bug** — Line ~566: `onComplete(score + (selected === q.correct ? 0 : 0))` — the ternary always adds 0. Should be `onComplete(score + (selected === q.correct ? 1 : 0))` or simply pass the final score after the last question.
2. **Mobile sidebar toggle** — Uses inline `window.innerWidth` check which only evaluates at render time, not on resize. Should use a `useEffect` with resize listener or CSS media queries.
3. **Unused imports** — Several lucide-react icons imported but not used: `Zap`, `Server`, `Database`, `ArrowRight`, `ArrowUp`, `Star`. Clean up or use them in new chapters.
4. **No error boundary** — If a diagram component throws, the whole app crashes. Wrap diagram rendering in an error boundary.
5. **Sidebar doesn't scroll to active section** — When navigating via review reminders, the sidebar doesn't auto-scroll to reveal the active section.

---

## What Needs to Be Built

### Priority 1: Chapters 2–4 (Part I — Foundations)

Build in book order. Each chapter needs a content object (`Ch2Content`, `Ch3Content`, `Ch4Content`) following the established pattern. Flip the chapter's `ready: true` in the TOC array.

#### Chapter 2: Data Models and Query Languages (p. 27–63)

**Section 2-0: Relational vs Document Model**
- Core concepts: relational model (tables, rows, normalization), document model (JSON-like nested structures, schema flexibility), the object-relational mismatch, many-to-one vs many-to-many relationships, when each model wins
- Suggested diagram: **Side-by-side comparison** — show the same data (e.g., a user profile with job history and education) modeled as normalized relational tables vs. a single JSON document. Interactive toggle to switch between them. Highlight joins in relational vs. duplication in document.
- OpenAgency connection: Campaign data has both relational aspects (campaign → ad groups → ads hierarchy) and document-like aspects (platform-specific ad creative payloads from Meta vs Google vs TikTok that have different schemas). How do you model this?
- Quiz: 2–3 questions on when to use relational vs document, what the object-relational mismatch is, and what happens when many-to-many relationships appear in a document model

**Section 2-1: Query Languages for Data**
- Core concepts: Declarative vs imperative queries, SQL as a declarative language, MapReduce as a hybrid, why declarative is better for optimization
- Suggested diagram: **Declarative vs Imperative animated comparison** — show the same query ("find all campaigns with spend > $1000") expressed as imperative step-by-step loop vs. declarative SQL. Animate how the database optimizer can reorder/parallelize the declarative version but is stuck with the imperative one.
- OpenAgency connection: When querying across ad network data, declarative approaches let the system optimize. If you write imperative data-fetching code that loops through campaigns one by one, you lose that flexibility.
- Quiz: 2 questions

**Section 2-2: Graph-Like Data Models**
- Core concepts: Property graphs, edges and vertices, when graph models shine (highly interconnected data), Cypher query language concepts, triple stores
- Suggested diagram: **Interactive graph** — show a small network of entities (advertisers, campaigns, audiences, platforms) as a property graph. Click nodes to see properties, click edges to see relationship types. Contrast with how many join tables you'd need in relational.
- OpenAgency connection: The relationships between advertisers, campaigns, audiences, conversion events, and billing form a natural graph. Understanding graph thinking helps when designing cross-network attribution.
- Quiz: 2 questions

#### Chapter 3: Storage and Retrieval (p. 69–103)

**Section 3-0: Data Structures That Power Your Database**
- Core concepts: Log-structured storage (append-only, SSTables, LSM-trees, compaction), page-oriented storage (B-trees, pages, write-ahead log), hash indexes, comparing B-trees vs LSM-trees (write amplification, read performance, compaction overhead)
- Suggested diagram: **Animated write path comparison** — Two side-by-side panels. Left: LSM-tree write path (write to memtable → flush to SSTable → compaction merges). Right: B-tree write path (find page → update in place → WAL for crash recovery). Step through both with the same sequence of writes. Show how LSM-trees batch writes sequentially while B-trees do random I/O.
- This is one of the most important sections in the entire book for building architectural intuition.
- OpenAgency connection: Understanding storage engines matters when choosing databases. Campaign analytics (heavy writes, range queries) might favor LSM-tree-based engines like RocksDB/Cassandra. Transactional billing data might favor B-tree-based Postgres.
- Quiz: 3 questions

**Section 3-1: Transaction Processing or Analytics? (OLTP vs OLAP)**
- Core concepts: OLTP (lots of small reads/writes, user-facing, low latency) vs OLAP (few huge scans, analyst-facing, throughput-oriented), data warehousing, ETL, star and snowflake schemas, fact tables and dimension tables
- Suggested diagram: **Interactive schema explorer** — Show a star schema for an ad analytics warehouse (fact table: ad_impressions with foreign keys to dim_campaign, dim_platform, dim_audience, dim_time, dim_geography). Click dimension tables to expand them. Contrast with the OLTP operational schema.
- OpenAgency connection: OpenAgency needs both OLTP (campaign CRUD, billing events, user management) and OLAP (spend trends, cross-network performance comparisons, ROI calculations). Understanding this split informs whether you use one database or separate systems.
- Quiz: 2 questions

**Section 3-2: Column-Oriented Storage**
- Core concepts: Why row-oriented storage is bad for analytics, column-oriented approach, column compression (bitmap encoding, run-length), sort order in column storage, materialized views and data cubes
- Suggested diagram: **Row vs Column storage visual** — Show the same table stored row-wise vs column-wise. Animate a query ("sum of spend where platform = 'Meta'") showing how row storage reads entire rows (wasted I/O) while column storage reads only the columns needed. Show compression ratio difference.
- OpenAgency connection: When building the analytics/reporting layer of OpenAgency, columnar storage (or a columnar database like ClickHouse/DuckDB) would massively speed up aggregation queries across millions of ad impressions.
- Quiz: 2 questions

#### Chapter 4: Encoding and Evolution (p. 111–139)

**Section 4-0: Formats for Encoding Data**
- Core concepts: Language-specific serialization (and why it's bad), JSON/XML/binary variants, schema-based encoding (Protocol Buffers, Thrift, Avro), forward and backward compatibility, schema evolution
- Suggested diagram: **Schema evolution simulator** — Show a Protobuf-style schema for a "Campaign" message. Add a new field (version 2), remove an old field (version 3). Animate what happens when an old reader encounters new data (forward compat) and when a new reader encounters old data (backward compat). Show which changes are safe and which break things.
- OpenAgency connection: Different ad network APIs return data in different formats and evolve their schemas independently. Your internal data model needs to handle schema evolution gracefully — a Meta API response from 2024 shouldn't crash your 2026 system.
- Quiz: 2–3 questions

**Section 4-1: Modes of Dataflow**
- Core concepts: Dataflow through databases (writer encodes, reader decodes, schema migration), dataflow through services (REST, RPC, their tradeoffs), message-passing dataflow (message brokers, actors)
- Suggested diagram: **Three dataflow paths animated** — Show the same piece of data (a campaign update) flowing through three different paths: (1) written to DB then read later, (2) sent via REST API call to another service, (3) published to a message queue and consumed by a worker. Highlight encoding/decoding at each boundary and where compatibility matters.
- OpenAgency connection: OpenAgency uses all three: database for campaign state, REST/RPC for ad network API calls, and message queues (via Temporal) for async workflow orchestration. Understanding where encoding boundaries exist helps you design for evolution.
- Quiz: 2 questions

### Priority 2: Chapters 5–9 (Part II — Distributed Data)

Same pattern. These are the hardest and most important chapters. Suggested diagram types per chapter:

| Chapter | Key Diagram Ideas |
|---------|-------------------|
| 5. Replication | Animated leader/follower write propagation; replication lag timeline showing read-your-own-writes violations; multi-leader conflict resolution |
| 6. Partitioning | Interactive hash ring showing key distribution; hot spot visualization with skewed vs uniform partitioning |
| 7. Transactions | ACID property explorer; isolation level comparison (read committed vs snapshot vs serializable) with concurrent transaction timelines |
| 8. Trouble with Distributed Systems | Network partition simulator; clock skew timeline; split-brain scenario |
| 9. Consistency and Consensus | Linearizability timeline (valid vs invalid orderings); 2PC animated protocol; Raft/Paxos simplified leader election |

### Priority 3: Chapters 10–12 (Part III — Derived Data)

| Chapter | Key Diagram Ideas |
|---------|-------------------|
| 10. Batch Processing | MapReduce job flow animation; Unix pipeline analogy; join strategies (map-side vs reduce-side) |
| 11. Stream Processing | Event stream timeline; CDC (change data capture) flow; stream vs batch comparison slider |
| 12. Future of Data Systems | Dataflow architecture overview; end-to-end correctness argument; unbundled database composition |

---

## Content Authoring Guidelines

### For Each Section

1. **`concept` text**: 2–4 paragraphs max. Write for retention, not completeness. Focus on the mental model and the "why" — not exhaustive detail. Use plain language. The book itself has the detail; this is the crystallized takeaway.

2. **`diagram` component**: Choose the visualization type that best matches the concept. Not every section needs a brand new component type — reuse and adapt the four established patterns where they fit:
   - Animated step-through → processes, protocols, data flow
   - Clickable selector + detail panel → categorizations, comparisons
   - Slider/toggle explorer → trade-offs, spectrums, what-if scenarios
   - Expandable card set → principles, properties, checklists
   
   Build new component types when the concept genuinely demands it (e.g., concurrent transaction timelines, hash ring visualizations).

3. **`quiz` questions**: 2–3 per section. Focus on conceptual understanding, NOT memorization. Good quiz questions test whether you understand the *why* behind a design choice, not whether you remember a specific term. Always include an `explanation` that reinforces the mental model.

4. **OpenAgency callouts**: Ground every concept in a concrete OpenAgency decision. These appear either inside diagram components (as gold-bordered boxes) or can be added as a field in the content object if a standalone callout is more appropriate.

### Diagram Component Conventions

- All diagrams use the dark surface background: `#0d1117` with `borderRadius: 12` and `padding: 24`
- Gold monospace label at top: `color: "#c9a227"`, `fontFamily: "'JetBrains Mono', monospace"`, `fontSize: 13`, `fontWeight: 600`
- Interactive controls use gold accent for active state, `#1c2333` background for buttons
- OpenAgency callout box: `background: "#1a1a0e"`, `borderLeft: "3px solid #c9a227"`, gold `#c9a227` label, `#e6d089` text
- Mitigation/positive callout: `background: "#0e2a1a"`, `borderLeft: "3px solid #3fb950"`
- Info/explanation callout: `borderLeft: "3px solid #58a6ff"`
- All transitions: `transition: "all 0.3s ease"` or `0.4s ease`
- Entry animation: `animation: "fadeIn 0.3s ease"` (keyframes defined in global style block)

---

## Structural Improvements to Consider

### As Chapter Count Grows

1. **Code splitting** — The single-file constraint means all content loads at once. As content grows, consider lazy-loading content objects. The `Ch{N}Content` objects could be defined in sections of the file that are only referenced when needed, though React will still bundle everything. At minimum, keep diagram components and content objects clearly separated by chapter with comment headers.

2. **Content object extraction** — Consider moving all `Ch{N}Content` objects into a single large content map at the top of the file, separate from component definitions, to make authoring easier:
   ```js
   const ALL_CONTENT = { ...Ch1Content, ...Ch2Content, ...Ch3Content, /* etc */ };
   ```

3. **Reusable diagram primitives** — Extract common patterns into reusable components:
   - `<AnimatedGraph nodes={} edges={} steps={} />` — generalized version of DataSystemDiagram
   - `<CategoryExplorer categories={} />` — generalized version of ReliabilityDiagram
   - `<TradeoffSlider params={} computeMetrics={} />` — generalized version of ScalabilityExplorer
   - `<ExpandableCards cards={} />` — generalized version of MaintainabilityPillars
   
   This would dramatically reduce code volume for chapters 2–12.

4. **Sidebar auto-collapse** — When a chapter's content is added and `ready` is set to `true`, the sidebar should probably auto-expand that chapter and collapse others for focus.

### Spaced Repetition Enhancements

The SM-2 engine is functional. Consider adding:

- **Review mode** — When the user clicks the "N sections due for review" button, enter a focused review flow that presents due sections one at a time with their quiz, then asks for a confidence rating, then advances to the next due section
- **Stats dashboard** — A simple view showing sections by status (not started, learning, mature), total review count, streak
- **Review scheduling visibility** — Show a calendar-like view of upcoming reviews

### Responsiveness

The current layout assumes a wide viewport. For mobile/tablet:
- Sidebar should overlay (not push) content, toggled by hamburger
- Diagrams should have `maxWidth: 100%` and scale down
- Quiz buttons should stack vertically at narrow widths

---

## File Structure

Everything is in a single file. Recommended internal organization:

```
// ─── Imports ───
// ─── Spaced Repetition Engine (SM2) ───
// ─── TOC Data ───
// ─── Reusable Diagram Primitives ─── (extract these as chapters grow)
// ─── Chapter 1 Diagrams ───
// ─── Chapter 1 Content ───
// ─── Chapter 2 Diagrams ───
// ─── Chapter 2 Content ───
// ─── ... ───
// ─── Quiz Component ───
// ─── Main App Component ───
```

---

## Summary

| Item | Status |
|------|--------|
| App scaffold + navigation | ✅ Complete |
| Spaced repetition engine | ✅ Complete |
| Persistent progress storage | ✅ Complete |
| Design system | ✅ Established |
| Chapter 1 content (4 sections) | ✅ Complete |
| Chapter 1 diagrams (4 interactive) | ✅ Complete |
| Chapter 1 quizzes (8 questions) | ✅ Complete |
| Known bugs (5 items) | ❌ Need fixing |
| Reusable diagram primitives | ❌ Not yet extracted |
| Chapter 2 content | ❌ Not started |
| Chapter 3 content | ❌ Not started |
| Chapter 4 content | ❌ Not started |
| Chapters 5–9 content | ❌ Not started |
| Chapters 10–12 content | ❌ Not started |
| Review mode flow | ❌ Not started |
| Mobile responsiveness | ❌ Incomplete |
| Stats dashboard | ❌ Not started |

Build order: Fix known bugs → Extract reusable diagram primitives → Chapter 2 → Chapter 3 → Chapter 4 → then Part II chapters sequentially.
