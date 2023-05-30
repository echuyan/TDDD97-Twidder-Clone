//arbitrary const for defining allowed password length
const pwdlength = 6;
let latitude=null;
let longitude=null;

displayView = function() {
    //the code required to display a View
};

//displaying the views
window.onload = function() {
//code that is executed as the page is loaded
//custom code
//no alerts!!!
document.getElementById("feedback").innerText=null;
let readToken = localStorage.getItem("token");
if (readToken==null)
{
console.log("token null");
document.getElementById("placeholder").innerHTML = document.getElementById("welcomeview").innerHTML ;

}
else {
        document.getElementById("placeholder").innerHTML = document.getElementById("profileview").innerHTML ; 
       //check if some Tab was opened and restore it
       let readTab = localStorage.getItem("tab");
       if (readTab==null){openTab(onclick,"Home")}
       else{openTab(onclick,readTab)} 
          let socket = new io();
          socket.on("connect", function () {
          socket.emit("check_session", readToken);
          socket.on("invalidtoken", (response) => {
            
            localStorage.removeItem("token");
            window.onload();
            //localStorage.removeItem("loggedinusers");
            localStorage.removeItem("tab");
            //signOut();
           
          });
       });
}
}




//function for the Welcome View to perform signin form validation
validateLogin = function(page) {
    
    document.getElementById("feedback").innerText = null;
    
    let pass1 = document.getElementById("password").value;
    if (pass1.length<pwdlength) {
        document.getElementById("feedback").innerText = "Password is not long enough. Minimal length is "+pwdlength;}
        else {
            signin(page);
        }

}

//function for the Welcome View to perform signup form validation (frontend validation only)
validateSignup = function(page) {
    document.getElementById("feedback").innerText = null;
    
    let pass1 = document.getElementById("passwordsignup").value;
    let pass2 = document.getElementById("repeatpassword").value;

    if (pass1!=pass2) {
        document.getElementById("feedback").innerText = "Passwords don't match!";}
    
    else {
        if (pass1.length<pwdlength) {
            document.getElementById("feedback").innerText = "Password is not long enough. Minimal length is "+pwdlength;}
            else {
                signup(page);
            }
    }
}

//function for the Welcome View to perform signup
//Result: refactored for python backend!
signup = function(page) {
    let name = page.firstname.value;
    let lastname = page.familyname.value;
    let gender = page.gender.value;
    let city = page.city.value;
    let country = page.country.value;
    let email = page.emailsignup.value;
    let password = page.passwordsignup.value;
   
   
    let user = {
        email:email,
        password:password,
        firstname: name,
        familyname: lastname,
        gender: gender,
        city:city,
        country:country
       
    }
    let messageDiv = document.getElementById("feedback");
    let req = new XMLHttpRequest();
    req.open("POST", "/user/create", true);
    req.setRequestHeader("Content-type", "application/json;charset=UTF-8")
    
    req.onreadystatechange =  function(){
        if (req.readyState == 4){
            if (req.status == 201){
                messageDiv.innerHTML = "User Created!";

            }else if (req.status == 409){
                messageDiv.innerHTML = "User already exists!";

            }else if (req.status == 400){
                messageDiv.innerHTML = "Wrong data format! "+req.response;

            }

        }
      }
      req.send(JSON.stringify(user));
}

//function for the Welcome View to signin
//Result: refactored for python backend!

signin = function(page) {
    let username = page.email.value;
    let password = page.password.value;

    let user = {
      email:username,
      password:password,
    }
    let messageDiv = document.getElementById("feedback");
    document.getElementById("feedback").innerText=null;
    let req = new XMLHttpRequest();
    req.open("POST", "/user/login", true);
    req.setRequestHeader("Content-type", "application/json;charset=UTF-8")
   
    req.onreadystatechange =  function(){
        if (req.readyState == 4){
            if (req.status == 200){
                messageDiv.innerHTML = "Successfully logged in!";
                
                let token = req.response;
                
                localStorage.setItem("token",token);
                window.onload();
                //showPersonalInfo();

            }else if (req.status == 404){
                messageDiv.innerHTML = "No such user!";

            }else if (req.status == 400){
                messageDiv.innerHTML = "Wrong data format! "+req.response;

            }

        }
      }
      req.send(JSON.stringify(user));
}

