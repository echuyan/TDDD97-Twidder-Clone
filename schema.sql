create table users(
      id integer primary key NOT NULL,
      firstname varchar(120) NOT NULL,
      familyname varchar(120) NOT NULL,
      email varchar(320) NOT NULL UNIQUE, 
      password varchar(120) NOT NULL,
      gender varchar(10) NOT NULL,
      city varchar(120) NOT NULL,
      country varchar(120) NOT NULL,
      token varchar(120) UNIQUE
 );

create table messages (
    id integer primary key NOT NULL,
    sender_id integer,  
    reciever_id integer,
    content varchar(120),
    geolocation varchar(320),
    foreign key(sender_id) REFERENCES users(id),
    foreign key(reciever_id) REFERENCES users(id)
);
                                                     