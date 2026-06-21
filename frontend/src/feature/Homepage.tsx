import { useState, useEffect } from "react";
import type { CSSProperties, ReactElement } from "react";
import { useNavigate } from "react-router-dom";

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

interface Stat {
  value: string;
  label: string;
}

interface Floater {
  piece: string;
  style: CSSProperties;
}

interface FloatingPieceProps {
  piece: string;
  style: CSSProperties;
}

type Footer = {
  text: string;
  link: string;
};

const FEATURES: Feature[] = [
  {
    icon: "♟",
    title: "Play Santai (soon)",
    desc: "Challenge players from across Indonesia, anytime. Pick your pace — blitz, rapid, or classical.",
  },
  {
    icon: "👑",
    title: "Challenge Bot for Crown",
    desc: "Human vs Robot, take back crown for human race!",
  },
  {
    icon: "🎓",
    title: "Learn & Master",
    desc: "Interactive lessons, puzzles, and grandmaster insights to sharpen every move you make.",
  },
  {
    icon: "⚔",
    title: "Tournaments (soon)",
    desc: "Join weekly online tournaments with real prizes. Glory awaits the bold.",
  },
];

const STATS: Stat[] = [
  { value: "8000+", label: "Active Players" },
  { value: "5000+", label: "Puzzles" },
  { value: "3000+", label: "ELO Rating BOT" },
  { value: "#3", label: "Chess Platform ID" },
];

function FloatingPiece({ piece, style }: FloatingPieceProps): ReactElement {
  return (
    <div className="floating-piece" style={style}>
      {piece}
    </div>
  );
}

const footer: Footer[] = [
  {
    text: "Tentang Kami",
    link: "/tentangkami",
  },
  {
    text: "Kebijakan Privasi",
    link: "/kebijakanprivasi",
  },
  {
    text: "Syarat & Ketentuan",
    link: "/syaratketentuan",
  },
  {
    text: "Kontak",
    link: "/kontak",
  },
  {
    text: "Blog",
    link: "/blog",
  },
];

// "Tentang Kami",
//             "Kebijakan Privasi",
//             "Syarat & Ketentuan",
//             "Kontak",
//             "Blog"

