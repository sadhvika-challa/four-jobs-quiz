"use client";

import { useState, useMemo, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Archetype = "slop" | "infra" | "hot" | "grown";

interface Answer {
  text: string;
  type: Archetype;
}

interface Question {
  question: string;
  answers: Answer[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    question: "It\u2019s 2am. A P0 alert fires. What\u2019s your first move?",
    answers: [
      { text: "Already in the terminal before the alert finishes loading", type: "slop" },
      { text: "Open Slack to figure out who\u2019s affected and what they need to know", type: "infra" },
      { text: "Hop on and start calming people down. Panic makes everything worse", type: "hot" },
      { text: "Check the runbook and make sure we\u2019re following the right escalation path", type: "grown" },
    ],
  },
  {
    question: "You have one free afternoon with zero meetings. You spend it:",
    answers: [
      { text: "Speedrunning that side project you\u2019ve been noodling on", type: "slop" },
      { text: "Finally writing the documentation nobody else will", type: "infra" },
      { text: "Grabbing coffee with someone on another team you haven\u2019t caught up with", type: "hot" },
      { text: "Cleaning up that spreadsheet / process that\u2019s been bugging you for weeks", type: "grown" },
    ],
  },
  {
    question: "Your Slack energy is closest to:",
    answers: [
      { text: "Rapid-fire messages, sometimes just a link with no context", type: "slop" },
      { text: "Long detailed messages with screenshots and links", type: "infra" },
      { text: "The person who always reacts with the perfect emoji first", type: "hot" },
      { text: "\u201CJust to close the loop on this\u2026\u201D", type: "grown" },
    ],
  },
  {
    question: "Pick a lunch order:",
    answers: [
      { text: "Whatever\u2019s fastest, eating at my desk anyway", type: "slop" },
      { text: "The same reliable order from the same reliable place", type: "infra" },
      { text: "Somewhere new someone recommended. I\u2019ll rally a group", type: "hot" },
      { text: "I meal prepped, thanks though", type: "grown" },
    ],
  },
  {
    question: "A prospect asks a question nobody on the call knows the answer to. You:",
    answers: [
      { text: "Improvise something plausible and figure it out after", type: "slop" },
      { text: "Pull up the docs mid-call and start digging", type: "infra" },
      { text: "Smoothly redirect: \u201CGreat question. Let\u2019s circle back with something thorough\u201D", type: "hot" },
      { text: "Make a note, assign a follow-up owner, and move the agenda forward", type: "grown" },
    ],
  },
  {
    question: "What\u2019s on your desk right now?",
    answers: [
      { text: "Multiple monitors, energy drinks, 3 half-finished projects", type: "slop" },
      { text: "One clean monitor, dark mode everything, no clutter", type: "infra" },
      { text: "Something aesthetic. A candle, a plant, maybe a nice mug", type: "hot" },
      { text: "A notebook with actual handwritten to-do lists", type: "grown" },
    ],
  },
  {
    question: "Somebody drops a wild idea in Slack at 11pm. You:",
    answers: [
      { text: "Get excited and start building a rough version immediately", type: "slop" },
      { text: "Start mentally mapping everything that could go wrong", type: "infra" },
      { text: "Mute the channel and go back to whatever you were doing", type: "hot" },
      { text: "Sleep on it and send a measured take in the morning", type: "grown" },
    ],
  },
  {
    question: "Which of these compliments would actually make your week?",
    answers: [
      { text: "\u201CWait, you built that today?\u201D", type: "slop" },
      { text: "\u201CThis hasn\u2019t broken once since you set it up\u201D", type: "infra" },
      { text: "\u201CThe client specifically asked to keep working with you\u201D", type: "hot" },
      { text: "\u201CGood thing you flagged that. We would\u2019ve missed it\u201D", type: "grown" },
    ],
  },
  {
    question: "Pick a guilty pleasure:",
    answers: [
      { text: "Signing up for every new AI tool the day it launches", type: "slop" },
      { text: "Optimizing something that technically didn\u2019t need optimizing", type: "infra" },
      { text: "Spending 30 minutes on a Slack message to get the tone just right", type: "hot" },
      { text: "Color-coding a spreadsheet nobody asked you to color-code", type: "grown" },
    ],
  },
  {
    question: "Your coworkers would describe you as the person who:",
    answers: [
      { text: "Ships things before anyone realized they were being worked on", type: "slop" },
      { text: "Somehow always knows what\u2019s going to break next", type: "infra" },
      { text: "Makes every meeting and customer call feel easy", type: "hot" },
      { text: "Quietly keeps the wheels from falling off", type: "grown" },
    ],
  },
];

const ARCHETYPE_INFO: Record<
  Archetype,
  { name: string; color: string; description: string }
> = {
  slop: {
    name: "Slop Cannon",
    color: "#FF6B2B",
    description:
      "You are a force of nature. You ship at mass and ask questions later. Your terminal is always open, your PRs are always pending, and your side projects have side projects. You don\u2019t wait for permission. You wait for forgiveness.",
  },
  infra: {
    name: "Security",
    color: "#00B4D8",
    description:
      "You are the reason things don\u2019t fall apart. While everyone else is shipping fast and breaking things, you\u2019re the one quietly making sure \u201Cthings\u201D still exist to break. You read postmortems for fun and your monitoring dashboards are a work of art.",
  },
  hot: {
    name: "Hot People",
    color: "#E91E8C",
    description:
      "You are the human API. Customers love you, coworkers gravitate toward you, and somehow you make even a standup feel fun. Your superpower is making complex things feel simple and hard conversations feel easy. There are many ways to be hot, and you found yours.",
  },
  grown: {
    name: "Grown Ups",
    color: "#7B61FF",
    description:
      "You are the ballast on a rocketship. When everyone else is moving fast, you\u2019re the one asking \u201Cbut should we?\u201D and being right about it 80% of the time. You\u2019ve prevented more disasters than anyone will ever know, and your spreadsheets have spreadsheets.",
  },
};

const ALL_COLORS = ["#FF6B2B", "#00B4D8", "#E91E8C", "#7B61FF", "#FFD600", "#00E676", "#FF1744", "#00BFA5"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Color Orb Background ───────────────────────────────────────────────────

function ColorField({ colors, seed = 0 }: { colors?: string[]; seed?: number }) {
  const orbs = useMemo(() => {
    const c = colors || ALL_COLORS;
    return Array.from({ length: 14 }, (_, i) => {
      const hash = (i + seed) * 2654435761;
      return {
        color: c[i % c.length],
        size: 100 + (hash % 200),
        x: (hash * 7) % 100,
        y: (hash * 13) % 100,
        delay: (i * 0.7) % 4,
        duration: 12 + (i % 8) * 2,
        animation: i % 3 === 0 ? 'float-slow' : i % 3 === 1 ? 'float-medium' : 'float-fast',
      };
    });
  }, [colors, seed]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          zIndex: 2,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
      {orbs.map((orb, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            borderRadius: '50%',
            background: orb.color,
            filter: `blur(${40 + (i % 3) * 15}px)`,
            opacity: 0.18 + (i % 4) * 0.04,
            animation: `${orb.animation} ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Progress ────────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: 'var(--muted)' }}>
          {current} / {total}
        </span>
        <span className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: 'var(--muted)' }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="w-full h-[3px]" style={{ backgroundColor: 'var(--progress-bg)' }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${ARCHETYPE_INFO.slop.color}, ${ARCHETYPE_INFO.hot.color}, ${ARCHETYPE_INFO.grown.color}, ${ARCHETYPE_INFO.infra.color})`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Answer Card ─────────────────────────────────────────────────────────────

function AnswerCard({
  answer,
  index,
  onSelect,
  selected,
}: {
  answer: Answer;
  index: number;
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left cursor-pointer relative animate-fade-up"
      style={{
        WebkitTapHighlightColor: 'transparent',
        animationDelay: `${index * 60}ms`,
        animationFillMode: 'both',
      }}
    >
      <div
        className="relative overflow-hidden transition-all duration-200"
        style={{
          padding: '18px 20px',
          background: 'var(--card-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid var(--card-border)`,
        }}
      >
        <span
          className="text-[15px] leading-relaxed"
          style={{ color: 'var(--foreground)' }}
        >
          {answer.text}
        </span>
      </div>
    </button>
  );
}

// ─── Result Breakdown ────────────────────────────────────────────────────────

function ResultBreakdown({ scores }: { scores: Record<Archetype, number> }) {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const sorted = (Object.entries(scores) as [Archetype, number][]).sort((a, b) => b[1] - a[1]);

  return (
    <div className="w-full max-w-sm space-y-4">
      {sorted.map(([type, count], i) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const info = ARCHETYPE_INFO[type];
        return (
          <div
            key={type}
            className="animate-fade-up"
            style={{ animationDelay: `${400 + i * 100}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <div style={{ width: 10, height: 10, backgroundColor: info.color, flexShrink: 0 }} />
              <span className="text-sm font-medium flex-1">{info.name}</span>
              <span className="text-sm font-light tabular-nums" style={{ color: 'var(--muted)' }}>
                {pct}%
              </span>
            </div>
            <div className="w-full h-[6px] overflow-hidden ml-[22px]" style={{ maxWidth: 'calc(100% - 22px)', backgroundColor: 'var(--progress-bg)' }}>
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{
                  backgroundColor: info.color,
                  width: `${pct}%`,
                  transitionDelay: `${600 + i * 100}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function Quiz() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(Archetype | null)[]>(Array(QUESTIONS.length).fill(null));
  const [copied, setCopied] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const shuffledQuestions = useMemo(
    () => QUESTIONS.map((q) => ({ ...q, answers: shuffle(q.answers) })),
    [phase]
  );

  // Derive scores from answers
  const scores = useMemo(() => {
    const s: Record<Archetype, number> = { slop: 0, infra: 0, hot: 0, grown: 0 };
    answers.forEach((a) => { if (a) s[a]++; });
    return s;
  }, [answers]);

  const handleAnswer = useCallback(
    (type: Archetype) => {
      if (transitioning) return;
      const newAnswers = [...answers];
      newAnswers[currentQ] = type;
      setAnswers(newAnswers);
      setTransitioning(true);
      setTimeout(() => {
        if (currentQ + 1 >= QUESTIONS.length) {
          setPhase("result");
        } else {
          setCurrentQ(currentQ + 1);
        }
        setTransitioning(false);
      }, 200);
    },
    [answers, currentQ, transitioning]
  );

  const goBack = useCallback(() => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  }, [currentQ]);

  const retake = useCallback(() => {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setCurrentQ(0);
    setCopied(false);
    setPhase("intro");
  }, []);

  const result = useMemo(() => {
    const max = Math.max(...Object.values(scores));
    const winners = (Object.entries(scores) as [Archetype, number][]).filter(([, v]) => v === max);
    const winner = winners.length > 1
      ? winners[Math.floor(Math.random() * winners.length)][0]
      : winners[0][0];
    return { winner, isTie: winners.length > 1, tiedWith: winners.map(([t]) => t) };
  }, [scores]);

  const copyResults = useCallback(() => {
    const info = ARCHETYPE_INFO[result.winner];
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const breakdown = (Object.entries(scores) as [Archetype, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([t, c]) => `${ARCHETYPE_INFO[t].name}: ${Math.round((c / total) * 100)}%`)
      .join("\n");
    const tieNote = result.isTie
      ? `\n(Tied with ${result.tiedWith.filter((t) => t !== result.winner).map((t) => ARCHETYPE_INFO[t].name).join(" & ")})`
      : "";
    const text = `I just took "The Only 4 Jobs That Will Survive at Tech Companies" quiz and got: ${info.name}${tieNote}\n\n${breakdown}\n\nTake the quiz: ${window.location.origin}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result, scores]);

  // ─── Intro Screen ──────────────────────────────────────────────────────────

  if (phase === "intro") {
    return (
      <>
        <ColorField seed={42} />
        <div className="flex-1 flex items-center justify-center px-6 py-16 relative" style={{ zIndex: 1 }}>
          <div className="text-center max-w-xl animate-fade-in">
            <h1
              className="text-[clamp(2rem,6vw,3.5rem)] leading-[1.05] tracking-[-0.03em] mb-6 animate-fade-up"
              style={{ fontFamily: "'DM Serif Display', serif", animationDelay: '100ms', animationFillMode: 'both' }}
            >
              The Only <span style={{ fontStyle: 'italic' }}>4 Jobs</span><br />
              That Will Survive<br />
              at Tech Companies
            </h1>

            <p
              className="text-base mb-6 leading-relaxed max-w-sm mx-auto animate-fade-up"
              style={{ color: 'var(--muted)', fontFamily: "'Special Elite', 'Courier New', monospace", animationDelay: '300ms', animationFillMode: 'both' }}
            >
              10 questions. 4 archetypes.<br />
              No wrong answers. Mostly.
            </p>

            <a
              href="https://x.com/heygurisingh/status/2039342389270339689"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs tracking-[0.1em] uppercase mb-10 animate-fade-up transition-opacity duration-200 hover:opacity-100"
              style={{ color: 'var(--muted)', opacity: 0.6, animationDelay: '400ms', animationFillMode: 'both', textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              Based on the tweet by @heygurisingh
            </a>

            <button
              onClick={() => setPhase("quiz")}
              className="px-10 py-3.5 text-sm font-medium tracking-[0.1em] uppercase cursor-pointer
                         transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] animate-fade-up"
              style={{
                background: 'var(--foreground)',
                color: 'var(--background)',
                animationDelay: '600ms',
                animationFillMode: 'both',
              }}
            >
              Begin
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── Result Screen ─────────────────────────────────────────────────────────

  if (phase === "result") {
    const { winner, isTie, tiedWith } = result;
    const info = ARCHETYPE_INFO[winner];

    return (
      <>
        <ColorField colors={[info.color, info.color, info.color, '#FFD600', '#ffffff']} seed={99} />
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative" style={{ zIndex: 1 }}>
          <div className="text-center max-w-lg w-full flex flex-col items-center">
            <p
              className="text-xs tracking-[0.25em] uppercase mb-3 font-medium animate-fade-up"
              style={{ color: 'var(--muted)', animationDelay: '200ms', animationFillMode: 'both' }}
            >
              You are
            </p>

            <h1
              className="text-[clamp(2.2rem,7vw,3.8rem)] leading-[1.05] tracking-[-0.03em] mb-2 animate-fade-up"
              style={{ fontFamily: "'DM Serif Display', serif", color: info.color, animationDelay: '300ms', animationFillMode: 'both' }}
            >
              {info.name}
            </h1>

            {isTie && (
              <p
                className="text-xs tracking-[0.15em] uppercase mb-4 animate-fade-up"
                style={{ color: 'var(--muted)', animationDelay: '400ms', animationFillMode: 'both' }}
              >
                tied with{" "}
                {tiedWith
                  .filter((t) => t !== winner)
                  .map((t) => ARCHETYPE_INFO[t].name)
                  .join(" & ")}
              </p>
            )}

            <p
              className="text-[15px] font-light leading-[1.7] mb-10 max-w-md animate-fade-up"
              style={{ color: 'var(--muted)', animationDelay: '500ms', animationFillMode: 'both' }}
            >
              {info.description}
            </p>

            <ResultBreakdown scores={scores} />

            <div
              className="flex flex-col sm:flex-row gap-3 mt-10 w-full max-w-sm animate-fade-up"
              style={{ animationDelay: '800ms', animationFillMode: 'both' }}
            >
              <button
                onClick={copyResults}
                className="flex-1 px-6 py-3 text-xs font-medium tracking-[0.1em] uppercase cursor-pointer
                           transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ background: 'var(--foreground)', color: 'var(--background)' }}
              >
                {copied ? "Copied" : "Share Results"}
              </button>
              <button
                onClick={retake}
                className="flex-1 px-6 py-3 text-xs font-medium tracking-[0.1em] uppercase cursor-pointer
                           transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--card-border)' }}
              >
                Retake
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Quiz Screen ───────────────────────────────────────────────────────────

  const q = shuffledQuestions[currentQ];
  const currentColors = [
    ARCHETYPE_INFO.slop.color,
    ARCHETYPE_INFO.infra.color,
    ARCHETYPE_INFO.hot.color,
    ARCHETYPE_INFO.grown.color,
  ];

  return (
    <>
      <ColorField colors={currentColors} seed={currentQ} />
      <div
        className="flex-1 flex flex-col items-center px-6 py-10 sm:py-14 relative"
        style={{ zIndex: 1, opacity: transitioning ? 0.5 : 1, transition: 'opacity 0.15s ease' }}
      >
        <ProgressBar current={currentQ + 1} total={QUESTIONS.length} />

        <div className="w-full max-w-2xl" key={currentQ}>
          {currentQ > 0 && (
            <button
              onClick={goBack}
              className="mb-4 text-xs tracking-[0.15em] uppercase cursor-pointer
                         transition-all duration-200 hover:-translate-x-0.5 animate-fade-up"
              style={{ color: 'var(--muted)', animationFillMode: 'both' }}
            >
              &larr; Back
            </button>
          )}

          <h2
            className="text-[clamp(1.4rem,3.5vw,1.9rem)] leading-[1.3] tracking-[-0.02em] mb-8 animate-fade-up"
            style={{ fontFamily: "'DM Serif Display', serif", animationFillMode: 'both' }}
          >
            {q.question}
          </h2>

          <div className="space-y-2.5">
            {q.answers.map((a, i) => (
              <AnswerCard
                key={`${currentQ}-${a.type}`}
                answer={a}
                index={i}
                selected={answers[currentQ] === a.type}
                onSelect={() => handleAnswer(a.type)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
