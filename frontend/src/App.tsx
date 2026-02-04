import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import { UserHomePage } from './components/pages/user-home';
import { SenderFlow } from './components/sender/users';
import { AdminHomePage } from './components/pages/admin-home';
import { AdminLogin } from './components/admin/login';
import { AdminDashboard } from './components/admin/dashboard';


import { Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/user-home" replace />} />
      <Route path="/user-home" element={<UserHomePage />} />
      <Route path="/users" element={<SenderFlow onBack={() => {}} />} />
      <Route path="/admin-home" element={<AdminHomePage />} />
      <Route path="/login" element={<AdminLogin onLogin={() => {}} onBack={() => {}} />} />
      <Route path="/dashboard" element={<AdminDashboard onLogout={() => {}} />} />
      {/* สามารถเพิ่ม Route อื่นๆ ได้ตามต้องการ */}
    </Routes>
  );
}

export default App