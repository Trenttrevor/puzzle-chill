import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import type { PieceDropHandlerArgs } from "react-chessboard";
import puzzlesData from "@/data/puzzle_1900.json";
import NavbarLux from "./NavbarLux";

type Puzzles = {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
};

type Status = "playing" | "wrong" | "correct";
type Theme = "skewer" | "pin" | "fork" | "middlegame";
interface CaptureBurst {
  id: number;
  square: string;
}

const themes: { value: Theme; label: string }[] = [
  { value: "skewer", label: "Skewer" },
  { value: "pin", label: "Pin" },
  { value: "fork", label: "Fork" },
  { value: "middlegame", label: "Middlegame" },
];

const pieceNames: Record<string, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

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

/* Always compute as if board is white-oriented (a1 bottom-left); the parent
   .plx-capture-layer flips itself with a CSS transform when orientation is black,
   so the math here stays identical to the always-white BotEasy.tsx board. */
function squareToPercent(square: string): { left: string; top: string } {
  const file = square.charCodeAt(0) - "a".charCodeAt(0); // 0-7
  const rank = parseInt(square[1], 10) - 1; // 0-7
  const col = file;
  const row = 7 - rank;
  const left = `${(col + 0.5) * 12.5}%`;
  const top = `${(row + 0.5) * 12.5}%`;
  return { left, top };
}

