import requests
import jwt

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from flask_cors import cross_origin
from .models import User
from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func


auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email').lower()
    password = data.get('password')

    user = User.query.filter(func.lower(User.email) == email).first()
    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token, user={"id": user.id, "firstName": user.firstName, "lastName": user.lastName, "email": user.email, "score": user.score, "profile_picture": user.profile_picture, "favorite_nba_team": user.favorite_nba_team, "favorite_nfl_team": user.favorite_nfl_team}), 200
    return jsonify({'error': 'Invalid credentials'}), 401


@auth.route('/google-login', methods=['POST'])
@cross_origin()
def google_login():
    idtoken = request.get_json(force=True)
    print(idtoken, flush=True)
    jwt_token = idtoken["id_token"]
    jwks_client = jwt.PyJWKClient("https://www.googleapis.com/oauth2/v3/certs")
    header = jwt.get_unverified_header(jwt_token)
    key = jwks_client.get_signing_key(header["kid"]).key
    jwt_payload = jwt.decode(jwt_token, key, [header["alg"]], options={"verify_aud":False})
    
    access_token = create_access_token(identity=jwt_payload["email"])
    user = User.query.filter_by(email=jwt_payload["email"]).first()
    if not user:
        new_user = User(email=jwt_payload["email"], firstName=jwt_payload["given_name"], lastName=jwt_payload["family_name"],
        password=generate_password_hash(jwt_payload["sub"], method='pbkdf2:sha256'))
        db.session.add(new_user)
        db.session.commit()
        return jsonify(access_token=access_token, user={"firstName" : jwt_payload["given_name"], "lastName" : jwt_payload["family_name"], "email": jwt_payload["email"], }), 200

    return jsonify(access_token=access_token, user={"id": user.id, "firstName": user.firstName, "lastName": user.lastName, "email": user.email, "score": user.score, "profile_picture": user.profile_picture, "favorite_nba_team": user.favorite_nba_team, "favorite_nfl_team": user.favorite_nfl_team}), 200


@auth.route('/sign-up', methods=['POST'])
def sign_up():
    data = request.get_json()
    email = data.get('email').lower()
    first_name = data.get('firstName', '') 
    last_name = data.get('lastName', '')
    password1 = data.get('password1', '')
    password2 = data.get('password2', '')

    if not email or not first_name or not last_name:
        return jsonify({'error': 'Missing fields.'}), 400

    if password1 != password2:
        return jsonify({'error': 'Passwords do not match.'}), 400
    if len(password1) < 8:
        return jsonify({'error': 'Password must be at least 8 characters.'}), 400

    user = User.query.filter(func.lower(User.email) == email).first()
    if user:
        return jsonify({'error': 'Email already in use.'}), 409

    new_user = User(email=email, firstName=first_name, lastName=last_name,
                password=generate_password_hash(password1, method='pbkdf2:sha256'))
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Account created successfully!'}), 200


@auth.route('/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    id = data.get('id')
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    user = User.query.filter_by(id = id).first()

    if not user:
        return jsonify({'error': 'User not found.'}), 404

    if not check_password_hash(user.password, old_password):
        return jsonify({'error': 'Invalid old password.'}), 400

    user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
    db.session.commit()

    return jsonify({'message': 'Password changed successfully!'}), 200


@auth.route('/update-account', methods=['POST'])
def update_account():
    data = request.get_json()
    email = data.get('email')
    new_first_name = data.get('newFirstName')
    new_last_name = data.get('newLastName')
    new_email = data.get('newEmail')

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'User not found.'}), 404

    if new_email:
        user.email = new_email
    if new_first_name:
        user.firstName = new_first_name
    if new_last_name:
        user.lastName = new_last_name

    db.session.commit()

    return jsonify({'message': 'Account information updated successfully!'}), 200

# auth.py

@auth.route('/update-timezone', methods=['POST'])
def update_timezone():
    data = request.get_json()
    email = data.get('email')
    timezone = data.get('timezone')

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'User not found.'}), 404

    user.timezone = timezone
    db.session.commit()

    return jsonify({'message': 'Timezone updated successfully!'}), 200
