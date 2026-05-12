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
import Verification from './Components/UserComponent/Verfication';
import AllOperator from './Components/BusOperator/AllOperator';
import ChatBot from './Components/AI Chat/ChatBot/ChatBot';
import SmartSearch from './Components/AI Chat/SmartSearch';

const App = () => {
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
        <Route path="/payment-success/:bookingId" element={<PaymentSuccess />} />
        <Route path="/operators" element={<AllOperator />} />
        <Route path="/smart-search" element={<SmartSearch userId={localStorage.getItem('userId')} />} />
      </Routes>
      <ChatBot />
    </Router>
  );
};

export default App;