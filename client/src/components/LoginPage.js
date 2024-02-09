import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BaseLayout from './BaseLayout';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', content: '' });
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  useEffect(() => {
    localStorage.removeItem('token');
    setAuthData({ isAuthenticated: false, token: null });
    console.log('Authentication state cleared');
  }, [setAuthData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: '', content: '' });

    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password
      });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      console.log('Token stored in localStorage:', access_token);
      setAuthData({ isAuthenticated: true, token: access_token });

      navigate('/home');
      setMessage({ type: 'success', content: 'Logged in successfully!' });
    } catch (error) {
      if (error.response) {
        setMessage({ type: 'error', content: error.response.data.error });
      } else {
        setMessage({ type: 'error', content: 'An error occurred. Please try again.' });
      }
    }
  };

  return (
    <BaseLayout>
      <div align="center">
        <img src="/kitty.jpg" style={{ width: '200px', height: 'auto' }} alt="Avatar" className="avatar" />
      </div>
      <div>
        <h5 align="center" style={{ color: 'rgb(43, 57, 55)' }}>
          Welcome returning sports lovers!
        </h5>
        {message.content && (
          <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`} role="alert">
            {message.content}
          </div>
        )}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Enter password"
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
