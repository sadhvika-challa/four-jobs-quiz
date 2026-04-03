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
  { name: string; article: string; color: string; description: string }
> = {
  slop: {
    name: "Slop Cannon",
    article: "a",
    color: "#FF6B2B",
    description:
      "You are a force of nature. You ship at mass and ask questions later. Your terminal is always open, your PRs are always pending, and your side projects have side projects. You don\u2019t wait for permission. You wait for forgiveness.",
  },
  infra: {
    name: "Security",
    article: "",
    color: "#00B4D8",
    description:
      "You are the reason things don\u2019t fall apart. While everyone else is shipping fast and breaking things, you\u2019re the one quietly making sure \u201Cthings\u201D still exist to break. You read postmortems for fun and your monitoring dashboards are a work of art.",
  },
  hot: {
    name: "Hot People",
    article: "",
    color: "#E91E8C",
    description:
      "You are the human API. Customers love you, coworkers gravitate toward you, and somehow you make even a standup feel fun. Your superpower is making complex things feel simple and hard conversations feel easy. There are many ways to be hot, and you found yours.",
  },
  grown: {
    name: "Grown Ups",
    article: "the",
    color: "#7B61FF",
    description:
      "You are the ballast on a rocketship. When everyone else is moving fast, you\u2019re the one asking \u201Cbut should we?\u201D and being right about it 80% of the time. You\u2019ve prevented more disasters than anyone will ever know, and your spreadsheets have spreadsheets.",
  },
};

const TIERED_DESCRIPTIONS: Record<Archetype, { high: string; mid: string; low: string }> = {
  slop: {
    high: "This is your dominant energy. You ship at mass and ask questions later. Your terminal is always open, your PRs are always pending, and your side projects have side projects. You don\u2019t wait for permission\u2014you wait for forgiveness.",
    mid: "You\u2019ve got real Slop Cannon tendencies. You\u2019re not always the first to ship, but when you do, you move fast and figure out the details later. There\u2019s a builder in you that comes out when nobody\u2019s watching.",
    low: "You\u2019re not really a Slop Cannon, and honestly that\u2019s probably fine. You prefer to think before you ship, and \u201Cmove fast and break things\u201D sounds more like a threat than a motto to you.",
  },
  infra: {
    high: "This is your core identity. While everyone else is shipping and breaking things, you\u2019re the one quietly making sure \u201Cthings\u201D still exist to break. You read postmortems for fun and your monitoring dashboards are a work of art.",
    mid: "You\u2019ve got some Security in you. You care about reliability more than most people, and you\u2019ve definitely been the one to ask \u201Cbut what happens if this goes down?\u201D at least once in a meeting.",
    low: "Security isn\u2019t really your lane. You trust that someone else is keeping the lights on, and you\u2019d rather build the new thing than maintain the old one. The monitoring dashboard? You\u2019ve seen it once, maybe.",
  },
  hot: {
    high: "This is your superpower. Customers love you, coworkers gravitate toward you, and somehow you make even a standup feel fun. You make complex things feel simple and hard conversations feel easy. There are many ways to be hot, and you found yours.",
    mid: "You\u2019ve got some Hot People energy. You\u2019re not always the center of the room, but people genuinely like working with you, and you\u2019ve smoothed over more awkward situations than you probably realize.",
    low: "Hot People is not your vibe, and you know it. You\u2019d rather let your work speak for itself than be the one running the meeting or charming the client. Social energy is finite and you spend yours wisely.",
  },
  grown: {
    high: "This is your defining trait. When everyone else is moving fast, you\u2019re the one asking \u201Cbut should we?\u201D and being right about it 80% of the time. You\u2019ve prevented more disasters than anyone will ever know, and your spreadsheets have spreadsheets.",
    mid: "There\u2019s a Grown Up in you trying to get out. You don\u2019t always play it safe, but you\u2019ve got a practical streak that kicks in when things get real. You\u2019ve caught at least one near-disaster by asking the right question.",
    low: "Grown Up energy is not your thing. Process, planning, and risk management sound like things that happen to other people. You\u2019d rather move fast and deal with the consequences than spend another hour in a review meeting.",
  },
};

