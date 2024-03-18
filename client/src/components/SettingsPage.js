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

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode
      ? "rgb(29, 37, 31)"
      : "rgb(204, 248, 229)";
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
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
        <Accordion title="Account Settings">
          <ul>
            <li>first name change</li>
            <li>last name change</li>
            <li>email change</li>
            <li>apply button</li>
          </ul>
        </Accordion>
        <Accordion title="Theme Settings">
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
        <Accordion title="Timezone Settings">
          <ul>
            <li>timezone dropbox</li>
            <li>apply button</li>
          </ul>
        </Accordion>
        <Accordion title="Password Settings">
          <ul>
            <li>password authentification</li>
            <li>asks for password 1</li>
            <li>asks for password 2</li>
            <li>apply button</li>
          </ul>
        </Accordion>
        <Accordion title="Pictures Links">
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
      </ol>
    </BaseLayout>
  );
};

export default SettingsPage;
