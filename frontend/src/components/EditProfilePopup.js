import React, {useState} from 'react'
import '../css/Popup.css';
import Cookies from 'js-cookie'
import axios from "axios";
import {useNavigate} from "react-router-dom";
const ROOT_URL = "http://127.0.0.1:5000"

function EditProfilePopup(props) {
    let navigate = useNavigate();
    const [username, setUsername]=useState('')
    const [oldPassword, setOldPassword]=useState('')
    const [newPassword, setNewPassword]=useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    props.setTrigger(false)
    await axios
    .post(ROOT_URL + "/editProfile", {
      demat_id: Cookies.get('DematId'),
      username: username,
      oldPassword: oldPassword,
      newPassword: newPassword
    })
    .then((response) => {
      if (response.data.username_status === 'Success'){
          props.setUserData({...props.userData,'username': username} )
      }  else if (response.data.username_status === 'Already Exists'){
            alert('username already exists')
      } 
      if(response.data.password_status === 'Success') {
        navigate('/logout');
      }  else if (response.data.password_status === 'incorrect old password') {
          alert('incorrect old password')
      }  else if (response.data.password_status === 'incorrect old password') {
        alert('incorrect old password')
    } 
    
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(()=>{
        setUsername('')
        setOldPassword('')
        setNewPassword('')
      });
  };

    return props.trigger ? (
        <div className="popup">
          <div className="popup-inner">
            <button className="popup-submit-btn" onClick={handleSubmit}>
              Submit
            </button>
            <button className="popup-close-btn" onClick={() => props.setTrigger(false)}>
                <i className="far fa-times-circle"></i>
            </button>
            <label className='popup-form-label'>Enter new username</label>
            <input className='popup-input-field' value={username} onChange={(e)=> {setUsername(e.target.value)}} type="text"></input>
            <label className='popup-form-label'>Enter old password</label>
            <input className='popup-input-field' value={oldPassword} onChange={(e)=> {setOldPassword(e.target.value)}} type="password"></input>
            <label className='popup-form-label'>Enter new password</label>
            <input className='popup-input-field' value={newPassword} onChange={(e)=> {setNewPassword(e.target.value)}} type="password"></input>
          </div>
        </div>
      ) : (
        ""
      );
    
}

export default EditProfilePopup