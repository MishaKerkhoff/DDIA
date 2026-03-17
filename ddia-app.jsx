import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  CheckCircle2,
  Clock,
  Brain,
  AlertTriangle,
  RotateCcw,
  Play,
  Pause,
  Eye,
  TrendingUp,
  Shield,
  Settings,
  Layers,
  X,
  Menu,
} from "lucide-react";

// ─── Error Boundary ───
class DiagramErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: "#2a0e0e", borderRadius: 12, padding: 24, marginTop: 16, border: "1px solid #f8514940" }}>
          <div style={{ color: "#f85149", fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>DIAGRAM ERROR</div>
          <div style={{ color: "#f8a0a0", fontSize: 13, lineHeight: 1.5 }}>
            This interactive diagram failed to render. Try refreshing the page.
          </div>
          <button onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: 12, background: "#1c2333", border: "1px solid #2d3548", borderRadius: 8, color: "#c9a227", padding: "6px 14px", cursor: "pointer", fontSize: 12 }}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Spaced Repetition Engine ───
const SM2 = {
  getNextReview(quality, repetitions, easeFactor, interval) {
    if (quality < 3) {
      return { repetitions: 0, interval: 1, easeFactor };
    }
    let newInterval;
    if (repetitions === 0) newInterval = 1;
    else if (repetitions === 1) newInterval = 3;
    else newInterval = Math.round(interval * easeFactor);
    const newEF = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    return { repetitions: repetitions + 1, interval: newInterval, easeFactor: newEF };
  },
  isDue(lastReview, interval) {
    if (!lastReview) return false;
    const now = new Date();
    const due = new Date(lastReview);
    due.setDate(due.getDate() + interval);
    return now >= due;
  },
};

// ─── TOC Data ───
const TOC = [
  {
    part: "I",
    title: "Foundations of Data Systems",
    chapters: [
      {
        num: 1, title: "Reliable, Scalable, and Maintainable Applications", page: 3, ready: true,
        sections: [
          { id: "1-0", title: "Thinking About Data Systems", page: 4 },
          { id: "1-1", title: "Reliability", page: 6 },
          { id: "1-2", title: "Scalability", page: 10 },
          { id: "1-3", title: "Maintainability", page: 18 },
        ],
      },
      {
        num: 2, title: "Data Models and Query Languages", page: 27, ready: true,
        sections: [
          { id: "2-0", title: "Relational vs Document Model", page: 28 },
          { id: "2-1", title: "Query Languages for Data", page: 42 },
          { id: "2-2", title: "Graph-Like Data Models", page: 49 },
        ],
      },
      {
        num: 3, title: "Storage and Retrieval", page: 69, ready: true,
        sections: [
          { id: "3-0", title: "Data Structures That Power Your Database", page: 70 },
          { id: "3-1", title: "Transaction Processing or Analytics?", page: 90 },
          { id: "3-2", title: "Column-Oriented Storage", page: 95 },
        ],
      },
      {
        num: 4, title: "Encoding and Evolution", page: 111, ready: true,
        sections: [
          { id: "4-0", title: "Formats for Encoding Data", page: 112 },
          { id: "4-1", title: "Modes of Dataflow", page: 127 },
        ],
      },
    ],
  },
  {
    part: "II",
    title: "Distributed Data",
    chapters: [
      {
        num: 5, title: "Replication", page: 151, ready: false,
        sections: [
          { id: "5-0", title: "Leaders and Followers", page: 152 },
          { id: "5-1", title: "Problems with Replication Lag", page: 161 },
          { id: "5-2", title: "Multi-Leader Replication", page: 168 },
          { id: "5-3", title: "Leaderless Replication", page: 177 },
        ],
      },
      {
        num: 6, title: "Partitioning", page: 199, ready: false,
        sections: [
          { id: "6-0", title: "Partitioning of Key-Value Data", page: 201 },
          { id: "6-1", title: "Partitioning and Secondary Indexes", page: 206 },
          { id: "6-2", title: "Rebalancing Partitions", page: 209 },
          { id: "6-3", title: "Request Routing", page: 214 },
        ],
      },
      {
        num: 7, title: "Transactions", page: 221, ready: false,
        sections: [
          { id: "7-0", title: "The Slippery Concept of a Transaction", page: 222 },
          { id: "7-1", title: "Weak Isolation Levels", page: 233 },
          { id: "7-2", title: "Serializability", page: 251 },
        ],
      },
      {
        num: 8, title: "The Trouble with Distributed Systems", page: 273, ready: false,
        sections: [
          { id: "8-0", title: "Faults and Partial Failures", page: 274 },
          { id: "8-1", title: "Unreliable Networks", page: 277 },
          { id: "8-2", title: "Unreliable Clocks", page: 287 },
          { id: "8-3", title: "Knowledge, Truth, and Lies", page: 300 },
        ],
      },
      {
        num: 9, title: "Consistency and Consensus", page: 321, ready: false,
        sections: [
          { id: "9-0", title: "Linearizability", page: 324 },
          { id: "9-1", title: "Ordering Guarantees", page: 339 },
          { id: "9-2", title: "Distributed Transactions and Consensus", page: 352 },
        ],
      },
    ],
  },
  {
    part: "III",
    title: "Derived Data",
    chapters: [
      {
        num: 10, title: "Batch Processing", page: 389, ready: false,
        sections: [
          { id: "10-0", title: "Batch Processing with Unix Tools", page: 391 },
          { id: "10-1", title: "MapReduce and Distributed Filesystems", page: 397 },
          { id: "10-2", title: "Beyond MapReduce", page: 419 },
        ],
      },
      {
        num: 11, title: "Stream Processing", page: 439, ready: false,
        sections: [
          { id: "11-0", title: "Transmitting Event Streams", page: 440 },
          { id: "11-1", title: "Databases and Streams", page: 451 },
          { id: "11-2", title: "Processing Streams", page: 464 },
        ],
      },
      {
        num: 12, title: "The Future of Data Systems", page: 489, ready: false,
        sections: [
          { id: "12-0", title: "Data Integration", page: 490 },
          { id: "12-1", title: "Unbundling Databases", page: 499 },
          { id: "12-2", title: "Aiming for Correctness", page: 515 },
          { id: "12-3", title: "Doing the Right Thing", page: 533 },
        ],
      },
    ],
  },
];

// ─── Reusable Diagram Primitives ───

