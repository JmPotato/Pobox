import peewee

import config

from flask import Blueprint, jsonify

from models import User
from .utils import *

account = Blueprint('account', __name__)

@account.route("/register", methods=["POST"])
def register():
    if request.method == "POST":
        req = request.get_json()
        try:
            user = User.create(name=req["username"], validation=md5_encode(req["username"] + req["password"]), token=generate_token())
            user.save()
            return jsonify(message="OK", token=dump_token(user.token)), 201
        except peewee.IntegrityError as e:
            return jsonify(message="error"), 409

@account.route("/login", methods=["POST"])
def login():
    req = request.get_json()
    try:
        user = User.get(User.name == req["userinfo"]["username"])
    except peewee.DoesNotExist:
        return jsonify(message="error"), 404
    # Validate username and password
    if validate_userinfo(req["userinfo"]["validation"], user):
        # Generate token
        return jsonify(message="OK", token=dump_token(user.token))
    else:
        return jsonify(message="unauthorized"), 401

@account.route("/auth", methods=["GET"])
@authorization_required
def auth():
    return jsonify(message="OK")