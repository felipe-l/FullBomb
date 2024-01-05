# app.py (Flask backend with Flask-SocketIO)
from flask import Flask, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

connected_users = {}

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('message', {'response': 'You are connected.'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    del connected_users[request.sid]
    emit('user_joined', {'users': list(connected_users.values())}, broadcast=True)

@socketio.on('change_username')
def handle_change_username(data):
    username = data['username']
    connected_users[request.sid] = username
    print(str(connected_users))
    emit('user_joined', {'users': list(connected_users.values())}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)