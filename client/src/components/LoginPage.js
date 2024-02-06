import React, { useState } from 'react';
import BaseLayout from './BaseLayout';

const LoginPage = ({ isAuthenticated, user }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here, you would typically send a request to your Flask API for login
    console.log('Submitting', email, password);
    // Implement login logic...
  };

  return (
    <BaseLayout isAuthenticated={isAuthenticated} user={user}>
      <div>
        <h5 align="center" style={{ color: 'rgb(43, 57, 55)' }}>
          Welcome returning sports lovers!
        </h5>
        <form onSubmit={handleSubmit}>
          <h3 align="center" style={{ color: 'rgb(30, 139, 121)' }}>Login</h3>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Enter email"
              style={{ color: 'rgb(63, 75, 21)' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password1">Password</label>
            <input
              type="password"
              className="form-control"
              id="password1"
              name="password1"
              placeholder="Enter password"
              style={{ color: 'rgb(63, 75, 21)' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <br />
          <button type="submit" className="btn btn-info">
            <i className="fa fa-fw fa-sign-in"></i>Login
          </button>
        </form>
      </div>
    </BaseLayout>
  );
};

export default LoginPage;