//function for the Profile View to view tabs
function openTab(event, tabName) {
      let i, tabcontent, tablinks;
     
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
     tabcontent[i].style.display = "none";
   }
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
   // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    let button=tabName+"Button";
    document.getElementById(button).className+= " active";
    localStorage.setItem("tab",tabName);
    if(tabName=="Home") {showPersonalInfo();}
    
  }

//function  for the Account Tab to perform password change
//Result: refactored for python backend!
  function changePassword() {
    if (document.getElementById("oldpassword") == null) {
    document.getElementById("Account").innerHTML += "<label for="+"oldpassword"+" >Old Password</label><input required id="+"oldpassword"+ " type="+"password"+">";
    document.getElementById("Account").innerHTML += "<label for="+"newpassword"+" >New Password</label><input required id="+"newpassword"+ " type="+"password"+">";
    document.getElementById("Account").innerHTML += "<label for="+"repeatnewpassword"+" >Repeat New Password</label><input required id="+"repeatnewpassword"+ " type="+"password"+">";
    document.getElementById("Account").innerHTML += "<button class="+"pwdchange1"+" onclick="+"validateNewPassword()"+">Submit</button>";
    }
  }

//functions to perform password reset
//Result: refactored for python backend!
function resetPassword() {
  document.getElementById("placeholder").innerHTML = document.getElementById("forgotpasswordview").innerHTML ;
 
}

function sendNewPassword(page) {
  let username = page.emailforgottenpwd.value;
  console.log(username);

  document.getElementById("feedback").innerText = null;
  let messageDiv = document.getElementById("feedback");
  let req = new XMLHttpRequest();
  req.open("PUT", "/reset_password", true);
  req.setRequestHeader("Content-type", "application/json;charset=UTF-8")
  user ={
        email:username,
       }
      
      req.onreadystatechange =  function(){
        if (req.readyState == 4){
            if (req.status == 200){
                window.onload();
                messageDiv.innerHTML = "New password was successfully sent to your email! It is recommended to change it once you've logged in successfully."+req.response;
                
  
            }else if (req.status == 400){
                messageDiv.innerHTML = "Something went wrong! Try again with correct credentials."+req.response;
            }
        }
      }
      req.send(JSON.stringify(user));
 }



//function  for the Account Tab to perform password validation
//Result: refactored for python backend!
  function validateNewPassword() {
    document.getElementById("feedback").innerText = null;
    
    let oldPassword = document.getElementById("oldpassword").value;
    let newpPassword = document.getElementById("newpassword").value;
    let newpass2 = document.getElementById("repeatnewpassword").value;

    if (newpPassword!=newpass2) {
        document.getElementById("feedback").innerText = "New passwords don't match!";}
        else
        if (newpPassword.length<pwdlength) {
            document.getElementById("feedback").innerText = "New password is not long enough. Minimal length is "+pwdlength;}
            else 
            if (newpPassword==oldPassword) {document.getElementById("feedback").innerText = "New password equals to the old one."}
    else {
      let token = localStorage.getItem("token");
      console.log(token);
      let messageDiv = document.getElementById("feedback");
      let req = new XMLHttpRequest();
      req.open("PUT", "/change_password", true);
      req.setRequestHeader("Content-type", "application/json;charset=UTF-8")
      req.setRequestHeader("Authorization", token)
      pass ={
        oldPassword:oldPassword,
        newPassword:newpPassword,
      }
      
      req.onreadystatechange =  function(){
        if (req.readyState == 4){
            if (req.status == 201){
                messageDiv.innerHTML = "Password was successfully changed!"+req.response;
                

            }else if (req.status == 401){
                messageDiv.innerHTML = "Invalid token!"+req.response;

            }else if (req.status == 400){
                messageDiv.innerHTML = "Wrong data format! "+req.response;

            }

        }
      }
      req.send(JSON.stringify(pass));
 
        }
 }

//function for the Account Tab to perform signout
//Result: refactored for python backend!
  function signOut() {
 
    let token = localStorage.getItem("token");
   
    let messageDiv = document.getElementById("feedback");
    let req = new XMLHttpRequest();
    req.open("POST", "/user/logout", true);
    
    req.setRequestHeader("Authorization", token)
  
    
    req.onreadystatechange =  function(){
      if (req.readyState == 4){
          if (req.status == 200){
              messageDiv.innerHTML = "Logged out successfully!"+req.response;
              

          }else if (req.status == 400){
              messageDiv.innerHTML = "Wrong data format! "+req.response;

          }

      }
    }
    req.send();
    localStorage.removeItem("token");
    localStorage.removeItem("loggedinusers");
    localStorage.removeItem("tab");
    
    window.onload();
  }



