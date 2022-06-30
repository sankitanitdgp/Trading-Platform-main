import enum
from socket import socket
from flask import Flask
from flask import request
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
import bcrypt
import yfinance as yf
import json
import string
import re
import uuid
import random
from kafka import KafkaProducer
from datetime import datetime
from pprint import pprint
from flask_mail import Mail, Message
from flask_socketio import *
import base64

encoded_password ="cGFzczE="
encoded_password_bytes = encoded_password.encode("ascii")
mongo_password_bytes = base64.b64decode(encoded_password_bytes)
mongo_password = mongo_password_bytes.decode("ascii")

app = Flask(__name__)
cors = CORS(app, resources={
            r"*": {"origins": "http://localhost:3000"}})
socketio = SocketIO(app, cors_allowed_origins="*")

client = MongoClient("mongodb+srv://user1:" + mongo_password + "@cluster0.4vqjg.mongodb.net/?retryWrites=true&w=majority")
db = client.get_database('total_records')
user_profile = db.user_profile # {demat, username, passwordHash, email, walletBalance}
user_watchlist = db.user_watchlist # {demat, watchlist: []}
user_portfolio = db.user_portfolio # {demat, portfolio: []}
user_transactions = db.user_transactions # {demat, transactions: []}
user_alerts = db.user_alerts # {demat, alerts}
user_dailyupdates = db.user_dailyupdates # {demat, profit, portfolioValue}
user_notifications = db.user_notifications
stock_alerts = db.stock_alerts # {stock, alert_list: [user, config]}
stock_live = db.stock_live # {}
stock_table = db.stock_table
socket_id = db.socket_id   

our_stocks = ['AAPL', 'NFLX', 'WFC', 'GOOGL', 'MSFT']
otp_list = []

mail = Mail(app)

encoded_password ="ZGdjYmxteGZucGVyd2V0dA=="
encoded_password_bytes = encoded_password.encode("ascii")
mail_password_bytes = base64.b64decode(encoded_password_bytes)
mail_password = mail_password_bytes.decode("ascii")

app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'trading.platform.wf@gmail.com'
app.config['MAIL_PASSWORD'] = mail_password
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)

@app.route('/sendOtp', methods=['POST', 'GET'])
@cross_origin()
def send_mail():
    data = request.json
    email = data['email']
    username = data['username']
    print(email)
    otp = random.randint(100000,999999)
    print(otp)
    otp_list.append({'email': email, 'otp': str(otp)})

    found_user_username = user_profile.find_one({"username": username})
    found_user_email = user_profile.find_one({"email": email})
    # print(found_user)
    if found_user_username or found_user_email:
        print('inside if')
        response = {"status": "ALREADY EXISTS"}
        return response

    msg = Message(
                    'OTP for sign up',
                    sender ='trading.platform.wf@gmail.com',
                    recipients = [email]
                )
    msg.body = 'OTP for sign up is ' + str(otp)
    mail.send(msg)
    return {'status': "SUCCESS"}

@app.route('/signup', methods=['POST'])
@cross_origin()
def signup():
    print(request.json)
    data = request.json
    name = data["name"]
    username = data["username"]
    password = data["password"]
    email = data["email"]
    otp = data["otp"]

    for item in otp_list:
        if item['email'] == email and item['otp'] != otp:
            return {"status": "FAILURE"}

    for i,item in enumerate(otp_list):
        if item['email'] == email:
            otp_list.pop(i)

    demat_id = str(uuid.uuid4())
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    print("password is", password)
    profile_input = {'demat_id': demat_id,'name': name ,'username': username, 'email': email, 'password': hashed_password, 'walletBalance': 0}
    portfolio_input = {'demat_id': demat_id, 'portfolio': []}
    watchlist_input = {'demat_id': demat_id, 'watchlist': []}
    transaction_input = {'demat_id': demat_id, 'transactions': []}
    alert_input = {'demat_id': demat_id, 'alerts': []}
    dailyUpdate_input = {'demat_id': demat_id, 'profit': [], 'portfolioValue': []}
    socket_input = {'demat_id': demat_id, "sid":""}
    notification_input = {'demat_id': demat_id, "notifications": []}

    user_profile.insert_one(profile_input)
    user_watchlist.insert_one(watchlist_input)
    user_portfolio.insert_one(portfolio_input)
    user_alerts.insert_one(alert_input)
    user_transactions.insert_one(transaction_input)
    user_dailyupdates.insert_one(dailyUpdate_input)
    socket_id.insert_one(socket_input)
    user_notifications.insert_one(notification_input)

    response = {"status": "SUCCESS", "demat_id": demat_id}
    return response

