import React, { useState, useEffect } from "react";
import BaseLayout from "./BaseLayout";
import "../App.css";

const SupportPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.body.classList.add("support-page-bg");

    return () => {
      document.body.classList.remove("support-page-bg");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    //handle the form submission here
    console.log(email, message);
  };

  return (
    <BaseLayout>
      <div className="support-container">
        <h1 className="support-header">Support</h1>
        <div className="support-content">
          <div className="support-column">
            <form className="contact-form" onSubmit={handleSubmit}>
              <input 
                type="email" 
                className="form-input" 
                placeholder="Your email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <textarea 
                className="form-textarea" 
                placeholder="Your message" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
              ></textarea>
              <button type="submit" className="submit-button">Submit</button>
            </form>
          </div>
          <div className="support-column">
            {/* FAQ section goes here */}
            <p>FAQ Section Coming Soon...</p>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default SupportPage;