//function for the Home Tab for showing current user info (call server by token)
//Result: refactored for python backend!
  function showPersonalInfo() {
    document.getElementById("personalInfo").innerHTML = null;
    let token = localStorage.getItem("token");
    let messageDiv = document.getElementById("feedback");
    let req = new XMLHttpRequest();
    req.open("GET", "/users/current", true);
    req.setRequestHeader("Authorization", token)
    
    
    req.onreadystatechange =  function(){
      if (req.readyState == 4){
          if (req.status == 200){
            
            let resp = JSON.parse(req.responseText);
            let arr=Object.values(resp);
        
            document.getElementById("personalInfo").innerHTML += "<li id="+"currentuseremail"+">"+arr[2]+"</li><br>"+
              "<li>"+arr[4]+"</li><br>"+
              "<li>"+arr[3]+"</li><br>"+
              "<li>"+ arr[5]+"</li><br>"+
              "<li>"+arr[0]+"</li><br>"+
              "<li>"+arr[1]+"</li><br>";   
              reload();
            }else if (req.status == 401){
              messageDiv.innerHTML = "Unauthorized! "+req.response;

          }    

          else if (req.status == 400){
              messageDiv.innerHTML = "Error occurred. Try again. "+req.response;

          }

      }
    }
    req.send();
  }
 
  //helper async function to call Nominatim API with given coordinates
  async function getAddress(url) {
    try {
        let res = await fetch(url);
        
        return await res.json();
    } catch (error) {
       console.log(error);
    }
}

//Strating function for posting a message, first step is to get a geoposition and then call the main posting function
function postSelf(){
    let feedback = document.getElementById("feedback");
    //locate the author of the message and if succeful - pass location to showPosition function
    if (navigator.geolocation) {
     
      navigator.geolocation.getCurrentPosition(postSelf1,postSelf1);
    } else {
     
      feedback.innerHTML = "Geolocation is not supported by this browser.";
    }  
}


//function for the Home Tab to post a message on user's own wall
//Result: refactored for python backend!
async function postSelf1(position) {

  //analyze if any position is returned or an error code is returned
    if (position.code==null){
    latitude=position.coords.latitude;
    longitude=position.coords.longitude;}
    else {
      latitude=null;
      longitude=null;
    }
  
  //form URL for Nominatim call and call async helper function getAddress
  const geocodingUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
  let address = await getAddress(geocodingUrl);  
  //analyze what kind of response from Nominatim service we got and assign respective location to citycountry variable
  let citycountry=null;
  
  if (address.error!=null) {
    citycountry="Unknown location";
   
  }
  else {
    citycountry = address.address.city+", "+address.address.country;
  }
   
  //clean info area
    document.getElementById("emptymessageWall").innerText = null;
    //retrieve token
    let token = localStorage.getItem("token");
    //get the user data from the server by token
    let messageDiv = document.getElementById("emptymessageWall");
    let req = new XMLHttpRequest();
    req.open("GET", "/users/current", true);
    req.setRequestHeader("Authorization", token)
   
    //req.send();
    req.onreadystatechange =  function(){
      if (req.readyState == 4){
          if (req.status == 200){
            
            let resp = JSON.parse(req.responseText);
            let arr=Object.values(resp);
            let email = arr[2];
            
            //get a message from the textarea
            let  message = document.getElementById("usermessage").value;
            //check if user tries to post empty message
            if (message=="") {document.getElementById("emptymessageWall").innerText = "Please enter a message. Blank messages can't be posted on the wall."}
            else {
            //call the server to post a message and if success, display the message on the wall immediately
           
              
            let req1 = new XMLHttpRequest();
            req1.open("POST", "/post", true);

            req1.setRequestHeader("Authorization", token)
            req1.setRequestHeader("Content-type", "application/json;charset=UTF-8")
            body ={
              message:message,
              email:email,
              location:citycountry,
            }
            
            req1.onreadystatechange =  function(){
              if (req1.readyState == 4){
                  if (req1.status == 200){
                    document.getElementById("Wall").innerHTML += "<li draggable="+"true"+" ondragstart="+"drag(event)"+"> Author: "+email + " Message: "+message+" Location: "+citycountry+"</li><br>"
                    
                  }


                  }
                  else if (req1.status == 401){
                    messageDiv.innerHTML = "Unauthorized! "+req.response;
                  }    
                  else if (req1.status == 400){
                    messageDiv.innerHTML = "Error occurred. Try again. "+req.response;
                  }
                  
            }
            req1.send(JSON.stringify(body));
          }
          }else if (req.status == 401){
              messageDiv.innerHTML = "Unauthorized! "+req.response;
          }    
          else if (req.status == 400){
              messageDiv.innerHTML = "Error occurred. Try again. "+req.response;
          }
      }
    }
    req.send();
    
  }