def mongo_call(username):
    found_user = user_profile.find_one({"username": username})
    return found_user

@app.route('/login', methods=['POST'])
@cross_origin()
def login():
    print(request.json)
    data = request.json
    username = data["username"]
    password = data["password"]

    found_user = mongo_call(username)
    # found_user = user_profile.find_one({"username": username})
    print(found_user)
    if found_user != None:
        passwordcheck = found_user['password']
        
        if bcrypt.checkpw(password.encode('utf-8'), passwordcheck):
            return {"status": "SUCCESS", "demat_id": found_user["demat_id"]}
        else:
            return {"status": "INVALID PASSWORD"}

    else:
        return {"status": "INVALID USERNAME"}


@app.route('/getUserAccount', methods=['POST', 'GET'])
@cross_origin()
def getUserAccount():
    data = request.json
    demat_id = data["demat_id"]
    found_user = user_profile.find_one({"demat_id": demat_id})
    if not found_user:
        return {"status": "FAILURE"}
    userProfile = {"demat_id": demat_id, "name": found_user["name"] ,"username": found_user["username"], "email": found_user["email"], "walletBalance": found_user["walletBalance"]}
    return {"status": "SUCCESS", "userProfile": userProfile}

@app.route('/addToWallet', methods=['POST', 'GET'])
@cross_origin()
def addToWallet():
    data = request.json
    demat_id = data["demat_id"]
    amount = float(data["amount"])
    found_user = user_profile.find_one({"demat_id": demat_id})
    oldAmount = float(found_user["walletBalance"])
    newAmount = oldAmount + amount
    myquery = { "demat_id": demat_id }
    newvalues = { "$set": { "walletBalance": float(newAmount) } }
    user_profile.update_one(myquery, newvalues)
    return {"status" : "SUCCESS"}




#user_info is the name of the collection
@app.route('/userAccount', methods=['POST', 'GET'])
@cross_origin()
def show_user_account():
    print(request.json)
    data = request.json
    demat_id = data["demat_id"]
    found_user = user_profile.find_one({"demat_id": demat_id})
    if found_user:
        response = {"status": "SUCCESS", "username": found_user["username"], "email": found_user["email"], "balance": found_user["balance"]}
        return response
    response = {"status": "INVALID USERNAME"} 
    return response

@app.route('/editProfile', methods=['POST', 'GET'])
@cross_origin()
def editProfile():
    data = request.json
    print(data)
    demat_id = data['demat_id']
    username = data["username"]
    oldPassword = data['oldPassword']
    newPassword = data['newPassword']
    found_user = user_profile.find_one({"demat_id": demat_id})
    response = {'username_status': ''}
    if username != '':
        found_user_name = user_profile.find_one({'username': username})
        if found_user_name:
            response['username_status'] = 'Already Exists'
        else:
            myquery = { "demat_id": demat_id }
            newvalues = { "$set": { "username": username } }
            user_profile.update_one(myquery, newvalues)
            response['username_status'] = 'Success'
    
    if newPassword != '':
        if bcrypt.checkpw(oldPassword.encode('utf-8'), found_user['password']):
            myquery = { "demat_id": demat_id }
            newPasswordHash = bcrypt.hashpw(newPassword.encode('utf-8'), bcrypt.gensalt())
            newPass = { "$set": { "password": newPasswordHash } }
            user_profile.update_one(myquery, newPass)
            response['password_status'] = 'Success'
        else:
            response['password_status'] = 'incorrect old password'
    elif oldPassword != '':
        response['password_status'] = 'new passsword empty'

    return response