const PuzzleLuxPointsTest = () => {
  const [game, setGame] = useState<Chess>(new Chess());
  const [moveIndex, setMoveIndex] = useState(0);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [status, setStatus] = useState<Status>("playing");
  const [theme, setTheme] = useState<Theme>("skewer");
  const [boardVisible, setBoardVisible] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [captureBursts, setCaptureBursts] = useState<CaptureBurst[]>([]);
  const [burstId, setBurstId] = useState(0);

  const spawnCaptureBurst = (square: string) => {
    const id = burstId + 1;
    setBurstId(id);
    setCaptureBursts((prev) => [...prev, { id, square }]);
    setTimeout(() => {
      setCaptureBursts((prev) => prev.filter((b) => b.id !== id));
    }, 650);
  };

  const allThemes = new Set(puzzlesData.flatMap((puzzle) => puzzle.themes));
  console.log([...allThemes]);

  const filteredPuzzle = puzzlesData.filter((pt) => pt.themes.includes(theme));

  const [puzzleIndex, setPuzzleIndex] = useState(() =>
    Math.floor(Math.random() * filteredPuzzle.length),
  );

  const currentPuzzle: Puzzles = filteredPuzzle[puzzleIndex];

  const getRandomIndex = (length: number) => Math.floor(Math.random() * length);

  const reset = () => {
    setBoardVisible(false);
    setHint(null);
    setCaptureBursts([]);
    const newGame = new Chess(currentPuzzle.fen);
    setPlayerColor(newGame.turn() === "w" ? "b" : "w");
    setStatus("playing");
    setGame(newGame);
    setMoveIndex(0);
    setTimeout(() => {
      computerMove(newGame, 0);
      setTimeout(() => setBoardVisible(true), 50);
    }, 500);
  };

  const showHint = () => {
    const correctMove = currentPuzzle.moves[moveIndex];
    if (!correctMove) return;
    const square = correctMove.slice(0, 2);
    const piece = game.get(square as any);
    if (piece) setHint(`Move your ${pieceNames[piece.type]}`);
  };

  useEffect(() => {
    setPuzzleIndex(getRandomIndex(filteredPuzzle.length));
  }, [theme]);

  useEffect(() => {
    if (currentPuzzle) reset();
  }, [puzzleIndex]);

  const onPieceDrop = ({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs): boolean => {
    if (!sourceSquare || !targetSquare || sourceSquare === targetSquare)
      return false;

    const newGame = new Chess(game.fen());
    const posBeforeWrong = newGame.fen();

    const move = newGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    if (!move) return false;

    const moveString = move.from + move.to + (move.promotion || "");

    if (currentPuzzle.moves[moveIndex] !== moveString) {
      setGame(newGame);
      setStatus("wrong");
      setTimeout(() => setGame(new Chess(posBeforeWrong)), 1000);
      return true;
    }

    if (move.captured) {
      spawnCaptureBurst(capturedSquare(move));
    }

    setHint(null);
    const nextIndex = moveIndex + 1;
    setMoveIndex(nextIndex);
    setGame(newGame);

    if (currentPuzzle.moves.length === nextIndex) {
      setStatus("correct");
      return true;
    }

    setTimeout(() => {
      computerMove(newGame, nextIndex);
    }, 200);
    return true;
  };

  const computerMove = (pos: Chess, index: number) => {
    const move = currentPuzzle.moves[index];
    if (!move) return;
    const newGame = new Chess(pos.fen());
    const result = newGame.move({
      from: move.slice(0, 2),
      to: move.slice(2, 4),
      promotion: move[4] as "q" | "r" | "b" | "n" | undefined,
    });
    if (result?.captured) {
      spawnCaptureBurst(capturedSquare(result));
    }
    setMoveIndex(index + 1);
    setGame(newGame);
  };

  const totalMoves = currentPuzzle?.moves.length ?? 0;
  const playerMoves = Math.ceil(totalMoves / 2);
  const progress = totalMoves
    ? (Math.min(moveIndex, totalMoves) / totalMoves) * 100
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiny5&family=Baloo+2:wght@500;600;700;800&family=Quicksand:wght@300;400;500;600;700&display=swap');

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

        

        .plx-page {
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
        .plx-page::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(232,161,77,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,161,77,0.035) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        /* ── DESKTOP layout ── */
        .plx-body {
          position: relative; z-index: 1;
          flex: 1; min-height: 0;
          display: grid;
          grid-template-columns: 190px 1fr 190px;
          grid-template-rows: 1fr;
          grid-template-areas: "left center right";
        }

        .plx-panel {
          display: flex; flex-direction: column;
          padding: 1rem;
          gap: 0.65rem;
          border-right: 3px solid var(--border);
          background: rgba(58,44,26,0.45);
          overflow: hidden;
          grid-area: left;
        }
        .plx-panel-r {
          border-right: none;
          border-left: 3px solid var(--border);
          grid-area: right;
        }

        .plx-slabel {
          font-family: 'Tiny5', monospace;
          font-size: 0.7rem; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--gold-light);
          padding-bottom: 0.4rem;
          border-bottom: 2px dashed var(--border);
          flex-shrink: 0;
        }

        .plx-tbtn {
          width: 100%; display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 0.65rem;
          background: rgba(58,44,26,0.6); border: 2px solid var(--border);
          color: var(--muted); font-family: 'Quicksand', sans-serif; font-weight: 600;
          font-size: 0.76rem; cursor: pointer; border-radius: 6px;
          transition: all 0.18s; text-align: left;
        }
        .plx-tbtn:hover { border-color: var(--gold-dim); color: var(--gold-light); background: rgba(232,161,77,0.08); transform: translateY(-1px); }
        .plx-tbtn.active { border-color: var(--gold); background: rgba(232,161,77,0.14); color: var(--gold-light); }

        .plx-info-card {
          border: 2px solid var(--border); background: rgba(58,44,26,0.55);
          border-radius: 6px; overflow: hidden; flex-shrink: 0;
        }
        .plx-info-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.35rem 0.6rem;
          border-bottom: 1px solid rgba(232,161,77,0.1);
          font-size: 0.68rem;
        }
        .plx-info-row:last-child { border-bottom: none; }
        .plx-il { color: var(--muted); }
        .plx-iv { font-size: 0.82rem; font-weight: 700; color: var(--gold-light); }

        .plx-btn {
          width: 100%;
          padding: 0.5rem 0.6rem;
          font-family: 'Quicksand', sans-serif; font-weight: 600; font-size: 0.74rem; letter-spacing: 0.02em;
          cursor: pointer; border-radius: 6px; transition: all 0.2s;
          border: 2px solid var(--border); background: rgba(58,44,26,0.6); color: var(--muted);
          text-align: center;
        }
        .plx-btn:hover { border-color: var(--gold-dim); color: var(--gold-light); background: rgba(232,161,77,0.1); transform: translateY(-1px); }
        .plx-btn-gold {
          background: linear-gradient(135deg, #8fce5c 0%, #4f8a2e 100%);
          border-color: #6fa83f; color: #fffceb; font-weight: 700;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 0 rgba(0,0,0,0.2);
        }
        .plx-btn-gold:hover {
          background: linear-gradient(135deg, #a3e070, #5f9c3a);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(143,206,92,0.3);
        }
        .plx-btn-hint {
          border-color: rgba(232,161,77,0.5);
          color: var(--gold-light);
          background: rgba(232,161,77,0.09);
        }
        .plx-btn-hint:hover {
          border-color: var(--gold);
          background: rgba(232,161,77,0.16);
          color: var(--gold-light);
        }
        .plx-hint-text {
          font-size: 0.68rem;
          color: var(--gold-light);
          border: 2px solid rgba(232,161,77,0.3);
          border-radius: 6px;
          padding: 0.35rem 0.6rem;
          background: rgba(232,161,77,0.08);
        }

        /* Centre column */
        .plx-center {
          grid-area: center;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 0.75rem 1.25rem;
          gap: 0.65rem; min-height: 0;
        }

        .plx-status {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-family: 'Tiny5', monospace;
          font-size: 0.7rem; letter-spacing: 0.04em;
          padding: 0.28rem 0.85rem; border-radius: 100px; border: 2px solid;
          transition: all 0.3s; flex-shrink: 0;
          white-space: nowrap;
        }
        .plx-status-playing { border-color: var(--border); color: var(--muted); background: rgba(58,44,26,0.4); }
        .plx-status-correct { border-color: rgba(143,206,92,0.45); color: #8fce5c; background: rgba(143,206,92,0.1); }
        .plx-status-wrong   { border-color: rgba(224,112,90,0.4); color: #e0705a; background: rgba(224,112,90,0.1); }
        .plx-sdot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: sdot 2s infinite; flex-shrink: 0; }
        @keyframes sdot { 0%,100%{opacity:1} 50%{opacity:0.25} }

        /* Board sizing — desktop */
        .plx-board-wrap {
          position: relative;
          width: min(calc(100vh - 52px - 110px), calc(100vw - 380px - 2.5rem));
          aspect-ratio: 1;
          flex-shrink: 0;
          border-radius: 8px;
          box-shadow: 0 0 0 4px #5c4326, 0 0 0 6px var(--gold-dim), 0 8px 24px rgba(0,0,0,0.4);
        }
        .plx-board-wrap > div { width: 100% !important; }

        /* CAPTURE BURST — little harvest pop where a piece is taken */
        .plx-capture-layer {
          position: absolute; inset: 0;
          pointer-events: none; z-index: 5;
          transition: none;
        }
        .plx-capture-burst {
          position: absolute;
          width: 12.5%; height: 12.5%;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none; z-index: 5;
          transform: translate(-50%, -50%);
        }
        .plx-capture-burst-inner {
          position: relative;
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }
        .plx-capture-burst-ring {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 3px solid #ffcb6b;
          animation: plxCaptureRing 0.55s ease-out forwards;
        }
        .plx-capture-burst-leaf {
          position: absolute;
          font-size: 1.1rem;
          animation: plxCaptureLeaf 0.6s ease-out forwards;
        }
        .plx-capture-burst-leaf:nth-child(2) { animation-delay: 0.02s; }
        .plx-capture-burst-leaf:nth-child(3) { animation-delay: 0.05s; }
        .plx-capture-burst-leaf:nth-child(4) { animation-delay: 0.08s; }
        @keyframes plxCaptureRing {
          0%   { opacity: 0.9; transform: scale(0.3); border-width: 4px; }
          100% { opacity: 0;   transform: scale(1.9); border-width: 1px; }
        }
        @keyframes plxCaptureLeaf {
          0%   { opacity: 1; transform: translate(0,0) scale(0.6) rotate(0deg); }
          100% { opacity: 0; transform: translate(var(--cbx,18px), var(--cby,-22px)) scale(1.1) rotate(50deg); }
        }

        .plx-overlay {
          position: absolute; inset: 0; z-index: 10;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 0.6rem;
          backdrop-filter: blur(8px); border-radius: 8px;
          animation: fadeIn 0.25s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .plx-ov-correct { background: rgba(43,32,20,0.92); border: 2px solid rgba(143,206,92,0.3); }
        .plx-ov-icon  { font-size: 2.6rem; }
        .plx-ov-title { font-family: 'Baloo 2', cursive; font-size: 1.5rem; font-weight: 700; }
        .plx-ov-correct .plx-ov-title { color: #8fce5c; }
        .plx-ov-sub { color: var(--muted); font-size: 0.72rem; }
        .plx-ov-btns { display: flex; gap: 0.5rem; margin-top: 0.3rem; }
        .plx-ov-btns .plx-btn { width: auto; padding: 0.45rem 1.1rem; }

        .plx-prog { width: 100%; flex-shrink: 0; }
        .plx-prog-labels {
          display: flex; justify-content: space-between;
          font-size: 0.6rem; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 0.3rem;
          font-weight: 600;
        }
        .plx-prog-track { height: 5px; background: rgba(232,161,77,0.12); border-radius: 4px; overflow: hidden; }
        .plx-prog-fill {
          height: 100%;
          background: linear-gradient(90deg, #4f8a2e, #8fce5c);
          border-radius: 4px; transition: width 0.4s ease;
        }
        .plx-loading {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Baloo 2', cursive;
          font-size: 1.3rem; color: var(--gold-light);
          background: rgba(43,32,20,0.92);
          border: 2px solid var(--border);
          border-radius: 8px;
          z-index: 20;
        }

        /* ── MOBILE top bar: theme pills ── */
        .plx-mobile-top {
          display: none;
          position: relative; z-index: 1;
          flex-direction: row; align-items: center;
          justify-content: space-between;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-bottom: 2px solid var(--border);
          background: rgba(58,44,26,0.4);
          flex-shrink: 0;
        }
        .plx-mobile-top-themes {
          display: flex; align-items: center; gap: 0.35rem;
          flex-shrink: 0;
        }
        .plx-mobile-top-stats {
          display: flex; align-items: center; gap: 0.5rem;
          flex-shrink: 0;
        }

        /* ── MOBILE bottom bar: info + actions ── */
        .plx-mobile-bottom {
          display: none;
          position: relative; z-index: 1;
          flex-direction: row; align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-top: 2px solid var(--border);
          background: rgba(58,44,26,0.4);
          flex-shrink: 0;
          flex-wrap: nowrap;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .plx-mobile-bottom::-webkit-scrollbar { display: none; }

        .plx-mb-chip {
          display: flex; align-items: center;
          padding: 0.3rem 0.6rem;
          border: 2px solid var(--border); border-radius: 6px;
          background: rgba(58,44,26,0.5); color: var(--muted);
          font-family: 'Quicksand', sans-serif; font-weight: 600; font-size: 0.65rem;
          white-space: nowrap; cursor: pointer; flex-shrink: 0;
          transition: all 0.18s;
        }
        .plx-mb-chip:hover { border-color: var(--gold-dim); color: var(--gold-light); }
        .plx-mb-chip.active { border-color: var(--gold); color: var(--gold-light); background: rgba(232,161,77,0.14); }
        .plx-mb-chip-gold {
          background: linear-gradient(135deg, #8fce5c 0%, #4f8a2e 100%);
          border-color: #6fa83f; color: #fffceb; font-weight: 700;
        }
        .plx-mb-chip-hint {
          border-color: rgba(232,161,77,0.5); color: var(--gold-light);
          background: rgba(232,161,77,0.09);
        }
        .plx-mb-divider {
          width: 1px; height: 16px;
          background: var(--border); flex-shrink: 0;
        }
        .plx-mb-stat {
          display: flex; flex-direction: column;
          align-items: center; flex-shrink: 0;
          gap: 0;
        }
        .plx-mb-stat-l { font-size: 0.5rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; line-height: 1; }
        .plx-mb-stat-v { font-size: 0.72rem; font-weight: 700; color: var(--gold-light); line-height: 1.2; }
        .plx-mb-hint-text {
          font-size: 0.62rem; color: var(--gold-light);
          border: 2px solid rgba(232,161,77,0.3); border-radius: 6px;
          padding: 0.25rem 0.5rem; background: rgba(232,161,77,0.08);
          white-space: nowrap; flex-shrink: 0;
        }

        /* ── RESPONSIVE breakpoint ── */
        @media (max-width: 680px) {
          html, body { overflow: hidden; }

          .plx-panel,
          .plx-panel-r { display: none; }

          .plx-mobile-top    { display: flex; }
          .plx-mobile-bottom { display: flex; }

          .plx-body {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
            grid-template-areas: "center";
          }

          .plx-center {
            padding: 0.5rem 0.5rem;
            gap: 0.45rem;
            justify-content: flex-start;
          }

          /* Board: full width minus padding */
          .plx-board-wrap {
            width: calc(100vw - 1rem);
          }

          .plx-status {
            font-size: 0.6rem;
            padding: 0.18rem 0.6rem;
          }

          .plx-prog-labels { font-size: 0.54rem; }
        }

        /* Tablet: narrow sidebar or collapse */
        @media (min-width: 681px) and (max-width: 900px) {
          .plx-body {
            grid-template-columns: 140px 1fr 140px;
          }
          .plx-panel, .plx-panel-r { padding: 0.75rem 0.6rem; gap: 0.5rem; }
          .plx-slabel { font-size: 0.62rem; }
          .plx-tbtn { font-size: 0.68rem; padding: 0.42rem 0.5rem; }
          .plx-btn { font-size: 0.66rem; padding: 0.42rem 0.5rem; }
          .plx-info-row { font-size: 0.62rem; padding: 0.3rem 0.5rem; }
          .plx-iv { font-size: 0.75rem; }

          .plx-board-wrap {
            width: min(calc(100vh - 52px - 100px), calc(100vw - 280px - 2rem));
          }
        }
      `}</style>

      <div className="plx-page">
        <NavbarLux />

        {/* ── MOBILE: theme pill bar (top) ── */}
        <div className="plx-mobile-top">
          {/* Left: theme pills */}
          <div className="plx-mobile-top-themes">
            {themes.map((t) => (
              <button
                key={t.value}
                className={`plx-mb-chip${theme === t.value ? " active" : ""}`}
                onClick={() => setTheme(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Right: stats */}
          <div className="plx-mobile-top-stats">
            <div className="plx-mb-stat">
              <span className="plx-mb-stat-l">Rating</span>
              <span className="plx-mb-stat-v">
                {currentPuzzle?.rating ?? "—"}
              </span>
            </div>
            <div className="plx-mb-divider" />
            <div className="plx-mb-stat">
              <span className="plx-mb-stat-l">Play</span>
              <span className="plx-mb-stat-v">
                {playerColor === "w" ? "♔ W" : "♚ B"}
              </span>
            </div>
            <div className="plx-mb-divider" />
            <div className="plx-mb-stat">
              <span className="plx-mb-stat-l">Moves</span>
              <span className="plx-mb-stat-v">{playerMoves}</span>
            </div>
          </div>
        </div>

        <div className="plx-body">
          {/* LEFT — theme filter (desktop/tablet) */}
          <div className="plx-panel">
            <p className="plx-slabel">🌱 Choose Theme</p>
            {themes.map((t) => (
              <button
                key={t.value}
                className={`plx-tbtn${theme === t.value ? " active" : ""}`}
                onClick={() => setTheme(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* CENTRE — board */}
          <div className="plx-center">
            <div className={`plx-status plx-status-${status}`}>
              <span className="plx-sdot" />
              {status === "playing" &&
                `Find the best move for${playerColor === "w" ? " WHITE" : " BLACK"}`}
              {status === "correct" && "Brilliant! Well played"}
              {status === "wrong" && "Wrong — study and retry"}
            </div>

            <div className="plx-board-wrap">
              {!boardVisible && (
                <div className="plx-loading">Growing the puzzle…</div>
              )}
              <div
                style={{
                  opacity: boardVisible ? 1 : 0,
                  transition: "opacity 0.2s ease",
                }}
              >
                <Chessboard
                  options={{
                    onPieceDrop,
                    position: game.fen(),
                    boardOrientation: playerColor === "w" ? "white" : "black",
                    darkSquareStyle: { backgroundColor: "#7a8450" },
                    lightSquareStyle: { backgroundColor: "#e8dcb5" },
                  }}
                />
              </div>

              <div
                className="plx-capture-layer"
                style={{
                  transform: playerColor === "b" ? "rotate(180deg)" : "none",
                }}
              >
                {captureBursts.map((b) => {
                  const pos = squareToPercent(b.square);
                  return (
                    <div
                      key={b.id}
                      className="plx-capture-burst"
                      style={{ left: pos.left, top: pos.top }}
                    >
                      <div
                        className="plx-capture-burst-inner"
                        style={{
                          transform:
                            playerColor === "b" ? "rotate(180deg)" : "none",
                        }}
                      >
                        <div className="plx-capture-burst-ring" />
                        <span
                          className="plx-capture-burst-leaf"
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
                          className="plx-capture-burst-leaf"
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
                          className="plx-capture-burst-leaf"
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
                          className="plx-capture-burst-leaf"
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
                    </div>
                  );
                })}
              </div>

              {status === "correct" && (
                <div className="plx-overlay plx-ov-correct">
                  <div className="plx-ov-icon">🏆</div>
                  <div className="plx-ov-title">Brilliant!</div>
                  <div className="plx-ov-sub">
                    You found the winning combination.
                  </div>
                  <div className="plx-ov-btns">
                    <button
                      className="plx-btn plx-btn-gold"
                      onClick={() =>
                        setPuzzleIndex(getRandomIndex(filteredPuzzle.length))
                      }
                    >
                      Next →
                    </button>
                    <button className="plx-btn" onClick={reset}>
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="plx-prog">
              <div className="plx-prog-labels">
                <span>Progress</span>
                <span>
                  {Math.min(moveIndex, totalMoves)} / {totalMoves} moves
                </span>
              </div>
              <div className="plx-prog-track">
                <div
                  className="plx-prog-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — puzzle info + actions (desktop/tablet) */}
          <div className="plx-panel plx-panel-r">
            <p className="plx-slabel">Puzzle Info</p>
            <div className="plx-info-card">
              <div className="plx-info-row">
                <span className="plx-il">Rating</span>
                <span className="plx-iv">{currentPuzzle?.rating ?? "—"}</span>
              </div>
              <div className="plx-info-row">
                <span className="plx-il">Your moves</span>
                <span className="plx-iv">{playerMoves}</span>
              </div>
              <div className="plx-info-row">
                <span className="plx-il">You play</span>
                <span className="plx-iv">
                  {playerColor === "w" ? "♔ White" : "♚ Black"}
                </span>
              </div>
            </div>

            <p className="plx-slabel" style={{ marginTop: "0.2rem" }}>
              Actions
            </p>
            <button className="plx-btn" onClick={reset}>
              ↺ Reset
            </button>
            {/* <button
              className="plx-btn"
              onClick={() => setPuzzleIndex((p) => p + 1)}
            >
              Skip →
            </button> */}
            <button
              className="plx-btn plx-btn-gold"
              onClick={() =>
                setPuzzleIndex(getRandomIndex(filteredPuzzle.length))
              }
            >
              Next Puzzle
            </button>

            {status === "wrong" && !hint && (
              <button className="plx-btn plx-btn-hint" onClick={showHint}>
                ◎ Hint
              </button>
            )}
            {hint && <div className="plx-hint-text">◎ {hint}</div>}
          </div>
        </div>

        {/* ── MOBILE: action chip bar (bottom) ── */}
        <div className="plx-mobile-bottom">
          <button className="plx-mb-chip" onClick={reset}>
            ↺ Reset
          </button>
          {/* <button
            className="plx-mb-chip"
            onClick={() => setPuzzleIndex((p) => p + 1)}
          >
            Skip →
          </button> */}
          <button
            className="plx-mb-chip plx-mb-chip-gold"
            onClick={() =>
              setPuzzleIndex(getRandomIndex(filteredPuzzle.length))
            }
          >
            Next →
          </button>
          {status === "wrong" && !hint && (
            <>
              <div className="plx-mb-divider" />
              <button
                className="plx-mb-chip plx-mb-chip-hint"
                onClick={showHint}
              >
                ◎ Hint
              </button>
            </>
          )}
          {hint && (
            <>
              <div className="plx-mb-divider" />
              <div className="plx-mb-hint-text">◎ {hint}</div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PuzzleLuxPointsTest;
