from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from .models import User
from . import db
from werkzeug.security import generate_password_hash, check_password_hash


auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token, user={"id": user.id, "firstName": user.firstName, "lastName": user.lastName, "email": user.email}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@auth.route('/sign-up', methods=['POST'])
def sign_up():
    data = request.get_json()
    email = data.get('email')
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

    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({'error': 'Email already in use.'}), 409

    new_user = User(email=email, firstName=first_name, lastName=last_name,
                password=generate_password_hash(password1, method='pbkdf2:sha256'))
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Account created successfully!'}), 201


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
