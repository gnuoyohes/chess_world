#!/usr/bin/python3
# app.py
# backend flask-socketio server for chess world

from flask import Flask, render_template, request, session
from flask_socketio  import SocketIO, emit, join_room, close_room
import uuid
import secrets
# import json
import os

SOCKET_URL = os.environ.get('SOCKET_URL')
if SOCKET_URL is None:
    SOCKET_URL = "http://localhost:5000"

print("Socket URL: " + SOCKET_URL)

app = Flask(__name__)
app.secret_key = secrets.token_bytes(32) # used to cryptographically sign session cookies

# socket = SocketIO(app, cors_allowed_origins="*")
socket = SocketIO(app)

# Single entry in rooms:
#
# <room key> : {
#   'board': <chess board FEN>,
#   'users': {
#       <name>: <position ([x, y, z])>,
#       ...
#   },
#   'info': {
#       'white': <name of white player>,
#       'black': <name of black player>,
#       'num_users': <number of users in room>
#   }
# }
class State:
    rooms = {}


############ Flask routes: ############

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<room_key>')
def game(room_key):
    if room_key in State.rooms:
        session['room_key'] = room_key
        return render_template('game.html', room_key=room_key, socket_url=SOCKET_URL)
    else:
        return 'Game does not exist', 404

@app.route('/get_room', methods=['GET'])
def get_room():
    room_key = request.values.get("roomKey")
    if room_key in State.rooms:
        return 'success'
    else:
        return ''

@app.route('/create_room', methods=['POST'])
def create_room():
    room_key = uuid.uuid1().hex[:6].upper()
    session['room_key'] = room_key
    State.rooms[room_key] = { 'board': '', 'users': {}, 'info': { 'white': '', 'black': '', 'num_users': 0 } }
    print('Room {} added!'.format(room_key))
    return room_key

@app.route('/validate_name', methods=['POST'])
def validate_name():
    room_key = request.values.get("roomKey")
    name = request.values.get("name")
    if name in State.rooms[room_key]['users']:
        return ''
    return 'success'

@app.errorhandler(404)
def game_not_found(error):
    return 'Page not found', 404

############ SocketIO handlers: ############

# sent everytime board updates
def send_board(room_key):
    board_fen = State.rooms[room_key]['board']
    emit('board', board_fen, room=room_key)

# sent once when page loads
def send_info(room_key):
    emit('info', State.rooms[room_key]['info'], room=room_key)

def send_users(room_key):
    emit('users', State.rooms[room_key]['users'], room=room_key)

@socket.on('join_room')
def on_join(data):
    name = data['name']
    session['name'] = name
    room_key = data['roomKey']
    join_room(room_key)

    room = State.rooms[room_key]
    room['users'][name] = (0, 0, 0)

    info = room['info']
    info['num_users'] += 1
    if info['white'] == '':
        info['white'] = name
    elif info['black'] == '':
        info['black'] = name

    send_info(room_key)
    send_board(room_key)
    emit('user_joined', {'username': name, 'numUsers': info['num_users']}, room=room_key)

# user automatically leaves room when disconnecting
@socket.on('disconnect')
def on_disconnect():
    room_key = session['room_key']
    room = State.rooms[room_key]
    info = room['info']
    if 'name' in session:
        name = session['name']
        info['num_users'] -= 1
        if info['white'] == name:
            info['white'] = ''
        elif info['black'] == name:
            info['black'] = ''

        del room['users'][name]

        send_info(room_key)
        emit('user_left', {'username': name, 'numUsers': info['num_users']}, room=room_key)

    # empty session globals
    if 'name' in session:
        session['name'] = ''
    if 'room_key' in session:
        session['room_key'] = ''

    # if no clients in room, close room
    if info['num_users'] == 0:
        close_room(room_key)
        del State.rooms[room_key]
        print('Room {} closed!'.format(room_key))

@socket.on('update_board')
def on_update_board(data):
    room_key = data['roomKey']
    State.rooms[room_key]['board'] = data['board']
    send_board(room_key)

@socket.on('users_init')
def on_users_init(room_key):
    client = request.sid
    emit('users_init', State.rooms[room_key]['users'], room=client) # send to only client who just joined

@socket.on('update_position')
def on_update_position(data):
    room_key = data['roomKey']
    name = data['name']
    position = data['position']
    State.rooms[room_key]['users'][name] = position
    send_users(room_key)

@socket.on('message_in')
def on_new_message(data):
    name = data['name']
    room_key = data['roomKey']
    msg = data['message']
    emit('message_out', {'username': name, 'message': msg}, room=room_key)


if __name__ == '__main__':
    socket.run(app, debug=True)
