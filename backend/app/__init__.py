# app.py (Flask backend with Flask-SocketIO)
from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('message', {'response': 'You are connected.'})

@socketio.on('message')
def handle_message(data):
    print('Received message:', data)
    emit('message', {'response': 'Message received!'})

if __name__ == '__main__':
    socketio.run(app, debug=True)