//function for the Home tab to refresh the wall for the user
//Result: refactored for python backend!
  function reload() {
    document.getElementById("Wall").innerHTML = null;
    let token = localStorage.getItem("token");
    let messageDiv = document.getElementById("feedback");
    let req = new XMLHttpRequest();
    req.open("GET", "users/current/messages", true);
    req.setRequestHeader("Authorization", token)

    req.onreadystatechange =  function(){
      if (req.readyState == 4){
          if (req.status == 200){
            if (req.responseText==""){
              document.getElementById("Wall").innerHTML += "<li>"+"No messages to display"+"</li><br>";
            }
            else {
            let resp = JSON.parse(req.responseText);
            let arr=Object.values(resp);
                        
            let i=0
            for (i=0; i<arr.length;i++) {
              document.getElementById("Wall").innerHTML += "<li draggable="+"true"+" ondragstart="+"drag(event)"+"> Author: "+arr[i].writer+" Message: "+arr[i].message+" Location: "+arr[i].location+"</li><br>";
            }
          }     
            }else if (req.status == 401){
              messageDiv.innerHTML = "Unauthorized! "+req.response;
          }    
          else if (req.status == 400){
              messageDiv.innerHTML = "Something has gone wrong. Try again later. "+req.response;
         }
      }
    }
    req.send();
 }


//function for the Browse Tab which retrieves data and messages for any user that current user wishes to search and look at
//Result: refactored for python backend!
function displayOtherUsersData() {
  //clear all data fields on the page to be able to display new data
  document.getElementById("WallOther").innerHTML = null;
  document.getElementById("personalInfoOther").innerHTML = null;
  document.getElementById("emailerror").innerText  = null;

  let token = localStorage.getItem("token");
  //get email to find from the form on the page
  let emailToSearch = document.getElementById("emailtofind").value;
  let messageDiv = document.getElementById("emailerror");
  let req = new XMLHttpRequest();
  req.open("GET", "/users/find/"+emailToSearch, true);
  req.setRequestHeader("Authorization", token)
 
    
    req.onreadystatechange =  function(){
      if (req.readyState == 4){
          if (req.status == 200){
           
            let resp = JSON.parse(req.responseText);
            let arr=Object.values(resp);
            document.getElementById("personalInfoOther").innerHTML += "<li id="+"otheruseremail"+">"+arr[2]+"</li><br>"+
            "<li>"+arr[4]+"</li><br>"+
            "<li>"+arr[3]+"</li><br>"+
            "<li>"+ arr[5]+"</li><br>"+
            "<li>"+arr[0]+"</li><br>"+
            "<li>"+arr[1]+"</li><br>";  
            reloadOther();           
            }else if (req.status == 401){
              messageDiv.innerHTML = "Unauthorized! "+req.response;

          }    

          else if (req.status == 404){
              messageDiv.innerHTML = "Email not found! "+req.response;

          }

      }
    }
    req.send();

 }

//Starting function for posting a message, first step is to get a geoposition and then call the main posting function
function postOther(){
  let feedback = document.getElementById("feedback");
  //locate the author of the message and if succeful - pass location to showPosition function
  if (navigator.geolocation) {
    
    navigator.geolocation.getCurrentPosition(postOther1,postOther1);
  } else {
    
    feedback.innerHTML = "Geolocation is not supported by this browser.";
  }  
}


