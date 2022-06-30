# Trading Platform

## QuickStart Guide

1. Installing Apache Kafka
	- In your home directory, run the following commands to install Apache Kafka and Zookeeper
	- `wget https://archive.apache.org/dist/zookeeper/zookeeper-3.5.5/apache-zookeeper-3.5.5-bin.tar.gz`
	- `tar -xvf apache-zookeeper-3.5.5-bin.tar.gz`
	- `rm apache-zookeeper-3.5.5-bin.tar.gz`
	- `mkdir apache-zookeeper-3.5.5-bin/data`
	- `wget https://archive.apache.org/dist/kafka/2.3.0/kafka_2.12-2.3.0.tgz`
	- `tar -xzf kafka_2.12-2.3.0.tgz`
	- `rm kafka_2.12-2.3.0.tgz`
	- Now we can start our Kafka Server by running the following from the repository's folder
	- `.backend/event-streaming/starter/start_all.sh`
2. Getting the platform up and running
	- Download the repository
	- Open the `Trading-Platform` folder on terminal
	- Run the following commands in sequence
	- Starting Backend
		- `cd backend`
		- `pip install -r requirements.txt` to install python dependencies
		- `flask run` to start the backend server
	- Starting Frontend
		- `cd ../frontend`
		- `npm install` to install node dependencies
		- `npm start` to start the frontend server
	- Starting Kakfa Producers and consumers
		- `cd ../backend/event-streaming`
		- `python producer.py`
		- `cd consumers`
		- `python TradeMatchingConsumer.py`
		- `python PortfolioUpdateConsumer.py`
		- `python StockUpdateConsumer.py`
	