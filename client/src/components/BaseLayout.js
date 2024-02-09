import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';

const BaseLayout = ({ children }) => {
  const { authData } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light sticky-top" style={{ backgroundColor: '#afd7d4' }}>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbar">
          <div className="navbar-nav">
            {authData.isAuthenticated ? (
              <>
                <Link className="nav-item nav-link" to="/home"><i className="fa fa-fw fa-home"></i>Make Picks</Link>
                <Link className="nav-item nav-link" to="/leaderboard"><i className="fa fa-fw fa-list"></i>LeaderBoard</Link>
                <Link className="nav-item nav-link" to="/account"><i className="fa fa-fw fa-user"></i>Account</Link>
                <Link className="nav-item nav-link" to="/settings"><i className="fa fa-fw fa-cogs"></i>Settings</Link>
                <Link className="nav-item nav-link" to="/support"><i className="fa fa-fw fa-wrench"></i>Support</Link>
                <button className="nav-item nav-link" onClick={handleLogout}><i className="fa fa-fw fa-sign-out"></i>Logout</button>
              </>
            ) : (
              <>
                <Link className="nav-item nav-link" to="/login"><i className="fa fa-fw fa-sign-in"></i>Login</Link>
                <Link className="nav-item nav-link" to="/sign-up"><i className="fa fa-fw fa-user-o"></i>Sign-Up</Link>
              </>
            )}
          </div>
          {authData.isAuthenticated && (
            <div className="navbar-nav ml-auto">
              <span className="navbar-text"><i className="fa fa-fw fa-id-card-o"></i> {authData.user?.firstName} {authData.user?.lastName}</span>
            </div>
          )}
        </div>
      </nav>

      <div className="container">
        {children}
      </div>

      {/* Include Bootstrap JS and jQuery */}
    </>
  );
};

export default BaseLayout;
