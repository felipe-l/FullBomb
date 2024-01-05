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

	useEffect(() => {
		if (!socket.current) {
			socket.current = io("http://localhost:5000");
		}
		socket.current.on('message', (data) => {
			setResponse(data.response);
		})
		socket.current.on('user_joined', (data) => {
			console.log(data.users);
			setUsers(data.users);
		})
		socket.current.on('input_changed', (data) => {
			console.log(data.users);
			setUsers(data.users);
		})
		socket.current.on('player_turn', (data) => {
			console.log("TURNNAME" + data.player_turn.username);
			const playerIndex = users.findIndex(user => user.id === data.player_turn.id);
			setCurrentPlayerIndex(playerIndex);
			console.log("TURNINDEX" + playerIndex);
		})
		if (username !== "") {
			socket.current.emit('change_username', {username: username});
		}

		return () => {
			if (socket.current) {
				socket.current.disconnect();
				socket.current = null;
			}
		};
	}, [username]);

	useEffect(() => {
			// Check if the username is already stored in local storage
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
		console.log(...updatedUsers)
		// Update the state with the new array
		setUsers(updatedUsers);
	};

	return (
		<div className="h-screen flex flex-col items-center justify-center">
		<div className="relative">
			{/* Bomb icon or any other representation */}
			<div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white z-1">
			💣
			</div>
			{/* Arrow pointing to the current player */}
			{currentPlayerIndex !== null && (
				<div className="w-64 h-64 absolute top-0 left-0"
					style={{ transform: `rotate(${currentPlayerIndex * 360 / users.length}deg)`, position: 'absolute', marginLeft:"-150%", marginTop:"-150%", zIndex: -1, transformOrigin: '50%, 50%'}} >
					<img src={process.env.PUBLIC_URL + "/arrow1.png"} alt="arrow" className="w-full h-full" style={{position: 'absolute'}} />
				</div>
			)}

			{console.log("All users: ", users)}
			{users.map((user, index) => (
				<Player key={user.id} user={user} users={users} index={index} username={username} socket={socket} />
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