// 1. AnimatedGraph — SVG node/edge graph with step-through animation
// Props: { title, nodes: [{id, label, x, y, icon}], edges: [{id, from, to}], steps: [{label, active: [nodeId], flow: [edgeId]}], viewBox?, maxWidth? }
function AnimatedGraph({ title, nodes, edges, steps, viewBox = "0 0 360 380", maxWidth = 500 }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep((s) => {
          if (s >= steps.length - 1) { setPlaying(false); return s; }
          return s + 1;
        });
      }, 2000);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, steps.length]);

  const cur = steps[step];
  const isActive = (id) => cur.active.includes(id);
  const getNode = (id) => nodes.find((n) => n.id === id);

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ color: "#c9a227", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
          {title}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setStep(0); setPlaying(false); }}
            style={{ background: "#1c2333", border: "1px solid #2d3548", borderRadius: 6, color: "#8b949e", padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
            <RotateCcw size={12} /> Reset
          </button>
          <button onClick={() => setPlaying(!playing)}
            style={{ background: playing ? "#c9a227" : "#1c2333", border: "1px solid " + (playing ? "#c9a227" : "#2d3548"), borderRadius: 6, color: playing ? "#0d1117" : "#c9a227", padding: "4px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
            {playing ? <Pause size={12} /> : <Play size={12} />} {playing ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      <svg viewBox={viewBox} style={{ width: "100%", maxWidth }}>
        {edges.map((e) => {
          const from = getNode(e.from);
          const to = getNode(e.to);
          const active = cur.flow.includes(e.id);
          return (
            <g key={e.id}>
              <line x1={from.x + 40} y1={from.y + 25} x2={to.x + 40} y2={to.y + 5} stroke={active ? "#c9a227" : "#2d3548"} strokeWidth={active ? 2.5 : 1.5} strokeDasharray={active ? "none" : "4 4"} style={{ transition: "all 0.5s ease" }} />
              {active && (
                <circle r={4} fill="#c9a227">
                  <animateMotion dur="1s" repeatCount="indefinite" path={`M${from.x + 40},${from.y + 25} L${to.x + 40},${to.y + 5}`} />
                </circle>
              )}
            </g>
          );
        })}
        {nodes.map((n) => (
          <g key={n.id} style={{ transition: "all 0.4s ease" }}>
            <rect x={n.x} y={n.y} width={80} height={50} rx={8} fill={isActive(n.id) ? "#1a2332" : "#161b22"} stroke={isActive(n.id) ? "#c9a227" : "#2d3548"} strokeWidth={isActive(n.id) ? 2 : 1} style={{ transition: "all 0.4s ease" }} />
            {isActive(n.id) && <rect x={n.x} y={n.y} width={80} height={50} rx={8} fill="#c9a227" opacity={0.08} />}
            <text x={n.x + 40} y={n.y + 20} textAnchor="middle" fontSize={16}>{n.icon}</text>
            <text x={n.x + 40} y={n.y + 38} textAnchor="middle" fill={isActive(n.id) ? "#e6d089" : "#6e7681"} fontSize={9} fontFamily="'JetBrains Mono', monospace" fontWeight={isActive(n.id) ? 600 : 400}>{n.label}</text>
          </g>
        ))}
      </svg>

      <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "16px 0 8px" }}>
        {steps.map((_, i) => (
          <button key={i} onClick={() => { setStep(i); setPlaying(false); }} style={{ width: 8, height: 8, borderRadius: "50%", background: i === step ? "#c9a227" : i < step ? "#4a4000" : "#2d3548", border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
        ))}
      </div>
      <p style={{ textAlign: "center", color: "#e6d089", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", margin: 0, minHeight: 20 }}>
        {cur.label}
      </p>
    </div>
  );
}

// 2. CategoryExplorer — click-to-select categories with detail panel, mitigation, and OA callout
// Props: { title, description?, categories: { [key]: { title, icon, color, desc, mitigation, example } } }
function CategoryExplorer({ title, description, categories }) {
  const [selected, setSelected] = useState(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const cat = selected ? categories[selected] : null;

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 16 }}>
      <span style={{ color: "#c9a227", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
        {title}
      </span>
      {description && <p style={{ color: "#8b949e", fontSize: 13, marginTop: 8, marginBottom: 16 }}>{description}</p>}

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(categories).map(([key, f]) => (
          <button key={key} onClick={() => { setSelected(key); setShowRecovery(false); }}
            style={{
              flex: 1, minWidth: 120, background: selected === key ? f.color + "18" : "#161b22",
              border: `1.5px solid ${selected === key ? f.color : "#2d3548"}`,
              borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left",
              transition: "all 0.3s",
            }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{f.icon}</div>
            <div style={{ color: selected === key ? f.color : "#c9d1d9", fontSize: 13, fontWeight: 600 }}>{f.title}</div>
          </button>
        ))}
      </div>

      {cat && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: "#161b22", borderRadius: 10, padding: 18, marginBottom: 12, borderLeft: `3px solid ${cat.color}` }}>
            <div style={{ color: "#e6edf3", fontSize: 14, lineHeight: 1.6 }}>{cat.desc}</div>
          </div>
          <button onClick={() => setShowRecovery(!showRecovery)}
            style={{ background: "#1c2333", border: "1px solid #2d3548", borderRadius: 8, color: "#c9a227", padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Shield size={14} /> {showRecovery ? "Hide" : "Show"} {cat.mitigationLabel || "Mitigation Strategy"}
          </button>
          {showRecovery && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ background: "#0e2a1a", borderRadius: 10, padding: 18, marginBottom: 12, borderLeft: "3px solid #3fb950" }}>
                <div style={{ color: "#3fb950", fontSize: 11, fontWeight: 700, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  {cat.mitigationTitle || "MITIGATION"}
                </div>
                <div style={{ color: "#afd9c0", fontSize: 13, lineHeight: 1.6 }}>{cat.mitigation}</div>
              </div>
              <div style={{ background: "#1a1a0e", borderRadius: 10, padding: 18, borderLeft: "3px solid #c9a227" }}>
                <div style={{ color: "#c9a227", fontSize: 11, fontWeight: 700, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>OPENAGENCY CONNECTION</div>
                <div style={{ color: "#e6d089", fontSize: 13, lineHeight: 1.6 }}>{cat.example}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 3. TradeoffSlider — range input + toggle between approaches with computed metric bars
// Props: { title, slider: {label, min, max, default}, options: [{key, label, desc}], computeMetrics: (value, option) => [{label, value, color, unit}], computeWarning: (value, option) => string|null, computeInsight: (value, option) => string }
function TradeoffSlider({ title, slider, options, computeMetrics, computeWarning, computeInsight, barMax = 1200 }) {
  const [value, setValue] = useState(slider.default || slider.min);
  const [option, setOption] = useState(options[0].key);

  const metrics = computeMetrics(value, option);
  const warning = computeWarning ? computeWarning(value, option) : null;
  const insight = computeInsight ? computeInsight(value, option) : null;
  const pctOf = (v) => Math.min(100, (v / barMax) * 100);

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 16 }}>
      <span style={{ color: "#c9a227", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
        {title}
      </span>

      <div style={{ marginTop: 16, marginBottom: 20 }}>
        <label style={{ color: "#8b949e", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", display: "block", marginBottom: 8 }}>
          {slider.label}: <span style={{ color: "#c9a227", fontWeight: 700 }}>{value}</span>
        </label>
        <input type="range" min={slider.min} max={slider.max} value={value} onChange={(e) => setValue(+e.target.value)}
          style={{ width: "100%", accentColor: "#c9a227" }} />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {options.map((opt) => (
          <button key={opt.key} onClick={() => setOption(opt.key)}
            style={{
              flex: 1, background: option === opt.key ? "#1a2332" : "#161b22",
              border: `1.5px solid ${option === opt.key ? "#c9a227" : "#2d3548"}`,
              borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.3s",
            }}>
            <div style={{ color: option === opt.key ? "#c9a227" : "#c9d1d9", fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
            <div style={{ color: "#6e7681", fontSize: 11, marginTop: 2 }}>{opt.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ background: "#161b22", borderRadius: 10, padding: 16 }}>
        <div style={{ color: "#8b949e", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>RESPONSE LATENCY</div>
        {metrics.map((m) => (
          <div key={m.label} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "#8b949e", fontSize: 12 }}>{m.label}</span>
              <span style={{ color: m.color, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{m.value}{m.unit || "ms"}</span>
            </div>
            <div style={{ background: "#0d1117", borderRadius: 4, height: 10, overflow: "hidden" }}>
              <div style={{ width: pctOf(m.value) + "%", height: "100%", background: m.color, borderRadius: 4, transition: "all 0.4s ease" }} />
            </div>
          </div>
        ))}
        {warning && (
          <div style={{ background: "#f8514918", border: "1px solid #f8514940", borderRadius: 8, padding: 12, marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} color="#f85149" />
            <span style={{ color: "#f85149", fontSize: 12 }}>{warning}</span>
          </div>
        )}
      </div>

      {insight && (
        <div style={{ background: "#1a1a0e", borderRadius: 10, padding: 14, marginTop: 12, borderLeft: "3px solid #c9a227" }}>
          <div style={{ color: "#c9a227", fontSize: 11, fontWeight: 700, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>KEY INSIGHT</div>
          <div style={{ color: "#e6d089", fontSize: 13, lineHeight: 1.5 }}>{insight}</div>
        </div>
      )}
    </div>
  );
}

// 4. ExpandableCards — accordion-style cards with bullet points and OA callouts
// Props: { title, cards: [{ id, icon, title, subtitle, color, points: [string], oa: string }] }
function ExpandableCards({ title, cards }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 16 }}>
      <span style={{ color: "#c9a227", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
        {title}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {cards.map((p) => (
          <div key={p.id}>
            <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              style={{
                width: "100%", background: expanded === p.id ? p.color + "12" : "#161b22",
                border: `1.5px solid ${expanded === p.id ? p.color : "#2d3548"}`,
                borderRadius: expanded === p.id ? "10px 10px 0 0" : 10,
                padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                transition: "all 0.3s",
              }}>
              <div style={{ color: p.color }}>{p.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: expanded === p.id ? p.color : "#c9d1d9", fontSize: 14, fontWeight: 600 }}>{p.title}</div>
                <div style={{ color: "#6e7681", fontSize: 11, marginTop: 1 }}>{p.subtitle}</div>
              </div>
              {expanded === p.id ? <ChevronDown size={16} color="#6e7681" /> : <ChevronRight size={16} color="#6e7681" />}
            </button>
            {expanded === p.id && (
              <div style={{ background: "#161b22", borderRadius: "0 0 10px 10px", padding: 16, borderTop: "none", border: `1.5px solid ${p.color}`, borderTopWidth: 0, animation: "fadeIn 0.3s ease" }}>
                {p.points.map((pt, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.color, marginTop: 6, flexShrink: 0 }} />
                    <span style={{ color: "#c9d1d9", fontSize: 13, lineHeight: 1.5 }}>{pt}</span>
                  </div>
                ))}
                <div style={{ background: "#1a1a0e", borderRadius: 8, padding: 12, marginTop: 12, borderLeft: "3px solid #c9a227" }}>
                  <div style={{ color: "#c9a227", fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>OPENAGENCY</div>
                  <div style={{ color: "#e6d089", fontSize: 12, lineHeight: 1.5 }}>{p.oa}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chapter 1 Diagrams (using primitives) ───
function DataSystemDiagram() {
  return (
    <AnimatedGraph
      title="ANATOMY OF A DATA SYSTEM"
      nodes={[
        { id: "client", label: "Client", x: 80, y: 40, icon: "👤" },
        { id: "api", label: "API / App", x: 80, y: 130, icon: "⚡" },
        { id: "cache", label: "Cache", x: 240, y: 90, icon: "💨" },
        { id: "db", label: "Database", x: 80, y: 230, icon: "🗄️" },
        { id: "search", label: "Search Index", x: 240, y: 200, icon: "🔍" },
        { id: "queue", label: "Message Queue", x: 80, y: 330, icon: "📬" },
        { id: "worker", label: "Worker", x: 240, y: 310, icon: "⚙️" },
      ]}
      edges={[
        { id: "client-api", from: "client", to: "api" },
        { id: "api-cache", from: "api", to: "cache" },
        { id: "api-db", from: "api", to: "db" },
        { id: "db-search", from: "db", to: "search" },
        { id: "db-queue", from: "db", to: "queue" },
        { id: "queue-worker", from: "queue", to: "worker" },
      ]}
      steps={[
        { label: "Client sends request", active: ["client"], flow: ["client-api"] },
        { label: "API layer validates & routes", active: ["api"], flow: ["api-db", "api-cache"] },
        { label: "Check cache first (fast path)", active: ["cache"], flow: ["api-cache"] },
        { label: "Cache miss → query database", active: ["db"], flow: ["api-db"] },
        { label: "Write to search index for queries", active: ["search"], flow: ["db-search"] },
        { label: "Async tasks via message queue", active: ["queue", "worker"], flow: ["db-queue", "queue-worker"] },
        { label: "Full data system working together", active: ["client", "api", "cache", "db", "search", "queue", "worker"], flow: [] },
      ]}
    />
  );
}

function ReliabilityDiagram() {
  return (
    <CategoryExplorer
      title="FAULT INJECTION SIMULATOR"
      description="Click a fault type to see how it affects a system and what mitigations exist."
      categories={{
        hardware: {
          title: "Hardware Fault", icon: "💥", color: "#f85149",
          desc: "A disk dies, RAM goes bad, or the power grid hiccups. These are random and independent — the probability of simultaneous failure across redundant components is very low.",
          mitigation: "Redundancy: RAID arrays, dual power supplies, hot-standby servers. The goal is to keep the system running even when individual components fail.",
          example: "OpenAgency runs on cloud VMs. If one VM's underlying host dies, your Temporal workers need to pick up where they left off — which is exactly what Temporal's durable execution model gives you.",
        },
        software: {
          title: "Software Error", icon: "🐛", color: "#d29922",
          desc: "Systematic faults — a bug that crashes every server on the same bad input, a cascade where one slow service causes everything upstream to pile up, a runaway process eating all the memory.",
          mitigation: "No quick fix. Requires careful design: circuit breakers, bulkheads (isolating components), crash-only design, thorough testing, monitoring that catches anomalies before they cascade.",
          example: "If the Meta Ads API starts returning 500s, OpenAgency's sync workers shouldn't retry infinitely and DDoS your own system. Exponential backoff + circuit breaker pattern.",
        },
        human: {
          title: "Human Error", icon: "🤦", color: "#a371f7",
          desc: "The #1 cause of outages. Misconfiguration, deploying bad code, running the wrong command. Humans are unreliable operators — not because they're careless, but because systems are complex.",
          mitigation: "Design for human error: sandbox environments, gradual rollouts, easy rollback, detailed audit logs, observability. Make it easy to do the right thing and hard to do the wrong thing.",
          example: "When deploying OpenAgency changes, CI/CD with staging environments and feature flags means a bad deploy doesn't instantly break every client's ad campaigns.",
        },
      }}
    />
  );
}

function ScalabilityDiagram() {
  return (
    <TradeoffSlider
      title="SCALABILITY EXPLORER"
      slider={{ label: "REQUESTS PER SECOND", min: 10, max: 1000, default: 100 }}
      options={[
        { key: "vertical", label: "Scale Up (Vertical)", desc: "Bigger machine" },
        { key: "horizontal", label: "Scale Out (Horizontal)", desc: "More machines" },
      ]}
      computeMetrics={(rps, approach) => {
        const p50 = approach === "vertical"
          ? Math.round(5 + (rps / 100) * 3 + (rps > 500 ? (rps - 500) * 0.5 : 0))
          : Math.round(5 + (rps / 100) * 1.5);
        const p99 = approach === "vertical"
          ? Math.round(p50 * 4 + (rps > 300 ? (rps - 300) * 2 : 0))
          : Math.round(p50 * 3 + (rps > 800 ? (rps - 800) * 0.3 : 0));
        return [
          { label: "p50 (median)", value: p50, color: "#3fb950" },
          { label: "p99 (tail)", value: p99, color: p99 > 500 ? "#f85149" : p99 > 200 ? "#d29922" : "#3fb950" },
        ];
      }}
      computeWarning={(rps, approach) => {
        const saturated = (approach === "vertical" && rps > 600) || (approach === "horizontal" && rps > 900);
        if (!saturated) return null;
        return approach === "vertical"
          ? "System saturated! Single machine has hit its ceiling. Consider scaling horizontally."
          : "Approaching distributed system complexity. Need partitioning strategy.";
      }}
      computeInsight={(rps, approach) =>
        approach === "vertical"
          ? "Vertical scaling is simple but has hard limits. A single machine can only get so big. Past a point, latency spikes nonlinearly because all requests compete for the same resources."
          : "Horizontal scaling removes the single-machine ceiling but introduces distributed system challenges: data consistency, request routing, and partial failures. The p99 stays lower because load is spread across nodes."
      }
    />
  );
}

function MaintainabilityPillars() {
  return (
    <ExpandableCards
      title="THREE PILLARS OF MAINTAINABILITY"
      cards={[
        {
          id: "operability", icon: <Settings size={20} />, title: "Operability", subtitle: "Making life easy for operations",
          color: "#58a6ff",
          points: [
            "Good monitoring & observability — can you see what's happening inside?",
            "Automation for routine tasks, but easy manual override",
            "Good documentation of system behavior",
            "Self-healing where possible, but graceful degradation always",
          ],
          oa: "For OpenAgency: health dashboards for each ad network sync, alerting when API rate limits are close, and runbooks for common failure scenarios.",
        },
        {
          id: "simplicity", icon: <Layers size={20} />, title: "Simplicity", subtitle: "Managing complexity",
          color: "#3fb950",
          points: [
            "Remove accidental complexity (complexity not inherent to the problem)",
            "Good abstractions hide implementation detail",
            "Avoid tight coupling between components",
            "A new engineer should be able to understand the system quickly",
          ],
          oa: "For OpenAgency: a clean abstraction layer across ad networks means adding a new platform (say, Reddit Ads) shouldn't require touching billing, auth, or the campaign data model.",
        },
        {
          id: "evolvability", icon: <TrendingUp size={20} />, title: "Evolvability", subtitle: "Making change easy",
          color: "#d2a8ff",
          points: [
            "Requirements always change — your system must accommodate this",
            "Closely linked to simplicity: simpler systems are easier to modify",
            "Test-driven and agile practices help, but architecture matters more",
            "Think about schema evolution, API versioning, backward compatibility",
          ],
          oa: "For OpenAgency: when you add White-Labeling or Multi-User Collaboration later, the data model and API should stretch to accommodate them without a rewrite.",
        },
      ]}
    />
  );
}

// ─── Quiz Component ───
function Quiz({ questions, sectionId, onComplete }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[current];

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    if (idx === q.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setDone(true);
      if (onComplete) onComplete(score);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const quality = pct >= 80 ? 5 : pct >= 60 ? 4 : pct >= 40 ? 3 : 2;
    return (
      <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, textAlign: "center", marginTop: 16 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>{pct >= 80 ? "🎯" : pct >= 50 ? "📖" : "💪"}</div>
        <div style={{ color: "#c9d1d9", fontSize: 18, fontWeight: 600 }}>{score} / {questions.length}</div>
        <div style={{ color: "#8b949e", fontSize: 13, marginTop: 4 }}>
          {pct >= 80 ? "Strong understanding! Review again in a few days." : pct >= 50 ? "Getting there. Worth a re-read of this section." : "This section needs more study. Re-read and try again."}
        </div>
        <button onClick={() => { setCurrent(0); setSelected(null); setRevealed(false); setScore(0); setDone(false); }}
          style={{ marginTop: 16, background: "#1c2333", border: "1px solid #2d3548", borderRadius: 8, color: "#c9a227", padding: "8px 20px", cursor: "pointer", fontSize: 13 }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ color: "#c9a227", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
          KNOWLEDGE CHECK
        </span>
        <span style={{ color: "#6e7681", fontSize: 12 }}>{current + 1} / {questions.length}</span>
      </div>

      <div style={{ color: "#e6edf3", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{q.question}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, i) => {
          let bg = "#161b22";
          let border = "#2d3548";
          let textColor = "#c9d1d9";
          if (revealed) {
            if (i === q.correct) { bg = "#0e2a1a"; border = "#3fb950"; textColor = "#afd9c0"; }
            else if (i === selected && i !== q.correct) { bg = "#2a0e0e"; border = "#f85149"; textColor = "#f8a0a0"; }
          } else if (i === selected) { border = "#c9a227"; bg = "#1a1a0e"; }
          return (
            <button key={i} onClick={() => handleSelect(i)}
              style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 8, padding: "10px 14px", textAlign: "left", cursor: revealed ? "default" : "pointer", color: textColor, fontSize: 13, lineHeight: 1.5, transition: "all 0.3s" }}>
              {opt}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div style={{ marginTop: 12 }}>
          <div style={{ background: "#161b22", borderRadius: 8, padding: 12, borderLeft: "3px solid #58a6ff", marginBottom: 12 }}>
            <div style={{ color: "#58a6ff", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>WHY</div>
            <div style={{ color: "#8b949e", fontSize: 12, lineHeight: 1.5 }}>{q.explanation}</div>
          </div>
          <button onClick={handleNext}
            style={{ background: "#c9a227", border: "none", borderRadius: 8, color: "#0d1117", padding: "8px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {current + 1 >= questions.length ? "See Results" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Chapter 1 Content ───
const Ch1Content = {
  "1-0": {
    title: "Thinking About Data Systems",
    concept: `Modern applications are rarely powered by a single tool. They compose multiple specialized components — a database for durable storage, a cache for speed, a search index for flexible queries, a message queue for async work — into a unified "data system" behind an API.

As the developer (or architect), YOU are now the data system designer. Your API hides the complexity, but you're responsible for keeping these pieces in sync, handling failures across them, and ensuring the composite system delivers its guarantees even when individual pieces misbehave.

This is the fundamental shift Kleppmann establishes: you're not just picking tools, you're designing a system with emergent properties that none of the individual tools provide alone.`,
    diagram: DataSystemDiagram,
    quiz: [
      {
        question: "Why does Kleppmann argue that application developers are now 'data system designers'?",
        options: [
          "Because databases are too complex for DBAs to manage alone",
          "Because applications now compose multiple tools into a system with guarantees none provide individually",
          "Because NoSQL databases require more developer involvement",
          "Because cloud computing shifted responsibility from ops to devs",
        ],
        correct: 1,
        explanation: "The key insight is that when you combine a database, cache, queue, and search index behind an API, the resulting system has properties (correctness, reliability, performance) that emerge from how you compose them — not from any single tool.",
      },
      {
        question: "What is the primary risk when an application composes multiple data tools?",
        options: [
          "The tools may use different programming languages",
          "Keeping data in sync across them and maintaining correctness guarantees",
          "Licensing costs increase linearly with tool count",
          "Network latency between tools is always unacceptable",
        ],
        correct: 1,
        explanation: "When data lives in multiple places (database, cache, search index), ensuring consistency between them — especially during failures — becomes the central design challenge.",
      },
    ],
  },
  "1-1": {
    title: "Reliability",
    concept: `Reliability means the system continues to work correctly even when things go wrong. "Things going wrong" are called faults, and a system that anticipates and handles them is fault-tolerant.

Crucially, a fault is NOT the same as a failure. A fault is one component deviating from spec. A failure is when the whole system stops providing the service it promises. Fault tolerance means preventing faults from escalating into failures.

There are three categories of faults, and they require fundamentally different strategies:

• Hardware faults are random and uncorrelated — a disk dies, a network cable gets unplugged. Solution: redundancy.

• Software faults are systematic and correlated — a bug that crashes every node on the same input, a service that silently returns corrupt data. Solution: careful design, monitoring, and testing assumptions.

• Human faults are the most common. Configuration errors, wrong commands, misunderstood interfaces. Solution: make systems that are easy to operate correctly and hard to break.`,
    diagram: ReliabilityDiagram,
    quiz: [
      {
        question: "What is the critical difference between a 'fault' and a 'failure'?",
        options: [
          "Faults are hardware problems; failures are software problems",
          "A fault is a single component deviating from spec; a failure is the system not providing its service",
          "Faults are temporary; failures are permanent",
          "Faults are preventable; failures are not",
        ],
        correct: 1,
        explanation: "This distinction is foundational. Fault tolerance is about building systems where faults (inevitable) don't cascade into failures (what the user experiences). You can't eliminate faults, but you can prevent them from becoming failures.",
      },
      {
        question: "Why are software faults considered harder to deal with than hardware faults?",
        options: [
          "Software faults are more expensive to fix",
          "Software faults tend to be correlated — they can hit all nodes simultaneously",
          "Software faults happen more frequently",
          "Software faults can't be detected by monitoring",
        ],
        correct: 1,
        explanation: "Hardware faults are random and independent — two disks failing simultaneously is rare. Software bugs are correlated — the same bad input can crash every server at once. This correlation defeats simple redundancy strategies.",
      },
    ],
  },
  "1-2": {
    title: "Scalability",
    concept: `Scalability is NOT a binary label ("this system is scalable"). It's a question: "If the system grows in a specific way, what are our options for coping?"

To reason about scalability, you need two things:

1. Load parameters — numbers that describe the current demand on your system. Requests per second, read/write ratio, simultaneous active users, cache hit rate. The right parameter depends on your architecture.

2. Performance metrics — once you've described load, you can ask: when load increases, what happens to performance? The key insight is to look at percentiles (p50, p95, p99), not averages. The p99 latency tells you about the experience of your worst-off users — and those are often your most valuable ones (they have the most data).

For coping with load, there's a spectrum between scaling up (bigger machines) and scaling out (more machines). Scaling up is simpler but has hard limits. Scaling out is more powerful but introduces all the distributed system challenges from Part II of the book.

There is no magic architecture — the right approach depends entirely on your specific load parameters and which operations need to be fast.`,
    diagram: ScalabilityDiagram,
    quiz: [
      {
        question: "Why does Kleppmann emphasize percentiles (p50, p95, p99) over averages for measuring performance?",
        options: [
          "Percentiles are easier to calculate",
          "Averages hide the long tail — a few extremely slow requests won't move the average but destroy user experience",
          "Percentiles are more standard in the industry",
          "Averages only work for normally distributed data",
        ],
        correct: 1,
        explanation: "A system with a 50ms average might have a p99 of 3 seconds — meaning 1 in 100 requests is 60x slower than the average suggests. Amazon found that customers with the slowest responses often had the most items in their cart (the highest-value customers).",
      },
      {
        question: "What does it mean that 'scalability is not a one-dimensional label'?",
        options: [
          "Some systems can't scale at all",
          "You must specify WHICH dimension of load you're scaling for — the answer changes based on your specific load parameters",
          "Scalability has both technical and business dimensions",
          "You need to consider both hardware and software scaling",
        ],
        correct: 1,
        explanation: "A system designed for 100K reads/sec with rare writes needs a completely different architecture than one designed for 10K writes/sec. 'Is this scalable?' is meaningless without specifying the load pattern you're scaling for.",
      },
    ],
  },
  "1-3": {
    title: "Maintainability",
    concept: `The majority of software cost is not in initial development — it's in ongoing maintenance. Fixing bugs, keeping systems running, adapting to new requirements, paying down tech debt, adding features.

Kleppmann identifies three design principles that minimize maintenance pain:

Operability — Make it easy for operations teams to keep the system running. Good monitoring, easy to understand runtime behavior, automation support, good defaults with overrides, self-healing capabilities, documented behavior.

Simplicity — Manage complexity ruthlessly. The enemy is "accidental complexity" — complexity that isn't inherent to the problem but arises from the implementation. Good abstractions are the best tool: they hide complexity behind clean interfaces that let you reason about one thing at a time.

Evolvability — Make change easy. Requirements change constantly, and the system must accommodate this. Evolvability is closely tied to simplicity: simple systems are inherently easier to modify than complex ones. Agile practices help at the process level, but the architecture determines whether changes are surgical or require rewrites.`,
    diagram: MaintainabilityPillars,
    quiz: [
      {
        question: "What is 'accidental complexity' and why does it matter?",
        options: [
          "Bugs that happen by accident during coding",
          "Complexity that's NOT inherent to the problem but arises from the implementation — it can and should be removed",
          "The complexity of dealing with unexpected user behavior",
          "Complexity introduced by using too many third-party libraries",
        ],
        correct: 1,
        explanation: "Essential complexity comes from the problem itself (ad campaigns have many interacting parameters). Accidental complexity comes from how you build the solution (tangled code, leaky abstractions, inconsistent naming). Good engineering eliminates accidental complexity through better abstractions.",
      },
      {
        question: "Where does most of the cost of software come from?",
        options: [
          "Initial development and architecture",
          "Hardware and infrastructure costs",
          "Ongoing maintenance: bug fixes, operations, adapting to new requirements",
          "Testing and quality assurance",
        ],
        correct: 2,
        explanation: "This is why maintainability matters so much. The initial build is a small fraction of lifetime cost. Designing for operability, simplicity, and evolvability is an investment that pays off continuously over the system's life.",
      },
    ],
  },
};

// ─── Chapter 2 Diagrams ───

// 2-0: Relational vs Document Model — side-by-side comparison
function DataModelComparison() {
  const [model, setModel] = useState("relational");

  const relationalTables = [
    { name: "campaigns", rows: [
      { id: 1, name: "Summer Sale", advertiser_id: 42, status: "active" },
      { id: 2, name: "Holiday Push", advertiser_id: 42, status: "paused" },
    ]},
    { name: "ad_groups", rows: [
      { id: 10, campaign_id: 1, platform: "Meta", budget: 500 },
      { id: 11, campaign_id: 1, platform: "Google", budget: 800 },
      { id: 12, campaign_id: 2, platform: "TikTok", budget: 300 },
    ]},
    { name: "ads", rows: [
      { id: 100, ad_group_id: 10, headline: "50% Off!", format: "image" },
      { id: 101, ad_group_id: 11, headline: "Shop Now", format: "video" },
    ]},
  ];

  const documentJson = {
    _id: "campaign:1",
    name: "Summer Sale",
    advertiser: { id: 42, name: "Acme Corp" },
    status: "active",
    ad_groups: [
      { platform: "Meta", budget: 500,
        ads: [{ headline: "50% Off!", format: "image", creative: { image_url: "...", cta: "Shop" } }]
      },
      { platform: "Google", budget: 800,
        ads: [{ headline: "Shop Now", format: "video", creative: { video_url: "...", cta: "Learn More" } }]
      },
    ],
  };

  const CellStyle = { padding: "4px 8px", borderBottom: "1px solid #2d3548", fontSize: 11, color: "#c9d1d9", fontFamily: "'JetBrains Mono', monospace" };
  const HeaderStyle = { ...CellStyle, color: "#c9a227", fontWeight: 600, background: "#161b22" };

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 16 }}>
      <span style={{ color: "#c9a227", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
        RELATIONAL vs DOCUMENT MODEL
      </span>
      <p style={{ color: "#8b949e", fontSize: 13, marginTop: 8, marginBottom: 16 }}>
        Toggle between views to see the same campaign data modeled two ways.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { key: "relational", label: "Relational (SQL)", desc: "Normalized tables + joins" },
          { key: "document", label: "Document (NoSQL)", desc: "Nested JSON structure" },
        ].map((opt) => (
          <button key={opt.key} onClick={() => setModel(opt.key)}
            style={{
              flex: 1, background: model === opt.key ? "#1a2332" : "#161b22",
              border: `1.5px solid ${model === opt.key ? "#c9a227" : "#2d3548"}`,
              borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.3s",
            }}>
            <div style={{ color: model === opt.key ? "#c9a227" : "#c9d1d9", fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
            <div style={{ color: "#6e7681", fontSize: 11, marginTop: 2 }}>{opt.desc}</div>
          </button>
        ))}
      </div>

      {model === "relational" ? (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          {relationalTables.map((table) => (
            <div key={table.name} style={{ marginBottom: 16 }}>
              <div style={{ color: "#58a6ff", fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                {table.name}
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "#0d1117", border: "1px solid #2d3548", borderRadius: 6 }}>
                  <thead>
                    <tr>
                      {Object.keys(table.rows[0]).map((col) => (
                        <th key={col} style={HeaderStyle}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} style={CellStyle}>{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <div style={{ background: "#161b22", borderRadius: 8, padding: 12, borderLeft: "3px solid #58a6ff", marginTop: 8 }}>
            <div style={{ color: "#58a6ff", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>TRADEOFF</div>
            <div style={{ color: "#8b949e", fontSize: 12, lineHeight: 1.5 }}>
              No duplication — advertiser name lives in one place. But fetching a full campaign requires 3 JOINs. Great for writes and consistency, more work for reads.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <pre style={{
            background: "#161b22", borderRadius: 8, padding: 16, overflowX: "auto",
            color: "#c9d1d9", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.6,
            border: "1px solid #2d3548",
          }}>
            {JSON.stringify(documentJson, null, 2)}
          </pre>
          <div style={{ background: "#161b22", borderRadius: 8, padding: 12, borderLeft: "3px solid #58a6ff", marginTop: 12 }}>
            <div style={{ color: "#58a6ff", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>TRADEOFF</div>
            <div style={{ color: "#8b949e", fontSize: 12, lineHeight: 1.5 }}>
              One read gets everything — no joins needed. But advertiser name is embedded and could become stale. Adding a many-to-many relationship (shared audiences across campaigns) breaks the nesting model.
            </div>
          </div>
        </div>
      )}

      <div style={{ background: "#1a1a0e", borderRadius: 10, padding: 14, marginTop: 16, borderLeft: "3px solid #c9a227" }}>
        <div style={{ color: "#c9a227", fontSize: 11, fontWeight: 700, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>OPENAGENCY CONNECTION</div>
        <div style={{ color: "#e6d089", fontSize: 13, lineHeight: 1.5 }}>
          Campaign data has both relational aspects (campaign → ad groups → ads hierarchy, shared audiences) and document-like aspects (platform-specific creative payloads from Meta vs Google vs TikTok with completely different schemas). A hybrid approach — relational structure with JSON columns for platform-specific payloads — captures the best of both.
        </div>
      </div>
    </div>
  );
}

// 2-1: Declarative vs Imperative query comparison
function QueryLanguageComparison() {
  const [mode, setMode] = useState("imperative");
  const [animStep, setAnimStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  const imperativeSteps = [
    { label: "Start: loop through all campaigns", highlight: [0, 1], note: "Must process every row sequentially" },
    { label: "Check condition on each row", highlight: [2], note: "Can't skip ahead — must examine each one" },
    { label: "If match, push to results array", highlight: [3], note: "Building results manually" },
    { label: "Return results", highlight: [5], note: "Order is locked to how we wrote the loop" },
  ];

  const declarativeSteps = [
    { label: "Declare WHAT you want", highlight: [0], note: "Just describe the result shape" },
    { label: "Engine chooses index scan", highlight: [1], note: "Optimizer picks the fastest access path" },
    { label: "Engine parallelizes if possible", highlight: [1], note: "Multiple cores can work simultaneously" },
    { label: "Results returned", highlight: [2], note: "Engine is free to optimize execution order" },
  ];

  const steps = mode === "imperative" ? imperativeSteps : declarativeSteps;

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setAnimStep((s) => {
          if (s >= steps.length - 1) { setPlaying(false); return s; }
          return s + 1;
        });
      }, 2000);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, steps.length]);

  const imperativeCode = [
    "function getHighSpendCampaigns(campaigns) {",
    "  const results = [];",
    "  for (const c of campaigns) {",
    "    if (c.spend > 1000) results.push(c);",
    "  }",
    "  return results;",
    "}",
  ];

  const declarativeCode = [
    "SELECT name, spend, platform",
    "FROM campaigns WHERE spend > 1000",
    "ORDER BY spend DESC;",
  ];

  const code = mode === "imperative" ? imperativeCode : declarativeCode;
  const cur = steps[animStep];

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 16 }}>
      <span style={{ color: "#c9a227", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
        DECLARATIVE vs IMPERATIVE QUERIES
      </span>
      <p style={{ color: "#8b949e", fontSize: 13, marginTop: 8, marginBottom: 16 }}>
        Same query, two paradigms. Watch how the execution differs.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[
          { key: "imperative", label: "Imperative", desc: "Step-by-step instructions" },
          { key: "declarative", label: "Declarative (SQL)", desc: "Describe the result" },
        ].map((opt) => (
          <button key={opt.key} onClick={() => { setMode(opt.key); setAnimStep(0); setPlaying(false); }}
            style={{
              flex: 1, background: mode === opt.key ? "#1a2332" : "#161b22",
              border: `1.5px solid ${mode === opt.key ? "#c9a227" : "#2d3548"}`,
              borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.3s",
            }}>
            <div style={{ color: mode === opt.key ? "#c9a227" : "#c9d1d9", fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
            <div style={{ color: "#6e7681", fontSize: 11, marginTop: 2 }}>{opt.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => { setAnimStep(0); setPlaying(false); }}
          style={{ background: "#1c2333", border: "1px solid #2d3548", borderRadius: 6, color: "#8b949e", padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
          <RotateCcw size={12} /> Reset
        </button>
        <button onClick={() => setPlaying(!playing)}
          style={{ background: playing ? "#c9a227" : "#1c2333", border: "1px solid " + (playing ? "#c9a227" : "#2d3548"), borderRadius: 6, color: playing ? "#0d1117" : "#c9a227", padding: "4px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
          {playing ? <Pause size={12} /> : <Play size={12} />} {playing ? "Pause" : "Play"}
        </button>
      </div>

      <div style={{ background: "#161b22", borderRadius: 8, padding: 16, marginBottom: 12, border: "1px solid #2d3548" }}>
        {code.map((line, i) => (
          <div key={i} style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.8,
            color: cur.highlight.includes(i) ? "#e6d089" : "#6e7681",
            background: cur.highlight.includes(i) ? "#c9a22715" : "transparent",
            padding: "1px 6px", borderRadius: 3, transition: "all 0.4s ease",
          }}>
            {line}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "12px 0 8px" }}>
        {steps.map((_, i) => (
          <button key={i} onClick={() => { setAnimStep(i); setPlaying(false); }} style={{ width: 8, height: 8, borderRadius: "50%", background: i === animStep ? "#c9a227" : i < animStep ? "#4a4000" : "#2d3548", border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <span style={{ color: "#e6d089", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{cur.label}</span>
        <div style={{ color: "#8b949e", fontSize: 11, marginTop: 4 }}>{cur.note}</div>
      </div>

      <div style={{ background: mode === "declarative" ? "#0e2a1a" : "#2a1a0e", borderRadius: 10, padding: 14, borderLeft: `3px solid ${mode === "declarative" ? "#3fb950" : "#d29922"}` }}>
        <div style={{ color: mode === "declarative" ? "#3fb950" : "#d29922", fontSize: 11, fontWeight: 700, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
          {mode === "declarative" ? "ADVANTAGE" : "LIMITATION"}
        </div>
        <div style={{ color: mode === "declarative" ? "#afd9c0" : "#e6d089", fontSize: 13, lineHeight: 1.5 }}>
          {mode === "declarative"
            ? "The database optimizer can choose indexes, parallelism, and execution order. If you add an index on spend tomorrow, the query automatically gets faster without code changes."
            : "The loop dictates execution order. The database can't optimize it. If the data structure changes, you rewrite the loop. Parallelization requires manual work."}
        </div>
      </div>

      <div style={{ background: "#1a1a0e", borderRadius: 10, padding: 14, marginTop: 12, borderLeft: "3px solid #c9a227" }}>
        <div style={{ color: "#c9a227", fontSize: 11, fontWeight: 700, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>OPENAGENCY CONNECTION</div>
        <div style={{ color: "#e6d089", fontSize: 13, lineHeight: 1.5 }}>
          When querying cross-network ad performance data, declarative SQL lets the database optimize complex aggregations. Writing imperative loops to fetch and filter campaigns one-by-one across Google, Meta, and TikTok data loses that optimization opportunity — and makes the code brittle when schemas evolve.
        </div>
      </div>
    </div>
  );
}

// 2-2: Interactive Property Graph
function GraphModelExplorer() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showJoinComparison, setShowJoinComparison] = useState(false);

  const graphNodes = [
    { id: "advertiser", label: "Advertiser", x: 180, y: 30, icon: "🏢", color: "#58a6ff", props: { name: "Acme Corp", industry: "E-commerce", tier: "Enterprise" } },
    { id: "campaign1", label: "Summer Sale", x: 60, y: 140, icon: "📢", color: "#3fb950", props: { budget: "$5,000", status: "active", objective: "conversions" } },
    { id: "campaign2", label: "Brand Awareness", x: 300, y: 140, icon: "📢", color: "#3fb950", props: { budget: "$2,000", status: "active", objective: "reach" } },
    { id: "audience1", label: "Retargeting", x: 60, y: 260, icon: "👥", color: "#d2a8ff", props: { size: "45K", source: "pixel", lookback: "30 days" } },
    { id: "audience2", label: "Lookalike", x: 300, y: 260, icon: "👥", color: "#d2a8ff", props: { size: "2M", source: "seed_list", similarity: "1%" } },
    { id: "meta", label: "Meta", x: 120, y: 360, icon: "📱", color: "#d29922", props: { api_version: "v18.0", rate_limit: "200/hr" } },
    { id: "google", label: "Google Ads", x: 260, y: 360, icon: "🔍", color: "#d29922", props: { api_version: "v16", rate_limit: "1500/day" } },
  ];

  const graphEdges = [
    { id: "e1", from: "advertiser", to: "campaign1", label: "owns", color: "#58a6ff" },
    { id: "e2", from: "advertiser", to: "campaign2", label: "owns", color: "#58a6ff" },
    { id: "e3", from: "campaign1", to: "audience1", label: "targets", color: "#3fb950" },
    { id: "e4", from: "campaign1", to: "audience2", label: "targets", color: "#3fb950" },
    { id: "e5", from: "campaign2", to: "audience2", label: "targets", color: "#3fb950" },
    { id: "e6", from: "campaign1", to: "meta", label: "runs_on", color: "#d29922" },
    { id: "e7", from: "campaign1", to: "google", label: "runs_on", color: "#d29922" },
    { id: "e8", from: "campaign2", to: "meta", label: "runs_on", color: "#d29922" },
  ];

  const getNode = (id) => graphNodes.find((n) => n.id === id);

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 16 }}>
      <span style={{ color: "#c9a227", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
        PROPERTY GRAPH EXPLORER
      </span>
      <p style={{ color: "#8b949e", fontSize: 13, marginTop: 8, marginBottom: 16 }}>
        Click nodes to see properties, edges to see relationships. Notice the many-to-many connections.
      </p>

      <svg viewBox="0 0 380 420" style={{ width: "100%", maxWidth: 500 }}>
        {graphEdges.map((e) => {
          const from = getNode(e.from);
          const to = getNode(e.to);
          const isSelected = selectedEdge === e.id;
          const mx = (from.x + to.x) / 2 + 40;
          const my = (from.y + to.y) / 2 + 25;
          return (
            <g key={e.id} onClick={() => { setSelectedEdge(isSelected ? null : e.id); setSelectedNode(null); }} style={{ cursor: "pointer" }}>
              <line x1={from.x + 40} y1={from.y + 30} x2={to.x + 40} y2={to.y + 10}
                stroke={isSelected ? "#c9a227" : e.color + "60"} strokeWidth={isSelected ? 2.5 : 1.5} />
              <rect x={mx - 20} y={my - 8} width={40} height={16} rx={4}
                fill={isSelected ? "#c9a22730" : "#0d1117"} stroke={isSelected ? "#c9a227" : "none"} />
              <text x={mx} y={my + 4} textAnchor="middle" fill={isSelected ? "#e6d089" : "#6e7681"}
                fontSize={8} fontFamily="'JetBrains Mono', monospace">{e.label}</text>
            </g>
          );
        })}
        {graphNodes.map((n) => {
          const isSelected = selectedNode === n.id;
          return (
            <g key={n.id} onClick={() => { setSelectedNode(isSelected ? null : n.id); setSelectedEdge(null); }} style={{ cursor: "pointer" }}>
              <rect x={n.x} y={n.y} width={80} height={50} rx={10}
                fill={isSelected ? n.color + "20" : "#161b22"}
                stroke={isSelected ? n.color : "#2d3548"} strokeWidth={isSelected ? 2 : 1}
                style={{ transition: "all 0.3s ease" }} />
              <text x={n.x + 40} y={n.y + 22} textAnchor="middle" fontSize={16}>{n.icon}</text>
              <text x={n.x + 40} y={n.y + 40} textAnchor="middle" fill={isSelected ? n.color : "#8b949e"}
                fontSize={8} fontFamily="'JetBrains Mono', monospace" fontWeight={isSelected ? 600 : 400}>{n.label}</text>
            </g>
          );
        })}
      </svg>

      {selectedNode && (
        <div style={{ animation: "fadeIn 0.3s ease", background: "#161b22", borderRadius: 10, padding: 16, marginTop: 8, borderLeft: `3px solid ${getNode(selectedNode).color}` }}>
          <div style={{ color: getNode(selectedNode).color, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
            NODE PROPERTIES: {getNode(selectedNode).label}
          </div>
          {Object.entries(getNode(selectedNode).props).map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <span style={{ color: "#6e7681", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", minWidth: 80 }}>{k}:</span>
              <span style={{ color: "#c9d1d9", fontSize: 12 }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {selectedEdge && (() => {
        const edge = graphEdges.find(e => e.id === selectedEdge);
        return (
          <div style={{ animation: "fadeIn 0.3s ease", background: "#161b22", borderRadius: 10, padding: 16, marginTop: 8, borderLeft: "3px solid #c9a227" }}>
            <div style={{ color: "#c9a227", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>RELATIONSHIP</div>
            <div style={{ color: "#c9d1d9", fontSize: 13 }}>
              <span style={{ color: "#58a6ff" }}>{getNode(edge.from).label}</span>
              {" —["}<span style={{ color: "#e6d089" }}>{edge.label}</span>{"]→ "}
              <span style={{ color: "#58a6ff" }}>{getNode(edge.to).label}</span>
            </div>
          </div>
        );
      })()}

      <button onClick={() => setShowJoinComparison(!showJoinComparison)}
        style={{ marginTop: 16, background: "#1c2333", border: "1px solid #2d3548", borderRadius: 8, color: "#c9a227", padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
        <Eye size={14} /> {showJoinComparison ? "Hide" : "Show"} Relational Equivalent
      </button>

      {showJoinComparison && (
        <div style={{ animation: "fadeIn 0.3s ease", background: "#161b22", borderRadius: 10, padding: 16, marginTop: 12, borderLeft: "3px solid #f85149" }}>
          <div style={{ color: "#f85149", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
            RELATIONAL: 4+ JOIN TABLES NEEDED
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8b949e", lineHeight: 1.6 }}>
            <div>advertisers (id, name, industry, tier)</div>
            <div>campaigns (id, advertiser_id, name, budget, status)</div>
            <div>audiences (id, name, size, source)</div>
            <div style={{ color: "#f85149" }}>campaign_audiences (campaign_id, audience_id) ← join table</div>
            <div>platforms (id, name, api_version)</div>
            <div style={{ color: "#f85149" }}>campaign_platforms (campaign_id, platform_id) ← join table</div>
          </div>
          <div style={{ color: "#8b949e", fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
            Many-to-many relationships (campaigns share audiences, run on multiple platforms) require join tables in relational. In a graph, these are just edges — no extra tables.
          </div>
        </div>
      )}

      <div style={{ background: "#1a1a0e", borderRadius: 10, padding: 14, marginTop: 16, borderLeft: "3px solid #c9a227" }}>
        <div style={{ color: "#c9a227", fontSize: 11, fontWeight: 700, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>OPENAGENCY CONNECTION</div>
        <div style={{ color: "#e6d089", fontSize: 13, lineHeight: 1.5 }}>
          The relationships between advertisers, campaigns, audiences, conversion events, and platforms form a natural graph. When building cross-network attribution ("which audience on which platform drove this conversion?"), graph traversal is far more intuitive than chains of SQL JOINs.
        </div>
      </div>
    </div>
  );
}

// ─── Chapter 2 Content ───
const Ch2Content = {
  "2-0": {
    title: "Relational vs Document Model",
    concept: `Most applications today face a fundamental choice: how do you structure your data? The relational model (SQL, tables, rows, normalization) has dominated since the 1970s. The document model (JSON-like nested structures, schema flexibility) rose with NoSQL in the 2010s. Neither is universally better — the right choice depends on your data's relationship patterns.

The relational model shines when your data has many-to-many relationships. Normalization eliminates duplication: a company name lives in one row, and everything references it. The cost is JOINs — reads require assembling data from multiple tables.

The document model shines when your data is naturally hierarchical — a "self-contained" entity that you typically load all at once. A user profile with embedded job history, or a campaign with nested ad groups. No JOINs needed, and the schema can vary between documents.

The object-relational mismatch is the awkward translation layer between objects in your application code and rows in a relational database. ORMs help, but they can't fully hide the impedance mismatch. Document databases reduce this friction for hierarchical data, but create new problems when relationships between documents appear.`,
    diagram: DataModelComparison,
    quiz: [
      {
        question: "When does the document model start to break down compared to relational?",
        options: [
          "When documents get very large (over 1MB)",
          "When many-to-many relationships emerge between entities that were originally nested",
          "When you need to support more than 100 concurrent users",
          "When documents contain more than 10 fields",
        ],
        correct: 1,
        explanation: "Document models work beautifully for hierarchical data (one-to-many). But when entities develop many-to-many relationships — like shared audiences across campaigns — you end up either duplicating data (denormalization) or doing application-level joins, both of which negate the document model's advantages.",
      },
      {
        question: "What is the 'object-relational mismatch' that Kleppmann describes?",
        options: [
          "The performance gap between object databases and relational databases",
          "The translation layer needed between in-memory objects/structs and relational table rows",
          "The inability of SQL to represent object-oriented inheritance",
          "Conflicts when two ORM libraries are used in the same project",
        ],
        correct: 1,
        explanation: "Application code thinks in objects, structs, and nested data. Relational databases think in flat tables and foreign keys. The mismatch between these two representations requires a translation layer (often an ORM), which adds complexity and can become a source of subtle bugs.",
      },
      {
        question: "Why does normalization matter in the relational model?",
        options: [
          "It makes queries faster by reducing table sizes",
          "It eliminates data duplication so updates only need to change one place, preventing inconsistencies",
          "It's required by the SQL standard for all relational databases",
          "It automatically creates indexes on frequently queried columns",
        ],
        correct: 1,
        explanation: "Normalization means each fact lives in one place. If Acme Corp changes its name, you update one row in the companies table, not hundreds of embedded copies across campaign documents. This single-source-of-truth principle prevents write inconsistencies.",
      },
    ],
  },
  "2-1": {
    title: "Query Languages for Data",
    concept: `There are two fundamentally different ways to tell a computer what data you want: imperatively (give step-by-step instructions) or declaratively (describe the result you want and let the system figure out how to get it).

SQL is the canonical declarative language. You say "give me all campaigns with spend over $1000, sorted by spend" and the database optimizer decides whether to use an index, which order to process tables, whether to parallelize. If you add a new index tomorrow, your queries automatically get faster — no code changes.

Imperative code (like a JavaScript for-loop filtering an array) locks you into a specific execution strategy. The runtime can't optimize it because you've specified the HOW, not just the WHAT. This matters enormously at scale.

MapReduce sits in between — it's neither fully declarative nor fully imperative. You write map and reduce functions (imperative), but the framework handles distribution and parallelism (declarative-ish). It's powerful for batch processing but awkward for the kind of ad-hoc queries SQL handles elegantly.`,
    diagram: QueryLanguageComparison,
    quiz: [
      {
        question: "Why can a declarative query language be optimized more effectively than imperative code?",
        options: [
          "Declarative languages are compiled to machine code while imperative code is interpreted",
          "Because you only specify WHAT you want, the engine is free to choose the best HOW — including using indexes, parallelism, and reordering operations",
          "Declarative languages have access to more memory than imperative code",
          "Because SQL was designed by database researchers who understood optimization",
        ],
        correct: 1,
        explanation: "When you write a for-loop, you've committed to a specific execution strategy. With SQL, the database optimizer can evaluate multiple execution plans (index scan vs. full scan, different join orders, parallelism) and pick the fastest one. This separation of concerns — what vs. how — is the key insight.",
      },
      {
        question: "Where does MapReduce fall on the declarative-imperative spectrum?",
        options: [
          "Fully declarative, like SQL",
          "Fully imperative, like a for-loop",
          "A hybrid — you write imperative map/reduce functions, but the framework handles distribution declaratively",
          "Neither — it uses a completely different paradigm called functional programming",
        ],
        correct: 2,
        explanation: "MapReduce gives you imperative control over what each map and reduce function does, but the framework declaratively handles how the work is distributed across machines, how failures are retried, and how intermediate results are shuffled between stages.",
      },
    ],
  },
  "2-2": {
    title: "Graph-Like Data Models",
    concept: `When your data is dominated by many-to-many relationships and the connections between entities are as important as the entities themselves, a graph model is the most natural fit.

A property graph has two building blocks: vertices (nodes) with properties, and edges (relationships) with a label and properties. Unlike relational tables, graph models make traversing relationships first-class: "find all campaigns that share an audience with Campaign X" is a simple graph traversal, not a multi-JOIN SQL nightmare.

Cypher is the query language for property graphs (like SQL is for relational). It uses an expressive pattern-matching syntax: (campaign)-[:TARGETS]->(audience)<-[:TARGETS]-(other_campaign) reads almost like a sentence.

The graph model shines when relationship patterns are heterogeneous and you need to traverse varying depths. Social networks, recommendation engines, fraud detection, and ad attribution graphs all benefit from this model. But if your data is mostly tabular with predictable JOINs, relational remains simpler and more mature.`,
    diagram: GraphModelExplorer,
    quiz: [
      {
        question: "When is a graph data model clearly better than relational?",
        options: [
          "When you need ACID transactions",
          "When you have lots of many-to-many relationships with varying types and depths of connections",
          "When your data is mostly flat and tabular",
          "When you need strong schema enforcement",
        ],
        correct: 1,
        explanation: "Graph models excel when relationships are complex, heterogeneous, and you need to traverse unknown depths. In relational, each new relationship type requires a new join table, and traversing unknown depths requires recursive queries. In a graph, it's just following edges.",
      },
      {
        question: "What makes graph query languages like Cypher more natural than SQL for relationship-heavy data?",
        options: [
          "They execute faster than SQL in all cases",
          "They use pattern matching to express graph traversals — (A)-[:RELATES]->(B) — making relationship paths readable",
          "They don't require any schema definition",
          "They automatically distribute data across multiple servers",
        ],
        correct: 1,
        explanation: "Cypher's pattern-matching syntax maps directly to how you think about graph traversals. Expressing 'find all campaigns that share an audience' as a Cypher pattern is intuitive, while the equivalent SQL requires multiple JOINs through intermediary tables — obscuring the intent behind relational mechanics.",
      },
    ],
  },
};

// ─── Chapter 3 Diagrams ───

// 3-0: LSM-Tree vs B-Tree write path comparison
function StorageEngineComparison() {
  const [engine, setEngine] = useState("lsm");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  const lsmSteps = [
    { label: "Write arrives: append to in-memory memtable (red-black tree)", phase: "memtable", detail: "Sequential write — very fast, no disk I/O yet" },
    { label: "Memtable fills up → flush to disk as sorted SSTable", phase: "flush", detail: "Written sequentially — optimal disk throughput" },
    { label: "Multiple SSTables accumulate on disk", phase: "accumulate", detail: "Each SSTable is sorted, but they overlap in key ranges" },
    { label: "Background compaction merges SSTables", phase: "compact", detail: "Merge sort combines files, discards overwritten values" },
    { label: "Read path: check memtable → recent SSTables → older SSTables", phase: "read", detail: "Bloom filters skip SSTables that definitely don't have the key" },
  ];

  const btreeSteps = [
    { label: "Write arrives: find the correct leaf page in the B-tree", phase: "find", detail: "Navigate from root → internal nodes → leaf — O(log n) page reads" },
    { label: "First, write to WAL (write-ahead log) for crash recovery", phase: "wal", detail: "Append-only log ensures no data loss if crash happens mid-write" },
    { label: "Update the value in the leaf page (in-place)", phase: "update", detail: "Random I/O — must write to the specific page location on disk" },
    { label: "If page is full, split into two pages and update parent", phase: "split", detail: "Page splits cascade upward — can require multiple page writes" },
    { label: "Read path: traverse tree from root to leaf — O(log n)", phase: "read", detail: "Predictable read performance, data is always in one place" },
  ];

  const steps_ = engine === "lsm" ? lsmSteps : btreeSteps;

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep((s) => {
          if (s >= steps_.length - 1) { setPlaying(false); return s; }
          return s + 1;
        });
      }, 2500);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, steps_.length]);

  const cur = steps_[step];

  const LsmVisual = () => {
    const phases = ["memtable", "flush", "accumulate", "compact", "read"];
    const activeIdx = phases.indexOf(cur.phase);
    return (
      <svg viewBox="0 0 400 200" style={{ width: "100%", maxWidth: 480 }}>
        {/* Memtable */}
        <rect x={20} y={20} width={80} height={60} rx={8} fill={activeIdx === 0 ? "#1a2332" : "#161b22"} stroke={activeIdx === 0 ? "#c9a227" : "#2d3548"} strokeWidth={activeIdx === 0 ? 2 : 1} style={{ transition: "all 0.4s" }} />
        <text x={60} y={45} textAnchor="middle" fill={activeIdx === 0 ? "#e6d089" : "#6e7681"} fontSize={9} fontFamily="'JetBrains Mono', monospace">Memtable</text>
        <text x={60} y={60} textAnchor="middle" fill="#8b949e" fontSize={7} fontFamily="'JetBrains Mono', monospace">(in RAM)</text>

        {/* Arrow to SSTables */}
        <line x1={100} y1={50} x2={140} y2={50} stroke={activeIdx === 1 ? "#c9a227" : "#2d3548"} strokeWidth={activeIdx === 1 ? 2 : 1} markerEnd="url(#arrow)" style={{ transition: "all 0.4s" }} />
        {activeIdx === 1 && <text x={120} y={42} textAnchor="middle" fill="#e6d089" fontSize={7} fontFamily="'JetBrains Mono', monospace">flush</text>}

        {/* SSTables */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={150} y={15 + i * 28} width={70} height={22} rx={4} fill={activeIdx >= 2 ? "#0e2a1a" : "#161b22"} stroke={activeIdx >= 2 ? "#3fb950" : "#2d3548"} strokeWidth={1} style={{ transition: "all 0.4s" }} />
            <text x={185} y={30 + i * 28} textAnchor="middle" fill={activeIdx >= 2 ? "#afd9c0" : "#6e7681"} fontSize={8} fontFamily="'JetBrains Mono', monospace">SSTable L{i}</text>
          </g>
        ))}

        {/* Compaction arrow */}
        <line x1={220} y1={50} x2={270} y2={50} stroke={activeIdx === 3 ? "#c9a227" : "#2d3548"} strokeWidth={activeIdx === 3 ? 2 : 1} style={{ transition: "all 0.4s" }} />
        {activeIdx === 3 && <text x={245} y={42} textAnchor="middle" fill="#e6d089" fontSize={7} fontFamily="'JetBrains Mono', monospace">merge</text>}

        {/* Compacted */}
        <rect x={280} y={30} width={90} height={40} rx={8} fill={activeIdx >= 3 ? "#1a2332" : "#161b22"} stroke={activeIdx >= 3 ? "#58a6ff" : "#2d3548"} strokeWidth={activeIdx >= 3 ? 2 : 1} style={{ transition: "all 0.4s" }} />
        <text x={325} y={50} textAnchor="middle" fill={activeIdx >= 3 ? "#58a6ff" : "#6e7681"} fontSize={8} fontFamily="'JetBrains Mono', monospace">Compacted</text>
        <text x={325} y={62} textAnchor="middle" fill="#8b949e" fontSize={7} fontFamily="'JetBrains Mono', monospace">SSTable</text>

        {/* Read path */}
        {activeIdx === 4 && (
          <g>
            <line x1={60} y1={90} x2={60} y2={80} stroke="#d2a8ff" strokeWidth={1.5} strokeDasharray="3 3" />
            <line x1={60} y1={100} x2={185} y2={100} stroke="#d2a8ff" strokeWidth={1.5} strokeDasharray="3 3" />
            <line x1={185} y1={100} x2={185} y2={85} stroke="#d2a8ff" strokeWidth={1.5} strokeDasharray="3 3" />
            <line x1={185} y1={110} x2={325} y2={110} stroke="#d2a8ff" strokeWidth={1.5} strokeDasharray="3 3" />
            <line x1={325} y1={110} x2={325} y2={70} stroke="#d2a8ff" strokeWidth={1.5} strokeDasharray="3 3" />
            <text x={200} y={125} textAnchor="middle" fill="#d2a8ff" fontSize={8} fontFamily="'JetBrains Mono', monospace">read: check each level</text>
          </g>
        )}

        <defs><marker id="arrow" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto"><path d="M0,0 L6,3 L0,6" fill="#c9a227" /></marker></defs>
      </svg>
    );
  };

  const BTreeVisual = () => {
    const phases = ["find", "wal", "update", "split", "read"];
    const activeIdx = phases.indexOf(cur.phase);
    return (
      <svg viewBox="0 0 400 200" style={{ width: "100%", maxWidth: 480 }}>
        {/* WAL */}
        <rect x={10} y={140} width={60} height={30} rx={4} fill={activeIdx === 1 ? "#1a2332" : "#161b22"} stroke={activeIdx === 1 ? "#d29922" : "#2d3548"} strokeWidth={activeIdx === 1 ? 2 : 1} style={{ transition: "all 0.4s" }} />
        <text x={40} y={158} textAnchor="middle" fill={activeIdx === 1 ? "#d29922" : "#6e7681"} fontSize={8} fontFamily="'JetBrains Mono', monospace">WAL</text>

        {/* Root */}
        <rect x={160} y={10} width={80} height={30} rx={6} fill={activeIdx === 0 || activeIdx === 4 ? "#1a2332" : "#161b22"} stroke={activeIdx === 0 || activeIdx === 4 ? "#c9a227" : "#2d3548"} strokeWidth={(activeIdx === 0 || activeIdx === 4) ? 2 : 1} style={{ transition: "all 0.4s" }} />
        <text x={200} y={28} textAnchor="middle" fill={(activeIdx === 0 || activeIdx === 4) ? "#e6d089" : "#6e7681"} fontSize={8} fontFamily="'JetBrains Mono', monospace">Root [10|20|30]</text>

        {/* Internal nodes */}
        {[{ x: 80, label: "[5|8]" }, { x: 240, label: "[22|25]" }].map((n, i) => (
          <g key={i}>
            <line x1={200} y1={40} x2={n.x + 40} y2={75} stroke={(activeIdx === 0 || activeIdx === 4) ? "#c9a22760" : "#2d3548"} strokeWidth={1} style={{ transition: "all 0.4s" }} />
            <rect x={n.x} y={75} width={80} height={26} rx={6} fill={activeIdx === 0 || activeIdx === 4 ? "#161b22" : "#161b22"} stroke={(activeIdx === 0 || activeIdx === 4) ? "#c9a22760" : "#2d3548"} strokeWidth={1} style={{ transition: "all 0.4s" }} />
            <text x={n.x + 40} y={92} textAnchor="middle" fill="#6e7681" fontSize={8} fontFamily="'JetBrains Mono', monospace">{n.label}</text>
          </g>
        ))}

        {/* Leaf pages */}
        {[{ x: 40, label: "Page A" }, { x: 140, label: "Page B" }, { x: 240, label: "Page C" }, { x: 330, label: "Page D" }].map((n, i) => (
          <g key={i}>
            <line x1={i < 2 ? 120 : 280} y1={101} x2={n.x + 30} y2={120} stroke="#2d3548" strokeWidth={1} />
            <rect x={n.x} y={120} width={60} height={26} rx={4}
              fill={(activeIdx === 2 || activeIdx === 3) && i === 2 ? "#1a2332" : "#161b22"}
              stroke={(activeIdx === 2 || activeIdx === 3) && i === 2 ? "#3fb950" : "#2d3548"}
              strokeWidth={(activeIdx === 2 || activeIdx === 3) && i === 2 ? 2 : 1}
              style={{ transition: "all 0.4s" }} />
            <text x={n.x + 30} y={137} textAnchor="middle" fill={(activeIdx === 2 || activeIdx === 3) && i === 2 ? "#3fb950" : "#6e7681"} fontSize={8} fontFamily="'JetBrains Mono', monospace">{n.label}</text>
          </g>
        ))}

        {/* Update arrow */}
        {activeIdx === 2 && (
          <text x={270} y={115} fill="#3fb950" fontSize={7} fontFamily="'JetBrains Mono', monospace">← update in-place</text>
        )}
        {activeIdx === 3 && (
          <text x={265} y={115} fill="#d29922" fontSize={7} fontFamily="'JetBrains Mono', monospace">← split if full</text>
        )}
      </svg>
    );
  };

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 16 }}>
      <span style={{ color: "#c9a227", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
        STORAGE ENGINE WRITE PATHS
      </span>
      <p style={{ color: "#8b949e", fontSize: 13, marginTop: 8, marginBottom: 16 }}>
        Compare how LSM-trees and B-trees handle writes differently.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[
          { key: "lsm", label: "LSM-Tree", desc: "Log-structured, append-only" },
          { key: "btree", label: "B-Tree", desc: "Page-oriented, update-in-place" },
        ].map((opt) => (
          <button key={opt.key} onClick={() => { setEngine(opt.key); setStep(0); setPlaying(false); }}
            style={{
              flex: 1, background: engine === opt.key ? "#1a2332" : "#161b22",
              border: `1.5px solid ${engine === opt.key ? "#c9a227" : "#2d3548"}`,
              borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.3s",
            }}>
            <div style={{ color: engine === opt.key ? "#c9a227" : "#c9d1d9", fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
            <div style={{ color: "#6e7681", fontSize: 11, marginTop: 2 }}>{opt.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => { setStep(0); setPlaying(false); }}
          style={{ background: "#1c2333", border: "1px solid #2d3548", borderRadius: 6, color: "#8b949e", padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
          <RotateCcw size={12} /> Reset
        </button>
        <button onClick={() => setPlaying(!playing)}
          style={{ background: playing ? "#c9a227" : "#1c2333", border: "1px solid " + (playing ? "#c9a227" : "#2d3548"), borderRadius: 6, color: playing ? "#0d1117" : "#c9a227", padding: "4px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
          {playing ? <Pause size={12} /> : <Play size={12} />} {playing ? "Pause" : "Play"}
        </button>
      </div>

      <div style={{ background: "#161b22", borderRadius: 10, padding: 16, marginBottom: 12 }}>
        {engine === "lsm" ? <LsmVisual /> : <BTreeVisual />}
      </div>

      <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "8px 0" }}>
        {steps_.map((_, i) => (
          <button key={i} onClick={() => { setStep(i); setPlaying(false); }} style={{ width: 8, height: 8, borderRadius: "50%", background: i === step ? "#c9a227" : i < step ? "#4a4000" : "#2d3548", border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ color: "#e6d089", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{cur.label}</div>
        <div style={{ color: "#8b949e", fontSize: 11, marginTop: 4 }}>{cur.detail}</div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, background: engine === "lsm" ? "#0e2a1a" : "#161b22", borderRadius: 10, padding: 14, borderLeft: `3px solid ${engine === "lsm" ? "#3fb950" : "#2d3548"}`, transition: "all 0.3s" }}>
          <div style={{ color: "#3fb950", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>LSM-TREE STRENGTHS</div>
          <div style={{ color: "#afd9c0", fontSize: 12, lineHeight: 1.6 }}>
            Fast writes (sequential I/O), good compression, high write throughput. Ideal for write-heavy workloads.
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200, background: engine === "btree" ? "#0e2a1a" : "#161b22", borderRadius: 10, padding: 14, borderLeft: `3px solid ${engine === "btree" ? "#3fb950" : "#2d3548"}`, transition: "all 0.3s" }}>
          <div style={{ color: "#3fb950", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>B-TREE STRENGTHS</div>
          <div style={{ color: "#afd9c0", fontSize: 12, lineHeight: 1.6 }}>
            Predictable read latency, strong transaction support, mature and battle-tested. Data is always in exactly one place.
          </div>
        </div>
      </div>

      <div style={{ background: "#1a1a0e", borderRadius: 10, padding: 14, marginTop: 16, borderLeft: "3px solid #c9a227" }}>
        <div style={{ color: "#c9a227", fontSize: 11, fontWeight: 700, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>OPENAGENCY CONNECTION</div>
        <div style={{ color: "#e6d089", fontSize: 13, lineHeight: 1.5 }}>
          Campaign analytics (high-volume ad impression writes, range queries over time) favor LSM-tree engines like RocksDB or Cassandra. Transactional billing data (Stripe payment records, invoice state) favor B-tree-based Postgres where each record has one authoritative location and reads are predictable.
        </div>
      </div>
    </div>
  );
}

// 3-1: OLTP vs OLAP — Star Schema Explorer
function OltpOlapExplorer() {
  const [mode, setMode] = useState("oltp");
  const [selectedDim, setSelectedDim] = useState(null);

  const factTable = {
    name: "fact_ad_impressions",
    columns: ["impression_id", "campaign_id", "platform_id", "audience_id", "time_id", "geo_id", "impressions", "clicks", "spend_cents", "conversions"],
  };

  const dimensions = [
    { id: "campaign", name: "dim_campaign", fk: "campaign_id", columns: ["campaign_id", "name", "objective", "status", "advertiser_name"], color: "#3fb950" },
    { id: "platform", name: "dim_platform", fk: "platform_id", columns: ["platform_id", "name", "api_version", "ad_format_types"], color: "#58a6ff" },
    { id: "audience", name: "dim_audience", fk: "audience_id", columns: ["audience_id", "name", "size", "type", "source"], color: "#d2a8ff" },
    { id: "time", name: "dim_time", fk: "time_id", columns: ["time_id", "date", "day_of_week", "month", "quarter", "year"], color: "#d29922" },
    { id: "geo", name: "dim_geography", fk: "geo_id", columns: ["geo_id", "country", "region", "city", "timezone"], color: "#f85149" },
  ];

  const oltpSchema = [
    { name: "campaigns", cols: "id, name, status, budget, advertiser_id, created_at" },
    { name: "ad_groups", cols: "id, campaign_id, platform, targeting_json, bid" },
    { name: "ads", cols: "id, ad_group_id, headline, creative_url, status" },
    { name: "billing_events", cols: "id, campaign_id, amount, stripe_id, timestamp" },
    { name: "users", cols: "id, email, role, org_id, last_login" },
  ];

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 16 }}>
      <span style={{ color: "#c9a227", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
        OLTP vs OLAP SCHEMA EXPLORER
      </span>
      <p style={{ color: "#8b949e", fontSize: 13, marginTop: 8, marginBottom: 16 }}>
        Compare the operational database schema with the analytics warehouse.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { key: "oltp", label: "OLTP (Operational)", desc: "Small reads/writes, user-facing" },
          { key: "olap", label: "OLAP (Analytics)", desc: "Huge scans, analyst-facing" },
        ].map((opt) => (
          <button key={opt.key} onClick={() => { setMode(opt.key); setSelectedDim(null); }}
            style={{
              flex: 1, background: mode === opt.key ? "#1a2332" : "#161b22",
              border: `1.5px solid ${mode === opt.key ? "#c9a227" : "#2d3548"}`,
              borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.3s",
            }}>
            <div style={{ color: mode === opt.key ? "#c9a227" : "#c9d1d9", fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
            <div style={{ color: "#6e7681", fontSize: 11, marginTop: 2 }}>{opt.desc}</div>
          </button>
        ))}
      </div>

      {mode === "oltp" ? (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ color: "#8b949e", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>NORMALIZED OPERATIONAL TABLES</div>
          {oltpSchema.map((t) => (
            <div key={t.name} style={{ background: "#161b22", borderRadius: 6, padding: "8px 12px", marginBottom: 6, border: "1px solid #2d3548" }}>
              <span style={{ color: "#58a6ff", fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{t.name}</span>
              <span style={{ color: "#6e7681", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginLeft: 8 }}>({t.cols})</span>
            </div>
          ))}
          <div style={{ background: "#161b22", borderRadius: 8, padding: 12, borderLeft: "3px solid #58a6ff", marginTop: 12 }}>
            <div style={{ color: "#58a6ff", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>OLTP PATTERN</div>
            <div style={{ color: "#8b949e", fontSize: 12, lineHeight: 1.5 }}>
              Small number of rows per query, accessed by key. Optimized for low latency. Queries like: "Get campaign #42 with its ad groups" or "Insert a new billing event."
            </div>
          </div>
        </div>
      ) : (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ color: "#8b949e", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>STAR SCHEMA — CLICK DIMENSIONS TO EXPLORE</div>

          {/* Fact table */}
          <div style={{ background: "#c9a22715", borderRadius: 8, padding: 12, border: "1.5px solid #c9a227", marginBottom: 12 }}>
            <div style={{ color: "#c9a227", fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
              {factTable.name} (FACT TABLE)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {factTable.columns.map((col) => {
                const isDimKey = dimensions.some(d => d.fk === col);
                const dimColor = isDimKey ? dimensions.find(d => d.fk === col).color : null;
                return (
                  <span key={col} style={{
                    fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: "2px 6px", borderRadius: 3,
                    background: isDimKey ? dimColor + "20" : "#161b22",
                    color: isDimKey ? dimColor : "#8b949e",
                    border: isDimKey ? `1px solid ${dimColor}40` : "1px solid #2d3548",
                  }}>{col}</span>
                );
              })}
            </div>
          </div>

          {/* Dimension tables */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {dimensions.map((dim) => (
              <button key={dim.id} onClick={() => setSelectedDim(selectedDim === dim.id ? null : dim.id)}
                style={{
                  flex: "1 1 140px", background: selectedDim === dim.id ? dim.color + "15" : "#161b22",
                  border: `1.5px solid ${selectedDim === dim.id ? dim.color : "#2d3548"}`,
                  borderRadius: 8, padding: "8px 10px", cursor: "pointer", textAlign: "left", transition: "all 0.3s",
                }}>
                <div style={{ color: selectedDim === dim.id ? dim.color : "#8b949e", fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                  {dim.name}
                </div>
              </button>
            ))}
          </div>

          {selectedDim && (() => {
            const dim = dimensions.find(d => d.id === selectedDim);
            return (
              <div style={{ animation: "fadeIn 0.3s ease", background: "#161b22", borderRadius: 8, padding: 12, marginTop: 10, borderLeft: `3px solid ${dim.color}` }}>
                <div style={{ color: dim.color, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>{dim.name}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {dim.columns.map((col) => (
                    <span key={col} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: "2px 6px", borderRadius: 3, background: "#0d1117", color: "#c9d1d9" }}>{col}</span>
                  ))}
                </div>
              </div>
            );
          })()}

          <div style={{ background: "#161b22", borderRadius: 8, padding: 12, borderLeft: "3px solid #58a6ff", marginTop: 12 }}>
            <div style={{ color: "#58a6ff", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>OLAP PATTERN</div>
            <div style={{ color: "#8b949e", fontSize: 12, lineHeight: 1.5 }}>
              Scans millions of rows, aggregates columns. "Total spend by platform by month for Q4" touches millions of fact rows but only needs 3 columns. This is why column-oriented storage matters (next section).
            </div>
          </div>
        </div>
      )}

      <div style={{ background: "#1a1a0e", borderRadius: 10, padding: 14, marginTop: 16, borderLeft: "3px solid #c9a227" }}>
        <div style={{ color: "#c9a227", fontSize: 11, fontWeight: 700, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>OPENAGENCY CONNECTION</div>
        <div style={{ color: "#e6d089", fontSize: 13, lineHeight: 1.5 }}>
          OpenAgency needs both: OLTP for campaign CRUD, billing events, and user management (Postgres); OLAP for spend trends, cross-network ROI comparisons, and performance dashboards. An ETL pipeline copies data from the operational DB to an analytics warehouse — they serve fundamentally different access patterns.
        </div>
      </div>
    </div>
  );
}

// 3-2: Row vs Column Storage Visual
function ColumnStorageExplorer() {
  const [storage, setStorage] = useState("row");
  const [showQuery, setShowQuery] = useState(false);

  const sampleData = [
    { campaign: "Summer Sale", platform: "Meta", spend: 4200, impressions: 890000, clicks: 23400 },
    { campaign: "Holiday Push", platform: "Google", spend: 6100, impressions: 1200000, clicks: 31000 },
    { campaign: "Brand Boost", platform: "Meta", spend: 2800, impressions: 560000, clicks: 14200 },
    { campaign: "Q1 Retarget", platform: "TikTok", spend: 3400, impressions: 720000, clicks: 19800 },
    { campaign: "Spring Promo", platform: "Google", spend: 5500, impressions: 980000, clicks: 27600 },
  ];

  const columns = ["campaign", "platform", "spend", "impressions", "clicks"];
  const queryColumns = ["platform", "spend"]; // columns needed for our example query

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 16 }}>
      <span style={{ color: "#c9a227", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
        ROW vs COLUMN STORAGE
      </span>
      <p style={{ color: "#8b949e", fontSize: 13, marginTop: 8, marginBottom: 16 }}>
        See how the same data is stored differently — and why it matters for analytics queries.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[
          { key: "row", label: "Row-Oriented", desc: "Store entire rows together" },
          { key: "column", label: "Column-Oriented", desc: "Store each column separately" },
        ].map((opt) => (
          <button key={opt.key} onClick={() => setStorage(opt.key)}
            style={{
              flex: 1, background: storage === opt.key ? "#1a2332" : "#161b22",
              border: `1.5px solid ${storage === opt.key ? "#c9a227" : "#2d3548"}`,
              borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left", transition: "all 0.3s",
            }}>
            <div style={{ color: storage === opt.key ? "#c9a227" : "#c9d1d9", fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
            <div style={{ color: "#6e7681", fontSize: 11, marginTop: 2 }}>{opt.desc}</div>
          </button>
        ))}
      </div>

      <button onClick={() => setShowQuery(!showQuery)}
        style={{ marginBottom: 16, background: showQuery ? "#c9a227" : "#1c2333", border: "1px solid " + (showQuery ? "#c9a227" : "#2d3548"), borderRadius: 8, color: showQuery ? "#0d1117" : "#c9a227", padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
        {showQuery ? "Hide" : "Show"} Query: SUM(spend) WHERE platform = 'Meta'
      </button>

      <div style={{ background: "#161b22", borderRadius: 10, padding: 16, overflowX: "auto" }}>
        {storage === "row" ? (
          <div>
            <div style={{ color: "#8b949e", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
              DISK LAYOUT: rows stored contiguously
            </div>
            {sampleData.map((row, ri) => {
              const isMetaRow = row.platform === "Meta";
              return (
                <div key={ri} style={{
                  display: "flex", gap: 2, marginBottom: 3,
                  opacity: showQuery && !isMetaRow ? 0.3 : 1,
                  transition: "all 0.4s",
                }}>
                  {columns.map((col) => {
                    const isNeeded = showQuery && queryColumns.includes(col) && isMetaRow;
                    const isWasted = showQuery && !queryColumns.includes(col) && isMetaRow;
                    return (
                      <span key={col} style={{
                        fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: "3px 6px", borderRadius: 3,
                        background: isNeeded ? "#3fb95020" : isWasted ? "#f8514915" : "#0d1117",
                        color: isNeeded ? "#3fb950" : isWasted ? "#f8514980" : "#8b949e",
                        border: isNeeded ? "1px solid #3fb95040" : isWasted ? "1px solid #f8514930" : "1px solid #2d3548",
                        flex: 1, textAlign: "center", transition: "all 0.4s",
                      }}>
                        {String(row[col])}
                      </span>
                    );
                  })}
                </div>
              );
            })}
            {showQuery && (
              <div style={{ marginTop: 10, background: "#f8514918", borderRadius: 6, padding: 8, border: "1px solid #f8514930" }}>
                <span style={{ color: "#f85149", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                  Wasted I/O: must read ALL 5 columns for every row, even though query only needs 2
                </span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ color: "#8b949e", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
              DISK LAYOUT: each column stored separately
            </div>
            {columns.map((col) => {
              const isNeeded = showQuery && queryColumns.includes(col);
              return (
                <div key={col} style={{
                  display: "flex", gap: 2, marginBottom: 3, alignItems: "center",
                  opacity: showQuery && !isNeeded ? 0.3 : 1,
                  transition: "all 0.4s",
                }}>
                  <span style={{ color: isNeeded ? "#c9a227" : "#6e7681", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", width: 80, flexShrink: 0, textAlign: "right", paddingRight: 8 }}>
                    {col}:
                  </span>
                  <div style={{ display: "flex", gap: 2, flex: 1 }}>
                    {sampleData.map((row, ri) => (
                      <span key={ri} style={{
                        fontSize: 10, fontFamily: "'JetBrains Mono', monospace", padding: "3px 6px", borderRadius: 3,
                        background: isNeeded ? "#3fb95020" : "#0d1117",
                        color: isNeeded ? "#3fb950" : "#8b949e",
                        border: isNeeded ? "1px solid #3fb95040" : "1px solid #2d3548",
                        flex: 1, textAlign: "center", transition: "all 0.4s",
                      }}>
                        {String(row[col])}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
            {showQuery && (
              <div style={{ marginTop: 10, background: "#0e2a1a", borderRadius: 6, padding: 8, border: "1px solid #3fb95040" }}>
                <span style={{ color: "#3fb950", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                  Only reads 2 columns from disk — skips campaign, impressions, clicks entirely. 60% less I/O!
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ background: "#161b22", borderRadius: 10, padding: 14, marginTop: 12, borderLeft: "3px solid #58a6ff" }}>
        <div style={{ color: "#58a6ff", fontSize: 11, fontWeight: 700, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
          BONUS: COMPRESSION
        </div>
        <div style={{ color: "#8b949e", fontSize: 12, lineHeight: 1.5 }}>
          Column storage compresses dramatically because values in a column are the same type and often repetitive. The "platform" column has only 3 distinct values across millions of rows — bitmap encoding can represent it in bits, not bytes.
        </div>
      </div>

      <div style={{ background: "#1a1a0e", borderRadius: 10, padding: 14, marginTop: 12, borderLeft: "3px solid #c9a227" }}>
        <div style={{ color: "#c9a227", fontSize: 11, fontWeight: 700, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>OPENAGENCY CONNECTION</div>
        <div style={{ color: "#e6d089", fontSize: 13, lineHeight: 1.5 }}>
          When building the analytics and reporting layer, columnar storage (ClickHouse, DuckDB, or BigQuery) would massively speed up aggregation queries across millions of ad impressions. Queries like "total spend by platform by month" only touch 3 columns — columnar skips the other 97% of the data.
        </div>
      </div>
    </div>
  );
}

// ─── Chapter 3 Content ───
const Ch3Content = {
  "3-0": {
    title: "Data Structures That Power Your Database",
    concept: `At the heart of every database is a data structure that determines how writes and reads perform. The two dominant families are fundamentally different in their tradeoffs.

LSM-trees (Log-Structured Merge-trees) treat the disk as an append-only log. Writes go to an in-memory balanced tree (memtable), which periodically flushes to disk as a sorted file (SSTable). Background compaction merges these files. The result: extremely fast writes (sequential I/O is king), but reads may need to check multiple files. Bloom filters help skip files that don't contain the requested key.

B-trees are the traditional workhorse — used by nearly every relational database. They organize data in fixed-size pages, updating values in-place. A write-ahead log (WAL) ensures crash safety. Reads are predictable: traverse the tree from root to leaf in O(log n). But writes require random I/O to specific pages, and page splits can cascade.

The choice matters more than most people realize. LSM-trees typically have higher write throughput and better compression. B-trees offer more predictable read latency and simpler transaction support. Neither is universally better — it depends on your workload's read/write ratio.`,
    diagram: StorageEngineComparison,
    quiz: [
      {
        question: "Why do LSM-trees generally have higher write throughput than B-trees?",
        options: [
          "LSM-trees use more RAM for caching",
          "LSM-trees write sequentially (append-only), while B-trees require random I/O to update specific pages in place",
          "LSM-trees skip the write-ahead log step",
          "LSM-trees compress data before writing, reducing disk usage",
        ],
        correct: 1,
        explanation: "Sequential disk I/O is dramatically faster than random I/O (10x+ on HDDs, still significant on SSDs). LSM-trees batch writes in memory and flush them sequentially, while B-trees must find and update the correct page on disk for each write.",
      },
      {
        question: "What is 'write amplification' and which storage engine suffers more from it?",
        options: [
          "Writing too much data to logs — B-trees suffer more because of WAL",
          "A single write causing multiple physical disk writes — both suffer, but LSM-trees can be worse due to repeated compaction rewrites",
          "The delay between a write and when it's readable — LSM-trees suffer more",
          "Writing duplicate data across replicas — both suffer equally",
        ],
        correct: 1,
        explanation: "Write amplification means one logical write triggers multiple physical writes. In LSM-trees, data is written to the memtable, then to an SSTable, then rewritten during compaction (potentially multiple times). In B-trees, a write goes to the WAL plus the page. LSM-trees can have higher amplification due to compaction, but their sequential I/O often compensates.",
      },
      {
        question: "Why do B-trees offer more predictable read performance than LSM-trees?",
        options: [
          "B-trees use faster compression algorithms",
          "B-trees store each key in exactly one place, while LSM-trees may need to check multiple SSTables at different levels",
          "B-trees keep all data in memory while LSM-trees store data on disk",
          "B-trees use a simpler data format that's faster to parse",
        ],
        correct: 1,
        explanation: "In a B-tree, each key exists in exactly one leaf page — you traverse the tree and you're done. In an LSM-tree, a key might exist in the memtable, or any of several SSTables at different levels. Even with Bloom filters, reads may check multiple locations, making worst-case latency less predictable.",
      },
    ],
  },
  "3-1": {
    title: "Transaction Processing or Analytics?",
    concept: `Databases serve two fundamentally different access patterns, and trying to serve both with one system leads to painful compromises.

OLTP (Online Transaction Processing) serves your application's users. It does lots of small reads and writes, looks up records by key, and demands low latency. Think: "update campaign #42's budget" or "insert a new billing event." The data model is normalized, and queries touch a small number of rows.

OLAP (Online Analytical Processing) serves your analysts and dashboards. It runs huge aggregate queries that scan millions of rows, cares about throughput (not latency per query), and often reads only a few columns from very wide tables. Think: "total spend by platform by month for Q4 across all advertisers."

Data warehousing solves the conflict by maintaining a separate copy of the data optimized for analytics. An ETL (Extract, Transform, Load) pipeline copies data from the OLTP system, transforms it into a star or snowflake schema, and loads it into the warehouse. The star schema centers on a fact table (events/measurements) surrounded by dimension tables (who, what, where, when).`,
    diagram: OltpOlapExplorer,
    quiz: [
      {
        question: "Why is it problematic to run analytics queries directly on your OLTP database?",
        options: [
          "OLTP databases can't handle SQL queries with GROUP BY",
          "Analytics queries scan huge amounts of data, which competes for resources with user-facing operations and degrades application performance",
          "OLTP databases don't store enough historical data for analytics",
          "Analytics queries require a different programming language than OLTP queries",
        ],
        correct: 1,
        explanation: "An analytics query scanning millions of rows consumes disk I/O, CPU, and memory that your application needs for serving users. A single heavy analytics query can spike latency for every user-facing operation. Separating OLTP and OLAP into different systems isolates these workloads.",
      },
      {
        question: "What is the 'fact table' in a star schema, and why is it central?",
        options: [
          "A table of verified/validated data, separate from raw data",
          "The table containing individual events or measurements (each row = one thing that happened), with foreign keys to dimension tables that describe the context",
          "The largest table by column count, containing all business rules",
          "A denormalized table that combines all dimensions into a single wide row",
        ],
        correct: 1,
        explanation: "In an ad analytics warehouse, each row in the fact table might be one ad impression — with foreign keys to dimension tables for campaign, platform, audience, time, and geography. The fact table captures the 'what happened' while dimensions capture 'the context around it.'",
      },
    ],
  },
  "3-2": {
    title: "Column-Oriented Storage",
    concept: `Row-oriented storage (how most OLTP databases work) stores all values from one row together on disk. This is great for OLTP — when you load a campaign, you want all its fields at once. But for analytics queries that touch millions of rows but only need 2-3 columns, you're reading vast amounts of irrelevant data.

Column-oriented storage flips this: it stores all values from one column together. A query for "SUM(spend) WHERE platform = 'Meta'" reads only the spend and platform columns from disk, skipping campaign names, impressions, clicks, and everything else entirely.

The compression benefits are equally important. Values in a column are the same type and often repetitive — a "platform" column with only 5 distinct values across 100 million rows compresses spectacularly with bitmap encoding or run-length encoding. Row storage can't compress nearly as well because adjacent values in a row are different types.

Sort order in column storage adds another optimization. If rows are sorted by date, then by platform, range queries on recent dates for a specific platform touch minimal data. Materialized views and data cubes can pre-compute common aggregations, trading storage space for query speed.`,
    diagram: ColumnStorageExplorer,
    quiz: [
      {
        question: "Why is column-oriented storage so much better for analytics queries than row-oriented storage?",
        options: [
          "Column storage uses faster disks",
          "Analytics queries typically only need a few columns from very wide tables — column storage reads only those columns, while row storage must read entire rows",
          "Column storage supports more concurrent queries",
          "Column storage uses a more efficient query language",
        ],
        correct: 1,
        explanation: "An analytics fact table might have 100+ columns, but a typical query only needs 3-5 of them. With row storage, you read all 100 columns for every row (95%+ wasted I/O). With column storage, you read only the columns you need. On tables with billions of rows, this difference is massive.",
      },
      {
        question: "Why does column-oriented storage compress better than row-oriented storage?",
        options: [
          "Column storage uses more advanced compression algorithms",
          "Columns contain values of the same type that are often repetitive (e.g., 5 platform names across millions of rows), enabling techniques like bitmap and run-length encoding",
          "Column storage stores less data overall",
          "Row storage doesn't support compression at all",
        ],
        correct: 1,
        explanation: "A column of platform names might have only 5 distinct values across 100 million rows — perfect for bitmap encoding (one bit per row per distinct value). In row storage, adjacent values are different types (string, integer, timestamp), which prevents these specialized compression techniques.",
      },
    ],
  },
};

// ─── Chapter 4 Diagrams ───

// 4-0: Schema Evolution Simulator
function SchemaEvolutionSim() {
  const [version, setVersion] = useState(1);

  const versions = [
    {
      v: 1, label: "Version 1 — Initial Schema",
      fields: [
        { name: "campaign_id", type: "int32", tag: 1, status: "original" },
        { name: "name", type: "string", tag: 2, status: "original" },
        { name: "budget_cents", type: "int64", tag: 3, status: "original" },
        { name: "status", type: "enum", tag: 4, status: "original" },
      ],
      notes: "Initial schema. All readers and writers agree on this structure.",
    },
    {
      v: 2, label: "Version 2 — Add new field",
      fields: [
        { name: "campaign_id", type: "int32", tag: 1, status: "original" },
        { name: "name", type: "string", tag: 2, status: "original" },
        { name: "budget_cents", type: "int64", tag: 3, status: "original" },
        { name: "status", type: "enum", tag: 4, status: "original" },
        { name: "objective", type: "string", tag: 5, status: "added" },
      ],
      notes: "New optional field added. Old readers (v1) simply ignore tag 5 — forward compatible. New readers (v2) reading old data see objective as empty — backward compatible.",
    },
    {
      v: 3, label: "Version 3 — Remove a field",
      fields: [
        { name: "campaign_id", type: "int32", tag: 1, status: "original" },
        { name: "name", type: "string", tag: 2, status: "original" },
        { name: "budget_cents", type: "int64", tag: 3, status: "removed" },
        { name: "status", type: "enum", tag: 4, status: "original" },
        { name: "objective", type: "string", tag: 5, status: "original" },
        { name: "daily_budget", type: "int64", tag: 6, status: "added" },
      ],
      notes: "budget_cents removed (tag 3 retired — never reuse it!). daily_budget added as replacement. Old writers still send tag 3, which new readers ignore. New writers skip tag 3, which old readers handle as missing.",
    },
  ];

  const cur = versions[version - 1];

  const statusColors = { original: "#8b949e", added: "#3fb950", removed: "#f85149" };
  const statusLabels = { original: "", added: "NEW", removed: "REMOVED" };

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 16 }}>
      <span style={{ color: "#c9a227", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
        SCHEMA EVOLUTION SIMULATOR
      </span>
      <p style={{ color: "#8b949e", fontSize: 13, marginTop: 8, marginBottom: 16 }}>
        Step through schema versions to see how forward and backward compatibility works.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {versions.map((v) => (
          <button key={v.v} onClick={() => setVersion(v.v)}
            style={{
              flex: 1, background: version === v.v ? "#1a2332" : "#161b22",
              border: `1.5px solid ${version === v.v ? "#c9a227" : "#2d3548"}`,
              borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "center", transition: "all 0.3s",
            }}>
            <div style={{ color: version === v.v ? "#c9a227" : "#c9d1d9", fontSize: 14, fontWeight: 700 }}>v{v.v}</div>
          </button>
        ))}
      </div>

      <div style={{ color: "#e6d089", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>
        {cur.label}
      </div>

      <div style={{ background: "#161b22", borderRadius: 10, padding: 16, marginBottom: 12 }}>
        <div style={{ color: "#8b949e", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
          message Campaign {"{"}
        </div>
        {cur.fields.map((f) => (
          <div key={f.tag + f.name} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", marginBottom: 2, borderRadius: 4,
            background: f.status === "added" ? "#3fb95010" : f.status === "removed" ? "#f8514910" : "transparent",
            textDecoration: f.status === "removed" ? "line-through" : "none",
            opacity: f.status === "removed" ? 0.6 : 1,
            animation: f.status !== "original" ? "fadeIn 0.3s ease" : "none",
          }}>
            <span style={{ color: "#6e7681", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", width: 50 }}>{f.type}</span>
            <span style={{ color: statusColors[f.status], fontSize: 12, fontFamily: "'JetBrains Mono', monospace", flex: 1 }}>{f.name}</span>
            <span style={{ color: "#6e7681", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>= {f.tag};</span>
            {statusLabels[f.status] && (
              <span style={{ color: statusColors[f.status], fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", background: statusColors[f.status] + "20", padding: "1px 5px", borderRadius: 3 }}>
                {statusLabels[f.status]}
              </span>
            )}
          </div>
        ))}
        <div style={{ color: "#8b949e", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", marginTop: 6 }}>{"}"}</div>
      </div>

      <div style={{ background: "#161b22", borderRadius: 10, padding: 14, borderLeft: "3px solid #58a6ff", marginBottom: 12 }}>
        <div style={{ color: "#58a6ff", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>COMPATIBILITY</div>
        <div style={{ color: "#8b949e", fontSize: 12, lineHeight: 1.6 }}>{cur.notes}</div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180, background: "#0e2a1a", borderRadius: 10, padding: 12, borderLeft: "3px solid #3fb950" }}>
          <div style={{ color: "#3fb950", fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>SAFE CHANGES</div>
          <div style={{ color: "#afd9c0", fontSize: 11, lineHeight: 1.5 }}>Add optional fields, remove optional fields (retire the tag number)</div>
        </div>
        <div style={{ flex: 1, minWidth: 180, background: "#2a0e0e", borderRadius: 10, padding: 12, borderLeft: "3px solid #f85149" }}>
          <div style={{ color: "#f85149", fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>UNSAFE CHANGES</div>
          <div style={{ color: "#f8a0a0", fontSize: 11, lineHeight: 1.5 }}>Change field type, reuse old tag numbers, remove required fields</div>
        </div>
      </div>

      <div style={{ background: "#1a1a0e", borderRadius: 10, padding: 14, marginTop: 16, borderLeft: "3px solid #c9a227" }}>
        <div style={{ color: "#c9a227", fontSize: 11, fontWeight: 700, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>OPENAGENCY CONNECTION</div>
        <div style={{ color: "#e6d089", fontSize: 13, lineHeight: 1.5 }}>
          Ad network APIs evolve independently — Meta adds new fields, Google deprecates old ones, TikTok changes types. Your internal data model needs tagged binary encoding (Protobuf/Avro) so that a 2024 API response can be read by your 2026 code without crashing.
        </div>
      </div>
    </div>
  );
}

// 4-1: Three Dataflow Paths
function DataflowPathsDiagram() {
  const [path, setPath] = useState("database");

  const paths = {
    database: {
      label: "Through Database",
      desc: "Writer encodes → Database stores → Reader decodes (potentially years later)",
      icon: "🗄️",
      color: "#58a6ff",
      steps: [
        { id: "writer", label: "Writer\nService", x: 30, y: 60 },
        { id: "db", label: "Database", x: 160, y: 60 },
        { id: "reader", label: "Reader\nService", x: 290, y: 60 },
      ],
      edges: [
        { from: "writer", to: "db", label: "encode\n& write" },
        { from: "db", to: "reader", label: "read &\ndecode" },
      ],
      insight: "The database is the intermediary. The writer and reader might be different versions of the same service, separated by months of deployments. Schema compatibility ensures old data remains readable by new code.",
      oaDetail: "When OpenAgency adds a new campaign field, old campaign records in Postgres must still be readable. Database schema migrations must be backward compatible — you can't break reads of existing data.",
    },
    service: {
      label: "Through Services (API)",
      desc: "Client encodes request → Service processes → Service encodes response",
      icon: "🌐",
      color: "#3fb950",
      steps: [
        { id: "client", label: "Campaign\nManager", x: 30, y: 60 },
        { id: "api", label: "REST /\nRPC API", x: 160, y: 60 },
        { id: "server", label: "Ad Network\nService", x: 290, y: 60 },
      ],
      edges: [
        { from: "client", to: "api", label: "request\n(encode)" },
        { from: "api", to: "server", label: "response\n(encode)" },
      ],
      insight: "Both client and server must agree on the encoding. REST uses JSON (human-readable, but verbose). RPC frameworks like gRPC use binary encoding (Protobuf) for efficiency. API versioning is how you handle evolution.",
      oaDetail: "OpenAgency calls 10+ ad network REST APIs, each with their own encoding and versioning. Internally, gRPC between microservices gives type safety and efficient encoding. The encoding boundary is where compatibility matters most.",
    },
    message: {
      label: "Through Message Queue",
      desc: "Producer encodes → Broker stores → Consumer decodes (async, decoupled)",
      icon: "📬",
      color: "#d2a8ff",
      steps: [
        { id: "producer", label: "Campaign\nUpdater", x: 30, y: 60 },
        { id: "broker", label: "Message\nBroker", x: 160, y: 60 },
        { id: "consumer", label: "Sync\nWorker", x: 290, y: 60 },
      ],
      edges: [
        { from: "producer", to: "broker", label: "publish\n(encode)" },
        { from: "broker", to: "consumer", label: "consume\n(decode)" },
      ],
      insight: "The producer and consumer are fully decoupled — they don't even need to be running at the same time. The broker holds messages until consumers are ready. This is inherently asynchronous and supports schema evolution naturally.",
      oaDetail: "Temporal workflows in OpenAgency are message-passing dataflow. When a campaign update is queued, the sync worker might be a different version than the service that queued it. Temporal's serialization handles this, but you need to think about payload compatibility.",
    },
  };

  const cur = paths[path];

  return (
    <div style={{ background: "#0d1117", borderRadius: 12, padding: 24, marginTop: 16, marginBottom: 16 }}>
      <span style={{ color: "#c9a227", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }}>
        THREE DATAFLOW PATHS
      </span>
      <p style={{ color: "#8b949e", fontSize: 13, marginTop: 8, marginBottom: 16 }}>
        The same campaign update can flow through three different paths — each with different encoding boundaries.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(paths).map(([key, p]) => (
          <button key={key} onClick={() => setPath(key)}
            style={{
              flex: 1, minWidth: 100, background: path === key ? p.color + "15" : "#161b22",
              border: `1.5px solid ${path === key ? p.color : "#2d3548"}`,
              borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "center", transition: "all 0.3s",
            }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{p.icon}</div>
            <div style={{ color: path === key ? p.color : "#c9d1d9", fontSize: 11, fontWeight: 600 }}>{p.label}</div>
          </button>
        ))}
      </div>

      <div style={{ background: "#161b22", borderRadius: 10, padding: 16, marginBottom: 12 }}>
        <svg viewBox="0 0 380 140" style={{ width: "100%", maxWidth: 500 }}>
          {cur.edges.map((e, i) => {
            const from = cur.steps.find(s => s.id === e.from);
            const to = cur.steps.find(s => s.id === e.to);
            return (
              <g key={i}>
                <line x1={from.x + 50} y1={from.y + 20} x2={to.x} y2={to.y + 20}
                  stroke={cur.color} strokeWidth={2} markerEnd="url(#arrowDF)" />
                <text x={(from.x + 50 + to.x) / 2} y={from.y + 8} textAnchor="middle" fill="#e6d089" fontSize={8} fontFamily="'JetBrains Mono', monospace">
                  {e.label.split('\n').map((line, li) => (
                    <tspan key={li} x={(from.x + 50 + to.x) / 2} dy={li === 0 ? 0 : 11}>{line}</tspan>
                  ))}
                </text>
              </g>
            );
          })}
          {cur.steps.map((s) => (
            <g key={s.id}>
              <rect x={s.x} y={s.y} width={80} height={50} rx={8} fill="#1a2332" stroke={cur.color} strokeWidth={1.5} />
              <text x={s.x + 40} y={s.y + 22} textAnchor="middle" fill={cur.color} fontSize={9} fontFamily="'JetBrains Mono', monospace" fontWeight={600}>
                {s.label.split('\n').map((line, li) => (
                  <tspan key={li} x={s.x + 40} dy={li === 0 ? 0 : 12}>{line}</tspan>
                ))}
              </text>
            </g>
          ))}
          <defs><marker id="arrowDF" markerWidth={8} markerHeight={8} refX={7} refY={4} orient="auto"><path d="M0,0 L8,4 L0,8" fill={cur.color} /></marker></defs>
        </svg>
        <div style={{ color: "#8b949e", fontSize: 12, marginTop: 8, lineHeight: 1.5, textAlign: "center" }}>{cur.desc}</div>
      </div>

      <div style={{ background: "#161b22", borderRadius: 10, padding: 14, borderLeft: `3px solid ${cur.color}`, marginBottom: 12 }}>
        <div style={{ color: cur.color, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>KEY INSIGHT</div>
        <div style={{ color: "#c9d1d9", fontSize: 12, lineHeight: 1.6 }}>{cur.insight}</div>
      </div>

      <div style={{ background: "#1a1a0e", borderRadius: 10, padding: 14, borderLeft: "3px solid #c9a227" }}>
        <div style={{ color: "#c9a227", fontSize: 11, fontWeight: 700, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>OPENAGENCY CONNECTION</div>
        <div style={{ color: "#e6d089", fontSize: 13, lineHeight: 1.5 }}>{cur.oaDetail}</div>
      </div>
    </div>
  );
}

// ─── Chapter 4 Content ───
const Ch4Content = {
  "4-0": {
    title: "Formats for Encoding Data",
    concept: `Every time data crosses a boundary — written to disk, sent over the network, passed between services — it must be encoded (serialized) from in-memory objects to a byte sequence, then decoded (deserialized) back. The format you choose has profound implications for performance, compatibility, and evolution.

Language-specific serialization (Java's Serializable, Python's pickle) is convenient but terrible: it ties you to one language, often has security issues, and handles schema evolution poorly. JSON and XML are human-readable and ubiquitous but verbose, ambiguous about number types, and don't support binary data well.

Schema-based binary formats — Protocol Buffers, Thrift, and Avro — solve these problems. They use a schema definition to encode data compactly (no field names in the byte stream, just tag numbers) and handle evolution through explicit rules: new fields get new tag numbers, old fields can be deprecated but their tags are never reused. This gives you both forward compatibility (old code can read new data by ignoring unknown tags) and backward compatibility (new code can read old data by using defaults for missing fields).

The key insight: schemas aren't just documentation — they're a machine-readable contract that enables safe evolution. When your system needs to handle data written months or years ago, this contract is what prevents everything from breaking.`,
    diagram: SchemaEvolutionSim,
    quiz: [
      {
        question: "What does 'forward compatibility' mean in the context of data encoding?",
        options: [
          "New code can read data written by old code",
          "Old code can read data written by new code (by ignoring unknown fields)",
          "Data can be converted forward from one format to another",
          "The encoding format supports future programming languages",
        ],
        correct: 1,
        explanation: "Forward compatibility means old code encountering data from a newer schema version doesn't crash — it simply ignores fields it doesn't recognize. This is critical during rolling deployments, where old and new code versions run simultaneously.",
      },
      {
        question: "Why is reusing a deleted field's tag number dangerous in Protocol Buffers?",
        options: [
          "It wastes memory in the compiled schema",
          "Old data still contains that tag number — readers would misinterpret old field values as the new field, corrupting data silently",
          "The Protobuf compiler will throw an error",
          "It makes the binary encoding larger",
        ],
        correct: 1,
        explanation: "Tag numbers are the identity of fields in the binary encoding. If you delete field 3 (budget_cents) and later add a new field 3 (daily_limit), old records with the original budget_cents value would be decoded as daily_limit values — silent data corruption, the worst kind of bug.",
      },
      {
        question: "Why are schema-based binary formats (Protobuf, Avro) preferred over JSON for service-to-service communication?",
        options: [
          "JSON is not supported by most programming languages",
          "Binary formats are more compact, enforce a schema contract, and handle evolution explicitly — JSON is schema-less, verbose, and ambiguous about number types",
          "JSON cannot represent nested data structures",
          "Binary formats are easier to debug than JSON",
        ],
        correct: 1,
        explanation: "JSON is great for human-readable APIs but has real problems at scale: no schema enforcement (bugs slip through), number precision issues (JavaScript's 53-bit integers), verbose encoding (field names repeated in every record), and no built-in evolution rules. Binary formats trade human readability for compactness, type safety, and explicit compatibility guarantees.",
      },
    ],
  },
  "4-1": {
    title: "Modes of Dataflow",
    concept: `Data doesn't just sit in one place — it flows between processes, services, and systems. There are three fundamental modes of dataflow, and each creates different encoding boundaries where compatibility matters.

Dataflow through databases: a writer encodes data and stores it; a reader decodes it later — possibly years later, possibly a different version of the application. The database is a time-travel machine: your current code must read data written by every past version. Schema migrations must be backward compatible, and ideally forward compatible too (so you can roll back a deployment without losing data).

Dataflow through services: REST and RPC are synchronous request-response patterns. REST (typically JSON over HTTP) is the lingua franca of web APIs — simple, widely supported, but verbose. RPC frameworks (gRPC, Thrift) offer binary efficiency and strong typing but add complexity. The key tradeoff: REST prioritizes interoperability; RPC prioritizes performance and type safety.

Message-passing dataflow: producers send messages to a broker (Kafka, RabbitMQ), consumers read them asynchronously. This decouples senders from receivers in time and space — the producer doesn't need to know who will consume the message or when. It naturally supports schema evolution because you can upgrade consumers independently of producers.`,
    diagram: DataflowPathsDiagram,
    quiz: [
      {
        question: "Why does dataflow through databases create the most challenging compatibility requirements?",
        options: [
          "Databases are slower than other dataflow methods",
          "Database data persists for years — current code must read data written by every past version of the application, creating a long compatibility window",
          "Databases don't support binary encoding formats",
          "Database queries are harder to write than API calls",
        ],
        correct: 1,
        explanation: "With services, you typically only need compatibility between adjacent versions (during a rolling deploy). With databases, data written 3 years ago by a long-gone code version must still be readable today. This long time horizon makes database schema evolution the hardest compatibility problem.",
      },
      {
        question: "What is the fundamental advantage of message-passing dataflow over direct service calls?",
        options: [
          "Messages are encrypted by default, making them more secure",
          "The sender and receiver are decoupled — the sender doesn't need to know who will consume the message or when, enabling independent evolution and resilience to receiver downtime",
          "Message brokers are always faster than REST APIs",
          "Message passing doesn't require any encoding or serialization",
        ],
        correct: 1,
        explanation: "Decoupling is the key benefit. If a service is down, messages queue up and are processed when it recovers — no failed requests. Producers and consumers can be deployed, scaled, and evolved independently. This temporal decoupling is why systems like Kafka and Temporal are so powerful for workflow orchestration.",
      },
    ],
  },
};

// ─── Main App ───
export default function DDIAApp() {
  const [activeSection, setActiveSection] = useState("1-0");
  const [expandedChapters, setExpandedChapters] = useState({ 1: true });
  const [progress, setProgress] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const activeSectionRef = useRef(null);

  // Responsive sidebar
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scroll sidebar to active section
  useEffect(() => {
    if (activeSectionRef.current) {
      activeSectionRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeSection]);

  // Load progress from storage
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("ddia-progress");
        if (result) setProgress(JSON.parse(result.value));
      } catch (e) { /* first load */ }
    })();
  }, []);

  // Save progress
  const saveProgress = useCallback(async (newProgress) => {
    setProgress(newProgress);
    try {
      await window.storage.set("ddia-progress", JSON.stringify(newProgress));
    } catch (e) { console.error("Storage error:", e); }
  }, []);

  const markStudied = (sectionId, quality) => {
    const prev = progress[sectionId] || { repetitions: 0, interval: 1, easeFactor: 2.5 };
    const next = SM2.getNextReview(quality, prev.repetitions, prev.easeFactor, prev.interval);
    const newProgress = {
      ...progress,
      [sectionId]: { ...next, lastReview: new Date().toISOString(), quality },
    };
    saveProgress(newProgress);
  };

  const getDueReviews = () => {
    return Object.entries(progress)
      .filter(([_, data]) => SM2.isDue(data.lastReview, data.interval))
      .map(([id]) => id);
  };

  const toggleChapter = (num) => {
    setExpandedChapters((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const ALL_CONTENT = { ...Ch1Content, ...Ch2Content, ...Ch3Content, ...Ch4Content };
  const content = ALL_CONTENT[activeSection];
  const dueReviews = getDueReviews();

  const getStatusIcon = (sectionId) => {
    const p = progress[sectionId];
    if (!p) return null;
    if (SM2.isDue(p.lastReview, p.interval)) return <Clock size={12} color="#d29922" />;
    if (p.quality >= 4) return <CheckCircle2 size={12} color="#3fb950" />;
    return <Eye size={12} color="#58a6ff" />;
  };

  return (
    <div style={{
      fontFamily: "'Nunito Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#0a0e14", color: "#c9d1d9", minHeight: "100vh", display: "flex",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Nunito+Sans:wght@300;400;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2d3548; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #3d4560; }
        input[type="range"] { height: 4px; }
      `}</style>

      {/* Mobile toggle */}
      {isMobile && (
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "fixed", top: 12, left: 12, zIndex: 1000, background: "#161b22", border: "1px solid #2d3548",
            borderRadius: 8, padding: 8, cursor: "pointer", color: "#c9d1d9", display: "flex",
          }}>
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      )}

      {/* Sidebar */}
      <nav style={{
        width: 300, minWidth: 300, background: "#0d1117", borderRight: "1px solid #1c2333",
        overflowY: "auto", height: "100vh", position: isMobile ? "fixed" : "sticky", top: 0,
        zIndex: isMobile ? 999 : "auto",
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
      }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #1c2333" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <BookOpen size={18} color="#c9a227" />
            <span style={{ color: "#e6edf3", fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>DDIA</span>
          </div>
          <div style={{ color: "#6e7681", fontSize: 11, lineHeight: 1.4 }}>Designing Data-Intensive Applications</div>

          {dueReviews.length > 0 && (
            <button onClick={() => { setShowReviewPanel(true); setActiveSection(dueReviews[0]); }}
              style={{
                marginTop: 12, width: "100%", background: "#d2992218", border: "1px solid #d2992240",
                borderRadius: 8, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              }}>
              <Brain size={14} color="#d29922" />
              <span style={{ color: "#d29922", fontSize: 12, fontWeight: 600 }}>
                {dueReviews.length} section{dueReviews.length > 1 ? "s" : ""} due for review
              </span>
            </button>
          )}
        </div>

        <div style={{ padding: "8px 0" }}>
          {TOC.map((part) => (
            <div key={part.part}>
              <div style={{ padding: "12px 16px 6px", color: "#6e7681", fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
                PART {part.part} — {part.title.toUpperCase()}
              </div>
              {part.chapters.map((ch) => (
                <div key={ch.num}>
                  <button onClick={() => toggleChapter(ch.num)}
                    style={{
                      width: "100%", background: "transparent", border: "none", padding: "8px 16px",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textAlign: "left",
                    }}>
                    {expandedChapters[ch.num] ? <ChevronDown size={13} color="#6e7681" /> : <ChevronRight size={13} color="#6e7681" />}
                    <span style={{ color: ch.ready ? "#c9d1d9" : "#484f58", fontSize: 13, fontWeight: 600, flex: 1 }}>
                      {ch.num}. {ch.title}
                    </span>
                    {!ch.ready && <span style={{ color: "#484f58", fontSize: 9, fontFamily: "'JetBrains Mono', monospace", background: "#161b22", padding: "2px 6px", borderRadius: 4 }}>SOON</span>}
                  </button>
                  {expandedChapters[ch.num] && (
                    <div>
                      {ch.sections.map((sec) => (
                        <button key={sec.id} ref={activeSection === sec.id ? activeSectionRef : null} onClick={() => { if (ch.ready) { setActiveSection(sec.id); setShowReviewPanel(false); if (isMobile) setSidebarOpen(false); } }}
                          style={{
                            width: "100%", background: activeSection === sec.id ? "#c9a22712" : "transparent",
                            border: "none", borderLeft: activeSection === sec.id ? "2px solid #c9a227" : "2px solid transparent",
                            padding: "6px 16px 6px 42px", cursor: ch.ready ? "pointer" : "default",
                            display: "flex", alignItems: "center", gap: 6, textAlign: "left",
                          }}>
                          <span style={{ color: activeSection === sec.id ? "#c9a227" : ch.ready ? "#8b949e" : "#3d4250", fontSize: 12, flex: 1, lineHeight: 1.4 }}>
                            {sec.title}
                          </span>
                          {getStatusIcon(sec.id)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "32px 40px", maxWidth: 780, overflowY: "auto" }}>
        {content ? (
          <div style={{ animation: "fadeIn 0.4s ease" }} key={activeSection}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "#6e7681", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                CHAPTER {activeSection.split("-")[0]} — SECTION {parseInt(activeSection.split("-")[1]) + 1}
              </div>
              <h1 style={{ color: "#e6edf3", fontSize: 26, fontWeight: 800, lineHeight: 1.3, margin: 0 }}>
                {content.title}
              </h1>
            </div>

            {/* Core Concept */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "#c9a227", fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
                CORE KNOWLEDGE
              </div>
              {content.concept.split("\n\n").map((para, i) => (
                <p key={i} style={{ color: "#b1bac4", fontSize: 14, lineHeight: 1.75, marginBottom: 14 }}>
                  {para}
                </p>
              ))}
            </div>

            {/* Interactive Diagram */}
            {content.diagram && (
              <DiagramErrorBoundary key={activeSection + "-diagram"}>
                <content.diagram />
              </DiagramErrorBoundary>
            )}

            {/* Quiz */}
            {content.quiz && (
              <Quiz
                questions={content.quiz}
                sectionId={activeSection}
                onComplete={(score) => {
                  const pct = score / content.quiz.length;
                  const quality = pct >= 0.8 ? 5 : pct >= 0.6 ? 4 : pct >= 0.4 ? 3 : 2;
                  markStudied(activeSection, quality);
                }}
              />
            )}

            {/* Mark as studied */}
            <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap", paddingBottom: 40 }}>
              {progress[activeSection] && (
                <div style={{ color: "#6e7681", fontSize: 12, display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                  <Clock size={12} />
                  Next review: {(() => {
                    const d = new Date(progress[activeSection].lastReview);
                    d.setDate(d.getDate() + progress[activeSection].interval);
                    const days = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
                    return days <= 0 ? "Due now" : `in ${days} day${days > 1 ? "s" : ""}`;
                  })()}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { q: 2, label: "Struggled", color: "#f85149" },
                  { q: 3, label: "Okay", color: "#d29922" },
                  { q: 5, label: "Got It", color: "#3fb950" },
                ].map((btn) => (
                  <button key={btn.q} onClick={() => markStudied(activeSection, btn.q)}
                    style={{
                      background: "#161b22", border: `1px solid ${btn.color}40`, borderRadius: 8,
                      color: btn.color, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                    }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
            <h2 style={{ color: "#e6edf3", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Coming Soon</h2>
            <p style={{ color: "#6e7681", fontSize: 14, maxWidth: 400, lineHeight: 1.6 }}>
              This section's interactive content is being built. Navigate to Chapter 1 sections to explore the completed material.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
