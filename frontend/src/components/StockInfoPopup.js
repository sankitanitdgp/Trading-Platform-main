import '../css/Popup.css';
import React, {useState} from 'react'
import axios from "axios";
import Cookies from 'js-cookie'

const ROOT_URL = "http://127.0.0.1:5000"

function StockInfoPopup(props) {

  const [number,setNumber]=useState('')
  const [price, setPrice]=useState('')
  const [optionVisible, setOptionVisible]=useState(true)
  const [marketPriceChosen, setMarketPriceChosen]=useState(false)
  const [option, setOption]=useState('')
  
  const handleBuy = async () => {
    await axios
    .post(ROOT_URL + "/buyStock", {
      "demat_id": Cookies.get('DematId'),
      "stockCode": props.ticker,
      "number": number,
      "maxPrice":marketPriceChosen? props.marketPrice: price,
      "option": option
    })
    .then((response) => {
      if (response.data.status === 'SUCCESS'){
          
          alert("Request sent");
          setNumber('');
          setPrice('');
      } 
      else{
        alert(response.data.status);
      }
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(()=>{
      setNumber('');
      setPrice('');
    });
  };
  
  const handleSell = async () => {
    await axios
    .post(ROOT_URL + "/sellStock", {
      "demat_id": Cookies.get('DematId'),
      'stockCode': props.ticker,
      'number':number,
      'minPrice':marketPriceChosen? props.marketPrice: price,
      "option": option
    })
    .then((response) => {
      if (response.data.status === 'SUCCESS'){
          alert("Request Sent")
         
      }
      else{
        alert(response.data.status);
      }
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(()=>{
     
      setNumber('');
      setPrice('');
    });
  };

  function handleSubmit(){
    if(props.type === "Buy") {
      handleBuy()
    }
      
    else {
      handleSell();
    }
    setOptionVisible(true)
    props.setTrigger(false)
    setMarketPriceChosen(false)
    setOption('')
  }

  function handleClose() {
    props.setTrigger(false)
    setOptionVisible(true)
    setMarketPriceChosen(false)
    setOption('')
  }

  function handleMarketClick() {
    setOptionVisible(false)
    setMarketPriceChosen(true)
    setOption("Market")
  }

  function handleCustomClick() {
    setOption("Custom")
    setOptionVisible(false)
  }

  if (props.trigger) {
    if (optionVisible){
      return (<div className="popup">
      <div className="popup-inner">
        <button className="popup popup-submit-btn first-button" onClick={handleMarketClick}>
          {props.type} at Market price
        </button>
        <button className="popup popup-submit-btn second-button" onClick={handleCustomClick }>
          {props.type} at custom price
        </button>
        <button className="popup-close-btn" onClick={handleClose}>
            <i className="far fa-times-circle"></i>
        </button>
       
      </div>
    </div>)
    } else {
      return  (
        <div className="popup">
          <div className="popup-inner">
            <button className="popup-submit-btn" onClick={handleSubmit}>
              Submit
            </button>
            <button className="popup-close-btn" onClick={handleClose}>
                <i className="far fa-times-circle"></i>
            </button>
            <label className='popup-form-label'  >Enter price</label>
            <input className='popup-input-field' readonly= {marketPriceChosen} value = {marketPriceChosen? props.marketPrice: price} onChange={(e) => {setPrice(e.target.value)}} type="text"></input>
            <label className='popup-form-label'>Enter number of stocks</label>
            <input className='popup-input-field' value = {number} onChange={(e) => {setNumber(e.target.value)}} type="text"></input>
          </div>
        </div>
      )
  }
}

  else {
    return ("")
  }
  
}

export default StockInfoPopup;