export default function Homepage(): ReactElement {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const floaters: Floater[] = [
    {
      piece: "♛",
      style: {
        top: "12%",
        left: "6%",
        fontSize: "3.5rem",
        animationDelay: "0s",
        opacity: 0.07,
      },
    },
    {
      piece: "♜",
      style: {
        top: "30%",
        right: "8%",
        fontSize: "2.8rem",
        animationDelay: "1.2s",
        opacity: 0.06,
      },
    },
    {
      piece: "♞",
      style: {
        bottom: "25%",
        left: "12%",
        fontSize: "4rem",
        animationDelay: "2.1s",
        opacity: 0.05,
      },
    },
    {
      piece: "♝",
      style: {
        top: "60%",
        right: "5%",
        fontSize: "3rem",
        animationDelay: "0.7s",
        opacity: 0.07,
      },
    },
    {
      piece: "♟",
      style: {
        top: "75%",
        left: "4%",
        fontSize: "2.4rem",
        animationDelay: "1.8s",
        opacity: 0.06,
      },
    },
    {
      piece: "♚",
      style: {
        top: "8%",
        right: "20%",
        fontSize: "2.6rem",
        animationDelay: "3s",
        opacity: 0.05,
      },
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiny5&family=Baloo+2:wght@500;600;700;800&family=Quicksand:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #e8a14d;
          --gold-light: #ffcb6b;
          --gold-dim: #9c6b2e;
          --bg: #2b2014;
          --bg2: #3a2c1a;
          --bg3: #463520;
          --surface: #4c3a22;
          --border: rgba(232,161,77,0.24);
          --text: #f3e9d2;
          --muted: #b89a72;
          --accent: #8fce5c;
        }

        body { background: var(--bg); color: var(--text); font-family: 'Quicksand', sans-serif; overflow-x: hidden; }

        /* NAVBAR */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem; height: 72px;
          transition: all 0.4s ease;
          border-bottom: 1px solid transparent;
        }
        .navbar.scrolled {
          background: rgba(43,32,20,0.94);
          backdrop-filter: blur(16px);
          border-bottom: 2px solid var(--border);
        }
        .logo {
          display: flex; align-items: center; gap: 0.6rem;
          font-family: 'Baloo 2', cursive;
          font-size: 1.35rem; font-weight: 700;
          color: var(--gold-light); letter-spacing: 0.01em;
          text-decoration: none;
        }
        .logo-icon { font-size: 1.8rem; }
        .logo-sub { color: var(--muted); font-size: 0.65rem; font-family: 'Quicksand', sans-serif; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; display: block; margin-top: 2px; }

        .nav-actions { display: flex; gap: 0.75rem; align-items: center; }

        .btn-gold {
          padding: 0.5rem 1.4rem;
          background: linear-gradient(135deg, #8fce5c 0%, #4f8a2e 100%);
          color: #fffceb; font-family: 'Quicksand', sans-serif;
          font-size: 0.84rem; font-weight: 700; letter-spacing: 0.04em;
          cursor: pointer; border: 2px solid #6fa83f; border-radius: 8px; transition: all 0.25s;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 0 rgba(0,0,0,0.2);
        }
        .btn-gold:hover { background: linear-gradient(135deg, #a3e070 0%, #5f9c3a 100%); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(143,206,92,0.3); }

        .mobile-donate {
  display: none;
}

@media (max-width: 768px) {
  .desktop-donate {
    display: none;
  }

  .mobile-donate {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    background: linear-gradient(135deg, #8fce5c, #4f8a2e);
    border: 2px solid #6fa83f;
    color: #fffceb;
    font-size: 0.85rem;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
  }
}

        /* HAMBURGER */
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 4px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: var(--gold-light); transition: all 0.3s; }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; padding: 0 2rem;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(143,206,92,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 70%, rgba(232,161,77,0.07) 0%, transparent 60%),
            var(--bg);
        }
        .chess-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(232,161,77,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,161,77,0.045) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);
        }
        .floating-piece {
          position: absolute; color: var(--gold);
          animation: floatDrift 8s ease-in-out infinite;
          user-select: none; pointer-events: none;
        }
        @keyframes floatDrift {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(4deg); }
          66% { transform: translateY(8px) rotate(-3deg); }
        }
        .hero-content { position: relative; z-index: 2; text-align: center; max-width: 860px; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border: 2px solid var(--border); background: rgba(143,206,92,0.08);
          color: var(--gold-light); font-family: 'Tiny5', monospace;
          font-size: 0.68rem; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 0.4rem 1rem; border-radius: 100px;
          margin-bottom: 2rem; animation: fadeUp 0.8s ease both;
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #8fce5c; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .hero-title {
          font-family: 'Baloo 2', cursive;
          font-size: clamp(2.6rem, 7vw, 6rem); font-weight: 700;
          line-height: 1.12; letter-spacing: -0.01em; color: var(--text);
          animation: fadeUp 0.8s 0.1s ease both;
        }
        .hero-title .gold { color: var(--gold-light); }
        .hero-title .line2 { display: block; margin-top: 0.3rem; }
        .hero-divider {
          width: 60px; height: 3px; border-radius: 2px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          margin: 1.8rem auto; animation: fadeUp 0.8s 0.2s ease both;
        }
        .hero-sub {
          font-size: 1.05rem; color: var(--muted); line-height: 1.7;
          max-width: 520px; margin: 0 auto 2.5rem; font-weight: 400;
          animation: fadeUp 0.8s 0.3s ease both;
        }
        .hero-cta {
          display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
          animation: fadeUp 0.8s 0.4s ease both;
        }
        .btn-hero {
          padding: 0.85rem 2.2rem; font-family: 'Quicksand', sans-serif;
          font-size: 0.9rem; font-weight: 600; letter-spacing: 0.04em; cursor: pointer;
          border-radius: 8px; transition: all 0.3s;
        }
        .btn-hero-gold {
          background: linear-gradient(135deg, #8fce5c 0%, #4f8a2e 100%);
          color: #fffceb; border: 2px solid #6fa83f; font-weight: 700;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 0 rgba(0,0,0,0.2);
        }
        .btn-hero-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(143,206,92,0.35); background: linear-gradient(135deg, #a3e070, #5f9c3a); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* STATS */
        .stats-bar { background: var(--bg2); border-top: 2px solid var(--border); border-bottom: 2px solid var(--border); padding: 2.2rem 2rem; }
        .stats-inner { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center; }
        .stat-val { font-family: 'Tiny5', monospace; font-size: 1.8rem; font-weight: 700; color: var(--gold-light); }
        .stat-label { font-size: 0.78rem; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; margin-top: 0.3rem; }

        /* FEATURES */
        .features { padding: 7rem 2rem; background: var(--bg); }
        .section-label { text-align: center; font-family: 'Tiny5', monospace; font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.75rem; }
        .section-title { font-family: 'Baloo 2', cursive; font-size: clamp(1.8rem, 3.6vw, 2.7rem); font-weight: 700; text-align: center; color: var(--text); margin-bottom: 4rem; }
        .features-grid { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(2, 1fr); gap: 3px; border: 2px solid var(--border); border-radius: 10px; overflow: hidden; }
        .feature-card { background: var(--bg2); padding: 2.5rem; transition: background 0.3s; cursor: default; }
        .feature-card:hover { background: var(--surface); }
        .feature-icon { font-size: 2.2rem; margin-bottom: 1rem; }
        .feature-title { font-family: 'Baloo 2', cursive; font-size: 1.2rem; font-weight: 700; color: var(--gold-light); margin-bottom: 0.7rem; }
        .feature-desc { color: var(--muted); font-size: 0.9rem; line-height: 1.7; font-weight: 400; }

        /* BOARD SECTION */
        .board-section {
          padding: 6rem 2rem; background: var(--bg2);
          display: flex; align-items: center; justify-content: center;
          gap: 5rem; flex-wrap: wrap;
          border-top: 2px solid var(--border); border-bottom: 2px solid var(--border);
        }
        .mini-board { display: grid; grid-template-columns: repeat(8, 1fr); width: 280px; height: 280px; border: 4px solid var(--gold-dim); border-radius: 8px; box-shadow: 0 0 0 2px #5c4326, 0 0 50px rgba(143,206,92,0.12); flex-shrink: 0; overflow: hidden; }
        .cell { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
        .cell.light { background: #e8dcb5; }
        .cell.dark2 { background: #7a8450; }
        .cell.gold-cell { background: rgba(232,161,77,0.45); }
        .board-copy { max-width: 380px; }
        .board-copy h2 { font-family: 'Baloo 2', cursive; font-size: 2.1rem; font-weight: 700; color: var(--text); line-height: 1.3; margin-bottom: 1.2rem; }
        .board-copy h2 em { color: var(--gold-light); font-style: normal; }
        .board-copy p { color: var(--muted); font-size: 0.92rem; line-height: 1.8; font-weight: 400; margin-bottom: 2rem; }

        /* CTA */
        .cta-section { padding: 8rem 2rem; text-align: center; position: relative; overflow: hidden; background: var(--bg); }
        .cta-glow { position: absolute; width: 600px; height: 300px; background: radial-gradient(ellipse, rgba(143,206,92,0.1) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }
        .cta-inner { position: relative; z-index: 1; }
        .cta-section h2 { font-family: 'Baloo 2', cursive; font-size: clamp(1.9rem, 4.6vw, 3.1rem); font-weight: 700; color: var(--text); margin-bottom: 1.2rem; line-height: 1.35; }
        .cta-section p { color: var(--muted); font-size: 1rem; margin-bottom: 2.5rem; font-weight: 400; }

        /* FOOTER */
        footer { background: var(--bg2); border-top: 2px solid var(--border); padding: 2.5rem 2.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
        .footer-logo { font-family: 'Baloo 2', cursive; font-size: 1.05rem; font-weight: 700; color: var(--gold); }
        .footer-links { display: flex; gap: 1.5rem; }
        .footer-links button { color: var(--muted); font-size: 0.8rem; text-decoration: none; transition: color 0.2s; background: none; border: none; cursor: pointer; font-family: 'Quicksand', sans-serif; }
        .footer-links button:hover { color: var(--gold-light); }
        .footer-copy { color: var(--muted); font-size: 0.75rem; }

        /* MOBILE */
        @media (max-width: 768px) {
          .nav-actions { display: none; }
          .hamburger { display: flex; }
          .mobile-menu {
            position: fixed; inset: 0; z-index: 99;
            background: rgba(43,32,20,0.97);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 2rem;
          }
          .mobile-menu-actions { display: flex; flex-direction: column; gap: 1rem; width: 220px; align-items: center; }
          .mobile-menu-actions button { width: 100%; padding: 0.9rem; font-size: 0.9rem; }
          .stats-inner { grid-template-columns: repeat(2, 1fr); }
          .features-grid { grid-template-columns: 1fr; }
          .board-section { flex-direction: column; gap: 3rem; }
          footer { flex-direction: column; text-align: center; }
          .footer-links { flex-wrap: wrap; justify-content: center; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <a href="#" className="logo">
          <span className="logo-icon">🌻</span>
          <span>
            Chill Chess Indo
            <span className="logo-sub">Play · Learn · Rise</span>
          </span>
        </a>

        {/* Desktop Donate Button */}
        <div className="nav-actions">
          <a
            href="https://saweria.co/chillwebdeveloper"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold desktop-donate"
          >
            ❤️ Support Chill Chess Indo
          </a>
        </div>

        {/* Mobile Donate Button */}
        <a
          href="https://saweria.co/chillwebdeveloper"
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-donate"
        >
          ❤️ Support
        </a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="chess-grid" />
        {floaters.map((f: Floater, i: number) => (
          <FloatingPiece key={i} piece={f.piece} style={f.style} />
        ))}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            Platform Catur #3 Indonesia
          </div>
          <h1 className="hero-title">
            Ganti Scrolling
            <span className="line2">
              dengan <span className="gold">Habit Berpikir.</span>
            </span>
          </h1>
          <div className="hero-divider" />
          <p className="hero-sub">
            Ambil napas, main catur sebentar, dan chill.
            <br />
            Magnus pernah main disini.
          </p>
          <div className="hero-cta">
            <button
              className="btn-hero btn-hero-gold"
              onClick={() => navigate("/puzzle")}
            >
              Mulai Bermain Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stats-inner">
          {STATS.map((s: Stat, i: number) => (
            <div key={i}>
              <div className="stat-val">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="features">
        <p className="section-label">Kenapa Chill Chess Indo?</p>
        <h2 className="section-title">Satu Platform, Segalanya Ada</h2>
        <div className="features-grid">
          {FEATURES.map((f: Feature, i: number) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BOARD VISUAL */}
      <section className="board-section">
        <MiniBoard />
        <div className="board-copy">
          <h2>
            Setiap Langkah
            <br />
            adalah <em>Seni</em>
          </h2>
          <p>
            Dari pembukaan klasik hingga endgame yang intens — Chill Chess Indo
            hadir dengan komunitas yang hangat untuk tumbuh bersama.
          </p>
          <button
            className="btn-hero btn-hero-gold"
            style={{ padding: "0.8rem 2rem" }}
            onClick={() => navigate("/puzzle")}
          >
            ▶ Mulai Bermain
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="cta-inner">
          <h2>
            Siap Menjadi
            <br />
            Raja Papan Catur?
          </h2>
          <p>Gratis selamanya. Langsung main tanpa daftar.</p>
          <div className="hero-cta">
            <button
              className="btn-hero btn-hero-gold"
              onClick={() => navigate("/puzzle")}
            >
              Mulai Bermain Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">🌻 Chill Chess Indo</div>
        <div className="footer-links">
          {footer.map((l) => (
            <button key={l.text} onClick={() => navigate(l.link)}>
              {l.text}
            </button>
          ))}
        </div>
        <div className="footer-copy">
          © 2026 Chill Chess Indo. All rights reserved.
        </div>
      </footer>
    </>
  );
}

// Mini decorative chessboard
function MiniBoard(): ReactElement {
  const highlight = new Set<number>([18, 19, 26, 27]);
  const pieces: Record<number, string> = {
    0: "♜",
    4: "♚",
    7: "♜",
    8: "♟",
    9: "♟",
    14: "♟",
    27: "♘",
    48: "♙",
    50: "♙",
    56: "♖",
    60: "♔",
    63: "♖",
  };

  return (
    <div className="mini-board">
      {Array.from({ length: 64 }, (_: unknown, i: number) => {
        const row: number = Math.floor(i / 8);
        const col: number = i % 8;
        const isLight: boolean = (row + col) % 2 === 0;
        const isHighlight: boolean = highlight.has(i);
        return (
          <div
            key={i}
            className={`cell ${isHighlight ? "gold-cell" : isLight ? "light" : "dark2"}`}
          >
            {pieces[i] ?? ""}
          </div>
        );
      })}
    </div>
  );
}
