import {useState,useEffect} from 'react'
import {Route, Redirect, Switch} from 'react-router-dom'
import {checkToken} from './auth'
import logo from '../images/Vectorlogo.svg'
import Header from './Header'
import Main from './Main'
import Footer from './Footer'
import EditAvatarPopup from './EditAvatarPopup'
import EditProfilePopup from './EditProfilePopup'
import DeletePlacePopup from './DeletePlacePopup'
import AddPlacePopup from './AddPlacePopup'
import ImagePopup from './ImagePopup'
import Login from './Login'
import Register from './Register'
import InfoTooltip from './InfoTooltip'
import ProtectedRoute from './ProtectedRoute'
import api from '../utils/api'
import CurrentUserContext from '../contexts/CurrentUserContext'

function App() {
    const [currentUser,setCurrentUser] = useState();
    const [cards,setCards] = useState([]);
    const [avatarPopup,setAvatarPopup] = useState(false);
    const [profilePopup,setProfilePopup] = useState(false);
    const [cardPopup,setCardPopup] = useState(false);
    const [deletePopup,setDeletePopup] = useState(false);
    const [imagePopup,setImagePopup] = useState(false);
    const [selectedCard,setSelectedCard] = useState({});
    const [loggedIn,setLoggedIn] = useState(false);
    const [registered,setRegistered] = useState(false); 
    const [isOpenToolTip,setIsOpenToolTip] = useState(false);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        Promise.all([api.getUser(),api.queryCards({})])
               .then(data => {
                   const [user,initialCards] = data;
                   setCurrentUser(user)
                   setCards(initialCards)
               })
               .catch(err => console.log(err))
    },[])

    useEffect(() => {
        const jwt = localStorage.getItem('jwt');
        if(jwt) {
            checkToken(jwt)
                .then(({data}) => {
                    if(data) {
                        setLoggedIn(true)
                        setEmail(data.email)
                        return
                    };
                    setLoggedIn(false)
                    console.log('logout')
                })
                .catch(err => console.log(err))
        }
    })

    function toggleToolTip() {
        setIsOpenToolTip(!isOpenToolTip)
    }
    function handleRegister(v,email,password) {
        setRegistered(v)
        if(v) {
            setEmail(email);
            setPassword(password)
        }
    }
    function handleLogin() {
        setLoggedIn(!loggedIn)
    }
    function handleEditAvatarClick() {
        setAvatarPopup(true)
    }
    function handleEditProfileClick() {
        setProfilePopup(true)
    }
    function handleAddPlaceClick() {
        setCardPopup(true)
    }
    function handleCardClick(card) {
        setImagePopup(true)
        setSelectedCard(card)
    }
    function handleCardDelete(card) {
        setDeletePopup(true);
        setSelectedCard(card);
    }
    function handleImagePopupClick() {
        let index = cards.indexOf(selectedCard) + 1;
        if(index === cards.length) index = 0; 
        setSelectedCard(cards[index])
    }
    function handleUserAvatarUpdate(field) {
        api.updateProfile({ avatar: 'avatar', body: field })
            .then(user => setCurrentUser(user))
            .catch(err => console.log(err))
            .finally(() => closeAllPopups())
    }
    function handleUserInfoUpdate(field) {
        api.updateProfile({body: field})
            .then(user => setCurrentUser(user))
            .catch(err => console.log(err))
            .finally(() => closeAllPopups())
    }
    function handleAddPlaceSubmit(field) {
        api.queryCards({ method: 'POST', body: field })
            .then(place => {
            setCards([place,...cards]);
            })
            .catch(err => console.log(err))
            .finally(() => closeAllPopups())
    }
    function handleDeleteCardSubmit(card = selectedCard) {
        const newCards = cards.filter(item => item._id !== card._id);
            api.queryCards({query: card._id, method: 'DELETE'})
               .then(() => setCards(newCards))
               .catch(err => {
                  console.log(err);
                  setCards(cards);
                })
               .finally(() => closeAllPopups())
    }
    function handleLikeClick(card) {
        const method = card.likes.some(data => data._id === currentUser._id) ? 'DELETE' : 'PUT';
        const newLike = method === 'DELETE' ? card.likes.filter(item => item._id !== currentUser._id) : [...card.likes, {_id: currentUser._id}];
        const newCards = cards.map(item => card._id === item._id ? {...item,likes: newLike} : item);
        setCards(newCards);
        api.queryCards({ query: `likes/${card._id}`, method })
            .catch(err => {
                console.log(err);
                setCards(cards)
            })
    }
    function handleUnloadedImage(card) {
        handleDeleteCardSubmit(card);
    }
    function closeAllPopups() {
            setAvatarPopup(false);
            setProfilePopup(false);
            setCardPopup(false);
            setDeletePopup(false);
            setImagePopup(false);
    }
    function handleOverlayAndCrossClick(e) {
        if(e.target.classList.contains('popup') || e.target.classList.contains('popup__close')) closeAllPopups();
    }

  return (
    <div className="page">
        <Switch>
            <CurrentUserContext.Provider value={currentUser}>
                <Route path='/signin'>
                    { loggedIn ? 
                        <Redirect to='/' /> : 
                        <Login 
                            logo={logo} 
                            toggleToolTip={toggleToolTip}
                            email={email}
                            password={password}
                            handleLog={handleLogin}
                            handleRegister={handleRegister} /> }
                </Route>
                <Route path='/signup'>
                    { loggedIn ? 
                        <Redirect to='/' /> : 
                        <Register
                            logo={logo}
                            toggleToolTip={toggleToolTip}
                            handleRegister={handleRegister} /> }
                </Route>
                <ProtectedRoute 
                    path="/" 
                    loggedIn={loggedIn}
                    component={() => (
                        <div>
                            <Header 
                                logo={logo}
                                email={email}
                                handleLog={handleLogin} />
                            <Main 
                                cards={cards}
                                onEditAvatar={handleEditAvatarClick}  
                                onEditProfile={handleEditProfileClick}
                                onAddPlace={handleAddPlaceClick}
                                onCardClick={handleCardClick}
                                onCardDelete={handleCardDelete}
                                onCardLike={handleLikeClick}
                                onUnLoadedImage={handleUnloadedImage}
                                onUnloadedAvatar={handleUserAvatarUpdate}
                            />
                            <Footer />
                            <EditAvatarPopup 
                                isOpen={avatarPopup} 
                                onClose={handleOverlayAndCrossClick} 
                                submit={handleUserAvatarUpdate} 
                            />
                            <EditProfilePopup 
                                isOpen={profilePopup} 
                                onClose={handleOverlayAndCrossClick} 
                                submit={handleUserInfoUpdate} 
                            />
                            <AddPlacePopup 
                                isOpen={cardPopup} 
                                onClose={handleOverlayAndCrossClick} 
                                submit={handleAddPlaceSubmit} 
                            />
                            <DeletePlacePopup 
                                isOpen={deletePopup} 
                                onClose={handleOverlayAndCrossClick} 
                                submit={handleDeleteCardSubmit} 
                            />
                            <ImagePopup 
                                isOpen={imagePopup}
                                card={selectedCard}
                                onClose={handleOverlayAndCrossClick}
                                onClick={handleImagePopupClick}
                            />
                        </div>
                    )}
                    />
                <Route path='/'>
                    { loggedIn ? <Redirect to='/' /> : <Redirect to='/signin' /> }
                </Route>    
                <InfoTooltip 
                    isOpen={isOpenToolTip} 
                    registered={registered} 
                    toggle={toggleToolTip}
                    />
            </CurrentUserContext.Provider>
        </Switch>
    </div>
  );
}

export default App;
