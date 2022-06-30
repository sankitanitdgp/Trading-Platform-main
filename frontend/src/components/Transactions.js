import React, { useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import '../css/Transactions.css'
import '../css/MainSection.css'
import TableRow from './TableRow';
import axios from 'axios'
import Cookies from 'js-cookie'
import {ClipLoader} from 'react-spinners'

const ROOT_URL = "http://127.0.0.1:5000"

function Transactions(props) {
  const [stockData,setStockData] = useState([]);
  const [gotData,setGotData] = useState(false);
  const [validData,setValidData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  let navigate = useNavigate();

  
function display(forEach)
{
  return (
  <TableRow 
    symbol = {forEach.stockCode}
    first = {forEach.stockCode}
    second =  {forEach.num} 
    third = {forEach.type}
    fourth = {forEach.price} 
    showFourthCol = {true}
    navigateToStock = {true}
    showDeleteOption = {false}
    isAlerts = {false}
    onClickFxn = {props.onChangeName}
    type = 'transactions'
  />);
}

useEffect(()=>{
  
  if(!gotData)
  { 
    axios
.post(ROOT_URL + "/showTransaction",{
  demat_id: Cookies.get('DematId')
})
.then((response) => {
  if (response.data.status === "SUCCESS"){
      setStockData(response.data.transactions.reverse())
      setGotData(true);
      setIsLoading(false);
  }
  if((response.data.transactions).length)
    setValidData(true);
  
})
.catch(function (error) {
  console.log(error);
});
  
}
  
},[stockData,gotData]);
  
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
    <div className='main-section transactions'>
      <h1 className='pb-5 section-heading'>My Transactions</h1>
      <div className='p-1 transactions-table-div'>
      {validData && <table className="table table-dark">
      <thead>
        <tr>
          
          <th className='p-3 '>Ticker</th>
          <th className='p-3 '>Number</th>
          <th className='p-3 '>Type</th>
          <th className='p-3 '>Price</th>
        </tr>
      </thead>
        <tbody>
        {stockData.map(display)}
        </tbody>
      </table>}
      {!validData && <h3> No Transactions</h3>}
      </div>
    </div>
  )
}
}

export default Transactions