DROP DATABASE IF EXISTS easyeats;

CREATE DATABASE easyeats;

USE easyeats;

create table user(
	email 		varchar(255) not null unique,
    firstname	varchar(15)	not null,
    lastname	varchar(15) not null,
    primary key(email)
);

create table account(
	email 		varchar(255) not null,
    username    varchar(255) not null unique,
    password 	varchar(255) not null,
    primary key(username),
    foreign key(email) references user(email) on update cascade on delete cascade
);