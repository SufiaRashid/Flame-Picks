import React, { useState, useEffect } from "react";
import BaseLayout from "./BaseLayout";
import "../App.css";

//component for notify of email
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast">
      {message}
    </div>
  );
}

function FAQ({ faqs }) {
  const [activeId, setActiveId] = useState(null);

  const toggle = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="faq-section">
      {faqs.map(faq => (
        <div key={faq.id} className="faq-item">
          <button className="faq-question" onClick={() => toggle(faq.id)}>
            {faq.question}
          </button>
          <div className={`faq-answer ${activeId === faq.id ? 'open' : ''}`}>
            {faq.answer}
          </div>
        </div>
      ))}
    </div>
  );
}

const SupportPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const faqs = [
    { id: 1, question: "How do I reset my password?", answer: "Go to your settings page and click on 'Reset Password.'" },
    { id: 2, question: "Where can I find my pick history?", answer: "Your past picks can be viewed in the 'Pick History' section the webpage."},
    { id: 3, question: "How do I contact support?", answer: "You can contact us via the support form on this page or directly email us at FlamePicksHelp@gmail.com." }
  ];

  useEffect(() => {
    document.body.classList.add("support-page-bg");

    return () => {
      document.body.classList.remove("support-page-bg");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { email, message };

    const response = await fetch('http://localhost:5001/mail/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        const responseData = await response.json();
        console.log('Success:', responseData);
        alert('Email sent successfully!');
        setToastMessage('Email sent successfully!');
        setShowToast(true);
        setEmail('');
        setMessage('');
    } else {
        const errorData = await response.json();
        console.error('Failed to send email:', errorData);
        alert('Failed to send email. Please try again later.');
        setToastMessage('Failed to send email. Please try again later.');
        setShowToast(true);
    }
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
                className="form-input input-default-font" 
                placeholder="Your email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <textarea 
                className="form-textarea input-default-font" 
                placeholder="Your message" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
              ></textarea>
              <button type="submit" className="submit-button">Submit</button>
            </form>
          </div>
          <div className="support-column">
            <FAQ faqs={faqs} />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default SupportPage;
