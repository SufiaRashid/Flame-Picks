import React, { useState } from 'react';
import BaseLayout from './BaseLayout';

const SignUpPage = ({ isAuthenticated, user }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here, you would send a request to your Flask API to create a new user
    console.log('SignUp Info:', { email, firstName, lastName, password, passwordConfirm });
    // Implement sign-up logic...
  };

  return (
    <BaseLayout isAuthenticated={isAuthenticated} user={user}>
      <div>
        <h5 align="center" style={{ color: 'rgb(43, 57, 55)' }}>
          Join our Flame Picks family!
        </h5>
        <form onSubmit={handleSubmit}>
          <h3 align="center" style={{ color: 'rgb(30, 139, 121)' }}>Sign Up</h3>
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
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              name="firstName"
              placeholder="Enter first name"
              style={{ color: 'rgb(63, 75, 21)' }}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              name="lastName"
              placeholder="Enter last name"
              style={{ color: 'rgb(63, 75, 21)' }}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
          <div className="form-group">
            <label htmlFor="password2">Password (Confirm)</label>
            <input
              type="password"
              className="form-control"
              id="password2"
              name="password2"
              placeholder="Re-enter password"
              style={{ color: 'rgb(63, 75, 21)' }}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>
          <br />
          <button type="submit" className="btn btn-info">
            <i className="fa fa-fw fa-user"></i>Create Account
          </button>
        </form>
      </div>
    </BaseLayout>
  );
};

export default SignUpPage;
