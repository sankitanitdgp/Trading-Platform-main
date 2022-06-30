import ast
from kafka import KafkaConsumer
from util.config import config,path
from pymongo import MongoClient
from flask import Flask
from flask_mail import Mail, Message
import requests

import os, sys

ROOT_URL = "http://localhost:5000"

def access_root_dir(depth = 1):
    current_dir = os.path.dirname(os.path.realpath(__file__))
    parent_dir = os.path.dirname(current_dir)
    args: list = [parent_dir]
    for _ in range(depth):
        args.append('..')
    
    rel_path = os.path.join(*args)
    sys.path.append(rel_path) 

# At the top of test_first.py
access_root_dir(2)
from backend.app import app
from backend.app import send_email

client = MongoClient("mongodb+srv://user1:pass1@cluster0.4vqjg.mongodb.net/?retryWrites=true&w=majority")
db = client.get_database('total_records')
stock_table = db.stock_table
user_profile = db.user_profile
stock_alerts = db.stock_alerts
user_alerts = db.user_alerts



consumer = KafkaConsumer(
                        config['topic_name2'],
                        bootstrap_servers=config['kafka_broker'])   

def deleteAlert(demat_id, alert_id, stockTicker):
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

for msg in consumer:
    dict_data=ast.literal_eval(msg.value.decode("utf-8"))
    print(dict_data)
    stock_table.insert_one(dict_data)

    found_alerts = stock_alerts.find_one({"stockTicker": dict_data["symbol"]})
    if found_alerts:
        print("alert", dict_data["symbol"], "found")
        alert_list = found_alerts["alerts"]
        for alert in alert_list:
            print("in for loop")
            if alert["isGreater"]:
                print("is greater")
                if float(dict_data["open"]) >= float(alert["price"]):
                    app_ctx = app.app_context()
                    app_ctx.push()
                    send_email(alert["demat_id"], "The price of " + alert["stock"] + " has gone above " + alert["price"] + " per share!", 'New Stock Price Alert')
                    app_ctx.pop()
                    data = {
                            "message": "The price of " + alert["stock"] + " has gone above " + alert["price"] + " per share!",
                            "demat_id": alert["demat_id"]
                            }
                    requests.post(url= ROOT_URL+"/pingReact", json=data)
                    deleteAlert(alert["demat_id"], alert["alert_id"], alert["stock"])

            else:
                print("is not greater")
                if float(dict_data["open"]) <= float(alert["price"]):
                    app_ctx = app.app_context()
                    app_ctx.push()
                    send_email(alert["demat_id"], "The price of " + alert["stock"] + " has gone below " + alert["price"] + " per share!", 'New Stock Price Alert')
                    app_ctx.pop()
                    data = {
                            "message": "The price of " + alert["stock"] + " has gone below " + alert["price"] + " per share!",
                            "demat_id": alert["demat_id"]
                            }
                    requests.post(url= ROOT_URL+"/pingReact", json=data)
                    deleteAlert(alert["demat_id"], alert["alert_id"], alert["stock"])

    print(str(dict_data['time']))



