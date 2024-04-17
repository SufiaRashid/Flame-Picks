import React, { useState, useEffect } from "react";
import BaseLayout from "./BaseLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const SignUpPage = ({ isAuthenticated, user }) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password1, setPassword] = useState("");
  const [password2, setPasswordConfirm] = useState("");
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

    if (password1 !== password2) {
      setMessage({ type: "error", content: "Passwords do not match." });
      return;
    }

    if (password1.length < 8) {
      setMessage({
        type: "error",
        content: "Password must be at least 8 characters long.",
      });
      return;
    }

    try {
      const signUpResponse = await axios.post("http://localhost:5001/sign-up", {
        email,
        firstName,
        lastName,
        password1,
        password2,
      });

      if (signUpResponse.status === 201) {
        const loginResponse = await axios.post("http://localhost:5001/login", {
          email,
          password: password1,
        });
        const { access_token, user } = loginResponse.data;

        setMessage({
          type: "success",
          content: "Account created successfully! Logging you in...",
        });
        setTimeout(() => {
          localStorage.setItem("token", access_token);
          localStorage.setItem("user", JSON.stringify(user));
          setAuthData({ isAuthenticated: true, token: access_token, user: user });
  
          navigate("/home");
        }, 1500);
      }
    } catch (error) {
      const errorMessage =
        error.response && error.response.data
          ? error.response.data.error
          : "An error occurred. Please try again.";
      setMessage({ type: "error", content: errorMessage });
    }
  };

  return (
    <BaseLayout isAuthenticated={isAuthenticated} user={user}>
      <div align="center">
      </div>
      <div>
      <h3 align="center" style={{ color: "rgb(30, 139, 121)" }}>
            SIGN UP
          </h3>
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
          <button type="submit" className="btn custom-btn-green">
            <i className="fa fa-fw fa-user"></i>Create Account
          </button>
        </form>
      </div>
    </BaseLayout>
  );
};

export default SignUpPage;
