# app.py (Flask backend with Flask-SocketIO)
from flask import Flask, request
from flask_socketio import SocketIO, emit
from threading import Timer, Lock
import time
import os

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

connected_users = {}
current_player_index = [0]
newTask = [False]
lock = Lock()

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('message', {'response': 'You are connected.'})
    if not newTask[0]:
        socketio.start_background_task(send_turn, connected_users, lock, current_player_index)  # Start a new background task
        newTask[0] = True
 

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected', request.sid)
    with lock:
        if request.sid in connected_users:
            del connected_users[str(request.sid)]
            emit('user_joined', {'users': list(connected_users.values())}, broadcast=True)

@socketio.on('change_username')
def handle_change_username(data):
    username = data['username']
    with lock:
        connected_users[str(request.sid)] = {'id': str(request.sid), 'username':username, 'input':None}
    print(str(connected_users))
    emit('user_joined', {'users': list(connected_users.values())}, broadcast=True)

@socketio.on('change_inputValue')
def handle_change_inputValue(data):
    inputValue = data['inputValue']
    # Implement only players turn can move, might need another enpoint for clear
    print("INPUT!", inputValue)
    with lock:
        player_turn = connected_users[list(connected_users.keys())[current_player_index[0]]]['id']
        print("TURN", player_turn, request.sid, player_turn == request.sid)
        # Make sure user is in game, and second verifies turn
        if request.sid in connected_users:
            connected_users[request.sid]['input'] = inputValue
            print(str(connected_users))
            emit('input_changed', {'users': list(connected_users.values())}, broadcast=True)

def send_turn(connected_users, lock, current_player_index):
    while True:
        with lock:
            print("RANSENDTURN", len(connected_users))
            print("PAST", current_player_index)
            if connected_users:
                player_turn = connected_users[list(connected_users.keys())[current_player_index[0]]]
                print(player_turn)
                socketio.emit('player_turn', {'player_turn': player_turn}, namespace='/')
                print("EMMITED")
                current_player_index[0] = (current_player_index[0] + 1) % len(connected_users)
        time.sleep(5)

if __name__ == "__main__":
    socketio.run(app, debug=True)