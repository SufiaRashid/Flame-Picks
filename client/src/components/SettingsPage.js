import React, { useState, useEffect, useContext } from "react";
import BaseLayout from "./BaseLayout";
import { useAuth } from "../context/AuthContext";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa6";

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="accordion-wrapper" onClick={toggle}>
        <button className="accordion">{title}</button>
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

const SettingsPage = ({ children }) => {
  const { isDarkMode, setIsDarkMode } = useAuth();
  // const { isDarkMode, setIsDarkMode } = useContext(AuthProvider);
  /*useEffect(() => {
        document.body.classList.add("settings-page-bg");

        return () => {
            document.body.classList.remove("settings-page-bg");
        };
      }, []);*/

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? "grey" : "white";

    // return () => {
    //   document.body.style.backgroundColor = "";
    // };
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <BaseLayout>
      <div
        className="fullPageDiv"
        style={{
          minHeight: "100vh",
          padding: "20px",
          fontFamily: "'Times New Roman', Times, serif",
          color: "#000000d0",
        }}
      >
        <h1 align="center" style={{ color: isDarkMode ? "white" : "black" }}>
          Settings Page
        </h1>
        <ol
          style={{
            color: "#000000d0",
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: "150%",
          }}
        >
          <Accordion title="General Settings">
            <ul>
              <li>
                <label>
                  Dark mode
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                  />
                  <span></span>
                </label>
              </li>
              <li>Site title and tagline</li>
              <li>Site URL</li>
              <li>Timezone settings</li>
              <li>Date and time format</li>
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
          <Accordion title="Account Settings">
            <ul>
              <li>Logo and site icon</li>
              <li>Favicon</li>
            </ul>
          </Accordion>
          <Accordion title="Theme Settings">
            <ul>
              <li>Default post category and format</li>
              <li>Default post editor</li>
            </ul>
          </Accordion>
          <Accordion title="Discussion Settings">
            <ul>
              <li>
                Comment settings (enable/disable comments, moderation settings)
              </li>
              <li>Avatar display settings</li>
              <li>Comment form settings</li>
            </ul>
          </Accordion>
        </ol>
      </div>
    </BaseLayout>
  );
};

export default SettingsPage;
