// UsernameModal.js
import React, { useState } from 'react';

const UsernameModal = ({ setUsername, closeModal, users}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError(null);
  };

  const [error, setError] = useState(null);

  const handleSubmit = () => {
    if (inputValue === '') {
      setError('Username cannot be empty');
    } else if (users.includes(inputValue)) {
      setError('Username already exists');
    } else {
      // Set the username in local storage or state
      localStorage.setItem('username', inputValue);
      setUsername(inputValue);
      setError(null);
      // Close the modal
      closeModal();
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="bg-white p-4 rounded-md">
        <h2 className="text-lg font-bold mb-2">Enter Your Username</h2>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="p-2 border rounded-md mb-2"
        />
        <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded-md">
          Submit
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>} 
      </div>
    </div>
  );
};

export default UsernameModal;