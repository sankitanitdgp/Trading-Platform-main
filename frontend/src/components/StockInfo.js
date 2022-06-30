import React, {useEffect, useState} from 'react'
import '../css/StockInfo.css'
import axios from "axios";
import {ClipLoader} from 'react-spinners'
import Cookies from 'js-cookie'
import Chart from "react-google-charts";
import StockInfoPopup from "./StockInfoPopup";
import AlertPopup from "./AlertPopup";

const ROOT_URL = "http://127.0.0.1:5000"

function StockInfo(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [transType,setTransType]=useState('')
    const [buttonPopup, setButtonPopup] = useState(false);
    const [alertButtonPopup, setAlertButtonPopup] = useState(false)
    const [isCandlestickData, setIsCandlestickData] = useState(false);
    const stock = {day_low:0,
                    day_high:0,
                    regular_market_price:0,
                    candlestick:[]};

    const [stockData, setStockData] = useState(stock)

    useEffect(() => {
      if(isLoading){
    axios
    .post(ROOT_URL + "/getStock", {
      ticker_symbol: props.ticker
    })
    .then((response) => {
      if (response.data.status === 'SUCCESS'){
        setIsLoading(false);
        setStockData({day_low: response.data.stock.day_low,
                        day_high: response.data.stock.day_high,
                        regular_market_price: response.data.stock.regular_market_price,
                        candlestick: response.data.candleStick});
        if(response.data.candleStick.length)
          setIsCandlestickData(true);
      } 
    })
    .catch(function (error) {
      console.log(error);
    });
    }}, [props.ticker,isLoading]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await axios
    .post(ROOT_URL + "/addToWatchlist", {
      demat_id: Cookies.get('DematId'),
      stockTicker: props.ticker,
    })
    .then((response) => {
      if (response.data.status === 'SUCCESS'){
          alert("added to watchlist")
      }
      else if(response.data.status==='already in wl'){
        alert("stock already in watchlist!");
      } 
    })
    .catch(function (error) {
      console.log(error);
    });
  };

  function handleBuyClick(){
    setButtonPopup(true)
    setTransType("Buy")
  }

  function handleSellClick(){
    setButtonPopup(true)
    setTransType("Sell")
  }


  var data = [["Time", "Low", "Close", "Open", "High"]];
  for (var i = 0; i < stockData.candlestick.length; i+=parseInt(stockData.candlestick.length/7)){
    data.push(stockData.candlestick[i])
  }
    if(isLoading) {
        return (
        <div className='main-section'>
            <div className='loader'>
                <ClipLoader color='white' size={50}/>
            </div>  
        </div>)
    } else {
        return (<div className='main-section'>
        {isCandlestickData && <div className="candlesticks-chart-div">
          <Chart
            width={'100%'}
            height={450}
            chartType="CandlestickChart"
            loader={<div className='loader'><ClipLoader color='white' size={50}/></div>}
            data={data}
            options={{
              legend: 'none',
              backgroundColor: '#1f2227',
              vAxis: {
                textStyle:{color: '#ddd'}
              },
              hAxis: {
                textStyle:{color: '#ddd'}
              }  
            }}
            rootProps={{ 'data-testid': '1' }}
          />             
        </div>  }
        <div className={isCandlestickData ? 'stock-info-div' : 'stock-info-div-without-graph'}>
          <div className='stock-info-heading'>
            <p>Stock Symbol</p>
            <p>Day Low</p>
            <p>Day High</p>
            <p>Regular Market Price</p>
          </div>
          <div className='stock-info-data'>
            <p>{props.ticker}</p>
            <p>{stockData.day_low}</p>
            <p>{stockData.day_high}</p>
            <p>{stockData.regular_market_price}</p>
          </div>
          
          <button className='stock-info-btn black-font' onClick={handleAdd}>Add to watchlist</button>
          <button className='stock-info-btn black-font' onClick={() => {setAlertButtonPopup(true)}}>Create an alert</button>
          <AlertPopup  marketPrice = {stockData.regular_market_price } ticker = {props.ticker} trigger={alertButtonPopup} setTrigger={setAlertButtonPopup} />
      
          <div className='buy-sell-btn-div'>
            <button className={isCandlestickData ? 'buy-btn' : 'buy-btn buy-btn-without-graph'} onClick={handleBuyClick}>Buy</button>
            <button className={isCandlestickData ? 'sell-btn' : 'sell-btn sell-btn-without-graph'} onClick={handleSellClick}>Sell</button>
          </div>
          
          <StockInfoPopup marketPrice = {stockData.regular_market_price } ticker = {props.ticker} trigger={buttonPopup} setTrigger={setButtonPopup} type={transType}/>
      
         
        </div>
    </div>
    )
    }

}

export default StockInfo