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
        style={{
          backgroundColor: "hsl(180, 15%, 54%)",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <h5 align="center" style={{ color: isDarkMode ? "white" : "black" }}>
          Flame Picks Settings Page
        </h5>
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
          <Accordion title="Site Identity">
            <ul>
              <li>Logo and site icon</li>
              <li>Favicon</li>
            </ul>
          </Accordion>
          <Accordion title="Writing Settings">
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
          <Accordion title="Permalinks">
            <ul>
              <li>URL structure for posts and pages</li>
            </ul>
          </Accordion>
          <Accordion title="Media Settings">
            <ul>
              <li>Image sizes and thumbnail settings</li>
              <li>Default image alignment</li>
            </ul>
          </Accordion>
          <Accordion title="Privacy Settings">
            <ul>
              <li>Privacy policy page</li>
              <li>Cookie consent settings</li>
            </ul>
          </Accordion>
          <Accordion title="Security Settings">
            <ul>
              <li>Two-factor authentication settings</li>
              <li>User roles and permissions</li>
            </ul>
          </Accordion>
          <Accordion title="SEO Settings">
            <ul>
              <li>Meta tags (title, description, keywords)</li>
              <li>Sitemap submission settings</li>
            </ul>
          </Accordion>
          <Accordion title="Analytics Integration">
            <ul>
              <li>Google Analytics tracking code</li>
              <li>Integration with other analytics platforms</li>
            </ul>
          </Accordion>
          <Accordion title="Customization Settings">
            <ul>
              <li>Theme customization options (colors, fonts, layout)</li>
              <li>Custom CSS/JS code</li>
            </ul>
          </Accordion>
          <Accordion title="Backup and Restore Settings">
            <ul>
              <li>Backup frequency and storage location</li>
              <li>Restore options</li>
            </ul>
          </Accordion>
          <Accordion title="API Settings">
            <ul>
              <li>Integration with third-party services via API keys</li>
            </ul>
          </Accordion>
          <Accordion title="User Profile Settings">
            <ul>
              <li>Profile information (name, email, bio)</li>
              <li>Avatar or profile picture</li>
            </ul>
          </Accordion>
          <Accordion title="Email Settings">
            <ul>
              <li>SMTP configuration for outgoing emails</li>
              <li>Email notifications settings</li>
            </ul>
          </Accordion>
          <Accordion title="Language and Localization Settings">
            <ul>
              <li>Site language</li>
              <li>Time and date formats specific to the locale</li>
            </ul>
          </Accordion>
          <Accordion title="Accessibility Settings">
            <ul>
              <li>Font size and contrast options</li>
              <li>Keyboard navigation settings</li>
            </ul>
          </Accordion>
          <Accordion title="Plugin Settings">
            <ul>
              <li>Configuration settings for installed plugins</li>
            </ul>
          </Accordion>
        </ol>
      </div>
    </BaseLayout>
  );
};

export default SettingsPage;
