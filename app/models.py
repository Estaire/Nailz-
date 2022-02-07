from . import db
import datetime
from werkzeug.security import generate_password_hash

class UserProfile(db.Model):
    __tablename__ = 'account'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(80), unique=True)
    firstname = db.Column(db.String(80))
    lastname = db.Column(db.String(80))
    phone = db.Column(db.String(10))
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(255))
    isadmin = db.Column(db.Integer)

    def __init__(self, email, firstname, lastname, phone, username, password):
        self.email = email
        self.firstname = firstname
        self.lastname = lastname
        self.username = username
        self.password = generate_password_hash(password)
        self.phone = phone
        self.isadmin = 0

class Appointment(db.Model):
    __tablename__ = 'appointments'

    username = db.Column(db.String(80), not_null=True)
    appointmentid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    appointmentdate = db.Column(db.String(80))
    appointmenttime = db.Column(db.String(80))

    def __init__(self, username, appointmentdate, appointmenttime):
        self.username = username
        self.appointmentdate = appointmentdate
        self.appointmenttime = appointmenttime


"""drop table account;

create table account(
    id integer not null primary key auto_increment,
    email varchar(80) not null, 
    firstname varchar(80) not null, 
    lastname varchar(80) not null, 
    phone varchar(10) not null, 
    username varchar(80) not null, 
    password varchar(255) not null, 
    isadmin integer not null
);"""
"""create table appointments(
    appointmentid integer primary key AUTO_INCREMENT,
    username varchar(80) not null,
    appointmentdate varchar(80),
    appointmenttime varchar(80),
    foreign key(username) references account(username) on update cascade on delete cascade
)"""