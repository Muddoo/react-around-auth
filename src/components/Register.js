import { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import * as auth from './auth'

function Register(props) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState({})

    const history = useHistory();

    function handleEmail(e) {
        setEmail(e.target.value)
        setError({...error, [e.target.name]: e.target.validationMessage})
    }
    function handlePassword(e) {
        setPassword(e.target.value)
        setError({...error, [e.target.name]: e.target.validationMessage})
    }
    function reset() {
        setEmail('');
        setPassword('')
    }
    function handleSubmit(e) {
        e.preventDefault();
        if(!Object.values(error).filter(e => e).length) {
            auth.register(password,email)
                .then(res => {
                    reset();
                    if(res.data)  {
                        props.handleRegister(true,email,password);
                        history.push('/signin')
                        return
                    };
                    props.handleRegister(false)
                    props.toggleToolTip()
                })
                .catch(err => console.log(err))
        }
    }

    return (
        <div className='login'>
            <div className='login__container'>
                <img draggable="false" src={props.logo} alt="logo" className="logo" />
                <Link to='/signin' className='login__link'>Log in</Link>
            </div>
            <form 
                action="#" 
                className='login__form'
                onSubmit={handleSubmit}
                >
                <p className="login__heading">Sign up</p>
                <input 
                    type="email" 
                    name="email" 
                    placeholder='Email' 
                    className='login__input' 
                    value={email}
                    onChange={handleEmail}
                    required/>
                <input 
                    type="password" 
                    name="password" 
                    placeholder='Password' 
                    className='login__input' 
                    value={password}
                    onChange={handlePassword}
                    minLength={4}
                    maxLength={12}
                    required/>
                <button className="login__submit" type='submit'>Sign up</button>
                <Link to='/signin' className="login__link login__note">Already a member? Log in here!</Link>
            </form>
        </div>
    )
}

export default Register