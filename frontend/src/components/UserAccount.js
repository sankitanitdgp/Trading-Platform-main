import React, { useEffect, useState } from 'react'
import '../css/UserAccount.css'
import '../css/MainSection.css'
import userImg from "../images/user.jpg"
import axios from 'axios'
import Cookies from 'js-cookie'
import DepositPopup from "./DepositPopup";
import {ClipLoader} from 'react-spinners'
import EditProfilePopup from './EditProfilePopup'


const ROOT_URL = "http://127.0.0.1:5000"

function UserAccount() {

    const [depositButtonPopup, setDepositButtonPopup] = useState(false);
    const [editButtonPopup, setEditButtonPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const user = {
        demat_id: '',
        username: '',
        email: '',
        name: ''
        };
    
    const [userData, setUserData] = useState(user);
    const [username, setUserName] = useState('');
    const [walletBalance, setWalletBalance] = useState('');



    useEffect(() => {
        if(isLoading) {
            axios
    .post(ROOT_URL + "/getUserAccount", {
      demat_id: Cookies.get('DematId')
    })
    .then((response) => {
      if (response.data.status === 'SUCCESS'){

         setIsLoading(false);
         setUserData({demat_id: response.data.userProfile.demat_id, 
            username: response.data.userProfile.username, 
            email: response.data.userProfile.email,
            name: response.data.userProfile.name
            })
          setWalletBalance(response.data.userProfile.walletBalance)  
            
      } 
    })
    .catch(function (error) {
      console.log(error);
    });
       
      }}, [username,isLoading]);
    
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
    <div className='main-section user-account'>
        <div className="user-profile">
          <h1 className='pb-5 account-heading'>My Account</h1>
              <div className='user-img-div'> 
                <img className='user-img' src={userImg} alt="userpic"/>
              </div>
              <div className='user-name-div'>
                {userData.name}
                <div className='edit-profile-div'>
                    <i className="far fa-edit edit-profile-logo"></i>
                    <button type="Submit" className="edit-profile-btn" name="btnAddMore" onClick={() => setEditButtonPopup(true)}>Edit Profile</button>
                  </div>
                </div>

                <div className='user-info-outer-div'>
                  <div className='user-info-div'>
                    <div className='user-info-heading'>
                      Username
                    </div>
                    <div className='user-info'>
                      {userData.username}
                    </div>
                  </div>

                  <div className='user-info-div'>
                    <div className='user-info-heading'>
                      Email
                    </div>
                    <div className='user-info'>
                      {userData.email}
                    </div>
                  </div>

                  <div className='user-info-div'>
                    <div className='user-info-heading'>
                       Demat Id
                    </div>
                    <div className='user-info'>
                      {userData.demat_id}
                    </div>
                  </div>

                  <div className='user-info-div'>
                    <div className='user-info-heading'>
                      Wallet Balance
                      <button className='add-money-btn' onClick={() => setDepositButtonPopup(true)}>  <i className="fas fa-plus"></i> </button>
                    </div>
                    <div className='user-info'>
                      {walletBalance}
                    </div>
                  </div>
                </div>
        </div>
        <EditProfilePopup userData={userData} setUserData={setUserData} trigger={editButtonPopup} setTrigger={setEditButtonPopup} /> 
        <DepositPopup walletBalance={walletBalance} setWalletBalance={setWalletBalance} trigger={depositButtonPopup} setTrigger={setDepositButtonPopup} />  
    </div>
  )
}}

export default UserAccount