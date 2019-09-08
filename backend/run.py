
from flask import Flask
from flask_cors import CORS

from models import init_all_tables
from routes import init_all_routes

app = Flask(__name__)

# Cross-origin
CORS(app)

@app.before_first_request
def init_db():
    init_all_tables()

init_all_routes(app)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
