import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type NavName = "Puzzle" | "Challenge BOT" | "Leaderboard";

const nav_links: { navName: NavName; navURL: string; short: string }[] = [
  { navName: "Puzzle", navURL: "/puzzle", short: "Puzzle" },
  { navName: "Challenge BOT", navURL: "/challenge", short: "BOT" },
  { navName: "Leaderboard", navURL: "/leaderboard", short: "Board" },
];

const NavbarLux = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getNavFromPath = (pathname: string): NavName => {
    if (pathname.includes("puzzle")) return "Puzzle";
    if (pathname.includes("challenge")) return "Challenge BOT";
    if (pathname.includes("leaderboard")) return "Leaderboard";
    return "Puzzle";
  };

  const [selectedNav, setSelectedNav] = useState<NavName>(
    getNavFromPath(location.pathname),
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --gold:       #C9A84C;
          --gold-light: #E8C97A;
          --gold-dim:   #8a6e2f;
          --bg:         #0a0a0c;
          --border:     rgba(201,168,76,0.16);
          --text:       #f0ece0;
          --muted:      #6e6860;
        }

        .plx-topbar {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.75rem;
          height: 52px;
          border-bottom: 1px solid var(--border);
          background: rgba(10,10,12,0.75);
          backdrop-filter: blur(12px);
          flex-shrink: 0;
          gap: 0.5rem;
        }

        /* ── BRAND ── */
        .plx-brand {
          display: flex; align-items: center; gap: 0.5rem;
          cursor: pointer; flex-shrink: 0; text-decoration: none;
          background: none; border: none; padding: 0;
        }
        .plx-brand-piece {
          font-size: 1.55rem; line-height: 1;
          color: var(--gold-light);
          display: flex; align-items: center; justify-content: center;
          filter: drop-shadow(0 0 6px rgba(201,168,76,0.35));
          transition: filter 0.2s;
        }
        .plx-brand:hover .plx-brand-piece {
          filter: drop-shadow(0 0 10px rgba(201,168,76,0.6));
        }
        .plx-brand-text {
          display: flex; flex-direction: column; align-items: flex-start; gap: 0;
        }
        .plx-brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem; font-weight: 700; color: var(--gold-light);
          line-height: 1.1; white-space: nowrap;
        }
        .plx-brand-sub {
          font-size: 0.55rem; font-weight: 300;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--muted); line-height: 1;
        }

        /* ── NAV ── */
        .plx-nav {
          display: flex; align-items: center;
          gap: 0.3rem; list-style: none;
          padding: 0; margin: 0;
        }
        .plx-nav-link {
          position: relative;
          display: inline-flex; align-items: center; justify-content: center;
          padding: 0.38rem 0.8rem;
          background: none; border: 1px solid transparent; border-radius: 3px;
          color: var(--muted);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.73rem; letter-spacing: 0.07em;
          text-transform: uppercase; font-weight: 500;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .plx-nav-link:hover {
          color: var(--gold-light);
          border-color: var(--border);
          background: rgba(201,168,76,0.05);
        }
        .plx-nav-link.active {
          color: var(--gold-light);
          border-color: var(--gold-dim);
          background: rgba(201,168,76,0.08);
        }
        .plx-nav-link::after {
          content: "";
          position: absolute; left: 12%; bottom: 4px;
          width: 76%; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .plx-nav-link:hover::after,
        .plx-nav-link.active::after { opacity: 1; }

        /* hide/show label variants */
        .plx-nav-short { display: none; }
        .plx-nav-full  { display: inline; }

        /* ── MOBILE ── */
        @media (max-width: 680px) {
          .plx-topbar {
            padding: 0 0.85rem;
          }

          /* hide the brand text on very small screens, show just the piece */
          .plx-brand-text { display: none; }
          .plx-brand-piece { font-size: 1.65rem; }

          /* shrink nav links to short labels */
          .plx-nav-full  { display: none; }
          .plx-nav-short { display: inline; }

          .plx-nav-link {
            font-size: 0.65rem;
            padding: 0.3rem 0.55rem;
            letter-spacing: 0.05em;
          }
          .plx-nav { gap: 0.2rem; }
        }

        /* ── TABLET ── */
        @media (min-width: 681px) and (max-width: 900px) {
          .plx-topbar { padding: 0 1.1rem; }
          .plx-brand-name { font-size: 0.88rem; }
          .plx-brand-sub  { font-size: 0.5rem; }
          .plx-nav-link   { font-size: 0.68rem; padding: 0.35rem 0.65rem; }
        }
      `}</style>

      <header className="plx-topbar">
        {/* Brand */}
        <button className="plx-brand" onClick={() => navigate("/")}>
          <span className="plx-brand-piece">♛</span>
          <span className="plx-brand-text">
            <span className="plx-brand-name">Chill Chess Indo</span>
            <span className="plx-brand-sub">Training Ground</span>
          </span>
        </button>

        {/* Nav */}
        <nav>
          <ul className="plx-nav">
            {nav_links.map((l) => (
              <li key={l.navName}>
                <button
                  className={`plx-nav-link${l.navName === selectedNav ? " active" : ""}`}
                  onClick={() => {
                    setSelectedNav(l.navName);
                    navigate(l.navURL);
                  }}
                >
                  <span className="plx-nav-full">{l.navName}</span>
                  <span className="plx-nav-short">{l.short}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
};

export default NavbarLux;