@app.route('/showWatchlist', methods=['POST', 'GET'])
@cross_origin()
def showWatchlist():
    data = request.json
    demat_id = data["demat_id"]

    
    # mystocks = ['MSFT','FB','GOOGL']
    found_user = user_watchlist.find_one({'demat_id': demat_id})
    myStocks = found_user["watchlist"]
    print(myStocks)
    stockdata = []
    for item in myStocks:
        print("In while loop", item)
        if item in our_stocks:
            max = 0
            min = 1000000000
            current_value = stock_table.find({"symbol" : item}).sort([("time", -1)]).limit(390)
            for value in current_value:
                if float(value["high"]) > max:
                    max = float(value["high"])
                if float(value["low"]) < min:
                    min = float(value["low"])

            current_value = stock_table.find({"symbol" : item}).sort([("time", -1)]).limit(1)
            # current_value = stock_table.find_one({"symbol" : "NFLX"}).sort({"time":-1})
            print("The cursor is", current_value)
            for value in current_value:
                print("current xyz is ", value["open"])
                stock = {
                    # 'name': long_name,
                    'symbol' : value["symbol"],
                    'market_price' : round(float(value["open"]),2),
                    'day_high' : round(max,2) ,
                    'day_low' : round(min,2)
                }
            # print("entered mongo")
            # current_value = stock_table.find({"symbol" : item}).sort([("time", -1)]).limit(1)
            # print("The cursor is", current_value)
            # for value in current_value:
            #     stock = {
            #         'symbol' : value["symbol"],
            #         'market_price' :round(float(value["open"]),2),
            #         'day_high' : round(float(value["high"]),2) ,
            #         'day_low' : round(float(value["low"]),2)
            #     }
        else:    
            stock_info = yf.Ticker(item).info
            market_price = stock_info['regularMarketPrice']
            day_High = stock_info['dayHigh']
            day_Low  = stock_info['dayLow']
            stock = {
                'symbol' : item,
                'market_price' : market_price ,
                'day_high' : day_High ,
                'day_low' : day_Low ,
            }
        stockdata.append(stock)
    print(stockdata)
    return {"status": "SUCCESS", "watchlist": stockdata}

@app.route('/addToWatchlist', methods=['POST', 'GET'])
@cross_origin()   
def addToWatchlist():
    data = request.json
    demat_id = data["demat_id"]
    ticker = data["stockTicker"]

    found_user = user_watchlist.find_one({'demat_id': demat_id})
    watchlist = found_user['watchlist']
    if (ticker not in watchlist):
        myquery = { "demat_id": demat_id }
        newvalues = { "$push": { "watchlist": ticker } }
        user_watchlist.update_one(myquery, newvalues)
        return {"status": "SUCCESS"}
    else:
        return {"status":"already in wl"}    

@app.route('/deleteFromWatchlist', methods=['POST', 'GET'])
@cross_origin()
def deleteFromWatchlist():
    data = request.json
    demat_id = data["demat_id"]
    stockTicker = data["stockTicker"]
    found_user = user_watchlist.find_one({"demat_id":demat_id})
    watchlist = found_user["watchlist"]
    for i, stock in enumerate(watchlist): 
        print(stock)
        if stock == stockTicker:
            watchlist.pop(i)
            break

    myquery = { "demat_id": demat_id }
    newvalues = { "$set": { "watchlist": watchlist } }
    user_watchlist.update_one(myquery, newvalues)    
    return {"status": "SUCCESS", 'watchlist': watchlist}
    
