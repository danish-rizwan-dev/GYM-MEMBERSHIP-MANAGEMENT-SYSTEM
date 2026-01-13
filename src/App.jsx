import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Members from "./pages/Members";
import MemberProfile from "./pages/MemberProfile";
import Dashboard from "./pages/Dashboard";
import PunchIn from "./pages/PunchIn";
import ExpiredMembers from "./pages/ExpiredMembers";
import DailyAttendance from "./pages/DailyAttendance";
import Revenue from "./pages/Revenue";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The Root is now Home by default */}
        <Route path="/" element={<Home />} />
        
        {/* Redirect /home to root to keep URLs clean */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* All Admin Pages are now publicly accessible */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/:id" element={<MemberProfile />} />
        <Route path="/punch-in" element={<PunchIn />} />
        <Route path="/expired-members" element={<ExpiredMembers />} />
        <Route path="/attendance" element={<DailyAttendance />} />
        <Route path="/revenue" element={<Revenue />} />

        {/* Catch-all for broken links */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


