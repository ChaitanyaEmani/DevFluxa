"use client"

import { useState, useCallback, useRef, useEffect } from "react";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { CopyButton } from "@/components/ui/CopyButton";
import { Download } from "@/components/ui/Download";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";

// ─── Types ────────────────────────────────────────────────────────────────────

type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };

interface JsonStats {
  totalKeys: number;
  maxDepth: number;
  arrayCount: number;
  objectCount: number;
  stringCount: number;
  numberCount: number;
  booleanCount: number;
  nullCount: number;
}

interface TreeNode {
  key: string | number;
  value: JsonValue;
  path: string;
  depth: number;
  type: string;
  isLast: boolean;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function computeStats(obj: JsonValue, path = "", depth = 0, stats: JsonStats = {
  totalKeys: 0, maxDepth: 0, arrayCount: 0, objectCount: 0,
  stringCount: 0, numberCount: 0, booleanCount: 0, nullCount: 0
}): JsonStats {
  stats.maxDepth = Math.max(stats.maxDepth, depth);

  if (Array.isArray(obj)) {
    stats.arrayCount++;
    obj.forEach((item, i) => computeStats(item, `${path}[${i}]`, depth + 1, stats));
  } else if (obj !== null && typeof obj === "object") {
    stats.objectCount++;
    const keys = Object.keys(obj as JsonObject);
    keys.forEach((key) => {
      stats.totalKeys++;
      computeStats((obj as JsonObject)[key], `${path}.${key}`, depth + 1, stats);
    });
  } else if (typeof obj === "string") stats.stringCount++;
  else if (typeof obj === "number") stats.numberCount++;
  else if (typeof obj === "boolean") stats.booleanCount++;
  else if (obj === null) stats.nullCount++;

  return stats;
}

// ─── Syntax Highlighting ──────────────────────────────────────────────────────

function SyntaxHighlightedJson({ json }: { json: string }) {
  const highlighted = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("((?:[^"\\]|\\.)*)")\s*:/g,
      (_, full) => `<span class="json-key">${full}</span>:`
    )
    .replace(
      /:\s*("(?:[^"\\]|\\\\)*")/g,
      (_, val) => `: <span class="json-string">${val}</span>`
    )
    .replace(/:\s*(-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g, `: <span class="json-number">$1</span>`)
    .replace(/:\s*(true|false)/g, `: <span class="json-boolean">$1</span>`)
    .replace(/:\s*(null)/g, `: <span class="json-null">$1</span>`);

  return (
    <div
      className="w-full h-full font-mono text-sm leading-relaxed p-4 overflow-auto whitespace-pre syntax-output"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

// ─── Tree View ────────────────────────────────────────────────────────────────

function TreeNodeRow({
  nodeKey, value, depth, isLast
}: {
  nodeKey: string | number;
  value: JsonValue;
  depth: number;
  isLast: boolean;
}) {
  const [collapsed, setCollapsed] = useState(depth >= 2);
  const isObj = value !== null && typeof value === "object";
  const isArr = Array.isArray(value);
  const entries = isObj ? (isArr ? (value as JsonValue[]) : Object.entries(value as JsonObject)) : null;

  const typeColor = () => {
    if (isArr) return "text-blue-500";
    if (isObj) return "text-purple-500";
    if (typeof value === "string") return "text-green-600 dark:text-green-400";
    if (typeof value === "number") return "text-orange-500";
    if (typeof value === "boolean") return "text-pink-500";
    return "text-gray-400";
  };

  const renderValue = () => {
    if (isArr) return <span className="text-blue-500 text-xs">[{(value as JsonValue[]).length}]</span>;
    if (isObj) return <span className="text-purple-500 text-xs">{`{${Object.keys(value as JsonObject).length}}`}</span>;
    if (typeof value === "string") return <span className="text-green-600 dark:text-green-400">"{value}"</span>;
    if (value === null) return <span className="text-gray-400">null</span>;
    return <span className={typeColor()}>{String(value)}</span>;
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1 py-0.5 px-2 rounded hover:bg-accent/50 cursor-pointer group`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isObj && setCollapsed(!collapsed)}
      >
        {isObj ? (
          <span className="text-muted-foreground text-xs w-3 flex-shrink-0">
            {collapsed ? "▶" : "▼"}
          </span>
        ) : (
          <span className="w-3 flex-shrink-0" />
        )}
        <span className="font-medium text-foreground">
          {typeof nodeKey === "number" ? (
            <span className="text-muted-foreground">[{nodeKey}]</span>
          ) : nodeKey}
        </span>
        {!isObj && (
          <>
            <span className="text-muted-foreground mx-1">:</span>
            <span className="truncate max-w-xs">{renderValue()}</span>
          </>
        )}
        {isObj && (
          <span className="text-muted-foreground ml-1">{renderValue()}</span>
        )}
      </div>
      {isObj && !collapsed && (
        <div>
          {isArr
            ? (value as JsonValue[]).map((item, i) => (
                <TreeNodeRow key={i} nodeKey={i} value={item} depth={depth + 1} isLast={i === (value as JsonValue[]).length - 1} />
              ))
            : Object.entries(value as JsonObject).map(([k, v], i, arr) => (
                <TreeNodeRow key={k} nodeKey={k} value={v} depth={depth + 1} isLast={i === arr.length - 1} />
              ))}
        </div>
      )}
    </div>
  );
}

function TreeView({ data }: { data: JsonValue }) {
  if (Array.isArray(data)) {
    return (
      <div className="font-mono text-sm">
        {(data as JsonValue[]).map((item, i) => (
          <TreeNodeRow key={i} nodeKey={i} value={item} depth={0} isLast={i === (data as JsonValue[]).length - 1} />
        ))}
      </div>
    );
  }
  if (data !== null && typeof data === "object") {
    return (
      <div className="font-mono text-sm">
        {Object.entries(data as JsonObject).map(([k, v], i, arr) => (
          <TreeNodeRow key={k} nodeKey={k} value={v} depth={0} isLast={i === arr.length - 1} />
        ))}
      </div>
    );
  }
  return <div className="font-mono text-sm p-4 text-muted-foreground">{String(data)}</div>;
}

// ─── Stats Panel ──────────────────────────────────────────────────────────────

function StatsPanel({ stats }: { stats: JsonStats }) {
  const items = [
    { label: "Total Keys", value: stats.totalKeys, color: "text-blue-500" },
    { label: "Max Depth", value: stats.maxDepth, color: "text-purple-500" },
    { label: "Objects", value: stats.objectCount, color: "text-indigo-500" },
    { label: "Arrays", value: stats.arrayCount, color: "text-cyan-500" },
    { label: "Strings", value: stats.stringCount, color: "text-green-500" },
    { label: "Numbers", value: stats.numberCount, color: "text-orange-500" },
    { label: "Booleans", value: stats.booleanCount, color: "text-pink-500" },
    { label: "Nulls", value: stats.nullCount, color: "text-gray-400" },
  ];

  return (
    <div className="mt-6 p-4 border rounded-lg bg-muted/30">
      <h3 className="font-semibold mb-3 text-sm">JSON Statistics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {items.map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center p-2 border rounded-md bg-background">
            <span className={`text-xl font-bold ${color}`}>{value}</span>
            <span className="text-xs text-muted-foreground mt-1 text-center">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Curl Parser ─────────────────────────────────────────────────────────────

interface ParsedCurl {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}

function parseCurl(input: string): ParsedCurl | null {
  const raw = input.trim();
  if (!raw.startsWith("curl")) return null;

  // Normalize line continuations (\ at end of line)
  const normalized = raw.replace(/\\\s*\n\s*/g, " ");

  const result: ParsedCurl = { url: "", method: "GET", headers: {}, body: null };

  // Extract URL — first quoted or unquoted token after 'curl' that looks like a URL
  const urlMatch = normalized.match(/curl\s+(?:--\S+\s+(?:'[^']*'|"[^"]*"|\S+)\s+)*['"]?(https?:\/\/[^\s'"]+)['"]?/)
    || normalized.match(/['"]?(https?:\/\/[^\s'"]+)['"]?/);
  if (urlMatch) result.url = urlMatch[1];

  // Method
  const methodMatch = normalized.match(/-X\s+(\w+)|--request\s+(\w+)/i);
  if (methodMatch) {
    result.method = (methodMatch[1] || methodMatch[2]).toUpperCase();
  }

  // Headers
  const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
  let hm;
  while ((hm = headerRegex.exec(normalized)) !== null) {
    const colonIdx = hm[1].indexOf(":");
    if (colonIdx > -1) {
      const key = hm[1].slice(0, colonIdx).trim();
      const val = hm[1].slice(colonIdx + 1).trim();
      result.headers[key] = val;
    }
  }

  // Body
  const bodyMatch = normalized.match(/(?:-d|--data|--data-raw|--data-binary)\s+['"]([\s\S]*?)['"]\s*(?:--|$|-[A-Za-z]|$)/);
  if (bodyMatch) {
    result.body = bodyMatch[1];
  } else {
    // Try unquoted body (multi-line style already collapsed)
    const bodyMatch2 = normalized.match(/(?:-d|--data|--data-raw|--data-binary)\s+'([\s\S]*?)'\s*$/);
    if (bodyMatch2) result.body = bodyMatch2[1];
  }

  // If body exists and no explicit method, default to POST
  if (result.body && !methodMatch) result.method = "POST";

  if (!result.url) return null;
  return result;
}

// ─── URL Fetch Modal ──────────────────────────────────────────────────────────

function UrlFetchModal({ onFetch, onClose }: { onFetch: (json: string) => void; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [parsed, setParsed] = useState<ParsedCurl | null>(null);

  const isCurl = input.trim().startsWith("curl");

  // Live parse curl as user types
  useEffect(() => {
    if (isCurl) {
      const p = parseCurl(input);
      setParsed(p);
    } else {
      setParsed(null);
    }
  }, [input, isCurl]);

  const handleFetch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setErr("");
    try {
      let url: string;
      let fetchOptions: RequestInit = {};

      if (isCurl && parsed) {
        url = parsed.url;
        fetchOptions = {
          method: parsed.method,
          headers: parsed.headers as HeadersInit,
          body: parsed.body ?? undefined,
        };
      } else {
        url = input.trim();
      }

      if (!url) throw new Error("Could not extract a valid URL");

      const res = await fetch(url, fetchOptions);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const text = await res.text();
      JSON.parse(text); // validate JSON
      onFetch(text);
      onClose();
    } catch (e: any) {
      setErr(e.message || "Failed to fetch JSON");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
        <h3 className="font-semibold text-lg mb-1">Load JSON from URL</h3>
        <p className="text-muted-foreground text-xs mb-4">
          Paste a plain URL <strong>or</strong> a full <code className="bg-muted px-1 rounded">curl</code> command — headers, method, and body are parsed automatically.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`https://api.example.com/data.json\n\n— or —\n\ncurl --location 'https://...' \\\n  --header 'Content-Type: application/json' \\\n  --data '{"key":"value"}'`}
          rows={6}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring mb-3 resize-none"
          autoFocus
        />

        {/* Parsed preview */}
        {isCurl && parsed && (
          <div className="mb-3 p-3 bg-muted/50 border rounded-md text-xs font-mono space-y-1">
            <div><span className="text-muted-foreground">URL:</span> <span className="text-foreground break-all">{parsed.url || <em className="text-destructive">not found</em>}</span></div>
            <div><span className="text-muted-foreground">Method:</span> <span className="text-blue-500 font-semibold">{parsed.method}</span></div>
            {Object.keys(parsed.headers).length > 0 && (
              <div><span className="text-muted-foreground">Headers:</span> {Object.entries(parsed.headers).map(([k, v]) => (
                <span key={k} className="ml-1 px-1 bg-background border rounded">{k}: {v}</span>
              ))}</div>
            )}
            {parsed.body && (
              <div><span className="text-muted-foreground">Body:</span> <span className="text-green-600 dark:text-green-400 break-all">{parsed.body.slice(0, 80)}{parsed.body.length > 80 ? "…" : ""}</span></div>
            )}
          </div>
        )}

        {isCurl && !parsed && input.trim().length > 10 && (
          <p className="text-amber-500 text-xs mb-3">⚠ Could not parse curl command — check the format</p>
        )}

        {err && (
          <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-destructive text-xs">{err}</p>
            {err.includes("Failed to fetch") || err.includes("NetworkError") || err.includes("CORS") ? (
              <p className="text-destructive/80 text-xs mt-1">
                This may be a CORS issue — the server blocked the browser request. Try copying the response and pasting it directly instead.
              </p>
            ) : null}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleFetch} disabled={loading || (isCurl && !parsed?.url)}>
            {loading ? "Fetching…" : "Fetch JSON"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Undo/Redo Hook ───────────────────────────────────────────────────────────

function useHistory(initial: string) {
  const [history, setHistory] = useState<string[]>([initial]);
  const [index, setIndex] = useState(0);

  const current = history[index];

  const push = useCallback((val: string) => {
    setHistory((h) => {
      const next = h.slice(0, index + 1);
      next.push(val);
      return next.slice(-50); // keep last 50
    });
    setIndex((i) => Math.min(i + 1, 49));
  }, [index]);

  const undo = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const redo = useCallback(() => setIndex((i) => Math.min(history.length - 1, i + 1)), [history.length]);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  return { current, push, undo, redo, canUndo, canRedo };
}

// ─── Main Component ───────────────────────────────────────────────────────────

type ViewMode = "tree" | "highlighted";

export function JsonFormatter() {
  const inputHistory = useHistory("");
  const [input, setInputRaw] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [stats, setStats] = useState<JsonStats | null>(null);
  const [parsedData, setParsedData] = useState<JsonValue | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("highlighted");
  const [showUrlModal, setShowUrlModal] = useState(false);

  // Sync input with history
  const setInput = (val: string) => {
    setInputRaw(val);
    inputHistory.push(val);
  };

  // Undo/Redo keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        inputHistory.undo();
        setInputRaw(inputHistory.current);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        inputHistory.redo();
        setInputRaw(inputHistory.current);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [inputHistory]);

  // Load from URL share param on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("json");
    if (shared) {
      try {
        const decoded = decodeURIComponent(atob(shared));
        setInputRaw(decoded);
        inputHistory.push(decoded);
      } catch {}
    }
  }, []);

  const processJson = (raw: string, indent = 2) => {
    try {
      if (!raw.trim()) throw new Error("Please enter JSON content");
      const parsed = JSON.parse(raw);
      const formatted = JSON.stringify(parsed, null, indent);
      const s = computeStats(parsed);
      setOutput(formatted);
      setError("");
      setIsValid(true);
      setStats(s);
      setParsedData(parsed);
      return true;
    } catch (err: any) {
      setError(err.message || "Invalid JSON");
      setOutput("");
      setIsValid(false);
      setStats(null);
      setParsedData(null);
      return false;
    }
  };

  const formatJson = () => processJson(input, 2);

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError("");
      setIsValid(true);
      setStats(computeStats(parsed));
      setParsedData(parsed);
    } catch {
      setError("Invalid JSON format");
      setOutput("");
      setIsValid(false);
    }
  };

  const clearAll = () => {
    setInputRaw("");
    setOutput("");
    setError("");
    setIsValid(false);
    setStats(null);
    setParsedData(null);
  };

  const viewTabs: { id: ViewMode; label: string }[] = [
    { id: "highlighted", label: "Highlighted" },
    { id: "tree", label: "Tree View" },
  ];

  return (
    <>
      {/* Syntax highlight styles */}
      <style>{`
        .syntax-output .json-key { color: #2563eb; }
        .dark .syntax-output .json-key { color: #60a5fa; }
        .syntax-output .json-key-dup { color: #dc2626; text-decoration: underline dotted; }
        .dark .syntax-output .json-key-dup { color: #f87171; text-decoration: underline dotted; }
        .syntax-output .json-string { color: #16a34a; }
        .dark .syntax-output .json-string { color: #4ade80; }
        .syntax-output .json-number { color: #ea580c; }
        .dark .syntax-output .json-number { color: #fb923c; }
        .syntax-output .json-boolean { color: #db2777; }
        .dark .syntax-output .json-boolean { color: #f472b6; }
        .syntax-output .json-null { color: #9ca3af; }
      `}</style>

      {showUrlModal && (
        <UrlFetchModal
          onFetch={(json) => { setInputRaw(json); inputHistory.push(json); }}
          onClose={() => setShowUrlModal(false)}
        />
      )}

      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <Header toolTitle="JSON Formatter" toolDescription="Format, validate, minify, explore, and share JSON data — entirely in your browser." />  

          {/* Top toolbar */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={formatJson}>Format JSON</Button>
            <Button variant="outline" onClick={minifyJson}>Minify</Button>
            <Button variant="outline" onClick={() => setShowUrlModal(true)}>Load from URL</Button>
            <Button
              variant="outline"
              onClick={() => { inputHistory.undo(); setInputRaw(inputHistory.current); }}
              disabled={!inputHistory.canUndo}
            >↩ Undo</Button>
            <Button
              variant="outline"
              onClick={() => { inputHistory.redo(); setInputRaw(inputHistory.current); }}
              disabled={!inputHistory.canRedo}
            >↪ Redo</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>

          {/* Editor grid */}
          <div className="flex flex-col gap-6">
            {/* Input */}
            <div className="flex justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Input JSON</h2>
                <span className="text-xs text-muted-foreground">Ctrl+Z / Ctrl+Y to undo/redo</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-1 border rounded-md p-0.5 bg-muted/30">
                  {viewTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setViewMode(tab.id)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        viewMode === tab.id
                          ? "bg-background shadow-sm font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {output && (
                  <div className="flex gap-2">
                    <CopyButton text={output} />
                    <Download content={output} filename="formatted.json" mimeType="application/json" />
                  </div>
                )}
              </div>
            </div>

            {/* Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 border border-input rounded-md overflow-hidden">
                <CodeEditor
                  value={input}
                  onChange={setInput}
                  placeholder="Paste your JSON here..."
                  className="h-full"
                  showLineNumbers={true}
                />
              </div>
              {/* Output panel */}
              <div className={`h-96 border border-input rounded-md bg-background overflow-hidden`}>
                {error && (
                  <div className="h-full p-4 text-destructive text-sm font-mono overflow-auto">
                    <div className="flex flex-col gap-2">
                      <strong>JSON Validation Error:</strong> {error}
                      <div className="text-xs">
                        Please check your JSON syntax. Common issues: missing commas, unclosed brackets, or trailing commas.
                      </div>
                    </div>
                  </div>
                )}
                {viewMode === "highlighted" && !error && output && (
                  <div className="h-full overflow-auto">
                    <SyntaxHighlightedJson json={output} />
                  </div>
                )}
                {viewMode === "highlighted" && !error && !output && (
                  <div className="h-full p-4 text-muted-foreground text-sm font-mono flex items-center justify-center">
                    Format JSON first to see syntax highlighting
                  </div>
                )}
                {viewMode === "tree" && !error && parsedData !== null && (
                  <div className="h-full overflow-auto py-2">
                    <TreeView data={parsedData} />
                  </div>
                )}
                {viewMode === "tree" && !error && parsedData === null && (
                  <div className="h-full p-4 text-muted-foreground text-sm font-mono flex items-center justify-center">
                    Format JSON first to see tree view
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && <StatsPanel stats={stats} />}

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Syntax Highlighting", desc: "Keys, strings, numbers, booleans, and nulls are color-coded for quick scanning." },
              { title: "Tree Explorer", desc: "Collapsible tree view for navigating large nested JSON structures." },
              { title: "Duplicate Key Detection", desc: "Automatically detects and highlights duplicate object keys." },
              { title: "JSON Statistics", desc: "Shows key count, max depth, array lengths, and data type breakdown." },
              { title: "Undo / Redo", desc: "Full edit history with Ctrl+Z / Ctrl+Y keyboard shortcuts." },
              { title: "Load from URL", desc: "Fetch JSON directly from any public API endpoint or URL." },
              { title: "Pretty Print & Minify", desc: "Format with proper indentation or strip all whitespace for production." },
            ].map(({ title, desc }) => (
              <div key={title} className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}