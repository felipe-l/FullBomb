// src/components/Player.js

import React, { useState, useEffect } from 'react';
import './player.css';

const Player = ({ user, users, index, username, socket, myTurn}) => {
  const [inputValue, setInputValue] = useState('');
  console.log("index" + index)
  useEffect(() => {
    if (myTurn) {
      setInputValue('');
      socket.current.emit('change_inputValue', { inputValue: ""});
    }
  }, [myTurn]);

  useEffect(() => {
    console.log(username + " " + user.username)
    if (username == user.username && myTurn) {
      const handleKeyPress = (event) => { 
        if (event.key === 'Enter') {
          const finalGuess = inputValue;
          socket.current.emit('submit_guess', { inputValue: finalGuess });
          setInputValue('');
        } else if (event.key.match(/^[a-zA-Z]$/)) {
          const updatedInputValue = inputValue + event.key;
          setInputValue(updatedInputValue);
          socket.current.emit('change_inputValue', { inputValue: updatedInputValue });
        } else if (event.key === 'Backspace' && inputValue.length > 0) {
          const updatedInputValue = inputValue.slice(0, -1);
          setInputValue(updatedInputValue);
          socket.current.emit('change_inputValue', { inputValue: updatedInputValue });
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [inputValue, myTurn]);

  return (
    <div className="player" key={user.id}>
			<div
				className="absolute top-0 left-0"
				style={{
				top: `${Math.sin((index / users.length) * 2 * Math.PI) * 300 + 26}%`,
				left: `${Math.cos((index / users.length) * 2 * Math.PI) * 300}%`,
				}}
			>
				{user.input}
			</div>
			<div
				className={`absolute bg-blue-500 p-2 rounded-full text-white`}
				style={{
				top: `${Math.sin((index / users.length) * 2 * Math.PI) * 300 + 26}%`,
				left: `${Math.cos((index / users.length) * 2 * Math.PI) * 300}%`,
				zIndex: -1,
				}}
			>
				{user.username} - {user.points}
			</div>
    </div>
  );
};

export default Player;