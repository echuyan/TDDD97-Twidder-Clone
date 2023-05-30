import sqlite3
from flask import g
#import bcrypt
import sqlite3

DATABASE_URI = "database.db"

#open connection to db
def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
        
    return db

#close connection to db
def disconnect():
    db = getattr(g, 'db', None)
    if db is not None:
        g.db.close()
        g.db = None

#create a user with the given data
def create_user(firstname, familyname,email,password,gender,city,country):
    try:
        get_db().execute("insert into users (firstname,familyname,email,password,gender,city,country)  values(?, ?, ?, ?, ?, ?, ?);", [firstname,familyname,email,password,gender,city,country]);
        get_db().commit()
        print("horraaay")
        return True
    except:
        return False

#search for a user with a given email and password
def find_user(email,password):
    cursor = get_db().execute("select email from users where email = ? and password = ?;", (email,password,))
   
    matches = cursor.fetchall()
    cursor.close()
    if  len(matches) == 0:
        return False
    else: 
        return True

#update the given user with the given token
def update_user(email,token):
    try:
        get_db().execute("update users set token= ? where email=?;", [token,email]);
        get_db().commit()
        return True
    except:
        return False

#clear the token
def clear_token(token):
    try:
        get_db().execute("update users set token= null where token=?;", [token]);
        get_db().commit()
        return True
    except:
        return False

#validate the token
def validate_token(token):
    try:
        cursor=get_db().execute("select email from users where token=?;", [token]);
        matches = cursor.fetchall()
        cursor.close()
        if  len(matches) == 0:
            return False
        else: 
            return True
    except:
        return False

#post message
def post_message(token,message,email_recepient,location):
    try:
        cursor=get_db().execute("select id from users where token=?;", [token]);
        matchesauthorid = cursor.fetchall()
        cursor=get_db().execute("select id from users where email=?;", [email_recepient]);
        matchesrecepientid = cursor.fetchall()
        cursor.close()
        if  len(matchesrecepientid) == 0:
             return False
        else:
            get_db().execute("insert into messages (sender_id,reciever_id,content,geolocation)  values(?, ?, ?,?);", [matchesauthorid[0][0],matchesrecepientid[0][0],message,location]);
            get_db().commit()
            return True
    except:
        return False

#get user messages by token
def get_user_messages_by_token(token):
    try:
        # retrieve the user data associated with the token
        # cursor = connection.cursor()
        cursor=get_db().execute("select id from users where token=?;", [token]);
        matchesuserid = cursor.fetchall()
        
        cursor=get_db().execute("SELECT users.email, messages.content,messages.geolocation FROM users,messages where messages.reciever_id=? and users.id=messages.sender_id;", [matchesuserid[0][0]]);
        matchesmessages=cursor.fetchall()
        result = []
        for index in range(len(matchesmessages)):
            result.append({'writer': matchesmessages[index][0], 'message': matchesmessages[index][1], 'location': matchesmessages[index][2]})
        # close the cursor 
        cursor.close()
        # return the user data
        if (len(result)==0):
            return None
        else:
            return result
    except:
        # return None if an error occurred 
        return None

#get user messages by email
def get_user_messages_by_email(email):
    try:
        cursor = get_db().execute(
            "select messages.id as id, content,geolocation, firstname,familyname from messages left join users u on u.id = messages.reciever_id where email=?;",
            [email])

        messages = cursor.fetchall()
        message_list = []
        for result in messages:
            message = {
                'message_id': result[0],
                'body': result[1],
                'name': result[3] + ' ' + result[4],
                'location' : result[2],

            }
            message_list.append(message)
        if (len(message_list)==0):
                return None
        else:
                return message_list
    except:
        # return None if an error occurred 
        return None          

#get all users
def get_all_users():
    cursor = get_db().execute("select * from users ")
    users = cursor.fetchall()
    cursor.close()
    return users

#get user data by email
def get_user_data_by_email(email):
    cursor = get_db().execute("select firstname,familyname,email,gender,city,country  from users where email=? ;", [email])
    return cursor.fetchone()

#function to change user password
def update_user_password(token, oldPassword, newPassword):
    cursor = get_db().execute("select * from users where token=? and password=? ;", [token, oldPassword])
    user = cursor.fetchone()
    cursor.close()
    print(user)
    if user is None:
        return False
    else:
        # update the user's password in the database
        get_db().execute("update users set password=? where token=? ;", [newPassword,token])
        get_db().commit()
        print(token)
        print(newPassword)
        print(oldPassword)
        return True

#function to reset user password
def reset_user_password(email, newpassword):
    cursor = get_db().execute("select * from users where email=? ;", [email])
    user = cursor.fetchone()
    cursor.close()
    print(user)
    if user is None:
        return False
    else:
        # reset the user's password in the database
        get_db().execute("update users set password=? where email=? ;", [newpassword,email])
        get_db().commit()
        
        return True

#helper function to verify the password, not used by now
#def verify_password(email, password):
#    try:
        # connect to the database
        # connection =  # ...

        # retrieve the hashed password for the user with the given email
        # cursor = connection.cursor()
#        cursor = get_db().execute("SELECT password FROM users WHERE email = ?", (email,))
#        result = cursor.fetchone()
#        hashed_password = result[0]

        # close the cursor and the connection
#        cursor.close()
        # connection.close()

        # return True if the password is correct, False otherwise
#        return bcrypt.checkpw(password.encode('utf-8'), hashed_password)
#    except:
        # return False if an error occurred
#        return False

#get user data by token
def get_user_data_by_token(token):
    try:

        # retrieve the user data associated with the token
        # cursor = connection.cursor()
        cursor = get_db().execute("SELECT * FROM users WHERE token = ?", (token,))
        result = cursor.fetchone()
        user_data = {
            'email': result[3],
            'firstname': result[1],
            'family_name': result[2],
            'gender': result[5],
            'city': result[6],
            'country': result[7],
        }

        # close the cursor and the connection
        cursor.close()
        # connection.close()

        # return the user data
        return user_data
    except:
        # return None if an error occurred or the token is invalid
        return None

#not used
# def get_users(name):
#     cursor = get_db().execute("select * from contact where name like ?;", [name])
#     matches = cursor.fetchall()
#     cursor.close()
#
#     result = []
#     for index in range(len(matches)):
#         result.append({'name': matches[index][0], 'number': matches[index][1]})
#
#     return result

# def find_users():

# def get_user_data_by_email(email):
#     try:
#
#         # retrieve the user data for the specified email address
#
#         cursor = get_db().execute(
#             "SELECT email, firstname, family_name, gender, city, country FROM users WHERE email = ?", (email,))
#         result = cursor.fetchone()
#         user_data = {
#             'email': result[0],
#             'firstname': result[1],
#             'family_name': result[2],
#             'gender': result[3],
#             'city': result[4],
#             'country': result[5],
#         }
#
#         # close the cursor and the connection
#         cursor.close()
#
#         # return the user data
#         return user_data
#     except:
#         # return None if an error occurred or the email address is not found
#         return None