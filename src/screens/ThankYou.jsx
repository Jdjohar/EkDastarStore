import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router
import '../index.css'; // Import CSS file for styling

const ThankYou = () => {
  const navigate = useNavigate();

  // Redirect to home page after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/'); // Navigate to home page
    }, 10000); // 10 seconds in milliseconds

    return () => clearTimeout(timer); // Clean up timer on unmount
  }, [navigate]);

  const handleBackToHome = () => {
    navigate('/'); // Navigate to home page immediately
  };

  return (
    <div className="thank-you-container">
      <div className="thank-you-text">
        Thank You for Your Purchase!
      </div>
      <div className="svg-container">
        {/* SVG animation icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-check-circle"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="16 12 12 8 8 12"></polyline>
        </svg>
      </div>
      <button className="back-to-home-button" onClick={handleBackToHome}>
        Back to Home
      </button>
    </div>
  );
};

export default ThankYou;
