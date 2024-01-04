import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import Player from './components/Player';
import BombRoom from './pages/BombRoom';
import Header from './pages/Header';
import Footer from './pages/Footer'

const App = () => {
  return (
  <div>
    <Header />
    <BombRoom />
    <Footer />
  </div>
  )

};


export default App;
