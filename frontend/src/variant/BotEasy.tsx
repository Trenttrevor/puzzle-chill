import { useCallback, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { useStockfish } from "../bot/useStockfish";
import NavbarLux from "@/componentsdiy/NavbarLux";

/* ─────────────────────────────────────────────────────────
   DIFFICULTY SETUPS
   The handicap only applies to the bot (Black) — you (White)
   always play with the complete, standard army.
   Easy   → bot has no queen, no rooks
   Medium → bot has no queen
   Hard   → full, standard starting position for both sides
   ───────────────────────────────────────────────────────── */
type Difficulty = "easy" | "medium" | "hard";
type View = "categories" | "game";

interface DifficultyConfig {
  label: string;
  icon: string;
  desc: string;
  fen: string;
}

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: "Easy",
    icon: "🌱",
    desc: "Bot has no Queen, no Rook — you play with a full army",
    // Black (bot): no queen, no rooks → no castling rights for Black.
    // White (you): full standard setup, can still castle both sides.
    fen: "1nb1kbn1/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQ - 0 1",
  },
  medium: {
    label: "Medium",
    icon: "🌿",
    desc: "Bot has no Queen — you play with a full army",
    // Black (bot): no queen, rooks stay → Black keeps castling rights.
    fen: "rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  },
  hard: {
    label: "Hard",
    icon: "🌳",
    desc: "Full setup on both sides — the real deal",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  },
};

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"];

