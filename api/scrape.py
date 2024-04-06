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

@scrape.route('/get-events', methods=['GET'])
def get_events():
    eastern = pytz.timezone('US/Eastern')
    three_days_from_now = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(eastern) + timedelta(days=3)
    two_days_from_now = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(eastern) + timedelta(days=2)
    game_in_next_three_days = Game.query.filter(
        Game.date <= three_days_from_now.strftime("%d/%m"),
        Game.date >= two_days_from_now.strftime("%d/%m")
    ).first()
    #print("Two days from now: ", two_days_from_now)
    #print("Three days from now: ", three_days_from_now)
    if game_in_next_three_days:
        #print("Upcoming games are already in the database. The game is: ", game_in_next_three_days.game_id, " on ", game_in_next_three_days.date)
        return jsonify({'message': 'Upcoming games are already in the database.'}), 200
    
    with Session() as session:
        #print("IN GET EVENTS")
        url = 'https://www.thesportsdb.com/league/4387-NBA'
        response = session.get(url)
        
        if response.ok:
            soup = BeautifulSoup(response.content, 'html.parser')
            events_table = soup.find('table', style="width:100%")
            if not events_table:
                return jsonify({'error': 'Table not found'}), 404
            new_games = []
            highest_game_id = 0
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
                            new_games.append(new_game)
                            if score not in ['-', None]:
                                highest_game_id = max(highest_game_id, int(game_id_str))

            if new_games:
                db.session.bulk_save_objects(new_games)
                db.session.commit()  

            games_with_score = Game.query.filter(Game.score != '-', Game.score != None).all()
            games_data = [{
                'home_team': game.home_team,
                'away_team': game.away_team,
                'date': game.date,
                'score': game.score,
                'time': game.time,
                'game_id': game.game_id
            } for game in games_with_score]                  

            if highest_game_id > 0:
                highest_game_id = max([int(game['game_id']) for game in games_data if game['score'] not in ['-', None]], default=0)
                #print(f"Highest game ID: {highest_game_id}")
                additional_game_objects = get_additional_games(highest_game_id)
            
            if highest_game_id>0 and additional_game_objects:
                db.session.bulk_save_objects(additional_game_objects)
                db.session.commit()

            return jsonify({'message': 'Events successfully updated.'}), 200

        else:
            return jsonify({'error': 'Failed to retrieve content'}), response.status_code
    
def get_additional_games(highest_game_id):
    #print("IN GET ADDITIONAL GAMES")
    additional_games = []
    eastern = pytz.timezone('US/Eastern')
    current_date = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(eastern)
    max_date = current_date + timedelta(days=3)
    game_id_to_check = highest_game_id + 1

    while True:
        #print("Looking at id ", game_id)
        score_url = f'https://www.thesportsdb.com/event/{game_id_to_check}'
        response = requests.get(score_url)
        if response.ok:
            soup = BeautifulSoup(response.content, 'html.parser')
            timestamp_element = soup.find(string=re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}"))
            if timestamp_element:
                game_date = parser.parse(timestamp_element.strip())
                formatted_date = game_date.strftime("%d/%m")
                formatted_time = game_date.strftime("%I:%M%p").lower()

                #print(f"Formatted date: {formatted_date}")
                #print(f"Formatted time: {formatted_time}")

                href_sport = soup.find_all('a')[45]
                href_element = soup.find_all('a')[47]
                #print("HREF ELEMENT: ", href_element)
                if href_element:
                    href = href_element['href']
                    sporthref = href_sport['href']
                    if "NBA" not in sporthref:
                        #print("Not an NBA game")
                        break
                    teams = href.split('/')[-1].split('-vs-')
                    home_team = teams[0].rsplit('-', 1)[-1]
                    #print("Home team: ", home_team)
                    away_team = teams[1].rsplit('-', 1)[-1]
                    #print("Away team: ", away_team)
                    existing_game = Game.query.filter_by(game_id=game_id_to_check).first()
                    if game_date <= max_date and not existing_game:
                        new_game = Game(
                            game_id=str(game_id_to_check),
                            home_team=home_team,
                            away_team=away_team,
                            date=formatted_date,
                            score="-",
                            time=formatted_time
                        )
                        additional_games.append(new_game)
                    elif game_date > max_date:
                        #print("Date is out of range for ", game_id_to_check)
                        break
                    #else:
                        #print("Game already exists for ", game_id_to_check)
                        #print("Contuining to next game")
                else:
                    print("HREF not found")
                    break
            else:
                print("Date element not found")
                break
        else:
            print("Response not OK")
            break
        game_id_to_check += 1

    return additional_games
    
@scrape.route('/update-scores', methods=['GET'])
def update_scores():
    #print("IN UPDATE SCORES")
    eastern = pytz.timezone('US/Eastern')
    current_date = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(eastern).strftime("%d/%m")
    games_to_update = Game.query.filter(
        Game.winning_team.is_(None),
        Game.date <= current_date 
    ).all()
    
    for game in games_to_update:
        score_url = f'https://www.thesportsdb.com/event/{game.game_id}'
        score_response = requests.get(score_url)
        
        if score_response.ok:
            score_soup = BeautifulSoup(score_response.content, 'html.parser')
            score_elements = score_soup.find_all('h2')
            
            if len(score_elements) >= 2:
                try:
                    score1 = score_elements[1].text.strip()
                    if score1 != "":
                        score1 = int(score1)
                    score2 = score_elements[2].text.strip()
                    if score2 != "":
                        score2 = int(score2)
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


