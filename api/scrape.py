from datetime import datetime, timedelta
from dateutil.tz import tzutc
import re
from flask import Blueprint, jsonify
import pytz
from .models import Game, GamePick, User
from . import db
import requests
from requests import Session
from bs4 import BeautifulSoup
from dateutil.parser import parse as date_parse
from dateutil import parser

scrape = Blueprint('scrape', __name__)

@scrape.route('/get-nba-games', methods=['GET'])
def get_nba_games():
    london = pytz.timezone('Europe/London')
    current_date = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(london)
    max_date = current_date + timedelta(days=3)
    max_date_2 = current_date + timedelta(days=4)
    max_date_obj = convert_to_date(max_date.strftime("%d/%m"))
    max_date_obj_2 = convert_to_date(max_date_2.strftime("%d/%m"))
    new_games = []

    with Session() as session:
        url = 'https://www.thesportsdb.com/season/4387-NBA/2023-2024&all=1&view='
        response = session.get(url)

        if response.ok:
            soup = BeautifulSoup(response.content, 'html.parser')
            tables = soup.find_all('table')
            #print("Number of tables:", len(tables))

            for table in tables:
                row = table.find('tr')  # Assuming there is only one row per table
                if row:
                    cells = row.find_all('td')
                    if len(cells) > 4:  # Check if there are enough cells
                        score = cells[4].get_text(strip=True)
                        #print("Score: ", score)
                        
                        if score == "-":
                            href_element = cells[3].find('a', href=True)  # Assuming the href is in the fourth cell
                            if href_element:
                                href = href_element['href']
                                game_info = href.split('/')[-1]
                                game_id = re.search(r'\d+', game_info).group()  # This extracts just the numeric part
                                teams = game_info.split('-vs-')
                                home_team = teams[0].rsplit('-', 1)[-1]
                                away_team = teams[1].rsplit('-', 1)[-1]
                                #print("Game id: ", game_id)
                                #print("Home team: ", home_team)
                                #print("Away team: ", away_team)

                                event_url = f'https://www.thesportsdb.com/event/{game_id}'
                                event_response = session.get(event_url)

                                if event_response.ok:
                                    event_soup = BeautifulSoup(event_response.content, 'html.parser')
                                    timestamp_element = event_soup.find(string=re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}"))
                                    game_date = parser.parse(timestamp_element.strip())
                                    formatted_date = game_date.strftime("%d/%m")
                                    #print("Formatted date: ", formatted_date)
                                    formatted_time = game_date.strftime("%I:%M%p").lower()
                                    #print("Formatted time: ", formatted_time)

                                    if convert_to_date(formatted_date) <= max_date_obj or (convert_to_date(formatted_date) <= max_date_obj_2 and date_parse(formatted_time).time() >= datetime.strptime("12:00am", "%I:%M%p").time() and date_parse(formatted_time).time() <= datetime.strptime("05:00am", "%I:%M%p").time()):
                                        existing_game = Game.query.filter_by(game_id=game_id).first()
                                        if not existing_game:
                                            new_game = Game(
                                                sport='NBA',
                                                game_id=game_id,
                                                home_team=home_team,
                                                away_team=away_team,
                                                date=formatted_date,
                                                score=score,
                                                time=formatted_time
                                            )
                                            new_games.append(new_game)
                                        pass
                                    elif convert_to_date(formatted_date) > max_date_obj_2:
                                        #print("Game date is out of range for id ", game_id)
                                        break
                                    else:
                                        #print("It is on the next day, but the game time is out of range for id ", game_id)
                                        break
                        #else:
                            #print("Score already exists for this game")
                    #else:
                        #print("Not enough cells in row to determine game details")
            
            if new_games:
                #print("Saving games to database")
                db.session.bulk_save_objects(new_games)
                db.session.commit()
                return jsonify({'message': 'New games successfully added'}), 200
            else:
                return jsonify({'message': 'No new games found'}), 200
        else:
            return jsonify({'error': 'Failed to retrieve content'}), response.status_code
    
@scrape.route('/update-scores', methods=['PUT'])
def update_scores():
    #print("IN UPDATE SCORES")
    london = pytz.timezone('Europe/London')
    current_date_obj = convert_to_date(datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(london).strftime("%d/%m"))
    games_to_update = []
    for game in Game.query.filter(Game.winning_team.is_(None)).all():
        game_date_obj = convert_to_date(game.date)
        if game_date_obj <= current_date_obj:
            games_to_update.append(game)
    if not games_to_update:
        print("No games to update")
    for game in games_to_update:
        #print("Updating game ", game.game_id)
        score_url = f'https://www.thesportsdb.com/event/{game.game_id}'
        score_response = requests.get(score_url)
        
        if score_response.ok:
            score_soup = BeautifulSoup(score_response.content, 'html.parser')
            score_elements = score_soup.find_all('h2')
            
            if len(score_elements) >= 2:
                try:
                    score1 = score_elements[1].text.strip()
                    #print("Score 1:", score1)
                    if score1 != "":
                        score1 = int(score1)
                    score2 = score_elements[2].text.strip()
                    if score2 != "":
                        score2 = int(score2)
                    game.score = f'{score1} - {score2}'
                    #print("Score 2:", score2)
                    
                    if score1 > score2:
                        game.winning_team = game.home_team
                    elif score2 > score1:
                        game.winning_team = game.away_team
                    else:
                        game.winning_team = None
                    
                    #print("Winning team: ", game.winning_team)
                    db.session.commit()

                except ValueError:
                    print(f"Error converting score text to integer for game {game.game_id}")
                    continue
            #else:
                #print(f"Score not found for game {game.game_id}")

        game_picks = GamePick.query.filter(GamePick.game_id == game.game_id, GamePick.result == None).all()
        for pick in game_picks:
            if game.winning_team:
                user = User.query.get(pick.user_id)
                if pick.picked_team == game.winning_team:
                    pick.result = 1
                    user.score += 1
                else:
                    pick.result = 0
                    user.losses += 1
                db.session.commit()
                
    return jsonify({'message': 'Scores and winning teamsprint("Score 1:", score1) updated, GamePick results updated'}), 200


def convert_to_date(date_str, year=2024):
    return datetime.strptime(f"{date_str}/{year}", "%d/%m/%Y")


