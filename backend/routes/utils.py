import random
import hashlib

import config

from functools import wraps
from flask import jsonify, request
from itsdangerous import (
    TimedJSONWebSignatureSerializer as URLSafeSerializer, BadSignature, SignatureExpired)

def md5_encode(data):
    return hashlib.md5(data.encode("utf-8")).hexdigest()

def base36_encode(number):
    assert number >= 0, "Positive integer required"
    if number == 0:
        return "0"
    base36 = []
    while number != 0:
        number, i = divmod(number, 36)
        base36.append("0123456789abcdefghijklmnopqrstuvwxyz"[i])
    return "".join(reversed(base36))

def generate_url():
    return base36_encode(random.randint(1000000000, 9999999999))

def generate_token():
    return "".join(random.sample("0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()-_=+", 16))

def generate_filename(folder, filename):
    return md5_encode(folder + "_" + filename)

def load_token(token):
    s = URLSafeSerializer(config.SECRET_KEY)
    try:
        return s.loads(token)
    except SignatureExpired:
        return None
    except BadSignature:
        return None

def dump_token(token):
    s = URLSafeSerializer(config.SECRET_KEY, expires_in=7 * 24 * 3600)
    return s.dumps({"token": token}).decode("utf-8")

def validate_userinfo(validation, user):
    return validation == user.validation

def validate_authorization():
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

    data = load_token(token)
    if not data: return False
    return data["token"]

def authorization_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Return code 401 when failed to validate token
        if not validate_authorization():
            return jsonify(message="unauthorized"), 401
        return f(*args, **kwargs)
    return wrapper