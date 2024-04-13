from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import pytz
from .models import User, GamePick
from . import db
from datetime import datetime

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

@user.route('/update-profile-picture', methods=['POST'])
@jwt_required()
def update_profile_picture():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    if 'profilePicture' not in request.files:
        return jsonify({'error': 'No profile picture provided'}), 400

    profile_picture = request.files['profilePicture']
    # Save profile picture to storage (e.g., AWS S3, local filesystem, etc.)
    # Update user's profile picture field in the database
    user.profile_picture = profile_picture.filename  # Example: Store filename in database

    db.session.commit()

    # Return updated user object
    return jsonify({
        'message': 'Profile picture updated successfully!',
        'profile_picture': user.profile_picture  # Send back the updated profile picture URL
    }), 200

@user.route('/update-favorite-nfl-team', methods=['POST'])
@jwt_required()
def update_favorite_nfl_team():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    favorite_nfl_team = data.get('favorite_nfl_team')

    user.favorite_nfl_team = favorite_nfl_team
    db.session.commit()

    # Return updated user object
    return jsonify({
        'message': 'Favorite NFL team updated successfully!',
        'favorite_nfl_team': user.favorite_nfl_team  # Send back the updated favorite NFL team
    }), 200

@user.route('/update-favorite-nba-team', methods=['POST'])
@jwt_required()
def update_favorite_nba_team():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    favorite_nba_team = data.get('favorite_nba_team')

    user.favorite_nba_team = favorite_nba_team
    db.session.commit()

    # Return updated user object
    return jsonify({
        'message': 'Favorite NBA team updated successfully!',
        'favorite_nba_team': user.favorite_nba_team  # Send back the updated favorite NBA team
    }), 200
