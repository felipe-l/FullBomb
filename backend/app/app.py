import requests

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
timer = 5
lock = Lock()

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('message', {'response': 'You are connected.'})
    if not newTask[0]:
        socketio.start_background_task(send_turn, connected_users, lock, current_player_index, timer)  # Start a new background task
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
        connected_users[str(request.sid)] = {'id': str(request.sid), 'username':username, 'input':None, 'points': 0}
    emit('user_joined', {'users': list(connected_users.values())}, broadcast=True)

@socketio.on('change_inputValue')
def handle_change_inputValue(data):
    if request.sid == connected_users[list(connected_users.keys())[current_player_index[0]]]["id"]:
        inputValue = data['inputValue']
        with lock:
            if request.sid in connected_users:
                connected_users[request.sid]['input'] = inputValue
        emit('input_changed', {'users': list(connected_users.values())}, broadcast=True)

def check_word_exists(word):
    response = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}")
    try:
        if isinstance(response.json(), list):
            print(len(response.json()))
            return True
        else:
            return False
    except ValueError:
        return False

@socketio.on('submit_guess')
def handle_submit_guess(data):
    if request.sid == connected_users[list(connected_users.keys())[current_player_index[0]]]["id"]:
        guess = data['inputValue']
        with lock:
            if request.sid in connected_users:
                if check_word_exists(guess):
                    connected_users[request.sid]['input'] = ""
                    connected_users[request.sid]['points'] += 1

        emit('input_changed', {'users': list(connected_users.values())}, broadcast=True)

def send_turn(connected_users, lock, current_player_index, timer):
    while True:
        with lock:
            if connected_users and timer == 1:
                current_player_index[0] = (current_player_index[0] + 1) % len(connected_users)
                player_turn = connected_users[list(connected_users.keys())[current_player_index[0]]]
                socketio.emit('player_turn', {'player_turn': player_turn}, namespace='/')
                timer = 5
                socketio.emit('timer', {'timer': timer}, namespace='/')
            elif len(connected_users) > 1:
                timer -= 1
                socketio.emit('timer', {'timer': timer}, namespace='/')
        time.sleep(1)

if __name__ == "__main__":
    socketio.run(app, debug=True)