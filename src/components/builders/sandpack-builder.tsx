"use client"

import { useState, useEffect } from "react"
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react"
import { ArrowLeft, Library } from "lucide-react"
import { apiFetch } from "@/lib/api-fetch"

const STARTER_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Math Game</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #09090b; color: #e4e4e7;
      font-family: system-ui, sans-serif;
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 24px;
      padding: 24px;
    }
    h1 { font-size: 24px; color: white; }
    p { font-size: 14px; color: #a1a1aa; text-align: center; }
    .group {
      display: flex; gap: 12px; padding: 20px;
      border: 1px solid #27272a; border-radius: 16px;
      background: rgba(24,24,27,0.8);
    }
    .dot {
      width: 48px; height: 48px; border-radius: 50%;
      background: linear-gradient(135deg, #ef4444, #f87171);
      box-shadow: 0 4px 12px rgba(239,68,68,0.4);
      cursor: pointer; transition: all 0.2s;
    }
    .dot.counted {
      background: linear-gradient(135deg, #6366f1, #818cf8);
      transform: scale(0.85);
      box-shadow: 0 0 12px rgba(99,102,241,0.4);
    }
    .btn {
      padding: 12px 32px; border-radius: 12px; border: none;
      font-size: 16px; font-weight: 600; cursor: pointer;
      color: white; transition: all 0.2s;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    }
    .btn:hover { box-shadow: 0 4px 20px rgba(37,99,235,0.5); }
    .options { display: flex; gap: 12px; }
    .option {
      width: 56px; height: 56px; border-radius: 12px;
      border: 1px solid #27272a; background: rgba(24,24,27,0.8);
      color: white; font-size: 20px; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
    }
    .option:hover { border-color: #3b82f6; box-shadow: 0 0 12px rgba(59,130,246,0.3); }
    .result { font-size: 20px; font-weight: 700; color: #10b981; }
  </style>
</head>
<body>
  <h1>My Addition Game</h1>
  <p>Edit this template to create your own math game!</p>

  <div style="display:flex; align-items:center; gap:16px;">
    <div class="group" id="groupA"></div>
    <span style="font-size:24px; font-weight:700; color:#71717a;">+</span>
    <div class="group" id="groupB"></div>
  </div>

  <p id="instruction">Tap each dot to count, then pick the total.</p>
  <div class="options" id="options" style="display:none;"></div>
  <div id="result"></div>
  <button class="btn" id="nextBtn" style="display:none;" onclick="nextRound()">Next</button>

  <script>
    var rounds = [
      { a: 2, b: 1 },
      { a: 3, b: 2 },
      { a: 4, b: 3 },
      { a: 3, b: 4 },
      { a: 5, b: 4 },
    ];
    var current = 0;
    var counted = 0;
    var total = 0;

    function makeDots(container, count) {
      container.innerHTML = '';
      for (var i = 0; i < count; i++) {
        var dot = document.createElement('div');
        dot.className = 'dot';
        dot.onclick = function() {
          if (this.classList.contains('counted')) return;
          this.classList.add('counted');
          counted++;
          if (counted >= total) showOptions();
        };
        container.appendChild(dot);
      }
    }

    function showOptions() {
      var opts = document.getElementById('options');
      opts.style.display = 'flex';
      opts.innerHTML = '';
      var correct = total;
      var choices = [correct - 1, correct, correct + 1, correct + 2];
      choices.sort(function() { return Math.random() - 0.5; });
      choices.forEach(function(n) {
        var btn = document.createElement('button');
        btn.className = 'option';
        btn.textContent = n;
        btn.onclick = function() {
          if (n === correct) {
            document.getElementById('result').textContent = rounds[current].a + ' + ' + rounds[current].b + ' = ' + correct;
            document.getElementById('result').className = 'result';
            opts.style.display = 'none';
            document.getElementById('nextBtn').style.display = 'inline-block';
            document.getElementById('instruction').textContent = '';
          } else {
            document.getElementById('instruction').textContent = 'Not quite — count again!';
            opts.style.display = 'none';
            // Reset counted dots
            document.querySelectorAll('.dot.counted').forEach(function(d) { d.classList.remove('counted'); });
            counted = 0;
          }
        };
        opts.appendChild(btn);
      });
    }

    function nextRound() {
      current++;
      if (current >= rounds.length) {
        document.body.innerHTML = '<h1 style="color:#10b981;">You finished all rounds!</h1>';
        return;
      }
      startRound();
    }

    function startRound() {
      counted = 0;
      total = rounds[current].a + rounds[current].b;
      document.getElementById('result').textContent = '';
      document.getElementById('nextBtn').style.display = 'none';
      document.getElementById('options').style.display = 'none';
      document.getElementById('instruction').textContent = 'Tap each dot to count, then pick the total.';
      makeDots(document.getElementById('groupA'), rounds[current].a);
      makeDots(document.getElementById('groupB'), rounds[current].b);
    }

    startRound();
  <\/script>
</body>
</html>`

interface SandpackBuilderProps {
  standardId: string
  scenario: string
  onBack: () => void
  onAddToLibrary: (html: string, title: string) => void
}

export function SandpackBuilder({
  standardId,
  scenario,
  onBack,
  onAddToLibrary,
}: SandpackBuilderProps) {
  const [gameHtml, setGameHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!scenario) {
      setGameHtml(STARTER_TEMPLATE)
      setLoading(false)
      return
    }

    let cancelled = false

    async function generate() {
      try {
        const res = await apiFetch("/api/game/generate-gemini", {
          method: "POST",
          body: JSON.stringify({
            standardId,
            scenario,
            builderType: "sentence",
          }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || `Generation failed (${res.status})`)
        }

        const data = await res.json()
        if (!cancelled) {
          setGameHtml(data.html)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Something went wrong."
          )
          setLoading(false)
        }
      }
    }

    generate()
    return () => {
      cancelled = true
    }
  }, [standardId, scenario])

  const truncatedTitle =
    scenario.length > 60 ? scenario.slice(0, 57) + "..." : scenario

  // Loading state
  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
        style={{
          background:
            "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)",
          fontFamily: "'Lexend', system-ui, sans-serif",
        }}
      >
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-base font-semibold text-zinc-200">
          Building your game...
        </p>
        <p className="text-sm text-zinc-400">
          This usually takes 10-20 seconds
        </p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
        style={{
          background:
            "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)",
          fontFamily: "'Lexend', system-ui, sans-serif",
        }}
      >
        <p className="text-sm text-red-400 max-w-md text-center">{error}</p>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white mt-4"
        >
          <ArrowLeft className="size-4" />
          Go back
        </button>
      </div>
    )
  }

  // Sandpack view
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #09090b 0%, #0c1222 50%, #09090b 100%)",
        fontFamily: "'Lexend', system-ui, sans-serif",
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/50 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <p className="text-sm text-zinc-300 font-medium truncate max-w-[40%]">
          {truncatedTitle}
        </p>

        <button
          onClick={() => {
            if (gameHtml) {
              const title = scenario.slice(0, 40) + (scenario.length > 40 ? "..." : "")
              onAddToLibrary(gameHtml, title)
            }
          }}
          className="flex items-center gap-1 text-xs font-semibold rounded-md px-3 py-1.5 transition-all active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, #059669, #10b981)",
            color: "white",
            boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
          }}
        >
          <Library className="size-3.5" />
          Add to library
        </button>
      </div>

      {/* Sandpack editor + preview */}
      <div className="flex-1 min-h-0" style={{ display: "flex", flexDirection: "column" }}>
        <SandpackProvider
          template="static"
          files={{
            "/index.html": { code: gameHtml || "" },
          }}
          options={{
            classes: {
              "sp-wrapper": "sp-full-height",
              "sp-layout": "sp-full-height",
            },
          }}
          theme={{
            colors: {
              surface1: "#09090b",
              surface2: "#18181b",
              surface3: "#27272a",
              clickable: "#a1a1aa",
              base: "#e4e4e7",
              disabled: "#52525b",
              hover: "#fafafa",
              accent: "#3b82f6",
              error: "#ef4444",
              errorSurface: "#450a0a",
            },
            syntax: {
              plain: "#e4e4e7",
              comment: { color: "#52525b", fontStyle: "italic" },
              keyword: "#c084fc",
              tag: "#60a5fa",
              punctuation: "#71717a",
              definition: "#34d399",
              property: "#fbbf24",
              static: "#f87171",
              string: "#86efac",
            },
            font: {
              body: "'Lexend', system-ui, sans-serif",
              mono: "'Fira Code', 'Cascadia Code', monospace",
              size: "13px",
              lineHeight: "1.6",
            },
          }}
        >
          <div style={{ display: "flex", flex: 1, height: "100%", minHeight: 0 }}>
            {/* Code panel — left, 40% */}
            <div style={{ width: "40%", height: "100%", borderRight: "1px solid rgba(63,63,70,0.5)", overflow: "auto" }}>
              <SandpackCodeEditor
                readOnly
                showLineNumbers
                showTabs={false}
                style={{ height: "100%", minHeight: "100%" }}
              />
            </div>

            {/* Preview panel — right, 60% */}
            <div style={{ width: "60%", height: "100%", overflow: "hidden" }}>
              <SandpackPreview
                showNavigator={false}
                showOpenInCodeSandbox={false}
                style={{ height: "100%", minHeight: "100%" }}
              />
            </div>
          </div>
        </SandpackProvider>

        {/* Force Sandpack to fill height */}
        <style>{`
          .sp-wrapper, .sp-layout { height: 100% !important; display: flex !important; flex-direction: column !important; flex: 1 !important; }
          .sp-preview-container { height: 100% !important; }
          .sp-preview-iframe { height: 100% !important; }
          .sp-code-editor { height: 100% !important; }
          .sp-cm { height: 100% !important; }
        `}</style>
      </div>
    </div>
  )
}
