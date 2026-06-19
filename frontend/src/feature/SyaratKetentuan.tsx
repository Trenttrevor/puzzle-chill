const SyaratKetentuan = () => {
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
          transition: all 0.4s ease;
          border-bottom: 1px solid transparent;
        }
        .navbar.scrolled {
          background: rgba(10,10,12,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }
        .logo {
          display: flex; align-items: center; gap: 0.6rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem; font-weight: 700;
          color: var(--gold-light); letter-spacing: 0.02em;
          text-decoration: none;
        }
        .logo-icon { font-size: 1.8rem; }
        .logo-sub { color: var(--muted); font-size: 0.7rem; font-family: 'DM Sans', sans-serif; font-weight: 300; letter-spacing: 0.15em; text-transform: uppercase; display: block; margin-top: -4px; }

        .nav-actions { display: flex; gap: 0.75rem; align-items: center; }

        .btn-gold {
          padding: 0.5rem 1.4rem;
          background: linear-gradient(135deg, var(--gold) 0%, #a8782a 100%);
          color: #0a0a0c; font-family: 'DM Sans', sans-serif;
          font-size: 0.84rem; font-weight: 600; letter-spacing: 0.06em;
          cursor: pointer; border: none; border-radius: 4px; transition: all 0.25s;
        }
        .btn-gold:hover { background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 100%); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(201,168,76,0.25); }

        .mobile-donate {
  display: none;
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
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.06) 0%, transparent 70%),
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

        /* CONTENT */
        .container {
          position: relative;
          z-index: 2;
          max-width: 900px;
        }

        .title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          color: var(--text);
          margin-bottom: 1rem;
          text-align: center;
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
          font-size: 1rem;
        }

        ul {
          padding-left: 1.2rem;
          color: #a8a293;
          line-height: 1.8;
        }

        li {
          margin-bottom: 0.5rem;
        }

        .box {
          border-left: 2px solid var(--gold);
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: var(--gold-light);
          font-style: italic;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
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
      <nav className="navbar">
        <a href="/#" className="logo">
          <span className="logo-icon">♛</span>
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
      <section className="hero">
        <div className="hero-bg" />
        <div className="chess-grid" />

        <div className="container">
          {/* TITLE */}
          <h1 className="title">Syarat & Ketentuan</h1>
          <p className="subtitle">Terakhir diperbarui: 19 Juni 2026</p>

          {/* INTRO */}
          <div className="section">
            <p>
              Selamat datang di <b>Chill Chess Indo</b>. Dengan mengakses atau
              menggunakan website ini, kamu dianggap telah membaca, memahami,
              dan menyetujui syarat dan ketentuan berikut.
            </p>
          </div>

          {/* 1 */}
          <div className="section">
            <h2>1. Penggunaan Website</h2>
            <p>
              Website ini menyediakan fitur seperti puzzle dan permainan catur.
            </p>
            <ul>
              <li>Dilarang menggunakan untuk aktivitas ilegal</li>
              <li>Dilarang mengganggu sistem</li>
              <li>Dilarang memakai bot tanpa izin</li>
            </ul>
          </div>

          {/* 2 */}
          <div className="section">
            <h2>2. Akun Pengguna</h2>
            <ul>
              <li>Pengguna bertanggung jawab atas akun masing-masing</li>
              <li>Semua aktivitas akun adalah tanggung jawab pengguna</li>
              <li>Akun dapat diblokir jika melanggar aturan</li>
            </ul>
          </div>

          {/* 3 */}
          <div className="section">
            <h2>3. Keadilan Permainan</h2>
            <ul>
              <li>Dilarang menggunakan chess engine</li>
              <li>Dilarang memanipulasi hasil permainan</li>
              <li>Dilarang mengeksploitasi bug</li>
            </ul>

            <p style={{ fontSize: "0.9rem", color: "#7a7465" }}>
              Pelanggaran dapat menyebabkan pembatasan akses.
            </p>
          </div>

          {/* 4 */}
          <div className="section">
            <h2>4. Hak Kekayaan Intelektual</h2>
            <p>
              Semua konten seperti desain, logo, dan sistem permainan dimiliki
              oleh Chill Chess Indo.
            </p>
          </div>

          {/* 5 */}
          <div className="section">
            <h2>5. Layanan Pihak Ketiga</h2>
            <p>
              Kami dapat menggunakan layanan pihak ketiga seperti analytics dan
              iklan (misalnya Google AdSense).
            </p>
          </div>

          {/* 6 */}
          <div className="section">
            <h2>6. Penafian</h2>
            <ul>
              <li>Website bisa mengalami error</li>
              <li>Data tidak selalu 100% akurat</li>
              <li>Layanan bisa berubah kapan saja</li>
            </ul>
          </div>

          {/* 7 QUOTE */}
          <div className="box">
            Kurangi scrolling. Asah pikiran. Nikmati catur.
          </div>

          {/* 8 */}
          <div className="section">
            <h2>8. Batasan Tanggung Jawab</h2>
            <ul>
              <li>Kehilangan data atau progres</li>
              <li>Gangguan layanan</li>
              <li>Kerugian akibat penggunaan website</li>
            </ul>
          </div>

          {/* 9 */}
          <div className="section">
            <h2>9. Perubahan Ketentuan</h2>
            <p>
              Kami dapat memperbarui syarat ini kapan saja tanpa pemberitahuan
              sebelumnya.
            </p>
          </div>

          {/* CONTACT */}
          <div className="section">
            <h2>Kontak</h2>
            <p>Jika ada pertanyaan, hubungi:</p>
            <p style={{ color: "#E8C97A" }}>cesgut007@gmail.com</p>
          </div>

          <div className="footer">
            © {new Date().getFullYear()} Chill Chess Indo. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  );
};

export default SyaratKetentuan;
