from flask import Blueprint, jsonify
from api.models import Game, GamePick


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