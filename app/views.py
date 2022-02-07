"""
Flask Documentation:     http://flask.pocoo.org/docs/
Jinja2 Documentation:    http://jinja.pocoo.org/2/documentation/
Werkzeug Documentation:  http://werkzeug.pocoo.org/documentation/
This file creates the application.
"""

import os
from app import app, login_manager, db
from flaskext.mysql import MySQL
from flask import render_template, request, jsonify, redirect, url_for, session
from app.models import UserProfile, Appointment
from app.notify import Notification
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from app.forms import LoginForm, NewAccountForm
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash, generate_password_hash
import datetime

###
# Routing for the application.
###

# This route is now our catch all route for our VueJS single page
# application.
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    """
    Because we use HTML5 history mode in vue-router we need to configure our
    web server to redirect all routes to index.html. Hence the additional route
    "/<path:path".

    Also we will render the initial webpage and then let VueJS take control.
    """
    return render_template('index.html')

@app.route('/api/users/register', methods=['GET','POST'])
def register():
    form = NewAccountForm()
    exist = UserProfile.query.filter_by(username=request.form['username']).first()
    if form.validate_on_submit() and request.method == 'POST' and exist is None:
        user = UserProfile(request.form['email'], request.form['firstname'], request.form['lastname'], request.form['phone'], request.form['username'], request.form['password'])
        db.session.add(user)
        db.session.commit()
        access_token = create_access_token(identity=request.form['username'])
        #message = Notification("account",request.form['email'],request.form['firstname']+" "+request.form['lastname'],None,None,None,datetime.datetime.now())
        return jsonify({'authenticated':True, 'access_token': access_token}), 200
    return jsonify(response=form_errors(form))

@app.route("/api/auth/login", methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit() and request.method == 'POST':
        username = form.username.data
        password = form.password.data
        user = UserProfile.query.filter_by(username=username).first()
        if user is not None and check_password_hash(user.password, password):
            access_token = create_access_token(identity=username)
            return jsonify({'authenticated':True, 'access_token': access_token}), 200
    return jsonify({'message':'Wrong username or password', 'authenticated':False, 'check':check_password_hash(user.password, password)}), 401

@app.route('/api/schedule', methods=['GET'])
@jwt_required()
def homepage():
    all_users_appointments = []
    all_current_user_appointments = []
    current_user = get_jwt_identity()
    current_user_appointments = Appointment.query.filter_by(username=current_user).all()
    other_users_appointments = Appointment.query.filter(Appointment.username!=current_user).all()
    specuser = UserProfile.query.filter_by(username=current_user).first()

    for user in other_users_appointments:
        all_users_appointments.append(dict({'username':user.username, 'appointmenttime':user.appointmenttime, 'appointmentdate':user.appointmentdate}))

    for appointments in current_user_appointments:
        all_current_user_appointments.append(dict({'username':appointments.username, 'appointmenttime':appointments.appointmenttime, 'appointmentdate':appointments.appointmentdate}))

    return jsonify({'user':all_current_user_appointments, 'users':all_users_appointments, 'isadmin':specuser.isadmin}), 200

@app.route('/api/create/<date>/<time>/appointment', methods=['POST'])
@jwt_required()  
def book_appointment(date, time):
    current_user = get_jwt_identity()
    user = UserProfile.query.filter_by(username=current_user).first()
    new_appointment = Appointment(current_user, date, time)
    db.session.add(new_appointment)
    db.session.commit()
    appointment = Appointment.query.filter_by(username=current_user, appointmentdate=date, appointmenttime=time).first()
    #message = Notification("book",user.email,user.firstname+" "+user.lastname,date,time,appointment.id,datetime.datetime.now())
    return jsonify({'message':'New appointment created'}), 200

@app.route('/api/delete/<date>/<time>/appointment', methods=['POST'])
@jwt_required()  
def delete_appointment(date, time):
    current_user = get_jwt_identity()
    Appointment.query.filter_by(username=current_user, appointmentdate=date, appointmenttime=time).delete()
    db.session.commit()
    return jsonify({'message':'Appointment deleted'}), 200

@app.route('/api/auth/logout', methods=['GET'])
@jwt_required()
def logout():
    return jsonify({'message':'Successfully logged out'}), 200

@login_manager.user_loader
def load_user(id):
    return UserProfile.query.get(int(id))

# Here we define a function to collect form errors from Flask-WTF
# which we can later use
def form_errors(form):
    error_messages = []
    """Collects form errors"""
    for field, errors in form.errors.items():
        for error in errors:
            message = u'Error in the %s field - %s' % (
                    getattr(form, field).label.text,
                    error
                )
            error_messages.append(message)
    return error_messages


###
# The functions below should be applicable to all Flask apps.
###

@app.route('/<file_name>.txt')
def send_text_file(file_name):
    """Send the static text file."""
    file_dot_text = file_name + '.txt'
    return app.send_static_file(file_dot_text)


@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also tell the browser not to cache the rendered page. If we wanted
    to we could change max-age to 600 seconds which would be 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response


@app.errorhandler(404)
def page_not_found(error):
    """Custom 404 page."""
    return render_template('404.html'), 404


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port="8080")
