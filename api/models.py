from . import db 
from flask_login import UserMixin
from datetime import datetime

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    firstName = db.Column(db.String(150))
    lastName = db.Column(db.String(150))
    score = db.Column(db.Integer, default=0)

class GamePick(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_id = db.Column(db.String(150), nullable=False)
    picked_team = db.Column(db.String(150), nullable=False)
    pick_time = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'game_id', name='_user_game_uc'),)

class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.String(150), unique=True, nullable=False)
    home_team = db.Column(db.String(150), nullable=False)
    away_team = db.Column(db.String(150), nullable=False)
    date = db.Column(db.String(150), nullable=False)
    score = db.Column(db.String(150), nullable=True)
    time = db.Column(db.String(150), nullable=True)
