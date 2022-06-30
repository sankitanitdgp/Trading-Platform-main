import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useEffect } from 'react';

function Logout(props) {
    const [cookies, setCookie,removeCookie] = useCookies(['user'])
    let navigate = useNavigate();

    useEffect(()=>{
        removeCookie('DematId', { path: '/' });
        props.fxn(false);
        navigate('/');
    })
}

export default Logout