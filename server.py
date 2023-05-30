from flask import Flask, request, jsonify,Response,json
#from waitress import serve
#from flask_sock import Sock
from flask_socketio import SocketIO, emit
import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import database_helper
import secrets
import re

app = Flask(__name__,static_url_path='/static')
socket = SocketIO(app,logger=True, engineio_logger=True)


loggedinusers = {}

pwdlength=6

@socket.on('check_session')
def check_session(token):
    res = database_helper.get_user_data_by_token(token)
    if res:
        #print(request)
        loggedinusers[res["email"]] = request.sid
        

@app.route("/", methods = ['GET'])
def root():
    return app.send_static_file("client.html"), 200

#shutdown connection
@app.teardown_request
def teardown(exception):
    database_helper.disconnect()

#helper function to validate email with regular expression
def validate_email(email):
   pattern = "^[a-zA-Z0-9-_]+@[a-zA-Z0-9]+\.[a-z]"
   if re.match(pattern,email):
      return True
   return False


#signup user method
@app.route('/user/create/', methods = ['POST'])
def save_user():
    
    data = request.get_json()
    
    if (len(data)>7):
        print("More fields than expected")
        return "Unexpected data fields found. Check the request: only first name, last name, email, password, gender, city and country are allowed.", 400
    if (len(data)<7):
        print("Not enough fields")
        return "Not enough data fields provided. Check the request: first name, last name, email, password, gender, city and country are required.", 400
    #check if provided data is correct (all fields provided and have acceptable length)
    if 'firstname' in data and 'familyname' in data and 'email' in data and 'password' in data and 'city' in data and 'country' in data and 'gender' in data:
        if len(data['firstname']) <= 120 and len(data['familyname']) <= 120 and len(data['email']) <= 320 and len(data['password']) <= 120 and len(data['gender']) <= 10 and len(data['city']) <= 120 and len(data['country']) <= 120 and len(data['password']) >= pwdlength:
            #validate email
            if(validate_email(data['email'])):
                print("create user here")
                resp = database_helper.create_user(data['firstname'], data['familyname'],data['email'],data['password'],data['gender'],data['city'],data['country'])
                if resp:
                    print("user created successfully")
                    return "", 201 # everything is ok, user created
                else:
                    return "User with such email already exists.", 409 # cmth gone wrong, returning 409 Conflict (maybe a duplicate email)
            else:
                print("Bad email format.")
                return 'Bad email format.', 400 # returning bad request if email is incorrect
        else:
            print("Wrong length.")
            return 'Wrong length.', 400 # returning bad request if length is incorrect
    else:
        print("Not all fields")
        return 'Not all required field provided. Check the request: first name, last name, email, password, gender, city and country are required.', 400 # returning bad request if dataset is corrupt

#signin user method
@app.route('/user/login/', methods = ['POST'])
def login_user():
    data = request.get_json()
  
    if 'email' in data and 'password' in data :
          resp = database_helper.find_user(data['email'],data['password'])
          if resp:
                #generate a token and update the user with token in database
                token=secrets.token_urlsafe(32)
                response = database_helper.update_user(data['email'],token)
                if response:
                     if data['email'] in loggedinusers:
                        sid=loggedinusers[data['email']]
                        #socket.emit('invalidtoken')
                        socket.emit('invalidtoken',to=sid)
                     return token, 200 # everything is ok, return the token and 200 status code
                else:
                    return "",400 #smth gone wrong while updating the user with the token
          else:
                return "", 404 #no such user found => returning 404 
    else:
        return '', 400 # incorrect dataset provided


#signout user method
@app.route('/user/logout/', methods = ['POST'])
def logout_user():
    token = request.headers.get("Authorization", None)
    if token is not None:
        resp = database_helper.clear_token(token)
        if resp:
            resp1 = database_helper.get_user_data_by_token(token)  
            if resp1: 
                del loggedinusers[resp1["email"]]
               
            return "",200 # everything is ok, return 200 status code
        else:
            return "",400 #smth gone wrong while clearing the token
    else:
         return '', 400 # incorrect dataset provided


#post message to the wall
@app.route('/post', methods = ['POST'])
def post_message():
    token = request.headers.get("Authorization", None)
    data = request.get_json()
    #print(token)
    if not token:
        return '',401 #unauthorized
    else:
        resp = database_helper.validate_token(token)
        if resp:
            if 'message' in data and 'email' and 'location' in data:
                resp1 = database_helper.post_message(token,data['message'],data['email'],data['location'])
                if resp1:
                    return '',200
                else:
                    return "",400 #smth gone wrong while posting the message
        else:
            return '',401 #unauthorized

