from flask import Blueprint, jsonify
from .models import Game, GamePick
from . import db
import requests
from bs4 import BeautifulSoup

scrape = Blueprint('scrape', __name__)

@scrape.route('/get-events', methods=['GET'])
def get_events():
    url = 'https://www.thesportsdb.com/league/4387-NBA'
    response = requests.get(url)
    
    if response.ok:
        soup = BeautifulSoup(response.content, 'html.parser')
        events_table = soup.find('table', style="width:100%")
        if not events_table:
            return jsonify({'error': 'Table not found'}), 404
        
        rows = events_table.find_all('tr')[1:]
        for row in rows:
            event_data = row.find_all('td')
            if event_data and len(event_data) > 3:
                href_element = event_data[1].find('a', href=True)
                if href_element:
                    href = href_element['href']
                    teams = href.split('/')[-1].split('-vs-')
                    game_id_str = teams[0].rsplit('-', 3)[0]
                    home_team = teams[0].rsplit('-', 1)[-1]
                    away_team = teams[1].rsplit('-', 1)[-1]
                    date = event_data[0].get_text(strip=True)
                    score = event_data[2].get_text(strip=True)
                    time = event_data[5].get_text(strip=True)
                    
                    existing_game = Game.query.filter_by(game_id=game_id_str).first()
                    if not existing_game:
                        new_game = Game(
                            game_id=game_id_str,
                            home_team=home_team,
                            away_team=away_team,
                            date=date,
                            score=score,
                            time=time
                        )
                        db.session.add(new_game)
                        db.session.commit()

        games = Game.query.all()
        games_data = [{
            'home_team': game.home_team,
            'away_team': game.away_team,
            'date': game.date,
            'score': game.score,
            'time': game.time,
            'game_id': game.game_id
        } for game in games]

        return jsonify(games_data)

    else:
        return jsonify({'error': 'Failed to retrieve content'}), response.status_code
    
@scrape.route('/update-scores', methods=['GET'])
def update_scores():

    games_to_update = Game.query.filter(
            (Game.winning_team == None)
        ).all()
    
    for game in games_to_update:
        print("Looking at game id:", game.game_id)
        score_url = f'https://www.thesportsdb.com/event/{game.game_id}'
        score_response = requests.get(score_url)
        
        if score_response.ok:
            score_soup = BeautifulSoup(score_response.content, 'html.parser')
            score_elements = score_soup.find_all('h2')
            
            if len(score_elements) >= 2:
                try:
                    score1 = score_elements[1].text.strip()
                    score2 = score_elements[2].text.strip()
                    game.score = f'{score1} - {score2}'
                    
                    if score1 > score2:
                        game.winning_team = game.home_team
                    elif score2 > score1:
                        game.winning_team = game.away_team
                    else:
                        game.winning_team = None
                    
                    db.session.commit()

                except ValueError:
                    print(f"Error converting score text to integer for game {game.game_id}")
                    continue
            else:
                print(f"Score not found for game {game.game_id}")

        game_picks = GamePick.query.filter_by(result=None).all()
        for pick in game_picks:
            game = Game.query.filter_by(game_id=pick.game_id).first()
            if game and game.winning_team:
                pick.result = 1 if pick.picked_team == game.winning_team else 0
                db.session.commit()
            elif not game:
                print(f"No game found with game_id {pick.game_id}")
            else:
                print(f"Game {game.game_id} does not have a winning team defined yet.")
                
    return jsonify({'message': 'Scores and winning teamsprint("Score 1:", score1) updated, GamePick results updated'}), 200


