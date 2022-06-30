import React, {useState, useEffect} from 'react'
import {Link, Outlet, useNavigate} from 'react-router-dom'
import axios from "axios";
import '../css/Home.css'
import '../css/MainSection.css'
import io from 'socket.io-client';
import Cookies from 'js-cookie'

const ROOT_URL = "http://127.0.0.1:5000"

export const socket = io(ROOT_URL);

function Home(props) {

  const [isActive, setIsActive] = useState([true, false, false, false, false, false, false]);
  const [didSearch,setDidSearch] = useState(false);
  let navigate = useNavigate();
  const navbarToId = {"portfolio": 0, "user": 1, "watchlist": 2, "transactions": 3, "analytics": 4, "alerts": 5, "notifications" : 6}
  
  useEffect(() => {
 
    

    socket.on("connect", (resp) => {
      axios
      .post(ROOT_URL + "/addSocketId", {sid : socket.id, demat_id: Cookies.get('DematId')})
    });

    socket.on('notifications', (resp) => {
      props.setNotification(resp.data)
      props.setIsNotificationVisible(true)
      setTimeout(() => {
        props.setIsNotificationVisible(false)
        props.setNotification("")
      }, 5000);

    })

    axios
    .post(ROOT_URL + "/addSocketId", {sid : socket.id, demat_id: Cookies.get('DematId')})
    if (window.location.pathname === '/home') 
      navigate('/home/portfolio')
    else {
      // handle reload of page
      navigate(window.location.pathname)  
      var arr = [false, false, false, false, false, false, false]
      var current = window.location.pathname.slice(6)
      var active = navbarToId[current]
      arr[active] = true;
      setIsActive(arr);
    }  
    
  }, []);

  window.addEventListener('resize', function() {
    var navbar = document.getElementById('navbar');
    if(navbar) {
      if (window.innerWidth <= 645)
        navbar.style.display = 'none';
      else{
        navbar.style.display = 'inline-block';
        navbar.classList.remove('navbar-visible');
      }
    }
    
  }, true);

  function handleClickNavbarBtn(e) {
    var navbar = document.getElementById('navbar');
    if (window.innerWidth <= 645)
      navbar.style.display = 'none';
    var activeBtnId = e.target.id;
    var arr = [false, false, false, false, false, false, false]
    arr[activeBtnId] = true;
    setIsActive(arr);
    setDidSearch(false);
  }

  function handleClickMenu() {
    var navbar = document.getElementById('navbar');
    var navbarStyle = navbar.style.display;
    if(navbarStyle === 'none' || navbarStyle === ''){
      navbar.style.display = 'inline-block';
      navbar.classList.add('navbar-visible');
    }
    else{
      navbar.style.display = 'none';
    }
  }


  return (
    <div style={{height: '100%'}}>
        <div className='navbar-menu-icon'>
          <i onClick={handleClickMenu} id='hamburger-icon' className="fas fa-bars hamburger-icon"/>
        </div>
        <div className='navbar' id='navbar'>
          <div className='brand-div'><span className='brand-wf'>WF</span> <span className='brand-trado'>Trado</span></div>
          <Link onClick={handleClickNavbarBtn} id='0' className='navbar-btn' to="/home/portfolio" style={{backgroundColor: isActive[0] && '#ff654d', color: isActive[0] && 'white'}}>
            Portfolio
          </Link>
          <Link onClick={handleClickNavbarBtn} id='1' className='navbar-btn' to="/home/user" style={{backgroundColor: isActive[1] && '#ff654d', color: isActive[1] && 'white'}} >
            Account
          </Link>
          
          <Link onClick={handleClickNavbarBtn} id='2' className='navbar-btn' to="/home/watchlist" style={{backgroundColor: isActive[2] && '#ff654d', color: isActive[2] && 'white'}}>
            Watchlist
          </Link>
          <Link onClick={handleClickNavbarBtn} id='3' className='navbar-btn' to="/home/transactions" style={{backgroundColor: isActive[3] && '#ff654d', color: isActive[3] && 'white'}}>
            Transactions
          </Link>
          <Link onClick={handleClickNavbarBtn} id='4' className='navbar-btn' to="/home/analytics" style={{backgroundColor: isActive[4] && '#ff654d', color: isActive[4] && 'white'}}>
            Analytics
          </Link>
          <Link onClick={handleClickNavbarBtn} id='5' className='navbar-btn' to="/home/alerts" style={{backgroundColor: isActive[5] && '#ff654d', color: isActive[5] && 'white'}}>
            Alerts
          </Link>
          <Link onClick={handleClickNavbarBtn} id='6' className='navbar-btn' to="/home/notifications" style={{backgroundColor: isActive[6] && '#ff654d', color: isActive[6] && 'white'}}>
            Notifications
          </Link>
        </div>
        
        <Outlet/> 
    </div>
    );
  
}

export default Home;
