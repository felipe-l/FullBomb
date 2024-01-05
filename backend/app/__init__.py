# app.py (Flask backend with Flask-SocketIO)
from flask import Flask, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

connected_users = []

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('message', {'response': 'You are connected.'})
    connected_users.append(request.sid)
    print("Connected:", request.sid, str(connected_users))
    emit('user_joined', {'user': request.sid, 'users': connected_users}, broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected?????')
    connected_users.remove(request.sid)
    emit('user_joined', {'user': request.sid, 'users': connected_users}, broadcast=True)

@socketio.on('message')
def handle_message(data):
    print('Received message:', data)
    emit('message', {'response': 'Message received!'})

if __name__ == '__main__':
    socketio.run(app, debug=True)