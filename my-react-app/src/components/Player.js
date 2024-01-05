// src/components/Player.js

import React, { useState, useEffect } from 'react';
import './player.css';

const Player = ({ user, users, index }) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.match(/^[a-zA-Z]+$/)) {
        setInputValue(inputValue + event.key);
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [inputValue]);

  return (
    <div className="player">
			<div
				className="absolute top-0 left-0"
				style={{
				top: `${Math.sin((index / users.length) * 2 * Math.PI) * 300 + 26}%`,
				left: `${Math.cos((index / users.length) * 2 * Math.PI) * 300}%`,
				}}
			>
				{inputValue}
			</div>
			<div
				className={`absolute bg-blue-500 p-2 rounded-full text-white`}
				style={{
				top: `${Math.sin((index / users.length) * 2 * Math.PI) * 300 + 26}%`,
				left: `${Math.cos((index / users.length) * 2 * Math.PI) * 300}%`,
				zIndex: -1,
				}}
			>
				{user}
			</div>
    </div>
  );
};

export default Player;