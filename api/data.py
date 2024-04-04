from datetime import datetime
from flask import Blueprint, jsonify, request
from . import db
from api.models import Game, GamePick, User


data = Blueprint('data', __name__)

@data.route('/get-games', methods=['GET'])
def get_all_games():
    games = Game.query.all()
    games_list = [{
        'game_id': game.game_id,
        'home_team': game.home_team,
        'away_team': game.away_team,
        'date': game.date,
        'score': game.score,
        'time': game.time,
        'winning_team': game.winning_team
    } for game in games]
    
    return jsonify(games_list), 200

@data.route('/get-gamepicks', methods=['GET'])
def get_all_gamepicks():
    gamepicks = GamePick.query.all()
    gamepicks_list = [{
        'id': pick.id,
        'user_id': pick.user_id,
        'game_id': pick.game_id,
        'picked_team': pick.picked_team,
        'pick_time': pick.pick_time.strftime("%Y-%m-%d %H:%M:%S"),
        'result': pick.result
    } for pick in gamepicks]
    
    return jsonify(gamepicks_list), 200

@data.route('/get-users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    users_list = [{
        'id': user.id,
        'email': user.email,
        'firstName': user.firstName,
        'lastName': user.lastName
    } for user in users]

    return jsonify(users_list), 200

#USED FOR TESTING ONLY
@data.route('/post-user', methods=['POST'])
def post_user():
    data = request.get_json()
    new_user = User(
        email=data['email'],
        password=data['password'],
        firstName=data['firstName'],
        lastName=data['lastName']
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

#USED FOR TESTING ONLY
@data.route('/post-gamepick', methods=['POST'])
def post_gamepick():
    data = request.get_json()
    new_gamepick = GamePick(
        user_id=data['user_id'],
        game_id=data['game_id'],
        picked_team=data['picked_team'],
        pick_time=datetime.utcnow(),
        result=data.get('result')
    )
    db.session.add(new_gamepick)
    db.session.commit()

    return jsonify({'message': 'GamePick created successfully'}), 201

#USED FOR TESTING ONLY
@data.route('/post-game', methods=['POST'])
def post_game():
    data = request.get_json()
    new_game = Game(
        game_id=data['game_id'],
        home_team=data['home_team'],
        away_team=data['away_team'],
        date=data['date'],
        score=data.get('score', '-'),
        time=data.get('time', '1:00pm'),
        winning_team=data.get('winning_team') 
    )
    db.session.add(new_game)
    db.session.commit()

    return jsonify({'message': 'Game created successfully'}), 201