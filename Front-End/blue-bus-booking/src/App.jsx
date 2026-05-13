import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Page1 from './Components/Page1/Page1';
import LogIn from './Components/UserComponent/LogIn';
import Register from './Components/UserComponent/Profile/Register';
import Profile from './Components/UserComponent/Profile';
import Update from './Components/UserComponent/Profile/Update';
import MyBookings from './Components/Bookings/MyBookings';
import CreateBookings from './Components/Bookings/CreateBookings';
import PaymentSuccess from './Components/Payments/PaymentSuccess';
import Offers from './Components/Bookings/Offers';
import Verification from './Components/UserComponent/Verfication';
import AllOperator from './Components/BusOperator/AllOperator';
import ChatBot from './Components/AI Chat/ChatBot/ChatBot';
import SmartSearch from './Components/AI Chat/SmartSearch';
import AdminLayout from './Components/AdminDashBoard/AdminLayout';
import AdminDashBoard from './Components/AdminDashBoard/AdminDashBoard';
import AdminUser from './Components/AdminDashBoard/AdminUser';
import AdminBus from './Components/AdminDashBoard/AdminBus';
import AdminOperator from './Components/AdminDashBoard/AdminOperator';
import AdminTrip from './Components/AdminDashBoard/AdminTrip';
import AdminStop from './Components/AdminDashBoard/AdminStop';
import AdminSeat from './Components/AdminDashBoard/AdminSeat';
import AdminSeatAvail from './Components/AdminDashBoard/AdminSeatAvail';
import AdminCoupon from './Components/AdminDashBoard/AdminCoupon';
import AdminBooking from './Components/AdminDashBoard/AdminBooking';

const App = () => {
  React.useEffect(() => {
    // Clear transient data only on full page refresh or logo click (full reload)
    // This allows data to persist during internal React navigation (like Login redirect)
    const transientDataKeys = ['lastSearch', 'pendingBooking', 'chatHistory', 'chatSessionId'];
    
    // Check if we just logged in (we want to keep data in that case)
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    if (justLoggedIn) {
      sessionStorage.removeItem('justLoggedIn');
    } else {
      transientDataKeys.forEach(key => localStorage.removeItem(key));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Page1 />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:token" element={<Verification />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/update" element={<Update />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/create-booking" element={<CreateBookings />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/payment-success/:bookingId" element={<PaymentSuccess />} />
        <Route path="/operators" element={<AllOperator />} />
        <Route path="/smart-search" element={<SmartSearch userId={localStorage.getItem('userId')} />} />

        {/* 🔐 Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashBoard />} />
          <Route path="users" element={<AdminUser />} />
          <Route path="buses" element={<AdminBus />} />
          <Route path="operators" element={<AdminOperator />} />
          <Route path="seats" element={<AdminSeat />} />
          <Route path="trips" element={<AdminTrip />} />
          <Route path="stops" element={<AdminStop />} />
          <Route path="coupons" element={<AdminCoupon />} />
          <Route path="bookings" element={<AdminBooking />} />
          <Route path="maintenance" element={<AdminSeatAvail />} />
        </Route>
      </Routes>
      <ChatBot />
    </Router>
  );
};

export default App;