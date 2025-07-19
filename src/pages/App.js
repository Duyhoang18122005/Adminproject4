import { Route, Routes, useLocation } from "react-router-dom"; // ⬅️ thêm useLocation
import AdminDashboard from "../admin/AdminDashboard";
import GameListPage from "../admin/GameList";
import GamerListPage from "../admin/GamerListPage";
import Order from "../admin/Order";
import Report from "../admin/Report";
import Revenue from "../admin/revenue";
import RevenueWithdrawDepositPage from "../admin/RevenueWithdrawDepositPage";
import UserListPage from "../admin/UserListPage";
import Header from "../components/Layout/Header";
import Profile from "../components/Profiles/Profile";
import { useUser } from "../contexts/UserContext";
import BookingPage from "../pages/BookingPage";
import BookingSuccess from "../pages/BookingSuccess";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

function App() {
  const { username, logout } = useUser();
  const location = useLocation(); // ⬅️ lấy path hiện tại

  // Kiểm tra nếu đang ở đường dẫn bắt đầu bằng "/admin"
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ❌ Ẩn header nếu là trang admin */}
      {!isAdminRoute && (
        <Header isLoggedIn={!!username} username={username} onLogout={logout} />
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking/:gamerId" element={<BookingPage />} />
        <Route path="/booking/success" element={<BookingSuccess />} />
        <Route path="/profile/:gamerId" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/manage-gamers" element={<GamerListPage />} />
        <Route path="/admin/users" element={<UserListPage />} />
        <Route path="/admin/games" element={<GameListPage />} />
        <Route path="/admin/orders" element={<Order />} />
        <Route path="/admin/revenue" element={<Revenue />} />
        <Route path="/admin/manage-payment" element={<RevenueWithdrawDepositPage />} />
        <Route path="/admin/report" element={<Report />} />
      </Routes>
    </div>
  );
}

export default App;
