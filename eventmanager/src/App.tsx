import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Calendar, Award, FileCheck, LogOut, User } from 'lucide-react';
import Login from './components/Login';
import EventDashboard from './components/EventDashboard';
import CertificatePortal from './components/CertificatePortal';
import OnDutySystem from './components/OnDutySystem';
import SathyabamaLogo from './Sathyabama_logo.jpg';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userData, setUserData] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogin = (role, user) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserData(user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setUserData(null);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  return (
    <Router>
      <div className="app-container">
        {isLoggedIn ? (
          <>
            <header className="header">
              <div className="logo-container">
                <img 
                  src={SathyabamaLogo} 
                  alt="Sathyabama Institute Logo"
                  className="logo-image"
                />
                <h1>Sathyabama Institute Portal</h1>
              </div>
              <div className="user-info">
                <div className="profile-icon" onClick={toggleProfileDropdown}>
                  {userData?.profilePicture ? (
                    <img 
                      src={userData.profilePicture} 
                      alt="Profile" 
                      className="profile-picture"
                    />
                  ) : (
                    <User size={24} className="default-profile-icon" />
                  )}
                </div>
                {showProfileDropdown && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      {userData?.profilePicture && (
                        <img 
                          src={userData.profilePicture} 
                          alt="Profile" 
                          className="dropdown-profile-picture"
                        />
                      )}
                      <div className="dropdown-user-details">
                        <h4>{userData?.name}</h4>
                        <p>{userRole}</p>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </header>

            <div className="main-content">
              <nav className="sidebar">
                <ul>
                  <li>
                    <Link to="/events" className="nav-link">
                      <Calendar size={20} />
                      <span>Events</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/certificates" className="nav-link">
                      <Award size={20} />
                      <span>Certificates</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/onduty" className="nav-link">
                      <FileCheck size={20} />
                      <span>On-Duty</span>
                    </Link>
                  </li>
                </ul>
              </nav>

              <main className="content">
                <Routes>
                  <Route path="/events" element={<EventDashboard userRole={userRole} userData={userData} />} />
                  <Route path="/certificates" element={<CertificatePortal userRole={userRole} userData={userData} />} />
                  <Route path="/onduty" element={<OnDutySystem userRole={userRole} userData={userData} />} />
                  {/* Redirect to /events after login */}
                  <Route path="/" element={<Navigate to="/events" />} />
                </Routes>
              </main>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            {/* Redirect to login if not authenticated */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;