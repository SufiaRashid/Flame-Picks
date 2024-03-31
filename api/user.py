from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import User, GamePick
from . import db

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

        existing_pick = GamePick.query.filter_by(user_id=user.id, game_id=game_id).first()
        if existing_pick:
            response_messages.append({'game_id': game_id, 'message': 'Pick already made'})
            continue

        new_pick = GamePick(user_id=user.id, game_id=game_id, picked_team=picked_team)
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
            'game_id': pick.game_id,
            'picked_team': pick.picked_team,
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