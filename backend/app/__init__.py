# app/__init__.py
from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
    return 'Hello, Poke!'

if __name__ == '__main__':
    app.run(debug=True)