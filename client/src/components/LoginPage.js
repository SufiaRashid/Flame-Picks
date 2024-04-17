import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BaseLayout from "./BaseLayout";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  useEffect(() => {
    localStorage.removeItem("token");
    setAuthData({ isAuthenticated: false, token: null });
    console.log("Authentication state cleared");
  }, [setAuthData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", content: "" });

    if (password.length < 8) {
      setMessage({
        type: "error",
        content: "Password must be at least 8 characters long.",
      });
      return;
    }

    try {
      const response = await axios.post("http://localhost:5001/login", {
        email,
        password,
      });
      const { access_token, user } = response.data;

      setMessage({
        type: "success",
        content: "Login successful! Redirecting...",
      });

      setTimeout(() => {
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
        setAuthData({ isAuthenticated: true, token: access_token, user: user });

        navigate("/home");
      }, 1500);
    } catch (error) {
      if (error.response) {
        setMessage({ type: "error", content: error.response.data.error });
      } else {
        setMessage({
          type: "error",
          content: "An error occurred. Please try again.",
        });
      }
    }
  };

  return (
    <BaseLayout>
      <div align="center">
        <img
          src="/loginlogo.png"
          style={{ width: "400px", height: "auto" }}
          alt="Avatar"
          className="avatar"
        />
      </div>
      <div>
        {message.content && (
          <div
            className={`alert ${
              message.type === "error" ? "alert-danger" : "alert-success"
            }`}
            role="alert"
          >
            {message.content}
          </div>
        )}
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="btn custom-btn-green">
            <i className="fa fa-fw fa-sign-in"></i>Login
          </button>
        </form>
      </div>
    </BaseLayout>
  );
};

export default LoginPage;