function getTieredDescription(type: Archetype, pct: number): string {
  const tier = TIERED_DESCRIPTIONS[type];
  if (pct >= 30) return tier.high;
  if (pct >= 15) return tier.mid;
  return tier.low;
}

function tieKey(types: Archetype[]): string {
  return [...types].sort().join("+");
}

const TIE_DESCRIPTIONS: Record<string, string> = {
  // 2-way ties
  [tieKey(["slop", "infra"])]:
    "You ship fast and somehow nothing breaks. You\u2019re the rare person who can hack together a prototype at 2am and then wake up the next morning to write the monitoring for it. You move at dangerous speed, but you\u2019ve also built the guardrails. Terrifying, honestly.",
  [tieKey(["slop", "hot"])]:
    "You\u2019re the person who builds the demo and then sells it in the same meeting. You move fast, you talk faster, and people somehow love you for it. Half the company thinks you\u2019re a genius, the other half has no idea what you actually do. Both are correct.",
  [tieKey(["slop", "grown"])]:
    "You ship at full speed but somehow always know when to pump the brakes. You\u2019ve got a side project for every day of the week and a spreadsheet tracking all of them. You\u2019re chaotic, but it\u2019s an organized chaos\u2014the most dangerous kind.",
  [tieKey(["infra", "hot"])]:
    "You\u2019re the person who explains the outage to the customer and somehow makes them feel better about it. You know where the bodies are buried and you deliver the news with grace. People trust you with both the systems and the relationships, which is an unreasonable amount of trust that you somehow deserve.",
  [tieKey(["infra", "grown"])]:
    "You are the reason the company will still exist in five years. You watch the dashboards and the budget. You read the postmortems and the quarterly reports. Everyone else is building the plane mid-flight and you\u2019re the one who remembered to check if there\u2019s fuel.",
  [tieKey(["hot", "grown"])]:
    "You\u2019re the person who can charm a room and then quietly reorganize the entire project plan afterward. You make people feel heard and then make sure what they said actually gets done. Half therapist, half project manager, fully indispensable.",

  // 3-way ties
  [tieKey(["slop", "infra", "hot"])]:
    "You build it, you keep it running, and you make everyone feel great about it. You\u2019re basically three people in a trenchcoat and somehow none of them are dropping the ball. The company would collapse without you but you\u2019d never say that out loud.",
  [tieKey(["slop", "infra", "grown"])]:
    "You ship fast, build it right, and know when to say no. You\u2019re the full stack of organizational competence\u2014equal parts chaos and control. Your coworkers can\u2019t figure out if you\u2019re a cowboy or a bureaucrat. The answer is yes.",
  [tieKey(["slop", "hot", "grown"])]:
    "You move fast, look good doing it, and somehow still remember to file the paperwork. You\u2019re the person who improvises a demo for a customer, nails it, and then sends a follow-up email with action items. Unhinged and professional in equal measure.",
  [tieKey(["infra", "hot", "grown"])]:
    "You\u2019re the steady hand that keeps everything and everyone together. You maintain the systems, manage the relationships, and make sure the trains run on time. You don\u2019t ship fast\u2014you ship right. And then you send a very nice Slack message about it.",

  // 4-way tie
  [tieKey(["slop", "infra", "hot", "grown"])]:
    "You are somehow all four jobs at once. You ship fast, keep things running, make people feel great, and still find time to ask \u201Cbut should we?\u201D You are either the most versatile person at your company or you just refuse to answer a personality quiz honestly. Either way, respect.",
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function generateResultImage(
  winner: Archetype,
  isTie: boolean,
  tiedWith: Archetype[],
  scores: Record<Archetype, number>,
): Promise<Blob> {
  const W = 540;
  const H = 960;
  const pad = 48;
  const contentW = W - pad * 2;
  const info = ARCHETYPE_INFO[winner];
  const description = isTie ? TIE_DESCRIPTIONS[tieKey(tiedWith)] : info.description;
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const sorted = (Object.entries(scores) as [Archetype, number][]).sort((a, b) => b[1] - a[1]);

  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = '14px "Special Elite", "Courier New", monospace';
  const descLines = wrapText(probe, description, contentW);

  probe.font = '12px "Special Elite", "Courier New", monospace';
  const archetypeBlocks = sorted.map(([type, count]) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const text = getTieredDescription(type as Archetype, pct);
    const lines = wrapText(probe, text, contentW - 12);
    return { type: type as Archetype, pct, lines };
  });
  const breakdownH = archetypeBlocks.reduce((h, b) => h + 22 + b.lines.length * 16 + 16, 0);
  const barSectionH = sorted.length * 36;
  const contentH = 40 + 28 + 56 + (isTie ? 28 : 0) + 20 + descLines.length * 21
    + 28 + barSectionH + 20 + 1 + 20 + breakdownH + 4 + 18 + 18;
  const topPad = Math.max(40, Math.floor((H - contentH) / 2));

  const canvas = document.createElement("canvas");
  const dpr = 2;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  ctx.fillStyle = "#faf8f5";
  ctx.fillRect(0, 0, W, H);

  const orbColor = info.color;
  const orbs = [
    { x: W * 0.2, y: H * 0.1, r: 180, opacity: 0.10 },
    { x: W * 0.8, y: H * 0.25, r: 150, opacity: 0.08 },
    { x: W * 0.5, y: H * 0.55, r: 200, opacity: 0.06 },
    { x: W * 0.15, y: H * 0.75, r: 120, opacity: 0.05 },
  ];
  for (const orb of orbs) {
    const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
    grad.addColorStop(0, orbColor + Math.round(orb.opacity * 255).toString(16).padStart(2, "0"));
    grad.addColorStop(1, orbColor + "00");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  let y = topPad;

  ctx.font = '10px "Special Elite", "Courier New", monospace';
  ctx.fillStyle = "#999";
  ctx.textAlign = "center";
  ctx.letterSpacing = "3px";
  ctx.fillText("THE ONLY 4 JOBS THAT WILL SURVIVE AT TECH COMPANIES", W / 2, y);
  y += 40;

  ctx.letterSpacing = "5px";
  ctx.font = '10px "Special Elite", "Courier New", monospace';
  ctx.fillStyle = "#888";
  const articleText = info.article ? ` ${info.article.toUpperCase()}` : "";
  ctx.fillText(`YOU ARE${articleText}`, W / 2, y);
  y += 12;

  ctx.letterSpacing = "0px";
  ctx.font = '44px "DM Serif Display", Georgia, serif';
  ctx.fillStyle = info.color;
  ctx.fillText(info.name, W / 2, y + 40);
  y += 56;

  if (isTie) {
    ctx.font = '10px "Special Elite", "Courier New", monospace';
    ctx.fillStyle = "#888";
    ctx.letterSpacing = "2px";
    const tieNames = tiedWith
      .filter((t) => t !== winner)
      .map((t) => ARCHETYPE_INFO[t].name)
      .join(" & ");
    ctx.fillText(`TIED WITH ${tieNames.toUpperCase()}`, W / 2, y);
    ctx.letterSpacing = "0px";
    y += 28;
  }

  y += 20;
  ctx.font = '14px "Special Elite", "Courier New", monospace';
  ctx.fillStyle = "#6b6b6b";
  ctx.textAlign = "center";
  for (const line of descLines) {
    ctx.fillText(line, W / 2, y);
    y += 21;
  }

  // score bars
  y += 28;
  ctx.textAlign = "left";
  for (const [type, count] of sorted) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const ai = ARCHETYPE_INFO[type];

    ctx.font = '12px "Special Elite", "Courier New", monospace';
    ctx.fillStyle = "#0a0a0a";
    ctx.fillText(ai.name, pad, y + 8);

    ctx.textAlign = "right";
    ctx.fillStyle = "#6b6b6b";
    ctx.fillText(`${pct}%`, W - pad, y + 8);
    ctx.textAlign = "left";

    y += 15;
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(pad, y, contentW, 5);
    ctx.fillStyle = ai.color;
    ctx.fillRect(pad, y, contentW * (pct / 100), 5);
    y += 21;
  }

  // archetype breakdown descriptions
  y += 20;
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(pad, y, contentW, 1);
  y += 20;

  for (const block of archetypeBlocks) {
    const ai = ARCHETYPE_INFO[block.type];

    ctx.font = 'bold 11px "Special Elite", "Courier New", monospace';
    ctx.fillStyle = ai.color;
    ctx.textAlign = "left";
    ctx.letterSpacing = "1px";
    ctx.fillText(`${ai.name.toUpperCase()}  \u2014  ${block.pct}%`, pad, y);
    ctx.letterSpacing = "0px";
    y += 18;

    ctx.font = '12px "Special Elite", "Courier New", monospace';
    ctx.fillStyle = "#888";
    for (const line of block.lines) {
      ctx.fillText(line, pad, y);
      y += 16;
    }
    y += 16;
  }

  // CTA
  y += 4;
  ctx.textAlign = "center";
  ctx.font = 'bold 13px "Special Elite", "Courier New", monospace';
  ctx.fillStyle = info.color;
  ctx.letterSpacing = "1px";
  ctx.fillText("Find out which job will be yours \u2192", W / 2, y);
  y += 18;
  ctx.font = '11px "Special Elite", "Courier New", monospace';
  ctx.fillStyle = "#999";
  ctx.letterSpacing = "2px";
  ctx.fillText("four-jobs-quiz.vercel.app", W / 2, y);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

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

function InfoModal({ info, pct, description, onClose }: {
  info: { name: string; article: string; color: string };
  pct: number;
  description: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-6"
      style={{ zIndex: 100 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative max-w-sm w-full animate-scale-in"
        style={{
          background: 'var(--background)',
          border: `1px solid var(--card-border)`,
          padding: '28px 24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center cursor-pointer text-sm"
          style={{ color: 'var(--muted)' }}
        >
          ✕
        </button>
        <div className="text-center mb-3">
          <p
            className="text-xs tracking-[0.2em] uppercase font-medium"
            style={{ color: info.color }}
          >
            {info.article ? `${info.article} ` : ""}{info.name}
          </p>
          <span className="text-xl font-light mt-1 block" style={{ color: info.color }}>{pct}%</span>
        </div>
        <p
          className="text-[14px] leading-[1.7]"
          style={{ color: 'var(--muted)' }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function ResultBreakdown({ scores }: { scores: Record<Archetype, number> }) {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const sorted = (Object.entries(scores) as [Archetype, number][]).sort((a, b) => b[1] - a[1]);
  const [modalType, setModalType] = useState<Archetype | null>(null);

  return (
    <>
      <div className="w-full max-w-sm space-y-4 text-left">
        {sorted.map(([type, count], i) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const info = ARCHETYPE_INFO[type];
          return (
            <div
              key={type}
              className="animate-fade-up"
              style={{ animationDelay: `${400 + i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-center mb-1.5">
                <span className="text-sm font-medium">{info.name}</span>
                <button
                  onClick={() => setModalType(type as Archetype)}
                  className="ml-1.5 cursor-pointer shrink-0 transition-colors duration-150"
                  style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                  }}
                  aria-label={`Read more about ${info.name}`}
                >
                  ›
                </button>
                <span className="ml-auto text-sm font-light tabular-nums" style={{ color: 'var(--muted)' }}>
                  {pct}%
                </span>
              </div>
              <div className="w-full h-[6px] overflow-hidden" style={{ backgroundColor: 'var(--progress-bg)' }}>
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
      {modalType && (() => {
        const modalPct = total > 0 ? Math.round((scores[modalType] / total) * 100) : 0;
        return (
          <InfoModal
            info={ARCHETYPE_INFO[modalType]}
            pct={modalPct}
            description={getTieredDescription(modalType, modalPct)}
            onClose={() => setModalType(null)}
          />
        );
      })()}
    </>
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

  const copyResults = useCallback(async () => {
    const { winner, isTie, tiedWith } = result;
    const blob = await generateResultImage(winner, isTie, tiedWith, scores);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz-result.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    const linkText = "Take the quiz: https://four-jobs-quiz.vercel.app";
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
          "text/plain": new Blob([linkText], { type: "text/plain" }),
        }),
      ]);
    } catch {
      try {
        await navigator.clipboard.writeText(linkText);
      } catch {
        // fallback: download still works
      }
    }

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      URL.revokeObjectURL(url);
    }, 2500);
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
              You are{info.article ? ` ${info.article}` : ""}
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
              {isTie ? TIE_DESCRIPTIONS[tieKey(tiedWith)] : info.description}
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
                {copied ? "Copied + Saved" : "Share Results"}
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
