import { Route, Routes } from "react-router";

import ProfilePage from "./componentsdiy/ProfilePage";
import ChallengeBotLux from "./bot/ChallengeBotLux";
import PuzzleLuxPointsTest from "./componentsdiy/PuzzleLuxPointsTest";
import LeaderboardLux from "./componentsdiy/LeaderboardLux";
import Homepage from "./feature/Homepage";
import Tentangkami from "./feature/Tentangkami";
import Blog from "./feature/Blog";
import SyaratKetentuan from "./feature/SyaratKetentuan";
import Privacy from "./feature/Privacy";
import Kontak from "./feature/Kontak";

function App() {
  return (
    <div className="min-h-screen bg-[#1D1718] text-white">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/tentangkami" element={<Tentangkami />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/syaratketentuan" element={<SyaratKetentuan />} />
        <Route path="/kebijakanprivasi" element={<Privacy />} />
        <Route path="/kontak" element={<Kontak />} />
        <Route path="/puzzle" element={<PuzzleLuxPointsTest />} />
        <Route path="/challenge" element={<ChallengeBotLux />} />
        <Route path="/leaderboard" element={<LeaderboardLux />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
