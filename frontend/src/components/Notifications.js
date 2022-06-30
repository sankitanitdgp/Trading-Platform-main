import React, {useState, useEffect} from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import {ClipLoader} from 'react-spinners'
import '../css/Notifications.css';

const ROOT_URL = "http://127.0.0.1:5000"

function Notifications() {
    
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidData, setIsValidData] = useState(false);

  useEffect(() => {
    if(isLoading) {
    axios
    .post(ROOT_URL + "/getNotifications", {
      demat_id: Cookies.get('DematId')
    })
    .then((response) => {
      if (response.data.status === 'SUCCESS'){
          setIsLoading(false);
          setNotifications(response.data.notifications.reverse())
         if(response.data.notifications.length > 0)
          setIsValidData(true);
      } 
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  }, [notifications,isLoading]);


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
          <div className='main-section watchlist'>
            <h1 className='pb-5 section-heading'>My Notifications</h1>
            <div className='p-1 alerts-table-div'>
            {isValidData? 
            
            <div>
               { notifications.map((notification)=>{
                    return <div className='notification-li'>
                                <div>{notification.message}</div> <div className='notification-time-div'>{notification.time}</div>
                            </div>
                })}
            </div>
             :
            <h3> No Notifications</h3>
            }
            </div>
          </div>
        )
      }
      
      
}

export default Notifications