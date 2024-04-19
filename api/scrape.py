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
    max_date = max_date.strftime("%d/%m")
    max_date_3 = current_date + timedelta(days=2)
    max_date_obj_3 = convert_to_date(max_date_3.strftime("%d/%m"))
    max_date_obj = convert_to_date(max_date)
    max_date_obj_2 = convert_to_date(max_date_2.strftime("%d/%m"))
    new_games = []

    games_check = Game.query.filter(
            Game.update_date == current_date.strftime("%d/%m"),
            Game.sport == 'NBA'
        ).all()
    
    if len(games_check) != 0:
        print("No new NBA games to add (already pulled today)")
        return jsonify({'message': 'Games for the next 3 days have already been added'}), 200

    games = Game.query.filter(
            Game.sport == 'NBA',
        ).all()
    games_after_max_date = [
    game for game in games 
        if convert_to_date(game.date) >= max_date_obj_3
    ]
    #print(games_after_max_date)
    if len(games_after_max_date) != 0:
        print("No new NBA games to add")
        return jsonify({'message': 'Games for the next 3 days have already been added'}), 200

    with Session() as session:
        url = 'https://www.thesportsdb.com/season/4387-NBA/2023-2024&all=1&view='
        response = session.get(url)

        if response.ok:
            soup = BeautifulSoup(response.content, 'html.parser')
            tables = soup.find_all('table')
            #print("Number of tables:", len(tables))

            for table in tables:
                row = table.find('tr')
                if row:
                    cells = row.find_all('td')
                    if len(cells) > 4:
                        score = cells[4].get_text(strip=True)
                        #print("Score: ", score)
                        
                        if score == "-":
                            href_element = cells[3].find('a', href=True)
                            if href_element:
                                href = href_element['href']
                                game_info = href.split('/')[-1]
                                game_id = re.search(r'\d+', game_info).group()
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
                                    try:
                                        game_date = parser.parse(timestamp_element.strip())
                                    except AttributeError:
                                        print("Error parsing game date for game id:", game_id)
                                        continue
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
                                                time=formatted_time,
                                                update_date=current_date.strftime("%d/%m")
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
        
@scrape.route('/get-epl-games', methods=['GET'])
def get_epl_games():
    london = pytz.timezone('Europe/London')
    current_date = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(london)
    max_date = current_date + timedelta(days=7)
    max_date_2 = current_date + timedelta(days=8)
    max_date = max_date.strftime("%d/%m")
    max_date_3 = current_date + timedelta(days=6)
    max_date_obj_3 = convert_to_date(max_date_3.strftime("%d/%m"))
    max_date_obj = convert_to_date(max_date)
    max_date_obj_2 = convert_to_date(max_date_2.strftime("%d/%m"))
    new_games = []
    break_loop = False

    games_check = Game.query.filter(
            Game.update_date == current_date.strftime("%d/%m"),
            Game.sport == 'EPL'
        ).all()
    
    if len(games_check) != 0:
        print("No new EPL games to add (already pulled today)")
        return jsonify({'message': 'Games for the next 3 days have already been added'}), 200
    
    games = Game.query.filter(
            Game.sport == 'EPL',
    ).all()
    games_after_max_date = [
    game for game in games 
        if convert_to_date(game.date) >= max_date_obj_3
    ]
    if len(games_after_max_date) != 0:
        print("No new EPL games to add")
        return jsonify({'message': 'Games for the next 7 days have already been added'}), 200


    with Session() as session:
        url = 'https://www.thesportsdb.com/season/4328-English-Premier-League/2023-2024&all=1&view='
        response = session.get(url)

        if response.ok:
            soup = BeautifulSoup(response.content, 'html.parser')
            tables = soup.find_all('table')
            #print("Number of tables:", len(tables))

            for table in tables:
                if break_loop:
                    break
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all('td')
                    if len(cells) > 4:
                        score = cells[4].get_text(strip=True)
                        #print("Score: ", score)
                        
                        if score == "-":
                            href_element = cells[3].find('a', href=True)
                            if href_element:
                                href = href_element['href']
                                game_info = href.split('/')[-1]
                                game_id_match = re.search(r'(\d+)', game_info)
                                game_id = game_id_match.group() if game_id_match else None
                                team_info = game_info[len(game_id)+1:] if game_id else game_info
                                teams = team_info.split('-vs-')
                                if len(teams) == 2:
                                    home_team = teams[0].replace('-', ' ')
                                    away_team = teams[1].replace('-', ' ')
                                else:
                                    home_team = None
                                    away_team = None

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
                                                sport='EPL',
                                                game_id=game_id,
                                                home_team=home_team,
                                                away_team=away_team,
                                                date=formatted_date,
                                                score=score,
                                                time=formatted_time,
                                                update_date=current_date.strftime("%d/%m")
                                            )
                                            new_games.append(new_game)
                                        pass
                                    elif convert_to_date(formatted_date) > max_date_obj_2:
                                        #print("Game date is out of range for id ", game_id)
                                        break_loop = True
                                        break
                                    else:
                                        #print("It is on the next day, but the game time is out of range for id ", game_id)
                                        break_loop = True
                                        break
                        #else:
                            #print("Score already exists for this game")
                    #else:
                        #print("Not enough cells in row to determine game details: ", row)
            
            if new_games:
                #print("Saving games to database")
                db.session.bulk_save_objects(new_games)
                db.session.commit()
                return jsonify({'message': 'New games successfully added'}), 200
            else:
                return jsonify({'message': 'No new games found'}), 200
        else:
            return jsonify({'error': 'Failed to retrieve content'}), response.status_code
        