@app.route('/addAlert', methods=['POST', 'GET'])
@cross_origin()
def addAlert():
    print("here")
    data = request.json
    demat_id = data["demat_id"]
    stockTicker = data["stockTicker"]
    if stockTicker not in our_stocks:
        return {"status": "stock not in our list"}
    alert_id = str(uuid.uuid4())    
    price = data["price"]
    currentPrice = data["currentPrice"]
    isGreater = (float(price) > float(currentPrice))
    print (price, currentPrice, isGreater)
    alert = {"alert_id": alert_id, "demat_id": demat_id, "stock": stockTicker, "price": price, "isGreater": isGreater}

    #update in user's alerts
    myquery = { "demat_id": demat_id }
    newvalues = { "$push": { "alerts": alert } }
    user_alerts.update_one(myquery, newvalues)

    #update in stock's alerts
    found_stock = stock_alerts.find_one({"stockTicker": stockTicker})
    if not found_stock: 
        stock_alerts.insert_one({"stockTicker": stockTicker, "alerts": []})

    myquery = { "stockTicker": stockTicker }
    newvalues = { "$push": {"alerts": alert}}

    stock_alerts.update_one(myquery, newvalues)
    return {"status": "SUCCESS"}

@app.route('/showAlerts', methods=['POST', 'GET'])
@cross_origin()
def showAlerts():
    data = request.json
    demat_id = data["demat_id"]
    found_user = user_alerts.find_one({"demat_id": demat_id})
    return {"status": "SUCCESS", "alerts": found_user["alerts"]}


@app.route('/deleteAlert', methods=['POST', 'GET'])
@cross_origin()
def deleteAlert():
    data = request.json
    status = "FAILURE"
    demat_id = data["demat_id"]
    alert_id = data["alert_id"]
    stockTicker = data["stockTicker"]
    found_user = user_alerts.find_one({"demat_id": demat_id})
    alert_list = found_user["alerts"]
    deleted = False
    for i, item in enumerate(alert_list):
        if item["alert_id"] == alert_id:
            alert_list.pop(i)
            deleted = True
            break
    
    if deleted:
        myquery = {"demat_id" : demat_id}
        newvalues = {"$set": {"alerts": alert_list}}
        user_alerts.update_one(myquery, newvalues)
        status = "SUCCESS"
        
   
    found_stock = stock_alerts.find_one({"stockTicker": stockTicker})
    alert_list = found_stock["alerts"]
    deleted = False
    for i, item in enumerate(alert_list):
        if item["alert_id"] == alert_id:
            print("here")
            alert_list.pop(i)
            deleted = True
            break
    
    if deleted:
        myquery = {"stockTicker" : stockTicker}
        newvalues = {"$set": {"alerts": alert_list}}
        stock_alerts.update_one(myquery, newvalues)
        status = "SUCCESS"

    

    return {"status" : status}

@app.route('/showPortfolio', methods=['POST', 'GET'])
@cross_origin()
def showPortfolio():
    data = request.json
    #print("data :",data)
    demat_id = data["demat_id"]
    found_user = user_portfolio.find_one({'demat_id': demat_id})
    #print("MY_USER : ",found_user)
    myStocks = found_user["portfolio"]

    profit = []
    value = []
    for stock in myStocks:

        current_value = stock_table.find({"symbol" : stock["stockTicker"]}).sort([("time", -1)]).limit(1)
        print("The cursor is", current_value)
        for curvalue in current_value:
            close = float(curvalue["close"])
            stock["value"] = round(close, 2)
            stock["profit"]= round(((stock["number_of_stocks"] * close) - stock["cost"]), 2)

    return {"status": "SUCCESS", "portfolio": myStocks}



