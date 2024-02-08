import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css'; // Add this line to import the FontAwesome CSS file

const BaseLayout = ({ children, isAuthenticated, user }) => {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light sticky-top" style={{ backgroundColor: '#afd7d4' }}>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbar">
          <div className="navbar-nav">
            {isAuthenticated ? (
              <>
                <Link className="nav-item nav-link" to="/"><i className="fa fa-fw fa-home"></i>Make Picks</Link>
                <Link className="nav-item nav-link" to="/leaderboard"><i className="fa fa-fw fa-list"></i>LeaderBoard</Link>
                <Link className="nav-item nav-link" to="/account"><i className="fa fa-fw fa-user"></i>Account</Link>
                <Link className="nav-item nav-link" to="/settings"><i className="fa fa-fw fa-cogs"></i>Settings</Link>
                <Link className="nav-item nav-link" to="/support"><i className="fa fa-fw fa-wrench"></i>Support</Link>
                <Link className="nav-item nav-link" to="/logout"><i className="fa fa-fw fa-sign-out"></i>Logout</Link>
              </>
            ) : (
              <>
                <Link className="nav-item nav-link" to="/login"><i className="fa fa-fw fa-sign-in"></i>Login</Link>
                <Link className="nav-item nav-link" to="/sign-up"><i className="fa fa-fw fa-user-o"></i>Sign-Up</Link>
              </>
            )}
          </div>
          {isAuthenticated && (
            <div className="navbar-nav ml-auto">
              <span className="navbar-text"><i className="fa fa-fw fa-id-card-o"></i> {user.firstName} {user.lastName}</span>
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
