from selenium import webdriver
import pytest
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from time import sleep
import random
import string

testusername="elech608@liu.se"
testpassword="222222"
testwrongpassword="2222225"
testanotheruser="elech608@liu.no"
testnewusergender="Female"
testnewuserfirstname="Elena"
testnewuserlastname="Chuyan"
testnewusercity="Stockholm"
testnewusercountry="Sweden"


#Test Case 1 - Login with correct user credentials
def test_login_correct_credentials():

    driver = webdriver.Chrome('./chromedriver')
    driver.get("http://127.0.0.1:5000")
    print(driver.title)
    username = driver.find_element(by=By.ID,value="email")
    password = driver.find_element(by=By.ID,value="password")
    submit   = driver.find_element(by=By.ID,value="submit")
    username.send_keys(testusername)
    password.send_keys(testpassword)

    submit.click()
    sleep(5)
    persInfo   = driver.find_element(by=By.ID,value="persinf")
    assert persInfo.is_displayed()
    
    driver.close()

#Test Case 2 - Login with incorrect user credentials
def test_login_incorrect_credentials():

    driver = webdriver.Chrome('./chromedriver')
    driver.get("http://127.0.0.1:5000")
    print(driver.title)
    username = driver.find_element(by=By.ID,value="email")
    password = driver.find_element(by=By.ID,value="password")
    submit   = driver.find_element(by=By.ID,value="submit")
    username.send_keys(testusername)
    password.send_keys(testwrongpassword)

    submit.click()
    sleep(1)
    feedback   = driver.find_element(by=By.ID,value="feedback").text
    assert feedback=="No such user!"
    
    driver.close()

#Test Case 3 - Post a message, validate its appearance on the wall
def test_post_message():

    driver = webdriver.Chrome('./chromedriver')
    driver.get("http://127.0.0.1:5000")
    print(driver.title)
    username = driver.find_element(by=By.ID,value="email")
    password = driver.find_element(by=By.ID,value="password")
    submit   = driver.find_element(by=By.ID,value="submit")
    username.send_keys(testusername)
    password.send_keys(testpassword)

    submit.click()
    sleep(3)
    usermessage   = driver.find_element(by=By.ID,value="usermessage")
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(64))
    usermessage.send_keys(result_str)
    postbutton=driver.find_element(by=By.ID,value="selfPost")
    postbutton.click()
    sleep(1)
    
    post = driver.find_element(by=By.XPATH,value="//li[contains(., result_str)]")
    assert post.is_displayed()
    driver.close()



#Test Case 4 - Search another user, check that their info appeared
def test_search_another_user():

    driver = webdriver.Chrome('./chromedriver')
    driver.get("http://127.0.0.1:5000")
    print(driver.title)
    username = driver.find_element(by=By.ID,value="email")
    password = driver.find_element(by=By.ID,value="password")
    submit   = driver.find_element(by=By.ID,value="submit")
    username.send_keys(testusername)
    password.send_keys(testpassword)

    submit.click()
    sleep(2)

    browsebutton=driver.find_element(by=By.ID,value="BrowseButton")
    browsebutton.click()
    sleep(1)
    searchfield= driver.find_element(by=By.ID,value="emailtofind")
    searchfield.send_keys(testanotheruser)
    findbutton=driver.find_element(by=By.ID,value="findotheruser")
    findbutton.click()
    sleep(1)

    useremailli = driver.find_element(by=By.ID,value="otheruseremail")
    assert useremailli.is_displayed()
    assert useremailli.text==testanotheruser
    
    driver.close()

#Test Case 5 - Test registering a user
def test_register_user():

    driver = webdriver.Chrome('./chromedriver')
    driver.get("http://127.0.0.1:5000")
    print(driver.title)
    firstname = driver.find_element(by=By.ID,value="firstname")
    familyname = driver.find_element(by=By.ID,value="familyname")
    gender = driver.find_element(by=By.ID,value="gender")
    city = driver.find_element(by=By.ID,value="city")
    country = driver.find_element(by=By.ID,value="country")
    email = driver.find_element(by=By.ID,value="emailsignup")
    password = driver.find_element(by=By.ID,value="passwordsignup")
    repeatpassword = driver.find_element(by=By.ID,value="repeatpassword")
    
    submit1   = driver.find_element(by=By.ID,value="submit1")

    firstname.send_keys(testnewuserfirstname)
    familyname.send_keys(testnewuserlastname)
    gender.send_keys(testnewusergender)
    city.send_keys(testnewusercity)
    country.send_keys(testnewusercountry)
    letters = string.ascii_lowercase
    random_email = ''
    for x in range(10):
       random_email+=''.join(random.choice(string.ascii_lowercase))
    random_email += '@gmail.com'
    email.send_keys(random_email)
    password.send_keys(testpassword)
    repeatpassword.send_keys(testpassword)
    submit1.click()
    sleep(3)
    feedback   = driver.find_element(by=By.ID,value="feedback").text
    assert feedback=="User Created!"

    username = driver.find_element(by=By.ID,value="email")
    password = driver.find_element(by=By.ID,value="password")
    submit   = driver.find_element(by=By.ID,value="submit")
    username.send_keys(random_email)
    password.send_keys(testpassword)

    submit.click()
    sleep(2)
    
    useremailli = driver.find_element(by=By.ID,value="currentuseremail")
    
    assert useremailli.is_displayed()
    assert useremailli.text==random_email
    
    driver.close()