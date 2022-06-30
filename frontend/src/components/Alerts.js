import React, { useEffect, useState } from 'react'
import '../css/Alerts.css'
import '../css/MainSection.css'
import TableRow from './TableRow';
import axios from 'axios'
import {ClipLoader} from 'react-spinners'
import Cookies from 'js-cookie'

const ROOT_URL = "http://127.0.0.1:5000"

function Alerts(props) {
  
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidData, setIsValidData] = useState(false);

  useEffect(() => {
    if(isLoading) {
    axios
    .post(ROOT_URL + "/showAlerts", {
      demat_id: Cookies.get('DematId')
    })
    .then((response) => {
      if (response.data.status === 'SUCCESS'){
          setIsLoading(false);
          setAlerts(response.data.alerts)
         if(response.data.alerts.length > 0)
          setIsValidData(true);
      } 
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  }, [alerts,isLoading]);

  
function display(forEach)
{
  return (
  <TableRow 
    key = {forEach.stock}
    symbol = {forEach.stock}
    first = {forEach.stock}
    second = {forEach.price} 
    third = {forEach.isGreater ? <i className="fas fa-arrow-up green"></i> : <i className="fas fa-arrow-down red"></i>}  
    showFourthCol = {false}
    navigateToStock = {true}
    alert_id = {forEach.alert_id}
    alerts = {alerts}
    setAlerts = {setAlerts}
    showDeleteOption = {true}
    setIsLoading = {setIsLoading}
    isAlerts = {true}
    onClickFxn = {props.onChangeName}
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
        <h1 className='pb-5 section-heading'>My Alerts</h1>
        <div className='p-1 alerts-table-div'>
        {isValidData? <table className="table table-dark">
        <thead>
          <tr>
            <th className='p-3 '>Ticker</th>
            <th className='p-3 '>Price</th>
            <th className='p-3 '>Status</th>
            <th className='p-3 '></th>
          </tr>
          </thead>
          <tbody>
          {alerts.map(display)}
          </tbody>
        </table> :
        <h3> No Alerts</h3>
        }
        </div>
      </div>
    )
  }
  
  
  
}

export default Alerts