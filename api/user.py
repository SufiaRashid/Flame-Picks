from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import pytz
from .models import User, GamePick
from . import db
from datetime import datetime
from flask import current_app, url_for
from werkzeug.utils import secure_filename
import os
from flask import Flask, request, jsonify

user = Blueprint('user', __name__)

@user.route('/make-pick', methods=['POST'])
@jwt_required()
def make_pick():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404

    picks_data = request.get_json()
    
    if not isinstance(picks_data, list):
        return jsonify({'error': 'Invalid data format. Expecting a list of picks.'}), 400

    response_messages = []
    for pick_data in picks_data:
        game_id = pick_data.get('game_id')
        picked_team = pick_data.get('picked_team')
        sport = pick_data.get('sport')

        existing_pick = GamePick.query.filter_by(user_id=user.id, game_id=game_id).first()
        if existing_pick:
            response_messages.append({'game_id': game_id, 'message': 'Pick already made'})
            continue

        new_pick = GamePick(user_id=user.id, sport=sport, game_id=game_id, picked_team=picked_team, pick_time=pytz.timezone('US/Eastern').localize(datetime.now()))
        db.session.add(new_pick)
        db.session.commit()
        response_messages.append({'game_id': game_id, 'message': 'Pick saved'})

    return jsonify(response_messages), 201

@user.route('/get-picks', methods=['GET'])
@jwt_required()
def get_picks():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_picks = GamePick.query.filter_by(user_id=user.id).all()

    picks_list = [
        {
            'id': pick.id,
            'sport': pick.sport,
            'user_id': pick.user_id,
            'game_id': pick.game_id,
            'picked_team': pick.picked_team,
            'pick_time': pick.pick_time.strftime("%Y-%m-%d %H:%M:%S"),
            'result': pick.result
        } for pick in user_picks
    ]

    return jsonify(picks_list), 200

@user.route('/get-score', methods=['GET'])
@jwt_required()
def get_score():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'score': user.score}), 200

@user.route('/get-losses', methods=['GET'])
@jwt_required()
def get_losses():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'losses': user.losses}), 200

@user.route('/get-current-user', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'email': user.email, 'firstName': user.firstName, 'lastName': user.lastName}), 200

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'  # Folder where profile pictures will be uploaded
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}  # Allowed file extensions

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Function to check if the file extension is allowed
def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/user/update-profile-picture', methods=['POST'])
def update_profile_picture():
    # Check if the POST request has the file part
    if 'profilePicture' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['profilePicture']

    # If the user does not select a file, the browser submits an empty file without a filename
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Check if the file extension is allowed
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    # Save the uploaded file
    filename = secure_filename(file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    # Return the URL of the uploaded profile picture
    profile_picture_url = f"http://localhost:5001{UPLOAD_FOLDER}/{filename}"  # Replace 'example.com' with your domain
    return jsonify({'message': 'Profile picture uploaded successfully', 'profilePictureURL': profile_picture_url}), 200

if __name__ == '__main__':
    app.run(debug=True)


@user.route('/update-favorite-nfl-team', methods=['POST'])
@jwt_required()  # Ensure that the user is authenticated
def update_favorite_nfl_team():
    try:
        data = request.get_json()
        selected_team = data.get('selectedTeam')

        current_user = get_jwt_identity()  # Get current user from JWT token
        user = User.query.filter_by(email=current_user).first()

        if not user:
            return jsonify({'error': 'User not found.'}), 404

        # Update favorite NFL team for the user
        user.favorite_nfl_team = selected_team
        db.session.commit()

        return jsonify({'message': 'Favorite NFL team updated successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@user.route('/update-favorite-nba-team', methods=['POST'])
@jwt_required()  # Ensure that the user is authenticated
def update_favorite_nba_team():
    try:
        data = request.get_json()
        selected_team = data.get('selectedTeam')

        current_user = get_jwt_identity()  # Get current user from JWT token
        user = User.query.filter_by(email=current_user).first()

        if not user:
            return jsonify({'error': 'User not found.'}), 404

        # Update favorite NBA team for the user
        user.favorite_nba_team = selected_team
        db.session.commit()

        return jsonify({'message': 'Favorite NBA team updated successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
