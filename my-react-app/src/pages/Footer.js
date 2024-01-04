// Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 fixed bottom-0 left-0 right-0 z-10">
    <p>&copy; {new Date().getFullYear()}</p>
    </footer>
  );
};

export default Footer;