@scrape.route('/get-mlb-games', methods=['GET'])
def get_mlb_games():
    london = pytz.timezone('Europe/London')
    current_date = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(london)
    #print("Current date:", current_date)
    max_date = current_date + timedelta(days=3)
    #print("Max date: ", max_date)
    max_date_2 = current_date + timedelta(days=4)
    max_date = max_date.strftime("%d/%m")
    max_date_3 = current_date + timedelta(days=2)
    max_date_obj_3 = convert_to_date(max_date_3.strftime("%d/%m"))
    max_date_obj = convert_to_date(max_date)
    max_date_obj_2 = convert_to_date(max_date_2.strftime("%d/%m"))
    new_games = []
    break_loop = False

    games_check = Game.query.filter(
            Game.update_date == current_date.strftime("%d/%m"),
            Game.sport == 'MLB'
        ).all()
    
    if len(games_check) != 0:
        print("No new MLB games to add (already pulled today)")
        return jsonify({'message': 'Games for the next 3 days have already been added'}), 200
    
    games = Game.query.filter(
            Game.sport == 'MLB',
    ).all()
    games_after_max_date = [
    game for game in games 
        if convert_to_date(game.date) >= max_date_obj_3
    ]
    if len(games_after_max_date) != 0:
        print("No new MLB games to add")
        return jsonify({'message': 'Games for the next 3 days have already been added'}), 200


    with Session() as session:
        url = 'https://www.thesportsdb.com/season/4424-MLB/2024&all=1&view='
        response = session.get(url)

        if response.ok:
            soup = BeautifulSoup(response.content, 'html.parser')
            tables = soup.find_all('table')
            #print("Number of tables:", len(tables))

            for table in tables:
                if break_loop:
                    break
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all('td')
                    if len(cells) > 4:
                        score = cells[4].get_text(strip=True)
                        #print("Score: ", score)
                        
                        if score == "-":
                            href_element = cells[3].find('a', href=True)
                            if href_element:
                                href = href_element['href']
                                game_info = href.split('/')[-1]
                                game_id = re.search(r'\d+', game_info).group()
                                teams = game_info.split('-vs-')
                                home_team = teams[0].rsplit('-', 1)[-1]
                                away_team = teams[1].rsplit('-', 1)[-1]

                                if away_team == 'Jays' or away_team == 'Sox':
                                    away_team = teams[1].rsplit('-')[-2] + " " + away_team

                                if home_team == 'Jays' or home_team == 'Sox':
                                    home_team = teams[0].rsplit('-')[-2] + " " + home_team

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
                                        #print("The game date is ", convert_to_date(formatted_date), " which is less than or equal to ", max_date_obj)
                                        existing_game = Game.query.filter_by(game_id=game_id).first()
                                        if not existing_game:
                                            new_game = Game(
                                                sport='MLB',
                                                game_id=game_id,
                                                home_team=home_team,
                                                away_team=away_team,
                                                date=formatted_date,
                                                score=score,
                                                time=formatted_time,
                                                update_date=current_date.strftime("%d/%m")
                                            )
                                            new_games.append(new_game)
                                        pass
                                    elif convert_to_date(formatted_date) > max_date_obj_2:
                                        #print("Game date is out of range for id ", game_id)
                                        break_loop = True
                                        break
                                    else:
                                        #print("It is on the next day, but the game time is out of range for id ", game_id)
                                        break_loop = True
                                        break
                        #else:
                            #print("Score already exists for this game")
                    #else:
                        #print("Not enough cells in row to determine game details: ", row)
            
            if new_games:
                #print("Saving games to database")
                db.session.bulk_save_objects(new_games)
                db.session.commit()
                return jsonify({'message': 'New games successfully added'}), 200
            else:
                return jsonify({'message': 'No new games found'}), 200
        else:
            return jsonify({'error': 'Failed to retrieve content'}), response.status_code
        
