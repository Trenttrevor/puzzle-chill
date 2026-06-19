const Kontak = () => {
  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --gold-dim: #8a6e2f;
          --bg: #0a0a0c;
          --bg2: #111115;
          --bg3: #18181e;
          --surface: #1e1e26;
          --border: rgba(201,168,76,0.18);
          --text: #f0ece0;
          --muted: #7a7465;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        /* NAVBAR */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem; height: 72px;
          backdrop-filter: blur(10px);
        }

        .logo {
          display: flex; align-items: center; gap: 0.6rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gold-light);
          text-decoration: none;
        }

        .logo-icon { font-size: 1.8rem; }

        .logo-sub {
          display: block;
          font-size: 0.7rem;
          color: var(--muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: -4px;
        }

        .nav-actions { display: flex; gap: 0.75rem; }

        .btn-gold {
          padding: 0.5rem 1.4rem;
          background: linear-gradient(135deg, var(--gold) 0%, #a8782a 100%);
          color: #0a0a0c;
          font-weight: 600;
          border-radius: 4px;
          text-decoration: none;
          transition: 0.3s;
        }

        .btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(201,168,76,0.25);
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 6rem 2rem;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.06), transparent 70%),
            var(--bg);
        }

        .chess-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);
        }

        .container {
          position: relative;
          z-index: 2;
          max-width: 900px;
        }

        .title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          color: var(--text);
          text-align: center;
          margin-bottom: 1rem;
        }

        .subtitle {
          text-align: center;
          color: var(--muted);
          margin-bottom: 3rem;
        }

        .section {
          margin-bottom: 3rem;
          text-align: center;
        }

        .section h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          color: var(--gold-light);
          margin-bottom: 1rem;
        }

        .section p {
          color: #a8a293;
          line-height: 1.8;
          margin-bottom: 1rem;
        }

        .email-box {
          display: inline-block;
          padding: 1rem 1.5rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: rgba(201,168,76,0.06);
          font-size: 1.1rem;
          color: var(--gold-light);
          font-family: 'Cormorant Garamond', serif;
          margin-top: 1rem;
        }

        .quote {
          border-left: 2px solid var(--gold);
          padding-left: 1rem;
          margin: 3rem auto;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          color: var(--gold-light);
          font-style: italic;
          max-width: 600px;
          text-align: left;
        }

        .footer {
          margin-top: 4rem;
          text-align: center;
          color: var(--muted);
          font-size: 0.85rem;
          border-top: 1px solid var(--border);
          padding-top: 2rem;
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        <a href="/#" className="logo">
          <span className="logo-icon">♛</span>
          <span>
            Chill Chess Indo
            <span className="logo-sub">Play · Learn · Rise</span>
          </span>
        </a>

        <div className="nav-actions">
          <a
            href="https://saweria.co/chillwebdeveloper"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold"
          >
            ❤️ Support
          </a>
        </div>
      </nav>

      {/* CONTENT */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="chess-grid" />

        <div className="container">
          {/* TITLE */}
          <h1 className="title">Kontak Kami</h1>
          <p className="subtitle">
            Kami siap mendengar pertanyaan, saran, atau kerja sama
          </p>

          {/* EMAIL */}
          <div className="section">
            <h2>Hubungi Kami</h2>
            <p>
              Jika kamu memiliki pertanyaan tentang website, bug, saran fitur,
              atau kerja sama, silakan hubungi kami melalui email berikut:
            </p>

            <div className="email-box">📩 cesgut007@gmail.com</div>
          </div>

          {/* QUOTE */}
          <div className="quote">
            Kami percaya ide terbaik datang dari percakapan sederhana.
          </div>

          {/* INFO */}
          <div className="section">
            <h2>Respon</h2>
            <p>
              Kami akan berusaha membalas email secepat mungkin, biasanya dalam
              1–3 hari kerja.
            </p>
          </div>

          {/* FOOTER */}
          <div className="footer">
            © {new Date().getFullYear()} Chill Chess Indo. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Kontak;
