import '../css/Portfolio.css'
import '../css/MainSection.css'
import { Pie } from 'react-chartjs-2';
import {Chart, ArcElement} from 'chart.js'
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import axios from 'axios'
import TableRow from './TableRow';
import {ClipLoader} from 'react-spinners'
const ROOT_URL = "http://127.0.0.1:5000"

Chart.register(ArcElement);

function Portfolio (props) {
  
  const [stockData,setStockData] = useState([]);
  const [gotData,setGotData] = useState(false);
  const [didSearch,setDidSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidData, setIsValidData] = useState(false);

  const [stockName, setStockName] = useState("");
  const [stockList,setStockList] = useState([{}]);
  const [dataFound, setDataFound] = useState(false);

var xValues = stockData.map((stock)=>{return stock.stockTicker})
var yValues = stockData.map((stock)=>{return stock.number_of_stocks})


var barColors = [
  '#003f5c',
  '#ffa600',
  '#f95d6a',
  '#a05195',
  '#665191',
  '#2f4b7c',
  '#d45087',
  '#ff7c43'
];

  const data = {
        labels: xValues,
        datasets: [{
          backgroundColor: barColors,
          data: yValues
        }]
  }

const options = {
  plugins: {
      title: {
          display: true,
          text: xValues.length?'Stocks you invested in':'',
          color:'#ddd',
          font: {
              size:24,
              weight: 100
          },
          padding:{
              top:30,
              bottom:30
          },
          responsive:true,
          animation:{
              animateScale: true,
          }
      }
  }
}
  useEffect(()=>{
    if(!gotData)
    { 
      axios
  .post(ROOT_URL + "/showPortfolio",{
    demat_id: Cookies.get('DematId')
  })
  .then((response) => {
    if (response.data.status === "SUCCESS"){
        setStockData(response.data.portfolio)
        setGotData(true);
        setIsLoading(false);
    }
    if((response.data.portfolio).length) 
    {
      setIsValidData(true);
    }
  })
  .catch(function (error) {
    console.log(error);
  });
    }
    
    
  },[stockData,gotData]);

  
  function displaySearch(forEach)
  {
    return (
      <TableRow
        key = {forEach.Symbol}
        symbol = {forEach.Symbol}
        first =  {forEach.Name} 
        second = {forEach.Sector} 
        third = {forEach.Symbol} 
        showFourthCol =  {false}
        navigateToStock = {true}
        showDeleteOption = {false}
        onClickFxn = {props.onChangeName}
        setDidSearch = {setDidSearch}
        isAlerts = {false}
      />);
  }

  
  const handleSearch = async (e) =>{
    setIsLoading(true);
    e.preventDefault();
    setDidSearch(true);
    let searchData = {user_input_1 : stockName};
    await axios
    .post(ROOT_URL + "/searchStocks", {user_input : searchData.user_input_1})
    .then((response)=>{
      const len = (response.data.list).length;
      if (len === 0){
       setDataFound(false);
      }
      else if(len){
        setDataFound(true);
        setStockList(response.data.list);
      }
      setIsLoading(false);
    })
  };

  function onClickBackBtn() {
    setDataFound(false);
    setDidSearch(false);
    setGotData(false);
    setIsLoading(true);
    setStockName('')
  }

  function displayPortfolioTable(forEach) { 
    return (
      <TableRow
        key = {forEach.stockTicker}
        symbol = {forEach.stockTicker}
        first =  {forEach.stockTicker} 
        second = {forEach.number_of_stocks} 
        third = {forEach.profit} 
        fourth = {forEach.cost}
        showFourthCol =  {true}
        navigateToStock = {true}
        showDeleteOption = {false}
        onClickFxn = {props.onChangeName}
        setDidSearch = {setDidSearch}
        type = 'portfolio'
      />);
  }
  

  if(isLoading){
    return (
      <div className='main-section'>
        <div className='loader'>
          <ClipLoader color='white' size={50}/>
        </div>  
      </div>
    )
  } else {
  return (
    <div className='main-section'>  
          <div className='search-form-div'>
            <form className="form ">
              <input className="form-control mr-sm-2 search-bar search-stock-input" value = {stockName} onChange={(e) => { setStockName(e.target.value);}} type="search" placeholder="Search for company" aria-label="Search" />
              <button className="search-stock-btn" type="submit" onClick = {handleSearch}>Search</button>
            </form>
          </div>
      {didSearch && <i className="back-btn far fa-arrow-alt-circle-left" onClick={onClickBackBtn} />}
      { didSearch &&  dataFound && 
        <div className='stock-list-table-div'>
          <table className="table table-dark stock-list-table">
          <thead>
            <tr>
              <th className='p-3 '>Name</th>
              <th className='p-3 '>Sector</th>
              <th className='p-3 '>Symbol</th>
            </tr>
            </thead>
            <tbody>
            {stockList.map(displaySearch)}
            </tbody>
          </table>
        </div>
      }

      {didSearch && !(dataFound) && <h3> No data found for {stockName}</h3>}
      
      

      {isValidData && !didSearch ?
        <><h1 className='pb-5 portfolio-heading'>My Portfolio</h1>
        <div className='p-1 portfolio-table-div'> <table className="table table-dark">
          <thead>
            <tr>
              <th className='p-3'>Ticker</th>
              <th className='p-3'>Number of stocks</th>
              <th className='p-3'>Profit/Loss</th>
              <th className='p-3'>Cost</th>
            </tr>
            </thead>
            <tbody>
            {stockData.map(displayPortfolioTable)}
            </tbody>
          </table></div>
          <div className='chart-div'>
          <Pie data={data} options={options}/>
        </div> </> :
        !didSearch && <div className='portfolio-table-div'><h3>Portfolio is empty</h3></div>
        }

    </div>
    
  )
}
}

export default Portfolio;