#get user data by token
@app.route('/users/current', methods=['GET'])
def get_user_data_by_token():
    token = request.headers.get("Authorization", None)
   
    if not token:
        return '',401 #unauthorized
    else:
        resp1 = database_helper.validate_token(token)
        if resp1:
         resp = database_helper.get_user_data_by_token(token)
         if resp:
            return jsonify(resp), 200
         else:
            return "",400 #smth gone wrong while getting user data
        else:
          return '',401 #unauthorized  

#get user messages by token
@app.route('/users/current/messages', methods=['GET'])
def get_user_messages_by_token():
    token = request.headers.get("Authorization", None)
    if not token:
        return '',401 #unauthorized
    else:
        resp1 = database_helper.validate_token(token)
        if resp1:
         resp = database_helper.get_user_messages_by_token(token)
         if resp:
            return jsonify(resp), 200
         else: 
            if (resp is None):
                return "",200 
            else:
                return "",400 #smth gone wrong while getting user messages (no messages acquired)
        else:
            return '',401 #unauthorized  

#get user messages by Email
@app.route('/user/messages/<email>', methods=['GET'])
def get_user_messages_by_email(email):
    token = request.headers.get("Authorization", None)
    if not token:
        return '',401 #unauthorized
    else:
        resp1 = database_helper.validate_token(token)
        if resp1:
            messages = database_helper.get_user_messages_by_email(email)
            if messages:
                return jsonify(messages), 200
            else: 
                if (messages is None):
                    return "",200 
                else:
                    return "",400 #smth gone wrong while getting user messages (no messages acquired)
        else:
            return '',401 #unauthorized 

#get all users
@app.route('/users/', methods=['GET'])
def get_all_users():
    resp = database_helper.get_all_users()
    return jsonify(resp), 200

#get user data by email
@app.route('/users/find/<email>', methods=['GET'])
def get_user_data_by_email(email):
    token = request.headers.get("Authorization", None)
    if token is None:
        return "empty token", 401

    valid_token = database_helper.validate_token(token)
    if not valid_token:
        return "invalid token", 401

    if email is not None:
        resp = database_helper.get_user_data_by_email(email)
        if resp:
            return Response(json.dumps(resp), mimetype='application/json')
        else:
            return "Email not found", 404
    else:
        return "", 400

#change password
@app.route('/change_password/', methods=['PUT'])
def change_password():
    # extract the input data from the request
    token = request.headers.get("Authorization", None)
    if token is None:
        return "empty token", 401

    valid_token = database_helper.validate_token(token)
    if not valid_token:
        return "invalid token", 401

    data = request.get_json()
    oldPassword = data.get('oldPassword')
    newPassword = data.get('newPassword')

    # validate the input
    if not all([token, oldPassword, newPassword]):
        return "Invalid input data", 400

    if (len(newPassword)<pwdlength):
         return "Password is not long enough", 400
    
    passwordUpdated = database_helper.update_user_password(token, oldPassword, newPassword)
    if passwordUpdated:
        return "password has been updated", 201
    else:
        return "Wrong old password.", 400

#reset password
@app.route('/reset_password/', methods=['PUT'])
def reset_password():
    # extract the input data from the request
    
    data = request.get_json()
    email = data.get('email')
   
    # generate random password
    newpassword=secrets.token_urlsafe(10)
 
    #reset password in the database
    passwordUpdated = database_helper.reset_user_password(email,newpassword)
    if passwordUpdated:
        #send new password to user's email
        sender = "otustestchuyan@gmail.com" #verified sender on smtp2go.com
        receiver = "elech608@student.liu.se" #where to send a new password (test)
      
        #receiver = email #where to send a new password (real)
        message = "Here is your new password: "+newpassword #what to send
        with smtplib.SMTP("mail.smtp2go.com", 2525) as server:
           server.login("Twidder", "Sc4SKFw626sd7WTM")
           server.sendmail(sender, receiver, message)
        return "password has been reset", 200
    else:
        return "Wrong username.", 400
    

#helper function to validate the token
def get_validate_token(request):
    token = request.headers.get("Authorization", None)
    if token is None:
        return "empty token", 401

    valid_token = database_helper.validate_token(token)
    if not valid_token:
        return "invalid token", 401

#find user by email
@app.route('/users/find/<user>', methods=['GET'])
def query_user(name):
    if name is not None:
        resp = database_helper.get_users(name)
        return jsonify(resp), 200
    else:
        return "", 400



if __name__ == '__main__':
    app.debug = True
    
    #app.run()
    #serve(app, port=8080, host="127.0.0.1")
    
    socket.run(app)
