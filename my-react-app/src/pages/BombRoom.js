import React, { useState, useEffect, useRef } from 'react';
import Player from '../components/Player';
import UsernameModal from './UsernameModal';
import io from 'socket.io-client';

const BombRoom = () => {

	const [username, setUsername] = useState('');
	const [showModal, setShowModal] = useState(false); 
	const [response, setResponse] = useState('');
	const [users, setUsers] = useState([]);
	const socket = useRef(null);
	const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
	const [myTurn, setMyTurn] = useState(false);
	const [gameStart, setGameStart] = useState(false);
	const [timer, setTimer] = useState(5);
	useEffect(() => {
		if (!socket.current) {
			const isSecure = process.env.REACT_APP_WS_API_URL.startsWith('https');
			socket.current = io(`${process.env.REACT_APP_WS_API_URL}`, {secure: isSecure}, { query: `foo=${window.location.pathname}` });
		}
		socket.current.on('message', (data) => {
			setResponse(data.response);
		})
		socket.current.on('user_joined', (data) => {
			//console.log(data.users);
			setUsers(data.users);
		})
		socket.current.on('input_changed', (data) => {
			//console.log(data.users);
			setUsers(data.users);
		})
		socket.current.on('timer', (data) => {
			setTimer(data.timer)
		})

		socket.current.on('gameStart', (data) => {
			setGameStart(data.gameStart)
			console.log(data.gameStart)
		})

		if (username !== "") {
			socket.current.emit('change_username', {username: username, room: window.location.pathname});
		}
		return () => {
			// if (socket.current) {
			// 	socket.current.disconnect();
			// 	socket.current = null;
			// }
		};
	}, [username]);

	useEffect(() => {
		socket.current.on('player_turn', (data) => {
			let playerIndex = -1;
			
			for (let i = 0; i < users.length; i++) {
				console.log(data.player_turn.id)
				if (users[i].id == data.player_turn.id) {
					//If the turn id is ours, set myTurn to True.
					console.log("IN")
					setMyTurn(users[i].id === socket.current.id);
					playerIndex = i;
					break;
				}
			}
			setCurrentPlayerIndex(playerIndex);
		})
		
	}, [users]);

	useEffect(() => {
			// Check if the username is already stored in local storag
			const storedUsername = localStorage.getItem('username');
			if (storedUsername) {
				setUsername(storedUsername);
			} else {
				// If no username is stored, show the modal
				setShowModal(true);
			}
	}, []);


	const handleLogout = () => {
	// Clear the username from localStorage
		// let pastUsername = localStorage.getItem('username');
		// removeUser(pastUsername);
		// localStorage.removeItem('username');

		removeUser(username);	
		setShowModal(true);
	// Update the state to reset the username
		setUsername('');
	};


	const closeModal = () => {
			setShowModal(false);
	};

	const addUser = (userName) => {
		setUsers((prevUsers) => [...prevUsers, userName]);
	};

	const removeUser = (usernameToRemove) => {
		// Create a new array excluding the user with the specified username
		const updatedUsers = users.filter(user => user != usernameToRemove);
		// Update the state with the new array
		setUsers(updatedUsers);
	};

	return (
		<div className="h-screen flex flex-col items-center justify-center">
		<div className="relative">
			{/* Bomb icon or any other representation */}
			<div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white z-1">
			💣
			{timer}
			</div>
			{/* Arrow pointing to the current player */}
			{currentPlayerIndex !== null && (
				<div className="w-64 h-64 absolute top-0 left-0"
					style={{ transform: `rotate(${currentPlayerIndex * 360 / users.length}deg)`, position: 'absolute', marginLeft:"-150%", marginTop:"-150%", zIndex: -1, transformOrigin: '50%, 50%'}} >
					<img src={process.env.PUBLIC_URL + "/arrow1.png"} alt="arrow" className="w-full h-full" style={{position: 'absolute'}} />
				</div>
			)}

			{users.map((user, index) => (
				<Player key={user.id} user={user} users={users} index={index} username={username} socket={socket} myTurn={myTurn && gameStart} />
			))}
		</div>
		{/* Example usage */}
			{username == "admin" && <button onClick={() => addUser('User1')}>Add User</button>}
			<button onClick={handleLogout}>Logout</button>    
		{/* Username Modal */}
		{showModal && <UsernameModal setUsername={setUsername} closeModal={closeModal} users={users} />}
		</div>
	);
};


export default BombRoom;
