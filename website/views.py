from flask import Blueprint, render_template, request
from . import db
from flask_login import login_required, current_user

views = Blueprint('views', __name__)

@views.route('/')
#login required to access this page
@login_required
def home():
    #allows for user to end up on home page when they log in if they log out on home page
    current_user.logoutPage = request.url
    db.session.commit()
    return render_template("home.html", user=current_user)

@views.route('/leaderboard')
#login required to access this page
@login_required
def leaderboard():
    #allows for user to end up on black and white page when they log in if they log out on home page
    current_user.logoutPage = request.url
    
    db.session.commit()
    return render_template("leaderBoard.html", user=current_user)

@views.route('/account')
#login required to access this page
@login_required
def account():
    #allows for user to end up on black and white page when they log in if they log out on home page
    current_user.logoutPage = request.url
    
    db.session.commit()
    return render_template("account.html", user=current_user)

@views.route('/settings')
#login required to access this page
@login_required
def settings():
    #allows for user to end up on black and white page when they log in if they log out on home page
    current_user.logoutPage = request.url
    
    db.session.commit()
    return render_template("settings.html", user=current_user)

@views.route('/support')
#login required to access this page
@login_required
def support():
    #allows for user to end up on black and white page when they log in if they log out on home page
    current_user.logoutPage = request.url
    
    db.session.commit()
    return render_template("support.html", user=current_user)