@scrape.route('/get-mls-games', methods=['GET'])
def get_mls_games():
    london = pytz.timezone('Europe/London')
    current_date = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(london)
    #print("Current date:", current_date)
    max_date = current_date + timedelta(days=3)
    #print("Max date: ", max_date)
    max_date_2 = current_date + timedelta(days=4)
    max_date = max_date.strftime("%d/%m")
    max_date_3 = current_date + timedelta(days=2)
    max_date_obj_3 = convert_to_date(max_date_3.strftime("%d/%m"))
    max_date_obj = convert_to_date(max_date)
    max_date_obj_2 = convert_to_date(max_date_2.strftime("%d/%m"))
    new_games = []
    break_loop = False

    games_check = Game.query.filter(
            Game.update_date == current_date.strftime("%d/%m"),
            Game.sport == 'MLS'
        ).all()
    
    if len(games_check) != 0:
        print("No new MLS games to add (already pulled today)")
        return jsonify({'message': 'Games for the next 3 days have already been added'}), 200
    
    games = Game.query.filter(
            Game.sport == 'MLS',
    ).all()
    games_after_max_date = [
    game for game in games 
        if convert_to_date(game.date) >= max_date_obj_3
    ]
    if len(games_after_max_date) != 0:
        print("No new MLS games to add")
        return jsonify({'message': 'Games for the next 3 days have already been added'}), 200


    with Session() as session:
        url = 'https://www.thesportsdb.com/season/4346-American-Major-League-Soccer/2024&all=1&view='
        response = session.get(url)

        if response.ok:
            soup = BeautifulSoup(response.content, 'html.parser')
            tables = soup.find_all('table')
            #print("Number of tables:", len(tables))

            for table in tables:
                if break_loop:
                    break
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all('td')
                    if len(cells) > 4:
                        score = cells[4].get_text(strip=True)
                        #print("Score: ", score)
                        
                        if score == "-":
                            href_element = cells[3].find('a', href=True)
                            if href_element:
                                href = href_element['href']
                                game_info = href.split('/')[-1]
                                game_id = re.search(r'\d+', game_info).group()
                                teams = game_info.split('-vs-')
                                home_team = teams[0].rsplit('-')[1]
                                away_team = teams[1].rsplit('-')[0]

                                if away_team == 'L.A.' or away_team == 'San' or away_team == "Los" or away_team == "New" or away_team == "DC" or away_team == "St." or away_team == "FC" or away_team == "Real" or away_team == "Sporting" or away_team == "Inter" or away_team == "CF":
                                    if away_team == "Sporting" or away_team == "Real" or away_team == "Inter" or away_team == "FC":
                                        away_team = teams[1].rsplit('-')[1]
                                    elif away_team == "CF":
                                        away_team = "Montreal"
                                    else:
                                        away_team = away_team + " " + teams[1].rsplit('-')[1]
                                    if away_team == "Salt":
                                        away_team = away_team + " " + teams[1].rsplit('-')[2]
                                    elif (away_team == "New York" or away_team == "Kansas") and len(teams[1].rsplit('-')) >= 3 and teams[1].rsplit('-')[2] == 'City':
                                        away_team = away_team + " " + teams[1].rsplit('-')[2]

                                if home_team == 'L.A.' or home_team == 'San' or home_team == "Los" or home_team == "New" or home_team == "DC" or home_team == "St." or home_team == "FC" or home_team == "Real" or home_team == "Sporting" or home_team == "Inter" or home_team == "CF":
                                    if home_team == "Sporting" or home_team == "Real" or home_team == "Inter" or home_team == "FC":
                                        home_team = teams[0].rsplit('-')[2]
                                    elif home_team == "CF":
                                        home_team = "Montreal"
                                    else:
                                        home_team = home_team + " " + teams[0].rsplit('-')[2]
                                    if home_team == "Salt":
                                        home_team = home_team + " " + teams[0].rsplit('-')[3]
                                    elif (home_team == "New York" or home_team == "Kansas") and len(teams[0].rsplit('-')) >= 4 and teams[0].rsplit('-')[3] == 'City':
                                        home_team = home_team + " " + teams[0].rsplit('-')[3]

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
                                        #print("The game date is ", convert_to_date(formatted_date), " which is less than or equal to ", max_date_obj)
                                        existing_game = Game.query.filter_by(game_id=game_id).first()
                                        if not existing_game:
                                            new_game = Game(
                                                sport='MLS',
                                                game_id=game_id,
                                                home_team=home_team,
                                                away_team=away_team,
                                                date=formatted_date,
                                                score=score,
                                                time=formatted_time,
                                                update_date=current_date.strftime("%d/%m")
                                            )
                                            new_games.append(new_game)
                                        pass
                                    elif convert_to_date(formatted_date) > max_date_obj_2:
                                        #print("Game date is out of range for id ", game_id)
                                        break_loop = True
                                        break
                                    else:
                                        #print("It is on the next day, but the game time is out of range for id ", game_id)
                                        break_loop = True
                                        break
                        #else:
                            #print("Score already exists for this game")
                    #else:
                        #print("Not enough cells in row to determine game details: ", row)
            
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
                if pick.picked_team.upper() == game.winning_team.upper():
                    pick.result = 1
                    user.score += 1
                else:
                    pick.result = 0
                    user.losses += 1
                db.session.commit()
                
    return jsonify({'message': 'Scores and winning teamsprint("Score 1:", score1) updated, GamePick results updated'}), 200


def convert_to_date(date_str, year=2024):
    return datetime.strptime(f"{date_str}/{year}", "%d/%m/%Y")
