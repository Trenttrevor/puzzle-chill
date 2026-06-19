const Tentangkami = () => {
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
          border-bottom: 1px solid transparent;
          backdrop-filter: blur(10px);
        }

        .logo {
          display: flex; align-items: center; gap: 0.6rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; font-weight: 700;
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
          font-family: 'DM Sans', sans-serif;
        }

        .nav-actions { display: flex; gap: 0.75rem; }

        .btn-gold {
          padding: 0.5rem 1.4rem;
          background: linear-gradient(135deg, var(--gold) 0%, #a8782a 100%);
          color: #0a0a0c;
          font-weight: 600;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          transition: 0.3s;
          text-decoration: none;
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

        .quote {
          border-left: 2px solid var(--gold);
          padding-left: 1rem;
          margin: 2rem 0;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          color: var(--gold-light);
          font-style: italic;
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
          <h1 className="title">Tentang Kami</h1>
          <p className="subtitle">Mengenal lebih dekat Chill Chess Indo</p>

          {/* SECTION 1 */}
          <div className="section">
            <h2>Cara Berbeda Mengisi Waktu</h2>
            <p>
              Di dunia yang dipenuhi scrolling tanpa akhir, Chill Chess Indo
              hadir sebagai ruang alternatif yang lebih tenang dan bermakna.
            </p>
            <p>
              Kami percaya bahwa beberapa langkah dalam permainan catur bisa
              memberikan nilai yang jauh lebih dalam dibandingkan berjam-jam
              mengonsumsi konten tanpa arah.
            </p>
          </div>

          {/* SECTION 2 */}
          <div className="section">
            <h2>Apa Itu Chill Chess Indo?</h2>
            <p>
              Chill Chess Indo adalah platform catur sederhana yang dirancang
              untuk semua orang — baik pemula maupun pemain berpengalaman.
            </p>
            <p>
              Di sini kamu bisa menikmati puzzle catur, bermain melawan bot, dan
              berlatih strategi dalam suasana yang santai dan tidak menekan.
            </p>
          </div>

          {/* QUOTE */}
          <div className="quote">
            Kurangi scrolling. Asah pikiran. Nikmati catur.
          </div>

          {/* SECTION 3 */}
          <div className="section">
            <h2>Misi Kami</h2>
            <p>
              Kami ingin membuat catur lebih mudah diakses, lebih menyenangkan,
              dan menjadi bagian dari kebiasaan positif sehari-hari.
            </p>
            <p>
              Bukan hanya sekadar permainan, tetapi cara untuk melatih fokus,
              kesabaran, dan pola pikir strategis.
            </p>
          </div>

          {/* SECTION 4 */}
          <div className="section">
            <h2>Untuk Siapa Website Ini?</h2>
            <p>Untuk siapa saja yang ingin:</p>
            <p>• Mengisi waktu dengan lebih bermakna</p>
            <p>• Melatih kemampuan berpikir</p>
            <p>• Menikmati permainan catur tanpa tekanan</p>
          </div>

          {/* FINAL */}
          <div className="section">
            <h2>Selamat Datang</h2>
            <p>Kami senang kamu ada di sini.</p>
            <p>
              Ambil waktu sejenak, mainkan satu puzzle, dan rasakan bagaimana
              satu langkah kecil bisa melatih cara berpikirmu.
            </p>
          </div>

          <div className="footer">
            © {new Date().getFullYear()} Chill Chess Indo. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tentangkami;
