const Privacy = () => {
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
          border-bottom: 1px solid transparent;
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

        ul {
          padding-left: 1.2rem;
          color: #a8a293;
          line-height: 1.8;
        }

        li {
          margin-bottom: 0.5rem;
        }

        .quote {
          border-left: 2px solid var(--gold);
          padding-left: 1rem;
          margin: 2rem 0;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
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
          <h1 className="title">Kebijakan Privasi</h1>
          <p className="subtitle">Terakhir diperbarui: 19 Juni 2026</p>

          {/* INTRO */}
          <div className="section">
            <p>
              Privasi kamu penting bagi kami. Kebijakan ini menjelaskan
              bagaimana Chill Chess Indo mengumpulkan, menggunakan, dan
              melindungi informasi pengguna.
            </p>
          </div>

          {/* 1 */}
          <div className="section">
            <h2>1. Informasi yang Kami Kumpulkan</h2>
            <p>Kami dapat mengumpulkan data berikut:</p>
            <ul>
              <li>
                Data penggunaan website (halaman yang dikunjungi, interaksi)
              </li>
              <li>Data perangkat dan browser</li>
              <li>Cookie untuk meningkatkan pengalaman pengguna</li>
            </ul>
          </div>

          {/* 2 */}
          <div className="section">
            <h2>2. Bagaimana Kami Menggunakan Data</h2>
            <p>Data digunakan untuk:</p>
            <ul>
              <li>Meningkatkan performa website</li>
              <li>Menganalisis penggunaan fitur</li>
              <li>Memberikan pengalaman bermain yang lebih baik</li>
            </ul>
          </div>

          {/* 3 */}
          <div className="section">
            <h2>3. Cookie</h2>
            <p>
              Website ini dapat menggunakan cookie untuk menyimpan preferensi
              pengguna dan meningkatkan pengalaman penggunaan.
            </p>
          </div>

          {/* QUOTE */}
          <div className="quote">
            Kami tidak menjual data pribadi kamu kepada pihak mana pun.
          </div>

          {/* 4 */}
          <div className="section">
            <h2>4. Layanan Pihak Ketiga</h2>
            <p>Kami dapat menggunakan layanan pihak ketiga seperti:</p>
            <ul>
              <li>Google Analytics</li>
              <li>Google AdSense</li>
              <li>Hosting & CDN</li>
            </ul>
            <p>Layanan tersebut memiliki kebijakan privasi masing-masing.</p>
          </div>

          {/* 5 */}
          <div className="section">
            <h2>5. Keamanan Data</h2>
            <p>
              Kami berusaha menjaga data pengguna tetap aman, namun tidak ada
              sistem yang 100% aman di internet.
            </p>
          </div>

          {/* 6 */}
          <div className="section">
            <h2>6. Hak Pengguna</h2>
            <ul>
              <li>Hak untuk mengetahui data yang dikumpulkan</li>
              <li>Hak untuk meminta penghapusan data</li>
              <li>Hak untuk menolak cookie tertentu</li>
            </ul>
          </div>

          {/* 7 */}
          <div className="section">
            <h2>7. Perubahan Kebijakan</h2>
            <p>
              Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan akan
              ditampilkan di halaman ini.
            </p>
          </div>

          {/* FINAL */}
          <div className="section">
            <h2>Kontak</h2>
            <p>Jika ada pertanyaan tentang privasi, hubungi:</p>
            <p style={{ color: "#E8C97A" }}>your-email@example.com</p>
          </div>

          <div className="footer">
            © {new Date().getFullYear()} Chill Chess Indo. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
