import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';

interface HeaderProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isAuthenticated = false, 
  onLogout = () => {} 
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="flex justify-between align-center p-2">
          <Link to="/" className="logo-container">
            <img src={logo} alt="Memory in a Jar" className="logo" />
            <span className="logo-text">Memory in a Jar</span>
          </Link>
          
          <nav className="main-nav">
            {isAuthenticated ? (
              <ul className="nav-list flex">
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <button onClick={handleLogout} className="nav-link btn-link">Logout</button>
                </li>
              </ul>
            ) : (
              <ul className="nav-list flex">
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link btn-primary">Sign Up</Link>
                </li>
              </ul>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
