from . import db 
from flask_login import UserMixin

#user class for storing user into database using their id, email, password, and name
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String(150), unique = True)
    password = db.Column(db.String(150))
    firstName = db.Column(db.String(150))
    lastName = db.Column(db.String(150))
    logoutPage = db.Column(db.String(150))