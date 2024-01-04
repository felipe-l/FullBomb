// src/components/Player.js

import React from 'react';
import './player.css';

const Player = ({ name }) => {
  return (
    <div className="player">
      <div className="square"></div>
      <div className="name">{name}</div>
    </div>
  );
};

export default Player;