/* ─────────────────────────────────────────────────────────
   STYLES — Stardew Valley theme
   ───────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Tiny5&family=Baloo+2:wght@600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

  :root {
    --gold:       #e8a14d;
    --gold-light: #ffcb6b;
    --gold-dim:   #9c6b2e;
    --bg:         #2b2014;
    --bg2:        #3a2c1a;
    --border:     rgba(232,161,77,0.22);
    --text:       #f3e9d2;
    --muted:      #b89a72;
  }

  html, body { margin: 0; padding: 0; height: 100%; }

  .cb-page {
    position: fixed; inset: 0;
    display: flex; flex-direction: column;
    background: var(--bg);
    background-image:
      radial-gradient(circle at 15% 20%, rgba(122,168,76,0.10) 0%, transparent 45%),
      radial-gradient(circle at 85% 80%, rgba(76,122,168,0.08) 0%, transparent 45%);
    font-family: 'Quicksand', sans-serif;
    color: var(--text);
    overflow: hidden;
  }
  .cb-page::before {
    content: '';
    position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(232,161,77,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(232,161,77,0.035) 1px, transparent 1px);
    background-size: 32px 32px;
  }

  /* BODY GRID — desktop */
  .cb-body {
    position: relative; z-index: 1;
    flex: 1; min-height: 0;
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    grid-template-areas: "left center right";
    overflow: hidden;
  }

  /* SIDE PANELS */
  .cb-panel {
    display: flex; flex-direction: column;
    padding: 1rem; gap: 0.7rem;
    border-right: 3px solid var(--border);
    background: rgba(58,44,26,0.45);
    overflow-y: auto; overflow-x: hidden;
    grid-area: left;
  }
  .cb-panel-r {
    border-right: none; border-left: 3px solid var(--border);
    grid-area: right;
  }

  .cb-slabel {
    font-family: 'Tiny5', monospace;
    font-size: 0.7rem; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--gold-light);
    padding-bottom: 0.45rem;
    border-bottom: 2px dashed var(--border);
    flex-shrink: 0; margin: 0;
  }
  .cb-slabel-glow {
    font-family: 'Tiny5', monospace;
    font-size: 0.72rem; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--gold-light);
    padding-bottom: 0.45rem; border-bottom: 2px dashed var(--border);
    flex-shrink: 0; margin: 0;
    animation: goldPulse 2.5s ease-in-out infinite;
  }
  @keyframes goldPulse {
    0%,100% { opacity:.88; text-shadow: 0 0 5px rgba(255,203,107,.4), 0 0 10px rgba(122,168,76,.2); }
    50%      { opacity:1;   text-shadow: 0 0 9px rgba(255,203,107,.8), 0 0 20px rgba(122,168,76,.4); }
  }

  /* CARDS */
  .cb-card {
    border: 2px solid var(--border); border-radius: 6px; overflow: hidden;
    background: rgba(58,44,26,0.55); flex-shrink: 0;
  }
  .cb-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.4rem 0.7rem;
    border-bottom: 1px solid rgba(232,161,77,0.1);
    font-size: 0.73rem;
  }
  .cb-row:last-child { border-bottom: none; }
  .cb-rl { color: var(--muted); }
  .cb-rv { font-size: 0.9rem; font-weight: 700; color: var(--gold-light); }
  .cb-rv-g { color: #8fce5c; }
  .cb-rv-r { color: #e0705a; }
  .cb-rv-b { color: #6fb3d8; }

  /* BUTTONS — wooden sign / parchment style */
  .cb-btn {
    width: 100%; padding: 0.55rem 0.65rem;
    font-family: 'Quicksand', sans-serif; font-weight: 600; font-size: 0.78rem; letter-spacing: 0.02em;
    cursor: pointer; border-radius: 6px; transition: all 0.2s;
    border: 2px solid var(--border); background: rgba(58,44,26,0.6); color: var(--muted);
    text-align: center;
  }
  .cb-btn:hover { border-color: var(--gold-dim); color: var(--gold-light); background: rgba(232,161,77,0.1); transform: translateY(-1px); }
  .cb-btn-gold {
    background: linear-gradient(135deg, #8fce5c 0%, #4f8a2e 100%);
    border-color: #6fa83f; color: #fffceb; font-weight: 700;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 0 rgba(0,0,0,0.2);
  }
  .cb-btn-gold:hover {
    background: linear-gradient(135deg, #a3e070, #5f9c3a);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(143,206,92,0.3);
  }
  .cb-btn-danger { border-color: rgba(224,112,90,0.4); color: #d68a72; }
  .cb-btn-danger:hover { border-color: #e0705a; color: #e0705a; background: rgba(224,112,90,0.1); }

  .cb-hint-text {
    font-size: 0.7rem;
    color: var(--gold-light);
    border: 2px solid rgba(232,161,77,0.3);
    border-radius: 6px;
    padding: 0.5rem 0.65rem;
    background: rgba(232,161,77,0.08);
    line-height: 1.4;
  }

  /* MOVE LOG */
  .cb-movelog {
    flex: 1; min-height: 0;
    border: 2px solid var(--border); border-radius: 6px;
    background: rgba(58,44,26,0.5);
    overflow-y: auto; padding: 0.4rem 0.6rem;
    display: flex; flex-direction: column; gap: 0.15rem;
    scrollbar-width: thin; scrollbar-color: var(--gold-dim) transparent;
  }
  .cb-move-pair {
    display: grid; grid-template-columns: 22px 1fr 1fr;
    gap: 0.2rem; align-items: center; font-size: 0.72rem;
  }
  .cb-move-num { color: var(--muted); }
  .cb-move-w { color: var(--text); padding: 0.15rem 0.35rem; border-radius: 4px; }
  .cb-move-b { color: var(--muted); padding: 0.15rem 0.35rem; border-radius: 4px; }
  .cb-move-latest { background: rgba(232,161,77,0.15); color: var(--gold-light) !important; }

  /* CENTRE */
  .cb-center {
    grid-area: center;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 0.6rem 1rem; gap: 0.5rem;
    min-height: 0; overflow: hidden;
  }
  .cb-center.is-categories {
    align-items: stretch;
    justify-content: center;
    width: 100%;
    overflow-y: auto;
  }

  /* ── Difficulty picker (centre, "categories" view) ── */
  .cb-diff-wrap {
    width: 100%; max-width: 760px; margin: 0 auto;
    display: flex; flex-direction: column; gap: 1.1rem;
  }
  .cb-diff-intro { text-align: center; }
  .cb-diff-intro-title {
    font-family: 'Baloo 2', cursive; font-weight: 800;
    font-size: 1.5rem; color: var(--gold-light); margin: 0 0 0.3rem;
  }
  .cb-diff-intro-sub { font-size: 0.8rem; color: var(--muted); margin: 0; }

  .cb-diff-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 0.9rem;
  }
  .cb-diff-card {
    position: relative;
    display: flex; flex-direction: column; align-items: flex-start; gap: 0.3rem;
    padding: 1.1rem 1.15rem;
    min-height: 140px;
    background: rgba(58,44,26,0.6);
    border: 2px solid var(--border);
    border-left-width: 5px;
    border-radius: 10px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
  }
  .cb-diff-card:hover {
    background: rgba(232,161,77,0.1);
    transform: translateY(-3px);
    box-shadow: 0 8px 18px rgba(0,0,0,0.3);
  }
  .cb-diff-card.active {
    border-color: var(--gold);
    background: rgba(232,161,77,0.16);
    box-shadow: 0 0 0 1px rgba(232,161,77,0.3);
  }
  .cb-diff-card-easy   { border-left-color: #8fce5c; }
  .cb-diff-card-medium { border-left-color: var(--gold); }
  .cb-diff-card-hard   { border-left-color: #e0705a; }
  .cb-diff-card-icon { font-size: 1.6rem; }
  .cb-diff-card-label {
    font-family: 'Baloo 2', cursive; font-weight: 700;
    font-size: 1.05rem; color: var(--text);
  }
  .cb-diff-card-desc { font-size: 0.74rem; color: var(--muted); line-height: 1.4; }
  .cb-diff-card-tag {
    position: absolute; top: 0.7rem; right: 0.8rem;
    font-family: 'Tiny5', monospace; font-size: 0.6rem; letter-spacing: 0.06em;
    color: var(--gold-light); text-transform: uppercase;
  }

  /* Puzzle-style back button */
  .cb-back-btn {
    align-self: flex-start;
    display: inline-flex; align-items: center; gap: 0.35rem;
    background: transparent; border: none;
    color: var(--muted); font-family: 'Quicksand', sans-serif; font-weight: 600;
    font-size: 0.74rem; cursor: pointer; padding: 0.2rem 0;
    flex-shrink: 0; transition: color 0.15s;
  }
  .cb-back-btn:hover { color: var(--gold-light); }

  /* STATUS PILL */
  .cb-status {
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-family: 'Tiny5', monospace;
    font-size: 0.72rem; letter-spacing: 0.04em;
    padding: 0.28rem 0.9rem; border-radius: 100px; border: 2px solid;
    transition: all 0.3s; flex-shrink: 0; white-space: nowrap;
  }
  .cb-status-playing  { border-color: var(--border); color: var(--muted); background: rgba(58,44,26,0.4); }
  .cb-status-thinking { border-color: rgba(232,161,77,0.4); color: var(--gold-light); background: rgba(232,161,77,0.08); }
  .cb-status-check    { border-color: rgba(224,160,60,0.45); color: #f0c070; background: rgba(224,160,60,0.1); }
  .cb-status-lost     { border-color: rgba(224,112,90,0.4); color: #e0705a; background: rgba(224,112,90,0.1); }
  .cb-status-won      { border-color: rgba(143,206,92,0.45); color: #8fce5c; background: rgba(143,206,92,0.1); }
  .cb-status-draw     { border-color: rgba(232,161,77,0.4); color: var(--gold-light); background: rgba(232,161,77,0.08); }
  .cb-sdot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: sdot 2s infinite; }
  @keyframes sdot { 0%,100%{opacity:1} 50%{opacity:.25} }

  /* BOARD */
  .cb-board-wrap {
    position: relative;
    width: min(calc(100vh - 220px), calc(100vw - 420px));
    aspect-ratio: 1;
    flex-shrink: 0;
    border-radius: 8px;
    box-shadow: 0 0 0 4px #5c4326, 0 0 0 6px var(--gold-dim), 0 8px 24px rgba(0,0,0,0.4);
  }

  /* PLAYER BARS */
  .cb-player-bar {
    width: min(calc(100vh - 220px), calc(100vw - 420px));
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.3rem 0.65rem;
    border: 2px solid var(--border); border-radius: 6px;
    background: rgba(58,44,26,0.65);
    font-size: 0.78rem; flex-shrink: 0;
  }
  .cb-player-info { display: flex; align-items: center; gap: 0.5rem; }
  .cb-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; border: 2px solid var(--border);
  }
  .cb-avatar-bot { background: rgba(111,179,216,0.15); border-color: rgba(111,179,216,0.3); }
  .cb-avatar-you { background: rgba(143,206,92,0.15); border-color: rgba(143,206,92,0.3); }
  .cb-pname  { font-weight: 700; color: var(--text); font-size: 0.75rem; }
  .cb-prating { font-size: 0.65rem; color: var(--muted); }
  .cb-captured { font-size: 0.7rem; color: var(--muted); letter-spacing: 0.03em; }

  /* THINKING */
  .cb-thinking {
    display: flex; align-items: center; gap: 0.3rem;
    font-size: 0.68rem; color: var(--gold-light); letter-spacing: 0.04em;
  }
  .cb-think-dot {
    width: 4px; height: 4px; border-radius: 50%; background: var(--gold-light);
    animation: thinkDot 1.2s ease-in-out infinite;
  }
  .cb-think-dot:nth-child(2) { animation-delay: 0.2s; }
  .cb-think-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes thinkDot { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }

  /* CAPTURE BURST — little harvest pop where a piece is taken */
  .cb-capture-burst {
    position: absolute;
    width: 12.5%; height: 12.5%;
    display: flex; align-items: center; justify-content: center;
    pointer-events: none; z-index: 5;
    transform: translate(-50%, -50%);
  }
  .cb-capture-burst-ring {
    position: absolute; inset: 0;
    border-radius: 50%;
    border: 3px solid #ffcb6b;
    animation: captureRing 0.55s ease-out forwards;
  }
  .cb-capture-burst-leaf {
    position: absolute;
    font-size: 1.1rem;
    animation: captureLeaf 0.6s ease-out forwards;
  }
  .cb-capture-burst-leaf:nth-child(2) { animation-delay: 0.02s; }
  .cb-capture-burst-leaf:nth-child(3) { animation-delay: 0.05s; }
  .cb-capture-burst-leaf:nth-child(4) { animation-delay: 0.08s; }
  @keyframes captureRing {
    0%   { opacity: 0.9; transform: scale(0.3); border-width: 4px; }
    100% { opacity: 0;   transform: scale(1.9); border-width: 1px; }
  }
  @keyframes captureLeaf {
    0%   { opacity: 1; transform: translate(0,0) scale(0.6) rotate(0deg); }
    100% { opacity: 0; transform: translate(var(--cbx,18px), var(--cby,-22px)) scale(1.1) rotate(50deg); }
  }

  /* CORNERS — little leaf/vine accents */
  .cb-corner {
    position: absolute; width: 14px; height: 14px;
    border-color: #8fce5c; border-style: solid; opacity: 0.6; z-index: 1; pointer-events: none;
  }
  .cb-corner-tl { top:-4px; left:-4px; border-width:3px 0 0 3px; border-radius: 6px 0 0 0; }
  .cb-corner-tr { top:-4px; right:-4px; border-width:3px 3px 0 0; border-radius: 0 6px 0 0; }
  .cb-corner-bl { bottom:-4px; left:-4px; border-width:0 0 3px 3px; border-radius: 0 0 0 6px; }
  .cb-corner-br { bottom:-4px; right:-4px; border-width:0 3px 3px 0; border-radius: 0 0 6px 0; }

  /* OVERLAY */
  .cb-overlay {
    position: absolute; inset: 0; z-index: 10;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 0.7rem;
    backdrop-filter: blur(8px);
    background: rgba(43,32,20,0.92);
    border: 2px solid var(--border);
    border-radius: 8px;
    animation: fadeIn 0.25s ease;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .cb-ov-icon  { font-family: 'Tiny5', monospace; font-size: 3rem; }
  .cb-ov-title { font-family: 'Tiny5', monospace; font-size: 1.7rem; font-weight: 700; margin: 0; letter-spacing: 0.05em; }
  .cb-ov-sub   { color: var(--muted); font-size: 0.77rem; text-align: center; padding: 0 1rem; }
  .cb-ov-btns  { display: flex; gap: 0.5rem; margin-top: 0.4rem; }
  .cb-ov-btns .cb-btn { width: auto; padding: 0.5rem 1.3rem; }

  /* ── MOBILE TOP BAR ── */
  .cb-mobile-top {
    display: none;
    position: relative; z-index: 1;
    flex-direction: row; align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    border-bottom: 2px solid var(--border);
    background: rgba(58,44,26,0.4);
    flex-shrink: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .cb-mobile-top::-webkit-scrollbar { display: none; }
  .cb-mb-back {
    display: inline-flex; align-items: center; gap: 0.3rem;
    background: rgba(58,44,26,0.6); border: 2px solid var(--border);
    color: var(--muted); font-family: 'Quicksand', sans-serif; font-weight: 600;
    font-size: 0.64rem; padding: 0.28rem 0.55rem; border-radius: 6px; cursor: pointer;
    flex-shrink: 0;
  }
  .cb-mb-back:hover { border-color: var(--gold-dim); color: var(--gold-light); }
  .cb-mb-title {
    font-family: 'Baloo 2', cursive; font-weight: 700;
    font-size: 0.76rem; color: var(--gold-light);
  }

  /* ── MOBILE BOTTOM BAR ── */
  .cb-mobile-bottom {
    display: none;
    position: relative; z-index: 1;
    flex-direction: row; align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    border-top: 2px solid var(--border);
    background: rgba(58,44,26,0.4);
    flex-shrink: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .cb-mobile-bottom::-webkit-scrollbar { display: none; }

  /* shared chip style */
  .cb-chip {
    display: inline-flex; align-items: center; gap: 0.3rem;
    padding: 0.3rem 0.65rem;
    border: 2px solid var(--border); border-radius: 6px;
    background: rgba(58,44,26,0.5); color: var(--muted);
    font-family: 'Quicksand', sans-serif; font-weight: 600; font-size: 0.65rem;
    white-space: nowrap; cursor: pointer; flex-shrink: 0;
    transition: all 0.18s;
  }
  .cb-chip:hover { border-color: var(--gold-dim); color: var(--gold-light); }
  .cb-chip-gold {
    background: linear-gradient(135deg, #8fce5c 0%, #4f8a2e 100%);
    border-color: #6fa83f; color: #fffceb; font-weight: 700;
  }
  .cb-chip-danger { border-color: rgba(224,112,90,0.4); color: #d68a72; }
  .cb-chip-danger:hover { border-color: #e0705a; color: #e0705a; }

  .cb-mb-divider { width: 1px; height: 16px; background: var(--border); flex-shrink: 0; }

  /* mobile move log: horizontal scrollable row */
  .cb-movelog-mobile {
    display: flex; flex-direction: row; align-items: center;
    gap: 0.3rem; overflow-x: auto; flex: 1;
    scrollbar-width: none;
  }
  .cb-movelog-mobile::-webkit-scrollbar { display: none; }
  .cb-move-token {
    display: inline-flex; align-items: center; gap: 0.2rem;
    font-size: 0.62rem; white-space: nowrap; flex-shrink: 0;
  }
  .cb-move-token-num { color: var(--muted); }
  .cb-move-token-w   { color: var(--text); }
  .cb-move-token-b   { color: var(--muted); }
  .cb-move-token-latest { color: var(--gold-light) !important; }

  /* thinking inline */
  .cb-think-inline {
    display: flex; align-items: center; gap: 0.25rem;
    font-size: 0.6rem; color: var(--gold-light); flex-shrink: 0;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 680px) {
    .cb-panel, .cb-panel-r { display: none; }
    .cb-mobile-top    { display: flex; }

    .cb-body {
      grid-template-columns: 1fr;
      grid-template-areas: "center";
    }

    .cb-center {
      padding: 0.45rem 0.5rem;
      gap: 0.4rem;
      justify-content: flex-start;
    }

    .cb-board-wrap {
      width: calc(100vw - 1rem);
    }

    .cb-player-bar {
      width: calc(100vw - 1rem);
      padding: 0.25rem 0.5rem;
      font-size: 0.7rem;
    }

    .cb-pname  { font-size: 0.68rem; }
    .cb-prating { font-size: 0.58rem; }
    .cb-captured { font-size: 0.62rem; }

    .cb-status {
      font-size: 0.62rem;
      padding: 0.18rem 0.65rem;
    }

    .cb-ov-icon  { font-size: 2.2rem; }
    .cb-ov-title { font-size: 1.3rem; }
    .cb-ov-sub   { font-size: 0.68rem; }

    .cb-diff-grid { grid-template-columns: 1fr; }
    .cb-diff-card { min-height: 100px; padding: 0.9rem 1rem; }

    /* Only show the mobile action bar once a game is actually on screen */
    .cb-mobile-bottom.is-visible { display: flex; }
  }

  @media (min-width: 681px) and (max-width: 900px) {
    .cb-body { grid-template-columns: 150px 1fr 150px; }
    .cb-panel, .cb-panel-r { padding: 0.75rem 0.65rem; gap: 0.55rem; }
    .cb-slabel, .cb-slabel-glow { font-size: 0.62rem; }
    .cb-btn { font-size: 0.68rem; padding: 0.42rem 0.5rem; }
    .cb-board-wrap {
      width: min(calc(100vh - 200px), calc(100vw - 320px));
    }
    .cb-player-bar {
      width: min(calc(100vh - 200px), calc(100vw - 320px));
    }
  }
`;

/* ─────────────────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────────────────── */
type GameStatus = "playing" | "thinking" | "check" | "won" | "lost" | "draw";
interface MovePair {
  num: number;
  white: string;
  black?: string;
}
interface CaptureBurst {
  id: number;
  square: string;
}

/* ─────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────── */
function deriveStatus(game: Chess): GameStatus {
  if (game.isCheckmate()) return game.turn() === "w" ? "lost" : "won";
  if (
    game.isDraw() ||
    game.isStalemate() ||
    game.isThreefoldRepetition() ||
    game.isInsufficientMaterial()
  )
    return "draw";
  if (game.inCheck()) return "check";
  return "playing";
}

/* For en passant, the captured pawn sits behind the destination square, not on it. */
function capturedSquare(move: {
  to: string;
  from: string;
  flags: string;
}): string {
  if (move.flags.includes("e")) {
    const file = move.to[0];
    const rank = move.from[1];
    return `${file}${rank}`;
  }
  return move.to;
}

/* Board is always oriented "white" in this component, so a1 is bottom-left. */
function squareToPercent(square: string): { left: string; top: string } {
  const file = square.charCodeAt(0) - "a".charCodeAt(0); // 0-7
  const rank = parseInt(square[1], 10) - 1; // 0-7
  const col = file;
  const row = 7 - rank;
  const left = `${(col + 0.5) * 12.5}%`;
  const top = `${(row + 0.5) * 12.5}%`;
  return { left, top };
}

/* ─────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────── */
const BotEasy = () => {
  /* view = "categories" → the difficulty grid in the centre.
     view = "game"       → the actual chessboard in the centre. */
  const [view, setView] = useState<View>("categories");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const chessRef = useRef<Chess>(new Chess(DIFFICULTY_CONFIG.hard.fen));

  const [fen, setFen] = useState(DIFFICULTY_CONFIG.hard.fen);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [isThinking, setIsThinking] = useState(false);
  const [captureBursts, setCaptureBursts] = useState<CaptureBurst[]>([]);
  const burstIdRef = useRef(0);

  const spawnCaptureBurst = (square: string) => {
    const id = ++burstIdRef.current;
    setCaptureBursts((prev) => [...prev, { id, square }]);
    setTimeout(() => {
      setCaptureBursts((prev) => prev.filter((b) => b.id !== id));
    }, 650);
  };

  const movePairsRef = useRef<MovePair[]>([]);
  const capturedBlackRef = useRef<string[]>([]);
  const capturedWhiteRef = useRef<string[]>([]);
  const moveLogRef = useRef<HTMLDivElement>(null);
  const moveLogMobileRef = useRef<HTMLDivElement>(null);

  /* Tap/click-to-move: the square currently selected, and the legal
     destination squares for the piece sitting on it (shown as dots). */
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);

  const scrollLog = () => {
    setTimeout(() => {
      moveLogRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
      moveLogMobileRef.current?.scrollTo({ left: 99999, behavior: "smooth" });
    }, 50);
  };

  const appendWhite = (san: string, pairNum: number) => {
    movePairsRef.current = [
      ...movePairsRef.current,
      { num: pairNum, white: san },
    ];
  };

  const appendBlack = (san: string) => {
    const pairs = movePairsRef.current;
    if (pairs.length === 0) return;
    const last = pairs[pairs.length - 1];
    movePairsRef.current = [...pairs.slice(0, -1), { ...last, black: san }];
  };

  const handleBestMove = useCallback((bestMove: string) => {
    const game = chessRef.current;
    if (!bestMove) return;

    const engineMove = game.move({
      from: bestMove.slice(0, 2),
      to: bestMove.slice(2, 4),
      promotion: "q",
    });
    if (!engineMove) return;

    if (engineMove.captured) {
      capturedBlackRef.current = [
        ...capturedBlackRef.current,
        engineMove.captured.toUpperCase(),
      ];
      spawnCaptureBurst(capturedSquare(engineMove));
    }
    appendBlack(engineMove.san);
    scrollLog();

    setFen(game.fen());
    setIsThinking(false);
    setStatus(deriveStatus(game));
  }, []);

  const { getBestMove } = useStockfish(handleBestMove);

  /* Shared by drag-and-drop and tap/click-to-move. Returns true if a legal
     chess move was made (regardless of what happens after). */
  const attemptPlayerMove = useCallback(
    (sourceSquare: string, targetSquare: string): boolean => {
      const game = chessRef.current;
      if (game.turn() !== "w") return false;
      if (!sourceSquare || !targetSquare || sourceSquare === targetSquare)
        return false;

      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      if (!move) return false;

      const pairNum = game.moveNumber() - 1;
      if (move.captured) {
        capturedWhiteRef.current = [
          ...capturedWhiteRef.current,
          move.captured.toUpperCase(),
        ];
        spawnCaptureBurst(capturedSquare(move));
      }
      appendWhite(move.san, pairNum);
      scrollLog();

      setFen(game.fen());
      const newStatus = deriveStatus(game);
      setStatus(newStatus);

      if (newStatus === "playing" || newStatus === "check") {
        setIsThinking(true);
        setStatus("thinking");
        setTimeout(() => getBestMove(game.fen()), 300);
      }

      return true;
    },
    [getBestMove],
  );

  const playerMove = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      setSelectedSquare(null);
      setLegalTargets([]);
      if (!targetSquare) return false;
      return attemptPlayerMove(sourceSquare, targetSquare);
    },
    [attemptPlayerMove],
  );

  /* Tap/click-to-move:
     - click your own piece → select it, show legal dots
     - click the same square again → deselect
     - click a highlighted square → play the move
     - click a different one of your own pieces → reselect */
  const handleSquareClick = ({ square }: { square: string }) => {
    const game = chessRef.current;
    const interactive =
      status === "playing" || status === "check" ? true : false;
    if (!interactive || game.turn() !== "w") return;

    if (selectedSquare && legalTargets.includes(square)) {
      attemptPlayerMove(selectedSquare, square);
      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalTargets([]);
      return;
    }

    const piece = game.get(square as any);
    if (piece && piece.color === game.turn()) {
      const moves = game.moves({
        square: square as any,
        verbose: true,
      }) as Array<{
        to: string;
      }>;
      setSelectedSquare(square);
      setLegalTargets(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalTargets([]);
    }
  };

  /* Highlight the selected square and its legal destinations. Occupied
     targets (captures) get a ring; empty targets get a small dot. */
  const squareStyles = (() => {
    const game = chessRef.current;
    const styles: Record<string, CSSProperties> = {};
    if (selectedSquare) {
      styles[selectedSquare] = { background: "rgba(232,161,77,0.35)" };
    }
    legalTargets.forEach((sq) => {
      const occupied = !!game.get(sq as any);
      styles[sq] = occupied
        ? {
            background:
              "radial-gradient(circle, transparent 58%, rgba(232,161,77,0.6) 60%)",
          }
        : {
            background:
              "radial-gradient(circle, rgba(232,161,77,0.6) 20%, transparent 21%)",
          };
    });
    return styles;
  })();

  /* Pick a difficulty from the grid (or the left nav) → jump into the board
     with that difficulty's starting setup. */
  const startGame = (diff: Difficulty) => {
    const startFen = DIFFICULTY_CONFIG[diff].fen;
    chessRef.current = new Chess(startFen);

    movePairsRef.current = [];
    capturedBlackRef.current = [];
    capturedWhiteRef.current = [];

    setDifficulty(diff);
    setFen(startFen);
    setStatus("playing");
    setIsThinking(false);
    setCaptureBursts([]);
    setSelectedSquare(null);
    setLegalTargets([]);
    setView("game");
  };

  /* "New Game" while already playing → restart at the same difficulty. */
  const resetGame = () => {
    if (!difficulty) return;
    startGame(difficulty);
  };

  const changeDifficulty = () => {
    setView("categories");
  };

  const undoMove = () => {
    const g = chessRef.current;
    g.undo();
    g.undo();

    const pairs = movePairsRef.current;
    const last = pairs[pairs.length - 1];
    if (last) {
      if (last.black) {
        movePairsRef.current = [
          ...pairs.slice(0, -1),
          { ...last, black: undefined },
        ];
      } else {
        movePairsRef.current = pairs.slice(0, -1);
      }
    }

    setFen(g.fen());
    setStatus(deriveStatus(g));
    setIsThinking(false);
    setCaptureBursts([]);
    setSelectedSquare(null);
    setLegalTargets([]);
  };

  const isOver = ["won", "lost", "draw"].includes(status);
  const pairs = movePairsRef.current;

  const statusLabel: Record<GameStatus, string> = {
    playing: "Your turn — play as White",
    thinking: "Engine thinking…",
    check: "Check! Defend your king",
    won: "You won by checkmate",
    lost: "Engine wins by checkmate",
    draw: "Game drawn",
  };

  return (
    <>
      <style>{css}</style>
      <div className="cb-page">
        <NavbarLux />

        {/* ── MOBILE TOP ── */}
        <div className="cb-mobile-top">
          {view === "game" ? (
            <>
              <button className="cb-mb-back" onClick={changeDifficulty}>
                ← Difficulty
              </button>
              <div className="cb-movelog-mobile" ref={moveLogMobileRef}>
                {pairs.length === 0 && (
                  <span style={{ fontSize: "0.62rem", color: "var(--muted)" }}>
                    No moves yet…
                  </span>
                )}
                {pairs.map((pair, i) => {
                  const isLast = i === pairs.length - 1;
                  return (
                    <span className="cb-move-token" key={pair.num}>
                      <span className="cb-move-token-num">{pair.num}.</span>
                      <span
                        className={`cb-move-token-w${isLast && !pair.black ? " cb-move-token-latest" : ""}`}
                      >
                        {pair.white}
                      </span>
                      {pair.black && (
                        <span
                          className={`cb-move-token-b${isLast && pair.black ? " cb-move-token-latest" : ""}`}
                        >
                          {pair.black}
                        </span>
                      )}
                    </span>
                  );
                })}
                {isThinking && (
                  <div className="cb-think-inline">
                    <span className="cb-think-dot" />
                    <span className="cb-think-dot" />
                    <span className="cb-think-dot" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <span className="cb-mb-title">
              🌻 Chill Bot — Choose Difficulty
            </span>
          )}
        </div>

        <div className="cb-body">
          {/* LEFT PANEL — desktop/tablet */}
          <div className="cb-panel">
            <p className="cb-slabel-glow">🌻 Chill Bot Ready</p>
            {view === "game" ? (
              <>
                <p className="cb-slabel">Actions</p>
                <button className="cb-btn cb-btn-gold" onClick={resetGame}>
                  New Game
                </button>
                <button className="cb-btn cb-btn-danger" onClick={undoMove}>
                  Undo Last Move
                </button>
                <button className="cb-btn" onClick={changeDifficulty}>
                  ← Change Difficulty
                </button>
              </>
            ) : (
              <>
                <p className="cb-slabel">Difficulty</p>
                {DIFFICULTY_ORDER.map((key) => {
                  const cfg = DIFFICULTY_CONFIG[key];
                  return (
                    <button
                      key={key}
                      className={`cb-btn${difficulty === key ? " cb-btn-gold" : ""}`}
                      onClick={() => startGame(key)}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* CENTRE — either the difficulty grid, or the board */}
          <div
            className={`cb-center${view === "categories" ? " is-categories" : ""}`}
          >
            {view === "categories" ? (
              <div className="cb-diff-wrap">
                <div className="cb-diff-intro">
                  <p className="cb-diff-intro-title">🌻 Chill Bot Ready!!</p>
                  <p className="cb-diff-intro-sub">
                    Pick a difficulty to start your match against the engine.
                  </p>
                </div>

                <div className="cb-diff-grid">
                  {DIFFICULTY_ORDER.map((key) => {
                    const cfg = DIFFICULTY_CONFIG[key];
                    return (
                      <button
                        key={key}
                        className={`cb-diff-card cb-diff-card-${key}${difficulty === key ? " active" : ""}`}
                        onClick={() => startGame(key)}
                      >
                        <span className="cb-diff-card-tag">{key}</span>
                        <span className="cb-diff-card-icon">{cfg.icon}</span>
                        <span className="cb-diff-card-label">{cfg.label}</span>
                        <span className="cb-diff-card-desc">{cfg.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <button className="cb-back-btn" onClick={changeDifficulty}>
                  ← Change Difficulty
                </button>

                <div className={`cb-status cb-status-${status}`}>
                  {!isOver && <span className="cb-sdot" />}
                  {statusLabel[status]}
                </div>

                {/* Bot bar */}
                <div className="cb-player-bar">
                  <div className="cb-player-info">
                    <div className="cb-avatar cb-avatar-bot">🤖</div>
                    <div>
                      <div className="cb-pname">Junimo Bot</div>
                      <div className="cb-prating">Black</div>
                    </div>
                  </div>
                  <div className="cb-captured">
                    {capturedBlackRef.current.join(" ")}
                  </div>
                  {isThinking && (
                    <div className="cb-thinking">
                      <span className="cb-think-dot" />
                      <span className="cb-think-dot" />
                      <span className="cb-think-dot" />
                      thinking
                    </div>
                  )}
                </div>

                {/* Board */}
                <div className="cb-board-wrap">
                  <div className="cb-corner cb-corner-tl" />
                  <div className="cb-corner cb-corner-tr" />
                  <div className="cb-corner cb-corner-bl" />
                  <div className="cb-corner cb-corner-br" />

                  {captureBursts.map((b) => {
                    const pos = squareToPercent(b.square);
                    return (
                      <div
                        key={b.id}
                        className="cb-capture-burst"
                        style={{ left: pos.left, top: pos.top }}
                      >
                        <div className="cb-capture-burst-ring" />
                        <span
                          className="cb-capture-burst-leaf"
                          style={
                            {
                              "--cbx": "20px",
                              "--cby": "-24px",
                            } as CSSProperties
                          }
                        >
                          🍃
                        </span>
                        <span
                          className="cb-capture-burst-leaf"
                          style={
                            {
                              "--cbx": "-22px",
                              "--cby": "-18px",
                            } as CSSProperties
                          }
                        >
                          🍂
                        </span>
                        <span
                          className="cb-capture-burst-leaf"
                          style={
                            {
                              "--cbx": "16px",
                              "--cby": "20px",
                            } as CSSProperties
                          }
                        >
                          ✨
                        </span>
                        <span
                          className="cb-capture-burst-leaf"
                          style={
                            {
                              "--cbx": "-18px",
                              "--cby": "18px",
                            } as CSSProperties
                          }
                        >
                          🍃
                        </span>
                      </div>
                    );
                  })}

                  {isOver && (
                    <div className="cb-overlay">
                      <div className="cb-ov-icon">
                        {status === "won"
                          ? "🏆"
                          : status === "lost"
                            ? "🥀"
                            : "🌾"}
                      </div>
                      <p
                        className="cb-ov-title"
                        style={{
                          color:
                            status === "won"
                              ? "#8fce5c"
                              : status === "lost"
                                ? "#e0705a"
                                : "var(--gold-light)",
                        }}
                      >
                        {status === "won"
                          ? "Victory"
                          : status === "lost"
                            ? "Defeated"
                            : "Draw"}
                      </p>
                      <div className="cb-ov-sub">
                        {status === "won" &&
                          "Checkmate — you outplayed the engine"}
                        {status === "lost" &&
                          "The engine found a forced checkmate"}
                        {status === "draw" && "The game ended in a draw"}
                      </div>
                      <div className="cb-ov-btns">
                        <button
                          className="cb-btn cb-btn-gold"
                          onClick={resetGame}
                        >
                          Play Again
                        </button>
                        <button className="cb-btn" onClick={changeDifficulty}>
                          Change Difficulty
                        </button>
                      </div>
                    </div>
                  )}

                  <Chessboard
                    options={{
                      position: fen,
                      onPieceDrop: playerMove,
                      onSquareClick: handleSquareClick,
                      squareStyles,
                      boardOrientation: "white",
                      darkSquareStyle: { backgroundColor: "#7a8450" },
                      lightSquareStyle: { backgroundColor: "#e8dcb5" },
                    }}
                  />
                </div>

                {/* Player bar */}
                <div className="cb-player-bar">
                  <div className="cb-player-info">
                    <div className="cb-avatar cb-avatar-you">🧑‍🌾</div>
                    <div>
                      <div className="cb-pname">You</div>
                      <div className="cb-prating">White</div>
                    </div>
                  </div>
                  <div className="cb-captured">
                    {capturedWhiteRef.current.join(" ")}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT PANEL — desktop/tablet */}
          <div className="cb-panel cb-panel-r">
            {view === "categories" ? (
              <>
                <p className="cb-slabel">Get Started</p>
                <div className="cb-hint-text">
                  🌱 Pick a difficulty card in the middle to start your match.
                </div>
              </>
            ) : (
              <>
                <p className="cb-slabel">Move Log</p>
                <div className="cb-movelog" ref={moveLogRef}>
                  {pairs.length === 0 && (
                    <div
                      style={{
                        color: "var(--muted)",
                        fontSize: "0.72rem",
                        padding: "0.3rem 0",
                      }}
                    >
                      No moves yet…
                    </div>
                  )}
                  {pairs.map((pair, i) => {
                    const isLast = i === pairs.length - 1;
                    return (
                      <div className="cb-move-pair" key={pair.num}>
                        <span className="cb-move-num">{pair.num}.</span>
                        <span
                          className={`cb-move-w${isLast && !pair.black ? " cb-move-latest" : ""}`}
                        >
                          {pair.white}
                        </span>
                        <span
                          className={`cb-move-b${isLast && pair.black ? " cb-move-latest" : ""}`}
                        >
                          {pair.black ?? ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── MOBILE BOTTOM: actions — game view only ── */}
        <div
          className={`cb-mobile-bottom${view === "game" ? " is-visible" : ""}`}
        >
          <button className="cb-chip cb-chip-gold" onClick={resetGame}>
            New Game
          </button>
          <button className="cb-chip cb-chip-danger" onClick={undoMove}>
            ↺ Undo
          </button>
          <div className="cb-mb-divider" />
          <button className="cb-chip" onClick={changeDifficulty}>
            ← Difficulty
          </button>
        </div>
      </div>
    </>
  );
};

export default BotEasy;
