from datetime import datetime
from flask import Blueprint, jsonify, request
from . import db
from api.models import Game, GamePick, User


data = Blueprint('data', __name__)

#USED BY HOMEPAGE.JS
@data.route('/get-games', methods=['GET'])
def get_all_games():
    games = Game.query.all()
    games_list = [{
        'sport': game.sport,
        'game_id': game.game_id,
        'home_team': game.home_team,
        'away_team': game.away_team,
        'date': game.date,
        'score': game.score,
        'time': game.time,
        'winning_team': game.winning_team
    } for game in games]
    
    return jsonify(games_list), 200

#USED BY MANY COMPONENTS
@data.route('/get-gamepicks', methods=['GET'])
def get_all_gamepicks():
    gamepicks = GamePick.query.all()
    gamepicks_list = [{
        'id': pick.id,
        'user_id': pick.user_id,
        'sport': pick.sport,
        'game_id': pick.game_id,
        'picked_team': pick.picked_team,
        'pick_time': pick.pick_time.strftime("%Y-%m-%d %H:%M:%S"),
        'result': pick.result
    } for pick in gamepicks]
    
    return jsonify(gamepicks_list), 200

#USED BY LEADERBOARD.JS
@data.route('/get-users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    users_list = [{
        'id': user.id,
        'email': user.email,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'score': user.score,
        'losses': user.losses,
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
        lastName=data['lastName'],
        score=data.get('score', 0),
        losses=data.get('losses', 0)
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
        sport=data['sport'],
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
        sport=data['sport'],
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

#USED BY MANAGEPICKS.JS
@data.route('/delete-gamepick/<int:gamepick_id>', methods=['DELETE'])
def delete_gamepick(gamepick_id):
    gamepick = GamePick.query.get(gamepick_id)
    if gamepick:
        db.session.delete(gamepick)
        db.session.commit()
        return jsonify({'message': 'GamePick deleted successfully'}), 200
    else:
        return jsonify({'message': 'GamePick not found'}), 404

#USED BY SETTINGSPAGE.JS
@data.route('/delete-user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if user:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    else:
        return jsonify({'message': 'User not found'}), 404

#USED FOR TESTING ONLY
@data.route('/delete-game/<int:game_id>', methods=['DELETE'])
def delete_game(game_id):
    game = Game.query.get(game_id)
    if game:
        db.session.delete(game)
        db.session.commit()
        return jsonify({'message': 'Game deleted successfully'}), 200
    else:
        return jsonify({'message': 'Game not found'}), 404
    
# USED FOR TESTING ONLY
@data.route('/update-game/<int:game_id>', methods=['PUT'])
def update_game(game_id):
    game = Game.query.get(game_id)
    if game:
        data = request.get_json()
        game.sport = data.get('sport', game.sport)
        game.home_team = data.get('home_team', game.home_team)
        game.away_team = data.get('away_team', game.away_team)
        game.date = data.get('date', game.date)
        game.score = data.get('score', game.score)
        game.time = data.get('time', game.time)
        game.winning_team = data.get('winning_team', game.winning_team)
        db.session.commit()
        return jsonify({'message': 'Game updated successfully'}), 200
    else:
        return jsonify({'message': 'Game not found'}), 404

# USED BY MANAGEPICKS.JS
@data.route('/update-gamepick/<int:gamepick_id>', methods=['PUT'])
def update_gamepick(gamepick_id):
    gamepick = GamePick.query.get(gamepick_id)
    if gamepick:
        data = request.get_json()
        gamepick.sport = data.get('sport', gamepick.sport)
        gamepick.picked_team = data.get('picked_team', gamepick.picked_team)
        gamepick.pick_time = data.get('pick_time', gamepick.pick_time)
        gamepick.result = data.get('result', gamepick.result)
        db.session.commit()
        return jsonify({'message': 'GamePick updated successfully'}), 200
    else:
        return jsonify({'message': 'GamePick not found'}), 404

# USED BY SETTINGSPAGE.JS AND ACCOUNTPAGE.JS
@data.route('/update-user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if user:
        data = request.get_json()
        user.email = data.get('email', user.email)
        user.password = data.get('password', user.password)
        user.firstName = data.get('firstName', user.firstName)
        user.lastName = data.get('lastName', user.lastName)
        user.score = data.get('score', user.score)
        user.losses = data.get('losses', user.losses)
        db.session.commit()
        return jsonify({'message': 'User updated successfully'}), 200
    else:
        return jsonify({'message': 'User not found'}), 404
    
@data.route('/update-theme/<int:user_id>', methods=['PUT'])
def update_theme_preference(user_id):
    user = User.query.get(user_id)
    if user:
        data = request.get_json()
        theme_preference = data.get('theme_preference')
        user.theme_preference = theme_preference
        db.session.commit()
        return jsonify({'message': 'Theme preference updated successfully'}), 200
    else:
        return jsonify({'message': 'User not found'}), 404
    
# USED FOR TESTING ONLY
@data.route('/get-game/<int:game_id>', methods=['GET'])
def get_game(game_id):
    game = Game.query.get(game_id)
    if game:
        game_data = {
            'sport': game.sport,
            'game_id': game.game_id,
            'home_team': game.home_team,
            'away_team': game.away_team,
            'date': game.date,
            'score': game.score,
            'time': game.time,
            'winning_team': game.winning_team
        }
        return jsonify(game_data), 200
    else:
        return jsonify({'message': 'Game not found'}), 404

# USED FOR TESTING ONLY
@data.route('/get-gamepick/<int:gamepick_id>', methods=['GET'])
def get_gamepick(gamepick_id):
    gamepick = GamePick.query.get(gamepick_id)
    if gamepick:
        gamepick_data = {
            'sport': gamepick.sport,
            'id': gamepick.id,
            'user_id': gamepick.user_id,
            'game_id': gamepick.game_id,
            'picked_team': gamepick.picked_team,
            'pick_time': gamepick.pick_time.strftime("%Y-%m-%d %H:%M:%S"),
            'result': gamepick.result
        }
        return jsonify(gamepick_data), 200
    else:
        return jsonify({'message': 'GamePick not found'}), 404

# USED FOR TESTING ONLY
@data.route('/get-user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        user_data = {
            'id': user.id,
            'email': user.email,
            'firstName': user.firstName,
            'lastName': user.lastName,
            'score': user.score,
            'losses': user.losses,
        }
        return jsonify(user_data), 200
    else:
        return jsonify({'message': 'User not found'}), 404