import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="flex justify-between align-center p-2">
          <div className="footer-copyright">
            &copy; {currentYear} Memory in a Jar. All rights reserved.
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link mr-2">Privacy Policy</a>
            <a href="#" className="footer-link mr-2">Terms of Service</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
