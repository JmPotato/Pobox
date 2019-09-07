import os
import peewee

import config

from functools import wraps
from flask import Blueprint, jsonify, request, send_file, redirect
from playhouse.shortcuts import model_to_dict, dict_to_model
from itsdangerous import (
    TimedJSONWebSignatureSerializer as URLSafeSerializer, BadSignature, SignatureExpired)

from models import Folder, File
from .utils import *


def verify_auth_token(token):
    s = URLSafeSerializer(config.SECRET_KEY)
    try:
        data = s.loads(token)
    except SignatureExpired:
        return None
    except BadSignature:
        return None
    return "key" in data and data["key"] == config.SECRET_KEY


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


main = Blueprint('main', __name__)


@main.route("/login", methods=["POST"])
def login():
    req = request.get_json()
    # Validate username and password
    if req["userinfo"] == md5_encode(config.EMAIL + config.PASSWORD):
        # Generate token
        s = URLSafeSerializer(
            config.SECRET_KEY, expires_in=7 * 24 * 3600)

        return jsonify(message="OK", token=s.dumps({"key": config.SECRET_KEY}).decode("utf-8"))
    else:
        return jsonify(message="unauthorized"), 401


@main.route("/auth", methods=["GET"])
@authorization_required
def auth():
    return jsonify(message="OK")


@main.route("/folders", methods=["GET", "POST"])
# TODO: @authorization_required
def folders():
    if request.method == "POST":
        req = request.get_json()
        try:
            f = Folder.create(name=req["name"])
            f.save()
            return jsonify(message="OK"), 201
        except peewee.IntegrityError as e:
            return jsonify(message="error"), 409

    if request.method == "GET":
        query = Folder.select()
        if (query.exists()):
            return jsonify(message="OK", data=[model_to_dict(folder) for folder in query])
        else:
            return jsonify(message="OK", data=[])


@main.route("/folders/<folder_name>", methods=["GET", "POST", "DELETE"])
# TODO: @authorization_required
def folder(folder_name):
    try:
        folder = Folder.get(Folder.name == folder_name)
    except peewee.DoesNotExist:
        return jsonify(message="error"), 404

    if request.method == "GET":
        return jsonify(message="OK", data=model_to_dict(folder, backrefs=True))

    if request.method == "POST":
        f = request.files["file"]
        if f:
            actual_filename = generate_filename(folder_name, f.filename)
            target_file = os.path.join(os.path.expanduser(
                config.UPLOAD_FOLDER), actual_filename)
            if os.path.exists(target_file):
                return jsonify(message="error"), 409

            try:
                f.save(target_file)
                f2 = File.create(folder=folder, filename=f.filename,
                                 public_share_url=generate_url(), open_public_share=False)
                f2.save()
            except Exception as e:
                print(e)
                return jsonify(message="error"), 500

            return jsonify(message="OK"), 201

    if request.method == "DELETE":
        try:
            for f in folder.files:
                actual_filename = generate_filename(folder_name, f.filename)
                target_file = os.path.join(os.path.expanduser(
                    config.UPLOAD_FOLDER), actual_filename)
                f2 = File.get(File.filename == f.filename)
                f2.delete_instance()
                if os.path.exists(target_file):
                    os.remove(target_file)
            folder.delete_instance()
        except Exception as e:
            return jsonify(message="error"), 409

    return jsonify(message="OK")


@main.route("/folders/<folder_name>/<filename>", methods=["GET", "PATCH", "DELETE"])
# TODO: @authorization_required
def files(folder_name, filename):
    try:
        f = File.get(filename=filename)
    except peewee.DoesNotExist:
        return jsonify(message="error"), 404

    actual_filename = generate_filename(folder_name, filename)
    target_file = os.path.join(os.path.expanduser(
        config.UPLOAD_FOLDER), actual_filename)

    if request.method == "GET":
        args = request.args
        if "query" in args and args["query"] == "info":
            return jsonify(message="OK", data=model_to_dict(f))

        if os.path.exists(target_file):
            return send_file(target_file)
        else:
            return jsonify(message="error"), 404

    if request.method == "PATCH":
        share_type = request.args.get("shareType")
        if share_type == "public":
            f.open_public_share = True
        elif share_type == "none":
            f.open_public_share = False
        f.save()
        return jsonify(message="OK")

    if request.method == "DELETE":
        if os.path.exists(target_file):
            try:
                f.delete_instance()
                os.remove(target_file)
                return jsonify(message="OK")
            except Exception as e:
                print(e)
                return jsonify(message="error"), 500
        else:
            return jsonify(message="error"), 404


@main.route('/share/<path>', methods=['GET'])
def share(path):
    is_public = False

    try:
        f = File.get(File.public_share_url == path)
        actual_filename = generate_filename(f.folder.name, f.filename)
        target_file = os.path.join(os.path.expanduser(
            config.UPLOAD_FOLDER), actual_filename)
        is_public = True
    except peewee.DoesNotExist:
        return jsonify(message='error'), 404

    if not (is_public and f.open_public_share):
        return jsonify(message='error'), 404

    s = URLSafeSerializer(config.SECRET_KEY, expires_in=24 * 3600)

    args = request.args
    if args.get('download') == 'true':
        return redirect("/share/download/" + path + "/" + f.filename)

    share_token = s.dumps({'path': path}).decode('utf-8')

    payload = {
        'filename': f.filename,
        'folder': f.folder.name,
        'open_public_share': f.open_public_share,
        'share_token': share_token,
    }

    return jsonify(message='OK', data=payload)


@main.route('/share/download/<path>/<filename>', methods=['GET'])
def share_download(path, filename):
    try:
        f = File.get(File.public_share_url == path)
        actual_filename = generate_filename(f.folder.name, f.filename)
        target_file = os.path.join(os.path.expanduser(
            config.UPLOAD_FOLDER), actual_filename)
    except peewee.DoesNotExist:
        return jsonify(message='error'), 404

    s = URLSafeSerializer(config.SECRET_KEY, expires_in=24 * 3600)
    share_token = None
    cookies = request.cookies
    if 'share_token' in cookies:
        share_token = cookies['share_token']
        try:
            data = s.loads(share_token)
            if data['path'] == path:
                if os.path.exists(target_file):
                    return send_file(target_file)
                else:
                    return jsonify(message='error'), 404
            else:
                return jsonify(message='unauthorized'), 401
        except:
            return jsonify(message='unauthorized'), 401
