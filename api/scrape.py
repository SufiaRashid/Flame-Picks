from flask import Blueprint, jsonify
from .models import Game
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


