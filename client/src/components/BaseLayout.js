import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';

const BaseLayout = ({ children }) => {
  const { authData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light sticky-top" style={{ backgroundColor: '#afd7d4' }}>
        <div className="container-fluid">
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav me-auto mb-2 mb-lg-0">
              {authData.isAuthenticated ? (
                <>
                  <Link className="nav-item nav-link" to="/home"><i className="fa fa-fw fa-home"></i> Make Picks</Link>
                  <Link className="nav-item nav-link" to="/leaderboard"><i className="fa fa-fw fa-list"></i> LeaderBoard</Link>
                  <Link className="nav-item nav-link" to="/account"><i className="fa fa-fw fa-user"></i> Account</Link>
                  <Link className="nav-item nav-link" to="/settings"><i className="fa fa-fw fa-cogs"></i> Settings</Link>
                  <Link className="nav-item nav-link" to="/support"><i className="fa fa-fw fa-wrench"></i> Support</Link>
                </>
              ) : (
                <>
                  <Link className="nav-item nav-link" to="/login"><i className="fa fa-fw fa-sign-in"></i> Login</Link>
                  <Link className="nav-item nav-link" to="/sign-up"><i className="fa fa-fw fa-user-o"></i> Sign-Up</Link>
                </>
              )}
            </div>
            {authData.isAuthenticated && (
              <div className="navbar-nav ms-auto">
                <span className="navbar-text me-3">{authData.user?.firstName} {authData.user?.lastName}</span>
                <button className="nav-link btn btn-clear" onClick={handleLogout} style={{ boxShadow: 'none' }}><i className="fa fa-fw fa-sign-out"></i> Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container">
        {children}
      </div>
    </>
  );
};

export default BaseLayout;