@app.route('/showTransaction', methods=['POST', 'GET'])
@cross_origin()
def showTransaction():
    data = request.json
    demat_id = data["demat_id"]
    found_user = user_transactions.find_one({'demat_id': demat_id})
    myStocks = found_user["transactions"]
    print("MYSTOCKS",myStocks)
    return {"status": "SUCCESS", "transactions": myStocks}
    



def generate_regex_list(user_input):
    text = user_input.lower()
    text_list = text.split()
    regex_list = []

    for word in text_list:
        regex_list.append(".*" + word + ".*")

    return regex_list

#send a string and get list of relevant stocks
@app.route('/searchStocks', methods=['POST', 'GET'])
@cross_origin()
def search_for_stocks():
    data = request.json
    user_input= data["user_input"]
    print(user_input)
    f = open('constituents.json')
    data = json.load(f)
    regex_list = generate_regex_list(user_input)
    response = []

    for item in data:
        for reg in regex_list:
            if re.search(reg, item["Name"].lower()) != None or re.search(reg, item["Symbol"].lower()) != None:
                response.append(item)
                break
    

    f.close()
    print(response)
    return {"list": response}

@app.route('/getCandleStickData', methods=['POST', 'GET'])
@cross_origin()
def get_candlestick_info():
    data = request.json
    ticker_symbol= data["ticker_symbol"]
    
    stock = []

    if ticker_symbol in our_stocks:
        print("entered mongo")
        current_value = stock_table.find({"symbol" : ticker_symbol}).sort([("time", -1)])
        # current_value = stock_table.find_one({"symbol" : "NFLX"}).sort({"time":-1})
        print("The cursor is", current_value)
        for value in current_value:
            stock.append([
                # 'name': long_name,
                value["time"],
                value["low"],
                value["close"],
                value["open"], 
                value["high"]])
    else:    
        stock_info = yf.Ticker(ticker_symbol).info
        #    long_name = stock_info['longName']
        market_price = stock_info['regularMarketPrice']
        day_High = stock_info['dayHigh']
        day_Low  = stock_info['dayLow']
        stock = {
            'symbol' : ticker_symbol,
            'regular_market_price' : market_price ,
            'day_high' : day_High ,
            'day_low' : day_Low ,
        }
    #with open('stock_data_file.json', 'w') as f:
    #   json.dump(stockdata, f)
    print(stock)
    response = {"status": "SUCCESS", "stock": stock}
    
    return response

#send a ticker symbol and get that stocks info
@app.route('/getStock', methods=['POST'])
@cross_origin()
def get_stock_info():
    data = request.json
    ticker_symbol= data["ticker_symbol"]
    print("stock is ", ticker_symbol)
    stock = {}
    candlestickvalues = []

    if ticker_symbol in our_stocks:
        print("entered mongo")
        max = 0
        min = 1000000000
        current_value = stock_table.find({"symbol" : ticker_symbol}).sort([("time", -1)]).limit(390)
        for value in current_value:
            if float(value["high"]) > max:
                max = float(value["high"])
            if float(value["low"]) < min:
                min = float(value["low"])

        current_value = stock_table.find({"symbol" : ticker_symbol}).sort([("time", -1)]).limit(1)
        # current_value = stock_table.find_one({"symbol" : "NFLX"}).sort({"time":-1})
        print("The cursor is", current_value)
        for value in current_value:
            stock = {
                # 'name': long_name,
                'symbol' : value["symbol"],
                'regular_market_price' : round(float(value["open"]),2),
                'day_high' : round(max,2) ,
                'day_low' : round(min,2)
            }
        current_value = stock_table.find({"symbol" : ticker_symbol}).sort([("time", -1)]).limit(390)
        # current_value = stock_table.find_one({"symbol" : "NFLX"}).sort({"time":-1})
        print("The cursor is", current_value)
        for value in current_value:
            
            candlestickvalues.insert(0,[
                # 'name': long_name,
                value["time"][10:16],
                float(value["low"]),
                float(value["close"]),
                float(value["open"]), 
                float(value["high"])])
    else:    
        stock_info = yf.Ticker(ticker_symbol).info
        print("entered YF for", ticker_symbol)
        #    long_name = stock_info['longName']
        market_price = stock_info['regularMarketPrice']
        day_High = stock_info['dayHigh']
        day_Low  = stock_info['dayLow']
        stock = {
            'symbol' : ticker_symbol,
            'regular_market_price' : market_price ,
            'day_high' : day_High ,
            'day_low' : day_Low ,
        }
    #with open('stock_data_file.json', 'w') as f:
    #   json.dump(stockdata, f)
    # print(stock, candlestickvalues)
    print("unit testing", type(candlestickvalues) == list)
    response = {"status": "SUCCESS", "stock": stock, "candleStick": candlestickvalues}
    
    return response

