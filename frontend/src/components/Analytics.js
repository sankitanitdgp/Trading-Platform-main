import React, {useEffect,useState} from 'react'
import '../css/Analytics.css'
import AnalyticsLineChart from './AnalyticsLineChart';
import AnalyticsCard from './AnalyticsCard';
import Cookies from 'js-cookie'
import axios from 'axios'
import {ClipLoader} from 'react-spinners'

const ROOT_URL = "http://127.0.0.1:5000"

function Analytics() {
  const [profitData, setProfitData] = useState([])
    const [valueData, setValueData] = useState([])
    const [profit, setProfit] = useState("");
    const [balance, setBalance] = useState("");
    const [value, setValue] = useState("")
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (isLoading){
        axios
        .post(ROOT_URL + "/getAnalytics", {
          demat_id: Cookies.get('DematId')
        })
        .then((response) => {
          if (response.data.status === 'SUCCESS'){
              setProfit(response.data.profit)
              setBalance(response.data.balance)
              setValue(response.data.value)
              setProfitData(response.data.profitArray)
              setValueData(response.data.valueArray)
              setIsLoading(false);
          } 
        })
        .catch(function (error) {
          console.log(error);
        });}
     
  }, [profitData, valueData, profit, balance, value, isLoading])



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
    <div className='main-section analytics'>
    <h1 className='pb-5 analytics-heading'>My Analytics</h1>
        <div className="row">
        <AnalyticsCard 
          heading='Balance Status'
          money= {` ${balance}`}
          logoClass = 'fas fa-wallet'
          />

          <AnalyticsCard 
          heading='Profit'
          money= {` ${profit}`}
          logoClass = 'fas fa-coins'
          />

          <AnalyticsCard 
          heading='Net Worth'
          money= {` ${value}`}
          logoClass = 'fas fa-dollar-sign'
          />
        </div>
        <div className='charts-div'>
        <div className='chart'><AnalyticsLineChart profitData={profitData} valueData={valueData} /></div>
        
        </div>
    
  </div>
)
  }
}

export default Analytics
