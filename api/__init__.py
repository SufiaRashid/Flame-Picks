#basic file needed to run all elements of the app and return all
#the code and logic from the files

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS


db = SQLAlchemy()
DB_NAME = "database.db"


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'candy'
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
    db.init_app(app)
    CORS(app)

    from .auth import auth
    from .scrape import scrape
    from .user import user
    from .data import data

    from flask_jwt_extended import JWTManager

    app.config['JWT_SECRET_KEY'] = 'cake'
    JWTManager(app)

    app.register_blueprint(auth, url_prefix = '/')
    app.register_blueprint(scrape, url_prefix = '/scrape')
    app.register_blueprint(user, url_prefix = '/user')
    app.register_blueprint(data, url_prefix = '/data')

    with app.app_context():
        db.create_all()
        from .scrape import get_nba_games, update_scores
        get_nba_games()
        update_scores()
    
    return app