#get a list of all stocks and their tickers
@app.route('/getAllStocks', methods=['POST', 'GET'])
@cross_origin()
def get_all_stocks():
    f = open('constituents.json')
    data = json.load(f)

    response = []
    for item in data:
        response.append({"Name": item["Name"], "Ticker_Symbol": item["Symbol"]})

    f.close()
    return {"list": response}

@app.route('/buyStock',methods=['POST','GET'])
@cross_origin()
def buyStock():
    data=request.json
    print(data)
    stockCode=data["stockCode"]
    demat_id= data["demat_id"]
    num= int(data["number"])
    maxPrice=int(data["maxPrice"])
    costNeeded = num * maxPrice

    found_user = user_profile.find_one({"demat_id": demat_id})
    if costNeeded > float(found_user["walletBalance"]):
        return {"status" : "INSUFFICIENT BALANCE"}

    time=datetime.now()
    # try:
    producer=KafkaProducer(bootstrap_servers='localhost:9092', value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8'))
    # value = {
    #             "orderId":orderId,
    #             "stockCode":stockCode,
    #             "number":number,
    #             "maxPrice":maxPrice
    #         }
    producer.send('tradesTopic',    value={
                                            "dematId":demat_id,
                                            "tradeType":"Buy",
                                            "stockCode":stockCode,
                                            "num":num,
                                            "maxPrice":maxPrice,
                                            "time":time
                                        })
    # except:
    #     return {"status":"FAIL","value":"Kafka error"}
    return {"status":"SUCCESS","value":"Successfully sent to Kafka"}

@app.route('/sellStock',methods=['POST','GET'])
@cross_origin()
def sellStock():
    data=request.json
    print(data)
    stockCode=data["stockCode"]
    demat_id=data["demat_id"]
    num= int(data["number"])
    minPrice= int(data["minPrice"])
    time=datetime.now()
    if num <1:
        return {"status":"FAIL","value":"Cant trade 0 stocks"}

    found_user = user_portfolio.find_one({"demat_id": demat_id})
    portfolio = found_user["portfolio"]

    foundStock = False
    for i, item in enumerate(portfolio):
        if item["stockTicker"] ==  stockCode :
            foundStock = True
            if int(item["number_of_stocks"]) < num:
                return {"status": "INSUFFICIENT NUMBER OF STOCKS"}
            else:
                break
        
    if foundStock == False:
        return {"status" : "STOCK NOT IN PORTFOLIO"}

    # try:
    producer=KafkaProducer(bootstrap_servers='localhost:9092', value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8'))
    producer.send('tradesTopic',value={
        "dematId":demat_id,
        "tradeType":"Sell",
        "stockCode":stockCode,
        "num":num,
        "minPrice":minPrice,
        "time":time
    })
    # except:
        # return {"status":"FAIL","value":"Kafka error"}
    return {"status":"SUCCESS","value":"Successfully sent to Kafka"}

def getMetrics(stockCode):
    tickerData=yf.Ticker(stockCode)
    forwardEps=tickerData.info['forwardEps']
    sharePrice=tickerData.info['regularmarketprice']
    forwardPE=sharePrice/forwardEps
    trailingEps=tickerData.info['trailingEps']
    trailingPE=sharePrice/trailingEps
    bvps=tickerData.info['bookValue']/tickerData.info['outstandingShares']
    PBratio=sharePrice/bvps
    
    return

def computePortfolio(dematId):
    # data=request.json
    # print(data)
    # dematId=data["demat_id"]
    found_user = user_portfolio.find_one({'demat_id': dematId})
    #print("MY_USER : ",found_user)
    myStocks = found_user["portfolio"]
    profit = 0
    value = 0
    for stock in myStocks:

        current_value = stock_table.find({"symbol" : stock["stockTicker"]}).sort([("time", -1)]).limit(1)
        # current_value = stock_table.find_one({"symbol" : "NFLX"}).sort({"time":-1})
        # print("The cursor is", current_value)
        for curvalue in current_value:
            close = float(curvalue["close"])
            value += stock["number_of_stocks"] * close
            profit += ((stock["number_of_stocks"] * close) - stock["cost"])
    found_user = user_profile.find_one({"demat_id": dematId})
    value += float(found_user["walletBalance"])
    return profit, value


@app.route('/getAnalytics',methods=['POST','GET'])
@cross_origin()
def getAnalytics():
    data=request.json
    # print(data)

    demat_id=data["demat_id"]
    found_user = user_profile.find_one({"demat_id": demat_id})
    balance = found_user["walletBalance"]
    profit, value = computePortfolio(demat_id)
    current_value = user_dailyupdates.find_one({"demat_id" : demat_id})
    profitArray = current_value["profit"][-7:]
    valueArray = current_value["portfolioValue"][-7:]
    return  {
                "status": "SUCCESS",
                "profitArray": profitArray, 
                "valueArray": valueArray,
                "profit": round(profit, 2),
                "balance": round(balance, 2),
                "value": round(value, 2)
            }

def send_email(demat_id, message, subject):
    # print(found_user)

    found_user = user_profile.find_one({"demat_id": demat_id})

    msg = Message(
                    subject,
                    sender ='trading.platform.wf@gmail.com',
                    recipients = [found_user["email"]]
                )
    msg.body = message
    mail.send(msg)
    return {'status': "SUCCESS"}                         



@app.route('/addSocketId',methods=['GET', 'POST'])
@cross_origin()
def addSocketId():
    data = request.json
    
    found_sid = socket_id.find_one_and_update({"demat_id": data["demat_id"]},
                        { '$set': { "sid" : data["sid"]} })
    # socket_id.insert_one({"sid": data["sid"], :})
    return {"status": "SUCCESS"}

# SocketIO Events
@socketio.on('connect')
def connected(request):
    print('Connected', request)

@socketio.on('disconnect')
def disconnected():
    print('Disconnected')

# @socketio.on('UserAdded')
@app.route('/pingReact',methods=['GET', 'POST'])
@cross_origin()
def pingReact():
    print(request)
    data=request.json
    message=data["message"]
    print('Sending Message to Frontend')
    found_id = socket_id.find_one({"demat_id": data["demat_id"]})
    print("sid is", found_id["sid"])
    socketio.emit('notifications', {'data': message}, broadcast=True, room=found_id["sid"])
    myquery = { "demat_id": data["demat_id"] }
    newvalues = { "$push": { "notifications": {"message": message, "time": datetime.now()}} }
    user_notifications.update_one(myquery, newvalues)
    return {"status": "SUCCESS"}

@app.route('/getNotifications',methods=['GET', 'POST'])
@cross_origin()
def getNotifications():
    data=request.json
    found_notifications = user_notifications.find_one({"demat_id": data["demat_id"]})
    return {"status": "SUCCESS", "notifications": found_notifications["notifications"][-10:]}

if __name__=="__main__":
    app.run(debug=True)
    socketio.run(app, debug=True)
