import React, { useState } from 'react';
import BaseLayout from './BaseLayout';
import axios from 'axios';

const SignUpPage = ({ isAuthenticated, user }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password1, setPassword] = useState('');
  const [password2, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: '', content: '' }); // Reset the message state before new submission
    try {
      const response = await axios.post('http://localhost:5000/sign-up', {
        email,
        firstName,
        lastName,
        password1,
        password2
      });
      // Handle success
      console.log(response.data);
      setMessage({ type: 'success', content: 'Account created successfully!' });
    } catch (error) {
      // Handle errors
      if (error.response) {
        console.error('SignUp error:', error.response.data);
        setMessage({ type: 'error', content: error.response.data.error });
      } else {
        console.error('SignUp error:', error.message);
        setMessage({ type: 'error', content: 'An error occurred. Please try again.' });
      }
    }
  };

  return (
    <BaseLayout isAuthenticated={isAuthenticated} user={user}>
      <div align="center">
        <img src="/kitty2.jpg" style={{ width: '200px', height: 'auto' }} alt="Avatar" className="avatar" />
      </div>
      <div>
        <h5 align="center" style={{ color: 'rgb(43, 57, 55)' }}>
          Join our Flame Picks family!
        </h5>
        {message.content && (
          <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`} role="alert">
            {message.content}
          </div>
        )}
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
              value={password1}
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
              value={password2}
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
