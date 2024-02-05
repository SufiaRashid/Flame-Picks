from flask import Blueprint, render_template, request, flash, redirect, url_for
from .models import User
from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, logout_user, current_user

auth = Blueprint('auth', __name__)

#function for login page-- get data for method when submit button is pressed
@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        #get email and password from user input
        email = request.form.get('email')
        password1 = request.form.get('password1')

        #check to see if user and password match a user already in the system
        user = User.query.filter_by(email = email).first()
        if user:
            if check_password_hash(user.password, password1):
                flash('Logged in successfully!', category='success')
                login_user(user, remember=True)
                #user ends up on page they logged out on
                return redirect(current_user.logoutPage)
            else:
                flash('Incorrect password.', category='error') #if user is in system but password is wrong
        else:
            flash('Not a user.', category='error') #if user is not in system
    
    return render_template("login.html", user=current_user)

#function for logging out of the website
@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login')) #returns user to login page

#function for signing up page
@auth.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
    #based on the inputs put in by the user, add them to database variables
    if request.method == 'POST':
        email = request.form.get('email') #user input email added to email variable
        firstName = request.form.get('firstName') #user first name email added to first name variable
        lastName = request.form.get('lastName') #user last name email added to last name variable
        password1 = request.form.get('password1') #user password1 email added to password1 variable
        password2 = request.form.get('password2') #user password2 email added to password2 variable

        user = User.query.filter_by(email = email).first() #if user is already in system
        if user:
            flash('User already exists.', category='error')
        elif len(email) < 5: #if email is less then 5 characters long
            flash('Email must be at least 5 characters.', category='error')
        elif len(firstName) < 2: #if name is less then 2 characters long
            flash('First name must be at least 2 characters.', category='error')
        elif len(lastName) < 2: #if name is less then 2 characters long
            flash('Last name must be at least 2 characters.', category='error')
        elif password1 != password2: #if passwords do not match
            flash('Passwords do not match.', category='error')
        elif len(password1) < 8: #if passwords are too short
            flash('Password must be at least 8 characters.', category='error')
        else: #add user to database
            new_user = User(email=email,firstName=firstName,lastName=lastName,password=generate_password_hash(password1, method='scrypt'), logoutPage = request.url)
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user, remember=True)
            flash('Account created!', category='success')
            return redirect(url_for('views.home')) #take user to home page

    return render_template("sign-up.html", user=current_user)