from functools import wraps
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

from Crypto import Random
from Crypto.PublicKey import RSA

from itsdangerous import (TimedJSONWebSignatureSerializer
as URLSafeSerializer, BadSignature, SignatureExpired)

from utils import *

app = Flask(__name__)
app.config.from_object("config")

# Cross-origin
CORS(app)

def verify_auth_token(token):
    s = URLSafeSerializer(app.config["SECRET_KEY"])
    try:
        data = s.loads(token)
    except SignatureExpired:
        return None
    except BadSignature:
        return None
    return "key" in data and data["key"] == app.config["SECRET_KEY"]

def test_authorization():
    cookies = request.cookies
    headers = request.headers
    args = request.args
    token = None
    # Validate token in three places
    if "token" in cookies:
        token = cookies["token"]
    elif "Authorization" in headers:
        token = headers["Authorization"]
    elif "token" in args:
        token = args["token"]
    else:
        return False

    return verify_auth_token(token)

def authorization_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Return code 401 when failed to validate token
        if not test_authorization():
            return jsonify(message="unauthorized"), 401
        return f(*args, **kwargs)
    return wrapper

@app.route("/login", methods=["POST"])
def login():
    req = request.get_json()
    # Validate username and password
    if req["userinfo_md5_rsa"] == md5_encode(app.config['EMAIL'] + app.config['PASSWORD']):
        # Generate token
        s = URLSafeSerializer(app.config["SECRET_KEY"], expires_in=7 * 24 * 3600)

        return jsonify(message="OK", token=s.dumps({"key": app.config["SECRET_KEY"]}).decode("utf-8"))
    else:
        return jsonify(message="unauthorized"), 401
    
@app.route("/auth", methods=["GET"])
@authorization_required
def auth():
    return jsonify(message="OK")

if __name__ == "__main__":
    app.run(debug=True)