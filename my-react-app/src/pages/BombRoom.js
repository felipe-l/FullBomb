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

	useEffect(() => {
		if (!socket.current) {
			socket.current = io("http://localhost:5000");
		}
		socket.current.on('message', (data) => {
			setResponse(data.response);
		})
		socket.current.on('user_joined', (data) => {
			setUsers(data.users);
		})

		return () => {
			if (socket.current) {
				socket.current.disconnect();
				socket.current = null;
			}
		};
	}, []);

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
		// Add socket to send list of players
	useEffect(() => {
			if (username !== "") {
				addUser(username)
			}
	}, [username])

		const handleLogout = () => {
		// Clear the username from localStorage
			let pastUsername = localStorage.getItem('username');
			removeUser(pastUsername);
			localStorage.removeItem('username');
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
			<div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white">
			💣
			</div>
			{users.map((user, index) => (
			<div
				key={index}
				className={`absolute bg-blue-500 p-2 rounded-full text-white`}
				style={{
				top: `${Math.sin((index / users.length) * 2 * Math.PI) * 300 + 26}%`,
				left: `${Math.cos((index / users.length) * 2 * Math.PI) * 300}%`,
				}}
			>
				{user}
			</div>
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
