import { useState } from "react";

const BLOG_POSTS = [
  {
    id: 1,
    title: "Kenapa Catur Lebih Baik dari Scroll Tanpa Akhir",
    date: "19 Juni 2026",
    excerpt:
      "Di dunia digital yang penuh distraksi, catur memberikan cara untuk kembali fokus dan berpikir lebih dalam...",
    content: `
Di dunia modern, kita terbiasa scrolling tanpa tujuan.

Catur adalah kebalikannya.

Setiap langkah membutuhkan:
- Fokus
- Perhitungan
- Kesabaran

Itulah kenapa catur jauh lebih “bernilai” dibanding konsumsi konten tanpa arah.
    `,
  },
  {
    id: 2,
    title: "Cara Meningkatkan Skill Catur Tanpa Stress",
    date: "18 Juni 2026",
    excerpt:
      "Banyak orang berhenti belajar catur karena merasa terlalu sulit. Padahal kuncinya ada di konsistensi...",
    content: `
Kamu tidak perlu jadi grandmaster untuk menikmati catur.

Mulai dari:
1. Puzzle harian
2. 1 game per hari
3. Review kesalahan

Progress kecil = hasil besar.
    `,
  },
];

const Blog = () => {
  const [activePost, setActivePost] = useState<any>(null);

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --bg: #0a0a0c;
          --bg2: #111115;
          --text: #f0ece0;
          --muted: #7a7465;
          --border: rgba(201,168,76,0.18);
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
        }

        /* NAVBAR (same pattern) */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          height: 72px;
          backdrop-filter: blur(10px);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gold-light);
          text-decoration: none;
        }

        .logo-icon {
          font-size: 1.8rem;
        }

        .logo-sub {
          display: block;
          font-size: 0.7rem;
          color: var(--muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: -4px;
        }

        .nav-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-gold {
          padding: 0.5rem 1.4rem;
          background: linear-gradient(135deg, var(--gold) 0%, #a8782a 100%);
          color: #0a0a0c;
          font-weight: 600;
          border-radius: 4px;
          text-decoration: none;
          transition: 0.3s;
          border: none;
          cursor: pointer;
        }

        .btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(201,168,76,0.25);
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          padding: 7rem 2rem 4rem;
          display: flex;
          justify-content: center;
        }

        .container {
          max-width: 1000px;
          width: 100%;
        }

        .title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          text-align: center;
          color: var(--muted);
          margin-bottom: 3rem;
        }

        /* BLOG GRID */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .card {
          background: var(--bg2);
          border: 1px solid var(--border);
          padding: 1.5rem;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.3s;
        }

        .card:hover {
          transform: translateY(-4px);
          border-color: var(--gold);
        }

        .card h3 {
          font-family: 'Cormorant Garamond', serif;
          color: var(--gold-light);
          margin-bottom: 0.5rem;
          font-size: 1.4rem;
        }

        .date {
          font-size: 0.75rem;
          color: var(--muted);
          margin-bottom: 1rem;
        }

        .excerpt {
          color: #a8a293;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
        }

        .modal {
          background: var(--bg2);
          max-width: 700px;
          width: 100%;
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          position: relative;
        }

        .modal h2 {
          font-family: 'Cormorant Garamond', serif;
          color: var(--gold-light);
          margin-bottom: 1rem;
        }

        .modal p {
          color: #a8a293;
          line-height: 1.8;
          white-space: pre-line;
        }

        .close {
          position: absolute;
          top: 10px;
          right: 15px;
          cursor: pointer;
          color: var(--muted);
          font-size: 1.2rem;
        }

        .close:hover {
          color: var(--gold-light);
        }

        /* FOOTER */
        .footer {
          text-align: center;
          margin-top: 4rem;
          color: var(--muted);
          font-size: 0.8rem;
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .navbar {
            padding: 0 1.2rem;
          }
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
        <div className="container">
          <h1 className="title">Blog Chess</h1>
          <p className="subtitle">
            Pikiran, strategi, dan refleksi dari dunia catur
          </p>

          {/* GRID */}
          <div className="grid">
            {BLOG_POSTS.map((post) => (
              <div
                key={post.id}
                className="card"
                onClick={() => setActivePost(post)}
              >
                <h3>{post.title}</h3>
                <div className="date">{post.date}</div>
                <p className="excerpt">{post.excerpt}</p>
              </div>
            ))}
          </div>

          <div className="footer">
            © {new Date().getFullYear()} Chill Chess Indo
          </div>
        </div>

        {/* MODAL */}
        {activePost && (
          <div className="modal-overlay" onClick={() => setActivePost(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="close" onClick={() => setActivePost(null)}>
                ✕
              </div>
              <h2>{activePost.title}</h2>
              <p>{activePost.content}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Blog;
