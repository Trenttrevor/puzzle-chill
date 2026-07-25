import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import type { PieceDropHandlerArgs } from "react-chessboard";
import puzzlesData from "@/data/puzzle_1900.json";
import NavbarLux from "./NavbarLux";
import {
  playMoveSound,
  playCaptureSound,
  playWrongSound,
  playSuccessSound,
} from "@/lib/chessSound";

type Puzzles = {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
};

type Status = "playing" | "wrong" | "correct";
type View = "categories" | "puzzle";
interface CaptureBurst {
  id: number;
  square: string;
}

/* ── Category / theme data ──────────────────────────────────────────
   "skewer", "pin", "fork" and "middlegame" are real theme keys that
   exist in puzzle_1900.json. Everything else here is a dummy/placeholder
   value with no matching puzzles yet — wire up real theme keys as they
   become available and the grid + filtering will pick them up for free. */
type CategoryItem = { value: string; label: string };
type CategoryGroup = {
  id: string;
  label: string;
  icon: string;
  items: CategoryItem[];
};

const categoryGroups: CategoryGroup[] = [
  {
    id: "tactics",
    label: "Tactics",
    icon: "⚔️",
    items: [
      { value: "sacrifice", label: "Sacrifice" },
      { value: "pin", label: "Pin" },
      { value: "fork", label: "Fork" },
      { value: "skewer", label: "Skewer" },
      { value: "attraction", label: "Attraction" },
      { value: "interference", label: "Interference" },
      { value: "discoveredAttack", label: "Discovered Attack" },
      { value: "discoveredCheck", label: "Discovered Check" },
      { value: "doubleCheck", label: "Double Check" },
      { value: "xRayAttack", label: "X-Ray Attack" },
      { value: "deflection", label: "Deflection" },
      { value: "clearance", label: "Clearance" },
    ],
  },
  {
    id: "mate",
    label: "Mate",
    icon: "♚",
    items: [
      { value: "smotheredMate", label: "Smothered Mate" },
      { value: "arabianMate", label: "Arabian Mate" },
      { value: "backRankMate", label: "BackRank Mate" },
      { value: "pillsburysMate", label: "Pillsbury's Mate" },
      { value: "morphysMate", label: "Morphy's Mate" },
      { value: "swallowstailMate", label: "Swallow's Tail Mate" },
      { value: "epauletteMate", label: "Epaulette Mate" },
      { value: "blindSwineMate", label: "Blind Swine Mate" },
      { value: "operaMate", label: "Opera Mate" },
      { value: "killBoxMate", label: "Kill Box Mate" },
      { value: "vukovicMate", label: "Vukovic Mate" },
      { value: "dovetailMate", label: "Dove Tail Mate" },
      { value: "hookMate", label: "Hook Mate" },
      { value: "balestraMate", label: "Balestra Mate" },
    ],
  },
  {
    id: "strategic",
    label: "Strategic",
    icon: "🧭",
    items: [
      { value: "opening", label: "Opening" },
      { value: "middlegame", label: "Middlegame" },
      { value: "endgame", label: "Endgame Technique" },
      { value: "advantage", label: "Advantage" },
      { value: "exposedKing", label: "Exposed King" },
      { value: "trappedPiece", label: "Trapped Piece" },
      { value: "hangingPiece", label: "Hanging Piece" },
      { value: "zugzwang", label: "Zugzwang" },
    ],
  },
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

/* ── Puzzle Elo rating (same idea as Lichess puzzle rating) ─────────────
   Treat the puzzle's own rating as an "opponent". Your expected score
   against it depends on the rating gap; the actual gain/loss is scaled
   by how far off that expectation you were. K controls volatility —
   this is the "parameter" for how much a given puzzle's difficulty
   should swing your rating. */
const ELO_STORAGE_KEY = "plx-player-elo";
const DEFAULT_ELO = 1000;
const ELO_K = 24;

function calcExpectedScore(playerElo: number, puzzleElo: number): number {
  return 1 / (1 + Math.pow(10, (puzzleElo - playerElo) / 400));
}

function calcEloDelta(
  playerElo: number,
  puzzleElo: number,
  correct: boolean,
): number {
  const expected = calcExpectedScore(playerElo, puzzleElo);
  const actual = correct ? 1 : 0;
  let delta = Math.round(ELO_K * (actual - expected));
  // Never let rounding produce a 0-point "win" or "loss" — always move at least 1.
  if (correct && delta <= 0) delta = 1;
  if (!correct && delta >= 0) delta = -1;
  return delta;
}

const PuzzleLuxPointsTest = () => {
  const [game, setGame] = useState<Chess>(new Chess());
  const [moveIndex, setMoveIndex] = useState(0);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [status, setStatus] = useState<Status>("playing");
  const [theme, setTheme] = useState<string>("skewer");
  const [boardVisible, setBoardVisible] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  // Stays true once the player makes a mistake on this puzzle, even after
  // the transient "wrong" flash reverts — that's when Hint should be offered.
  const [canHint, setCanHint] = useState(false);
  const [captureBursts, setCaptureBursts] = useState<CaptureBurst[]>([]);
  const [burstId, setBurstId] = useState(0);

  /* view = "categories" → grid of themes in the centre.
     view = "puzzle"     → the actual chessboard in the centre. */
  const [view, setView] = useState<View>("categories");
  const [activeGroupId, setActiveGroupId] = useState<string>("tactics");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const catScrollRef = useRef<HTMLDivElement | null>(null);

  /* Tap/click-to-move: the square currently selected, and the legal
     destination squares for the piece sitting on it (shown as dots). */
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);

  /* Player's puzzle Elo, persisted across sessions. */
  const [playerElo, setPlayerElo] = useState<number>(DEFAULT_ELO);
  // Guards against scoring twice on the same puzzle attempt (e.g. retrying
  // after a wrong move, or solving the remaining moves after already failing).
  const [puzzleScored, setPuzzleScored] = useState(false);
  // Little "+8" / "-6" toast shown next to the status badge.
  const [eloToast, setEloToast] = useState<number | null>(null);

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem(ELO_STORAGE_KEY)
        : null;
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!Number.isNaN(parsed)) setPlayerElo(parsed);
    }
  }, []);

  const scorePuzzle = (correct: boolean) => {
    if (!currentPuzzle || puzzleScored) return;
    setPuzzleScored(true);
    const delta = calcEloDelta(playerElo, currentPuzzle.rating, correct);
    const nextElo = Math.max(100, playerElo + delta);
    setPlayerElo(nextElo);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ELO_STORAGE_KEY, String(nextElo));
    }
    setEloToast(delta);
    setTimeout(() => setEloToast(null), 1400);
  };

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

  const currentPuzzle: Puzzles | undefined = filteredPuzzle[puzzleIndex];

  const getRandomIndex = (length: number) => Math.floor(Math.random() * length);

  const reset = () => {
    if (!currentPuzzle) return;
    setBoardVisible(false);
    setHint(null);
    setCanHint(false);
    setCaptureBursts([]);
    setSelectedSquare(null);
    setLegalTargets([]);
    setPuzzleScored(false);
    setEloToast(null);
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
    if (!currentPuzzle) return;
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

  /* Pick a theme from a grid card (or the left nav) → jump into the board. */
  const selectTheme = (value: string) => {
    setTheme(value);
    setView("puzzle");
  };

  /* Left-panel nav: scroll the centre grid to a category section.
     If we're currently looking at the board, hop back to the grid first. */
  const goToSection = (id: string) => {
    setActiveGroupId(id);
    if (view !== "categories") {
      setView("categories");
      setTimeout(() => {
        sectionRefs.current[id]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 60);
      return;
    }
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* Shared by drag-and-drop and tap/click-to-move: try to play a move,
     check it against the puzzle solution, and update state accordingly.
     Returns true if the attempt was "handled" (legal chess move made). */
  const attemptMove = (sourceSquare: string, targetSquare: string): boolean => {
    if (!currentPuzzle) return false;
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
      setCanHint(true);
      setSelectedSquare(null);
      setLegalTargets([]);
      playWrongSound();
      scorePuzzle(false);
      setTimeout(() => {
        setGame(new Chess(posBeforeWrong));
        setStatus("playing");
      }, 1000);
      return true;
    }

    if (move.captured) {
      spawnCaptureBurst(capturedSquare(move));
      playCaptureSound();
    } else {
      playMoveSound();
    }

    setHint(null);
    const nextIndex = moveIndex + 1;
    setMoveIndex(nextIndex);
    setGame(newGame);

    if (currentPuzzle.moves.length === nextIndex) {
      setStatus("correct");
      setTimeout(() => playSuccessSound(), 150);
      scorePuzzle(true);
      return true;
    }

    setTimeout(() => {
      computerMove(newGame, nextIndex);
    }, 200);
    return true;
  };

  const onPieceDrop = ({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs): boolean => {
    setSelectedSquare(null);
    setLegalTargets([]);
    if (!sourceSquare || !targetSquare) return false;
    return attemptMove(sourceSquare, targetSquare);
  };

  /* Tap/click-to-move:
     - first click on your own piece → select it, show legal dots
     - click again on the same square → deselect
     - click a highlighted (legal) square → play the move
     - click a different one of your own pieces → reselect */
  const handleSquareClick = (square: string) => {
    if (!currentPuzzle || status !== "playing") return;

    if (selectedSquare && legalTargets.includes(square)) {
      attemptMove(selectedSquare, square);
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
    const styles: Record<string, CSSProperties> = {};
    if (selectedSquare) {
      styles[selectedSquare] = {
        background: "rgba(232,161,77,0.35)",
      };
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

  const computerMove = (pos: Chess, index: number) => {
    if (!currentPuzzle) return;
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
      playCaptureSound();
    } else {
      playMoveSound();
    }
    setMoveIndex(index + 1);
    setGame(newGame);
  };

  const totalMoves = currentPuzzle?.moves.length ?? 0;
  const playerMoves = Math.ceil(totalMoves / 2);
  const progress = totalMoves
    ? (Math.min(moveIndex, totalMoves) / totalMoves) * 100
    : 0;

  const currentThemeLabel =
    categoryGroups.flatMap((g) => g.items).find((i) => i.value === theme)
      ?.label ?? theme;

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
          overflow-y: auto;
          overflow-x: hidden;
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
        .plx-center.is-categories {
          align-items: stretch;
          justify-content: flex-start;
          width: 100%;
        }

        /* ── Category grid (centre, "categories" view) ── */
        .plx-cat-scroll {
          width: 100%; height: 100%;
          overflow-y: auto; overflow-x: hidden;
          padding-right: 4px;
        }
        .plx-cat-scroll::-webkit-scrollbar { width: 6px; }
        .plx-cat-scroll::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 4px; }

        .plx-cat-intro { margin: 0 0 1rem; }
        .plx-cat-intro-title {
          font-family: 'Baloo 2', cursive; font-weight: 700;
          font-size: 1.3rem; color: var(--gold-light); margin: 0 0 0.2rem;
        }
        .plx-cat-intro-sub { font-size: 0.76rem; color: var(--muted); margin: 0; }

        .plx-cat-section { margin-bottom: 1.75rem; scroll-margin-top: 10px; }
        .plx-cat-heading {
          display: flex; align-items: center; gap: 0.45rem;
          font-family: 'Baloo 2', cursive; font-weight: 700;
          font-size: 1.05rem; color: var(--gold-light);
          margin: 0 0 0.65rem;
          padding-bottom: 0.35rem;
          border-bottom: 2px dashed var(--border);
        }

        .plx-cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.65rem;
        }
        .plx-cat-card {
          display: flex; flex-direction: column; justify-content: center;
          gap: 0.15rem;
          min-height: 68px;
          padding: 0.75rem 0.9rem;
          background: rgba(58,44,26,0.6);
          border: 2px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          transition: all 0.18s;
        }
        .plx-cat-card:hover {
          border-color: var(--gold-dim);
          background: rgba(232,161,77,0.1);
          transform: translateY(-2px);
        }
        .plx-cat-card.active {
          border-color: var(--gold);
          background: rgba(232,161,77,0.16);
          box-shadow: 0 0 0 1px rgba(232,161,77,0.3);
        }
        .plx-cat-card-label {
          font-family: 'Quicksand', sans-serif; font-weight: 700;
          font-size: 0.82rem; color: var(--text);
        }
        .plx-cat-card.active .plx-cat-card-label { color: var(--gold-light); }
        .plx-cat-card-count {
          font-size: 0.6rem; color: var(--muted); letter-spacing: 0.03em;
        }

        /* ── Puzzle view (centre) ── */
        .plx-back-btn {
          align-self: flex-start;
          display: inline-flex; align-items: center; gap: 0.35rem;
          background: transparent; border: none;
          color: var(--muted); font-family: 'Quicksand', sans-serif; font-weight: 600;
          font-size: 0.74rem; cursor: pointer; padding: 0.2rem 0;
          flex-shrink: 0; transition: color 0.15s;
        }
        .plx-back-btn:hover { color: var(--gold-light); }

        .plx-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.5rem; padding: 2.5rem 1rem; text-align: center; color: var(--muted);
        }
        .plx-empty-icon { font-size: 2.2rem; }
        .plx-empty-title { font-family: 'Baloo 2', cursive; font-size: 1.1rem; color: var(--gold-light); }
        .plx-empty-sub { font-size: 0.78rem; max-width: 260px; }

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

        .plx-status-row {
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem; flex-shrink: 0; flex-wrap: wrap;
        }
        .plx-elo-badge {
          position: relative;
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.28rem 0.7rem;
          border-radius: 100px; border: 2px solid var(--border);
          background: rgba(58,44,26,0.4);
          font-family: 'Quicksand', sans-serif;
        }
        .plx-elo-label {
          font-size: 0.58rem; text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--muted); font-weight: 700;
        }
        .plx-elo-value {
          font-size: 0.78rem; font-weight: 700; color: var(--gold-light);
        }
        .plx-elo-toast {
          position: absolute; top: -4px; right: -6px;
          transform: translateY(-100%);
          font-family: 'Baloo 2', cursive; font-weight: 700; font-size: 0.7rem;
          padding: 0.1rem 0.4rem; border-radius: 6px;
          animation: plxEloToast 1.4s ease forwards;
          white-space: nowrap;
        }
        .plx-elo-toast.up   { color: #8fce5c; background: rgba(143,206,92,0.16); border: 1px solid rgba(143,206,92,0.4); }
        .plx-elo-toast.down { color: #e0705a; background: rgba(224,112,90,0.16); border: 1px solid rgba(224,112,90,0.4); }
        @keyframes plxEloToast {
          0%   { opacity: 0; transform: translateY(-80%); }
          15%  { opacity: 1; transform: translateY(-130%); }
          80%  { opacity: 1; transform: translateY(-130%); }
          100% { opacity: 0; transform: translateY(-170%); }
        }

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

        /* ── MOBILE top bar ── */
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
        .plx-mobile-top-left {
          display: flex; align-items: center; gap: 0.35rem;
          flex-shrink: 0;
        }
        .plx-mobile-top-stats {
          display: flex; align-items: center; gap: 0.5rem;
          flex-shrink: 0;
        }
        .plx-mb-back {
          display: inline-flex; align-items: center; gap: 0.3rem;
          background: rgba(58,44,26,0.6); border: 2px solid var(--border);
          color: var(--muted); font-family: 'Quicksand', sans-serif; font-weight: 600;
          font-size: 0.66rem; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer;
        }
        .plx-mb-back:hover { border-color: var(--gold-dim); color: var(--gold-light); }
        .plx-mb-title {
          font-family: 'Baloo 2', cursive; font-weight: 700;
          font-size: 0.78rem; color: var(--gold-light);
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

          .plx-cat-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
          /* Only show the mobile action bar once a puzzle is on screen */
          .plx-mobile-bottom.is-visible { display: flex; }
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

        {/* ── MOBILE top bar ── */}
        <div className="plx-mobile-top">
          <div className="plx-mobile-top-left">
            {view === "puzzle" ? (
              <button
                className="plx-mb-back"
                onClick={() => setView("categories")}
              >
                ← Categories
              </button>
            ) : (
              <span className="plx-mb-title">🌱 Puzzle Themes</span>
            )}
          </div>

          {view === "puzzle" && (
            <div className="plx-mobile-top-stats">
              <div className="plx-mb-stat">
                <span className="plx-mb-stat-l">You</span>
                <span className="plx-mb-stat-v">{playerElo}</span>
              </div>
              <div className="plx-mb-divider" />
              <div className="plx-mb-stat">
                <span className="plx-mb-stat-l">Puzzle</span>
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
          )}
        </div>

        <div className="plx-body">
          {/* LEFT — category nav (desktop/tablet): click to scroll the grid */}
          <div className="plx-panel">
            <p className="plx-slabel">📚 Categories</p>
            {categoryGroups.map((g) => (
              <button
                key={g.id}
                className={`plx-tbtn${
                  view === "categories" && activeGroupId === g.id
                    ? " active"
                    : ""
                }`}
                onClick={() => goToSection(g.id)}
              >
                {g.icon} {g.label}
              </button>
            ))}
          </div>

          {/* CENTRE — either the category grid, or the puzzle board */}
          <div
            className={`plx-center${view === "categories" ? " is-categories" : ""}`}
          >
            {view === "categories" ? (
              <div className="plx-cat-scroll" ref={catScrollRef}>
                <div className="plx-cat-intro">
                  <p className="plx-cat-intro-title">🌱 Choose a Theme</p>
                  <p className="plx-cat-intro-sub">
                    Pick a puzzle theme below to jump straight into the board.
                  </p>
                </div>

                {categoryGroups.map((group) => (
                  <div
                    key={group.id}
                    className="plx-cat-section"
                    ref={(el) => {
                      sectionRefs.current[group.id] = el;
                    }}
                  >
                    <h3 className="plx-cat-heading">
                      {group.icon} {group.label}
                    </h3>
                    <div className="plx-cat-grid">
                      {group.items.map((item) => (
                        <button
                          key={item.value}
                          className={`plx-cat-card${
                            theme === item.value ? " active" : ""
                          }`}
                          onClick={() => selectTheme(item.value)}
                        >
                          <span className="plx-cat-card-label">
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <button
                  className="plx-back-btn"
                  onClick={() => setView("categories")}
                >
                  ← Back to Categories
                </button>

                {!currentPuzzle ? (
                  <div className="plx-empty">
                    <span className="plx-empty-icon">🌱</span>
                    <span className="plx-empty-title">
                      No puzzles yet for “{currentThemeLabel}”
                    </span>
                    <span className="plx-empty-sub">
                      This theme is a placeholder for now — pick Pin, Fork,
                      Skewer, or Middlegame to play a real puzzle.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="plx-status-row">
                      <div className={`plx-status plx-status-${status}`}>
                        <span className="plx-sdot" />
                        {status === "playing" &&
                          `Find the best move for${playerColor === "w" ? " WHITE" : " BLACK"}`}
                        {status === "correct" && "Brilliant! Well played"}
                        {status === "wrong" && "Wrong — study and retry"}
                      </div>
                      <div className="plx-elo-badge">
                        <span className="plx-elo-label">Rating</span>
                        <span className="plx-elo-value">{playerElo}</span>
                        {eloToast !== null && (
                          <span
                            key={eloToast + Date.now()}
                            className={`plx-elo-toast${eloToast > 0 ? " up" : " down"}`}
                          >
                            {eloToast > 0 ? `+${eloToast}` : eloToast}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="plx-board-wrap">
                      {!boardVisible && (
                        <div className="plx-loading">Loading the puzzle…</div>
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
                            onSquareClick: ({ square }: any) =>
                              handleSquareClick(square),
                            squareStyles,
                            position: game.fen(),
                            boardOrientation:
                              playerColor === "w" ? "white" : "black",
                            darkSquareStyle: { backgroundColor: "#7a8450" },
                            lightSquareStyle: { backgroundColor: "#e8dcb5" },
                          }}
                        />
                      </div>

                      <div
                        className="plx-capture-layer"
                        style={{
                          transform:
                            playerColor === "b" ? "rotate(180deg)" : "none",
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
                                    playerColor === "b"
                                      ? "rotate(180deg)"
                                      : "none",
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
                                setPuzzleIndex(
                                  getRandomIndex(filteredPuzzle.length),
                                )
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
                  </>
                )}
              </>
            )}
          </div>

          {/* RIGHT — puzzle info + actions (desktop/tablet) */}
          <div className="plx-panel plx-panel-r">
            {view === "categories" ? (
              <>
                <p className="plx-slabel">Get Started</p>
                <div className="plx-hint-text">
                  🌱 Pick a theme card in the middle to start solving.
                </div>
              </>
            ) : (
              <>
                <p className="plx-slabel">Puzzle Info</p>
                <div className="plx-info-card">
                  <div className="plx-info-row">
                    <span className="plx-il">Your Rating</span>
                    <span className="plx-iv">{playerElo}</span>
                  </div>
                  <div className="plx-info-row">
                    <span className="plx-il">Puzzle Rating</span>
                    <span className="plx-iv">
                      {currentPuzzle?.rating ?? "—"}
                    </span>
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
                <button
                  className="plx-btn plx-btn-gold"
                  onClick={() =>
                    setPuzzleIndex(getRandomIndex(filteredPuzzle.length))
                  }
                >
                  Next Puzzle
                </button>

                {canHint && !hint && status !== "correct" && (
                  <button className="plx-btn plx-btn-hint" onClick={showHint}>
                    ◎ Hint
                  </button>
                )}
                {hint && <div className="plx-hint-text">◎ {hint}</div>}
              </>
            )}
          </div>
        </div>

        {/* ── MOBILE: action chip bar (bottom) — puzzle view only ── */}
        <div
          className={`plx-mobile-bottom${
            view === "puzzle" && currentPuzzle ? " is-visible" : ""
          }`}
        >
          <button className="plx-mb-chip" onClick={reset}>
            ↺ Reset
          </button>
          <button
            className="plx-mb-chip plx-mb-chip-gold"
            onClick={() =>
              setPuzzleIndex(getRandomIndex(filteredPuzzle.length))
            }
          >
            Next →
          </button>
          {canHint && !hint && status !== "correct" && (
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