//function for the current user to post on the other's user wall from the Browse Tab
//Result: refactored for python backend!
async function postOther1(position) {
   //analyze if any position is returned or an error code is returned
   if (position.code==null){
    latitude=position.coords.latitude;
    longitude=position.coords.longitude;}
    else {
      latitude=null;
      longitude=null;
    }
  
  
   //form URL for Nominatim call and call async helper function getAddress
   const geocodingUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
   let address = await getAddress(geocodingUrl);  
   //analyze what kind of response from Nominatim service we got and assign respective location to citycountry variable
   let citycountry=null;
   
   if (address.error!=null) {
     citycountry="Unknown location";
     
   }
   else {
     citycountry = address.address.city+", "+address.address.country;
   }
   
  document.getElementById("emptymessageWallOther").innerText = null;
  //getting current user's token
  let token = localStorage.getItem("token");
   //get the user data from the server by token
   let messageDiv = document.getElementById("emptymessageWallOther");
   let req = new XMLHttpRequest();
   req.open("GET", "/users/current", true);
   req.setRequestHeader("Authorization", token)
   
   
   req.onreadystatechange =  function(){
     if (req.readyState == 4){
         if (req.status == 200){
           
           let resp = JSON.parse(req.responseText);
           let arr=Object.values(resp);
           let currentuseremail=arr[2];
           let email = document.getElementById("emailtofind").value;
           //get a message from the textarea
           let  message = document.getElementById("usermessageOther").value;
           //check if user tries to post empty message
           if (message=="") {document.getElementById("emptymessageWallOther").innerText = "Please enter a message. Blank messages can't be posted on the wall."}
           else {
           //call the server to post a message and if success, display the message on the wall immediately
           let req1 = new XMLHttpRequest();
           req1.open("POST", "/post", true);
           req1.setRequestHeader("Authorization", token)
           req1.setRequestHeader("Content-type", "application/json;charset=UTF-8")
           body ={
             message:message,
             email:email,
             location:citycountry
           }
           
           req1.onreadystatechange =  function(){
             if (req1.readyState == 4){
                 if (req1.status == 200){
                   document.getElementById("WallOther").innerHTML += "<li draggable="+"true"+" ondragstart="+"drag(event)"+"> Author: "+currentuseremail + " Message: "+message+" Location: "+citycountry+"</li><br>"}
                 }
                 else if (req1.status == 401){
                   messageDiv.innerHTML = "Unauthorized! "+req.response;
                 }    
                 else if (req1.status == 400){
                   messageDiv.innerHTML = "Error occurred. Try again. "+req.response;
                 }
           }
           req1.send(JSON.stringify(body));
         }
         }else if (req.status == 401){
             messageDiv.innerHTML = "Unauthorized! "+req.response;
         }    
         else if (req.status == 400){
             messageDiv.innerHTML = "Error occurred. Try again. "+req.response;
         }
     }
   }
   req.send();

}



//function for the current user to reload the other's user wall at the Browse Tab
//Result: refactored for python backend!
function reloadOther() {
  //clear the wall
  document.getElementById("WallOther").innerHTML = null;
  //retrieve current user token
  let token = localStorage.getItem("token");
  //getting recepient's email from the page  
  let email= document.getElementById("emailtofind").value;

  let messageDiv = document.getElementById("feedback");
  let req = new XMLHttpRequest();
  //getting all messages for the current recepient
  req.open("GET", "user/messages/"+email, true);
  req.setRequestHeader("Authorization", token)
 
  req.onreadystatechange =  function(){
    if (req.readyState == 4){
        if (req.status == 200){
          
          if (req.responseText==""){
            document.getElementById("WallOther").innerHTML += "<li>"+"No messages to display"+"</li><br>";
          }
          else {
          let resp = JSON.parse(req.responseText);
          let arr=Object.values(resp);
                      
          let i=0
          for (i=0; i<arr.length;i++) {
            document.getElementById("WallOther").innerHTML += "<li draggable="+"true"+" ondragstart="+"drag(event)"+"> Author: "+arr[i].name+" Message: "+arr[i].body+" Location: "+arr[i].location+"</li><br>";
          }
        }     
          }else if (req.status == 401){
            messageDiv.innerHTML = "Unauthorized! "+req.response;
        }    
        else if (req.status == 400){
            messageDiv.innerHTML = "Something has gone wrong. Try again later. "+req.response;
       }
    }
  }
  req.send();
  
}

//drag and drop functionality

//what to drag
function drag(ev) {
  console.log(ev.target.innerText);
  ev.dataTransfer.setData("text", ev.target.innerText);

}
//prevent the default handling of the element
function allowDrop(ev) {
  ev.preventDefault();
}
//what to drop
function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  data=data.substring(data.indexOf("Message: ")+9,data.indexOf("Location:"));
  ev.target.innerText=data;
}