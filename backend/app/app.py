import requests
import logging

# app.py (Flask backend with Flask-SocketIO)
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from threading import Timer, Lock
import time
import os

logging.getLogger('werkzeug').setLevel(logging.ERROR)
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", engineio_logger=False, manage_session=False)

rooms = {}
userRoom = {}

lock = Lock()
@socketio.on('connect')
def handle_connect():
    room = request.args.get('foo')
    print(f'Client connected with room: {room}, SID: {request.sid}')
    join_room(room)
    # Additional connection handling logic here

@socketio.on('disconnect')
def handle_disconnect():
    room = request.args.get('foo')
    print(f'Client disconnected from room: {room}, SID: {request.sid}')
    reqUsername = rooms[room]['connected_users'][request.sid]['username']
    with lock:
        if room in rooms and request.sid in rooms[room]['connected_users']:
            leave_room(room)
            del rooms[room]['connected_users'][request.sid]
            emit('user_joined', {'users': list(rooms[room]['connected_users'].values())}, room=room)
            print("THE USER LEAVING WAS ", reqUsername, "and the admin is", rooms[room]['admin'])
            if rooms[room]['admin'] == reqUsername and len(rooms[room]['connected_users']) > 0:
                newAdminUsername = list(rooms[room]['connected_users'].values())[0]['username']
                rooms[room]['admin'] = newAdminUsername
            emit('gameStart', {'gameStart':rooms[room]['gameStart'], 'admin':rooms[room]['admin']}, room=room)

@socketio.on('change_username')
def handle_change_username(data):
    room = data['room']
    username = data['username']
    with lock:
        userRoom[request.sid] = room
        if room not in rooms:
            rooms[room] = {'connected_users': {}, "current_player_index": 0, "timer": 5, "gameStart": False, "admin": username} 
            rooms[room]['connected_users'][request.sid] = {'id': request.sid, 'username': username, 'input': None, 'points': 0}
            socketio.start_background_task(send_turn, room)
        else:
            rooms[room]['connected_users'][request.sid] = {'id': request.sid, 'username': username, 'input': None, 'points': 0}
    emit('user_joined', {'users': list(rooms[room]['connected_users'].values())}, room=room)

@socketio.on('change_inputValue')
def handle_change_inputValue(data):
    room = userRoom[request.sid]
    if request.sid == rooms[room]['connected_users'][list(rooms[room]['connected_users'].keys())[rooms[room]['current_player_index']]]["id"]:
        inputValue = data['inputValue']
        with lock:
            if request.sid in rooms[room]['connected_users']:
                rooms[room]['connected_users'][request.sid]['input'] = inputValue
        emit('input_changed', {'users': list(rooms[room]['connected_users'].values())}, room=room)

def check_word_exists(word):
    response = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}")
    try:
        if isinstance(response.json(), list):
            return True
        else:
            return False
    except ValueError:
        return False

@socketio.on('submit_guess')
def handle_submit_guess(data):
    room = userRoom[request.sid]
    if request.sid == rooms[room]['connected_users'][list(rooms[room]['connected_users'].keys())[rooms[room]['current_player_index']]]["id"]:
        guess = data['inputValue']
        with lock:
            if request.sid in rooms[room]['connected_users']:
                if check_word_exists(guess):
                    rooms[room]['connected_users'][request.sid]['input'] = ""
                    rooms[room]['connected_users'][request.sid]['points'] += 1
        emit('input_changed', {'users': list(rooms[room]['connected_users'].values())}, room=room)

@socketio.on("start_game")
def handle_start_game():
    room = userRoom[request.sid]
    reqUsername = rooms[room]['connected_users'][request.sid]['username']
    if reqUsername == rooms[room]['admin']:
        for user in rooms[room]["connected_users"].values():
            user["points"] = 0
            user["input"] = ""
        rooms[room]['timer'] = 5
        rooms[room]["gameStart"] = True
    emit('gameStart', {'gameStart':rooms[room]['gameStart'], 'admin':rooms[room]['admin']}, room=room)

def send_turn(room):
    while True:
        with lock:
            if rooms[room]['connected_users'] and rooms[room]['timer'] == 1:
                ### I don't understand why this line was added, game should never reset to false here.
                #rooms[room]['gameStart'] = True
                rooms[room]['current_player_index'] = (rooms[room]['current_player_index'] + 1) % len(rooms[room]['connected_users'])
                player_turn = rooms[room]['connected_users'][list(rooms[room]['connected_users'].keys())[rooms[room]['current_player_index']]]
                socketio.emit('player_turn', {'player_turn': player_turn}, room=room)
                rooms[room]['timer'] = 5
                socketio.emit('timer', {'timer': rooms[room]['timer']}, room=room)
                socketio.emit('gameStart', {"gameStart": rooms[room]['gameStart'], 'admin': rooms[room]['admin']}, room=room)
            elif len(rooms[room]['connected_users']) > 1 and rooms[room]["gameStart"]:
                rooms[room]['timer'] -= 1
                socketio.emit('timer', {'timer': rooms[room]['timer']}, room=room)
                socketio.emit('gameStart', {"gameStart": rooms[room]['gameStart'], 'admin': rooms[room]['admin']}, room=room)
            elif len(rooms[room]['connected_users']) == 1:
                rooms[room]['gameStart'] = False
                #socketio.emit('timer', {'timer': rooms[room]['timer']}, room=room)
                socketio.emit('gameStart', {"gameStart": rooms[room]['gameStart'], 'admin': rooms[room]['admin']}, room=room)
            elif len(rooms[room]['connected_users'])== 0:
                del rooms[room]
                break 
        time.sleep(1)

if __name__ == "__main__":
    if os.getenv('FLASK_ENV') == 'production':
        ssl_context = ('fullchain.pem',
                        'privkey.pem')
        socketio.run(app, debug=True, ssl_context=ssl_context)
    else:
        socketio.run(app, debug=True)
