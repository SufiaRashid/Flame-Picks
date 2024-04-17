import React, { useState, useEffect, useContext } from "react";
import BaseLayout from "./BaseLayout";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Accordion = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="accordion-wrapper" onClick={toggle}>
        <button className="accordion">
          {title} {icon && <i className={icon} aria-hidden="true"></i>}
        </button>
        <span>{isOpen ? <FaMinus /> : <FaPlus />}</span>
      </div>
      <div
        className={`panel ${isOpen ? "show" : ""}`}
        style={{
          maxHeight: isOpen ? "100%" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        {children}
      </div>
    </>
  );
};

const SettingsPage = ({ children, user }) => {
  const { isDarkMode, setIsDarkMode } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const { authData, logout, setAuthData } = useAuth();
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [timezone, setTimezone] = useState(authData.user?.timezone || "");
  const navigate = useNavigate();
  const [themePreference, setThemePreference] = useState(
    authData.user.theme_preference || "light"
  );

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    document.body.classList.add("settings-page-bg");

    return () => {
      document.body.classList.remove("settings-page-bg");
    };
  }, []);

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      const response = await axios.get(
        "http://localhost:5001/user/get-current-user"
      );
      const userData = response.data;
      authData((prevAuthData) => ({
        ...prevAuthData,
        user: {
          ...prevAuthData.user,
          id: userData.user.id,
          email: userData.user.email,
          firstName: userData.user.firstName,
          lastName: userData.user.lastName,
        },
      }));

      console.log("NEW EMAIL??? :", authData.user.email);
    } catch (error) {
      console.error("Error fetching current user data:", error);
    }
  };

  /////////////////////////////////////
  /*const handleThemeChange = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5001/data/update-theme/${user.id}`,
        {
          theme_preference: themePreference,
        }
      );

      // Optionally, you can update the theme preference in the local state
      // or reload the page to reflect the changes immediately
      console.log(response.data.message);
    } catch (error) {
      console.error("Error updating theme preference:", error);
    }
  };

  const toggleDarkMode = () => {
    const newTheme = themePreference === "light" ? "dark" : "light";
    setThemePreference(newTheme);
    handleThemeChange(); // Update theme preference in the database
  };*/
  /////////////////////////////////////

  const handleUpdateTimezone = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5001/update-timezone",
        {
          email: authData.user?.email,
          timezone,
        }
      );

      setUpdateMessage(response.data.message);
    } catch (error) {
      if (error.response && error.response.data) {
        setUpdateMessage(error.response.data.error);
      } else {
        setUpdateMessage("An error occurred. Please try again.");
      }
    }
  };

  // make a route to get the current user details authenticated

  const handleUpdateAccount = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if email is a valid email address
    if (newEmail !== "") {
      if (!newEmail || !emailRegex.test(newEmail)) {
        setUpdateMessage("Please enter a valid email address.");
        return;
      }
    }

    try {
      const response = await axios.put(
        `http://localhost:5001/data/update-user/${authData.user.id}`,
        {
          email: newEmail || authData.user.email,
          firstName: newFirstName || authData.user.firstName,
          lastName: newLastName || authData.user.lastName,
        }
      );
      console.log(response);
      console.log(authData.user.email);
      console.log(authData.user.firstName);
      console.log(authData.user.lastName);
      setUpdateMessage(response.data.message);

      //  getCurrentUser();
    } catch (error) {
      console.log(error);

      if (error.response && error.response.data) {
        setUpdateMessage(error.response.data.error);
      } else {
        setUpdateMessage("An error occurred. Please try again.");
      }
    }
  };

  const handlePasswordChange = async (event) => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordMessage("All fields are required.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage("Password must be at least 8 characters long.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5001/change-password`,
        {
          id: authData.user?.id,
          oldPassword: oldPassword,
          newPassword: newPassword,
        }
      );
      console.log(response);
      setPasswordMessage(response.data.message);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.log(error);

      if (error.response && error.response.data) {
        setPasswordMessage(error.response.data.error);
      } else if (error.message === "Request failed with status code 401") {
        setPasswordMessage("Old password does not match.");
      } else {
        setPasswordMessage("An error occurred. Please try again.");
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5001/data/delete-user/${authData.user.id}`
      );
      console.log(response);
      setUpdateMessage(response.data.message);

      logout();
      navigate("/login");
    } catch (error) {
      console.log(error);

      if (error.response && error.response.data) {
        setUpdateMessage(error.response.data.error);
      } else {
        setUpdateMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <BaseLayout>
      <h1
        align="center"
        style={{
          color: isDarkMode ? "white" : "#631d1d",
          fontFamily: "'Times New Roman', Times, serif",
          padding: "7px",
        }}
      >
        Settings Page
      </h1>
      <ol
        style={{
          color: "#000000d0",
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: "150%",
        }}
      >
        <Accordion title="Account Settings" icon="fa fa-address-card-o">
          <ul>
            <li>
              <input
                type="text"
                placeholder={authData.user?.firstName}
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
              />
            </li>
            <li>
              <input
                type="text"
                placeholder={authData.user?.lastName}
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
              />
            </li>
            <li>
              <input
                type="email"
                placeholder={authData.user?.email}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </li>
            <li>
              <button
                onClick={handleUpdateAccount}
                type="submit"
                className="btn custom-btn-green"
              >
                <i className="fa fa-pencil" aria-hidden="true"></i> Update
                Account
              </button>
              {updateMessage && <p>{updateMessage}</p>}
            </li>
          </ul>
        </Accordion>
        <Accordion title="Theme Settings" icon="fa fa-adjust">
          <ul>
            <li>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={toggleDarkMode}
                />
                <span className="slider"></span>
              </label>
            </li>
          </ul>
        </Accordion>
        <Accordion title="Timezone Settings" icon="fa fa-clock-o">
          <ul>
            <li>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="">Select Timezone</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
                <option value="GMT">Greenwich Mean Time (GMT)</option>
                <option value="EST">Eastern Standard Time (EST)</option>
                <option value="CST">Central Standard Time (CST)</option>
                <option value="MST">Mountain Standard Time (MST)</option>
                <option value="PST">Pacific Standard Time (PST)</option>
                <option value="IST">Indian Standard Time (IST)</option>
                <option value="CET">Central European Time (CET)</option>
                <option value="EET">Eastern European Time (EET)</option>
                <option value="AEST">
                  Australian Eastern Standard Time (AEST)
                </option>
                <option value="ACST">
                  Australian Central Standard Time (ACST)
                </option>
                <option value="AWST">
                  Australian Western Standard Time (AWST)
                </option>
              </select>
            </li>
            <li>
              <button
                onClick={handleUpdateTimezone}
                className="btn custom-btn-green"
              >
                Update Timezone
              </button>
              {updateMessage && <p>{updateMessage}</p>}
            </li>
          </ul>
        </Accordion>
        <Accordion title="Password Settings" icon="fa fa-lock">
          <ul>
            <li>
              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </li>
            <li>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </li>
            <li>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </li>
            <li>
              <button
                onClick={handlePasswordChange}
                type="submit"
                className="btn custom-btn-green"
              >
                <i className="fa fa-key" aria-hidden="true"></i> Change Password
              </button>
            </li>
            {passwordMessage && <li>{passwordMessage}</li>}
          </ul>
        </Accordion>
        <Accordion title="Pictures Links" icon="fa fa-picture-o">
          <ul>
            <li>
              <a href="https://www.freepik.com/free-vector/cute-cat-cartoon-character_45188752.htm#page=2&query=cat%20clipart&position=3&from_view=search&track=ais&uuid=234b2f64-1ae7-42ff-b5a9-f3a54eb7e393">
                Image by brgfx
              </a>{" "}
              on Freepik
            </li>
            <li>
              <a href="https://www.freepik.com/free-vector/cute-black-kitten-sitting-pose_43941387.htm#page=2&query=cat&position=4&from_view=author&uuid=e2b6486b-a4a3-41b4-aa88-8ad098501516">
                Image by brgfx
              </a>{" "}
              on Freepik
            </li>
          </ul>
        </Accordion>
        <Accordion title="Delete Account" icon="fa fa-picture-o">
          <ul>
            <li>
              <button onClick={handleDelete} className="btn custom-btn-green">
                Delete account
              </button>
            </li>

            {updateMessage && <p>{updateMessage}</p>}
          </ul>
        </Accordion>
      </ol>
    </BaseLayout>
  );
};

export default SettingsPage;
