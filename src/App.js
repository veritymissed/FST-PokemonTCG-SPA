import React, { useState, useEffect, useReducer, useContext } from 'react';
import logo from './logo.svg';
import './App.css';
import { Box, TextField, Button, Typography, Icon } from '@mui/material';
import { Card, CardMedia, CardContent, CardActions } from '@mui/material';
import { FormControl } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';

import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import Cookies from 'js-cookie';
import * as _ from 'lodash';

import request from 'request';

import * as raritiesEsModule from './static/rarities.json';
import * as supertypesEsModule from './static/supertypes.json';
import * as typesEsModule from './static/types.json';
import * as ponkemon_cards from './static/data/cards.json'

let cards = ponkemon_cards.default.data;

const rarities = raritiesEsModule.default.data;
const supertypes = supertypesEsModule.default.data;
const types = typesEsModule.default.data;

// console.log('rarities', rarities)
// console.log('supertypes', supertypes)
// console.log('types', types)

const QUERYING_API_PAGE_SIZE = 8;

const initialState = {
  isLogin: false,
  currentUserEmail: null,
  favorite_cards: [],
};

function reducer(state, action) {
  console.log('state', state);
  console.log('action', action);
  switch (action.type) {
    case 'login':
      const { isLogin, ...updatePayload } = action.payload;
      console.log('updatePayload', updatePayload);
      return { isLogin: true , ...updatePayload };
    case 'logout':
      return initialState;
    default:
      throw new Error();
  }
};

const UserContext = React.createContext(null);

function setSessionStorage(session){
  removeSessionStorage();
  let jsonStringOfNewSession = JSON.stringify(session);
  localStorage.setItem("session", jsonStringOfNewSession)
}

function removeSessionStorage(){
  localStorage.removeItem("session");
}

function getSessionStorage(){
  const sessionCookie = localStorage.getItem("session");
  if(sessionCookie === "undefined" || !sessionCookie) return {};
  else return JSON.parse(sessionCookie);
}

function getCurrentUser(){
  const {currentUser} = getSessionStorage();
  return currentUser;
}

const getUpdateUserPromise = function(updatingUser, form){
  return new Promise(function(resolve) {
    let options = {
      'method': 'PATCH',
      'url': `http://localhost:3000/users/${updatingUser.id}`,
      'headers': {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form)
    };
    request(options, function (error, response) {
      if (error) throw error;
      let responseObject = JSON.parse(response.body);
      console.log(responseObject);
      resolve(responseObject)
    });

  });
}

function App(props) {
  const [userState, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    //
    let currentUserInLocalStorage = getCurrentUser();
    if(currentUserInLocalStorage){
      dispatch({type: 'login', payload: {currentUserEmail: currentUserInLocalStorage.email, favorite_cards: currentUserInLocalStorage.favorite_cards }});
    }
    //
  },[]);


  return (
    <div className="App">
    <UserContext.Provider value={{userState, dispatch}}>
    <Router>
      <NavBar></NavBar>
      <Routes>
        <Route path="/" element={<QueryBlock />}></Route>
        <Route path="/favorite_list" element={<FavoriteCardList/>}></Route>
        <Route path="/login" element={<LoginForm />}></Route>
        <Route path="/register" element={<RegisterForm />}></Route>
        <Route path="/logout" element={<Logout />}></Route>
      </Routes>
    </Router>
    </UserContext.Provider>
    </div>
  );
}

function FavoriteCardList(props){
  let navigate = useNavigate();

  // let [userIsLogin, setUserIsLogin] = useState(false);
  let [favoriteCardList, setFavoriteCardList] = useState([]);

  let [isUpdating, setIsUpdating] = useState(false);

  let currentUser = getCurrentUser();

  let userIsLogin = false;
  if(_.isEmpty(currentUser)) currentUser = false;
  else {
    userIsLogin = true;
    console.log(currentUser)
  }

  useEffect(()=>{
    setFavoriteCardList(currentUser.favorite_cards);
  },[])

  let addTo = async (cardObject) => {
    if(isUpdating) return

    const currentUser = getCurrentUser();
    if(_.isEmpty(currentUser)) return;

    let foundIndex = currentUser.favorite_cards.findIndex((cardInCurrentUser) => cardInCurrentUser.id === cardObject.id);
    if(foundIndex >= 0) return;

    currentUser.favorite_cards.push(cardObject);
    setSessionStorage({currentUser})

    try {
      await getUpdateUserPromise(currentUser, {favorite_cards: currentUser.favorite_cards || []})
    } catch (e) {
      console.log(e)
    } finally {
      setIsUpdating(false);
    }
  };

  let removeFrom = async (cardId) => {
    console.log(`card id = ${cardId}`);
    if(isUpdating) return
    const currentUser = getCurrentUser();
    if(_.isEmpty(currentUser)) return;

    let foundIndex = currentUser.favorite_cards.findIndex((cardInCurrentUser) => cardInCurrentUser.id === cardId);
    if(foundIndex < 0) return;
    currentUser.favorite_cards.splice(foundIndex, 1);
    setSessionStorage({currentUser})

    try {
      setIsUpdating(true);
      await getUpdateUserPromise(currentUser, {favorite_cards: currentUser.favorite_cards || []})
    } catch (e) {
      console.log(e)
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if(!userIsLogin) navigate('/');
  },[navigate]);

  return (<CardList userIsLogin={userIsLogin} cards={favoriteCardList}
    addTo={addTo} removeFrom={removeFrom}></CardList>)
}

function CardList(props){
  const { cards, userIsLogin, addTo, removeFrom } = props;

  return (
    <Box display="flex" justifyContent="left" flexWrap="wrap" maxWidth="900px" mx="auto">
    {
      cards.map((card) => (
        <PokemonCard card={card} userIsLogin={userIsLogin}
        addTo={addTo} removeFrom={removeFrom}></PokemonCard>
      ))
    }
    </Box>
  )
}

function LoginForm(){
  const { userState, dispatch } = useContext(UserContext);
  console.log('userState in LoginForm', userState);

  const navigate = useNavigate();
  let [isLoading, setIsLoading] = useState(false);

  let [formEmail, setFormEmail] = useState("");
  let [formPassword, setFormPassword] = useState("");

  useEffect(()=>{
    console.log('userState.isLogin', userState.isLogin)
    if(userState.isLogin) navigate("/")
  }, [navigate])

  let loginUser = async () => {
    let loginPromise = new Promise(function(resolve, reject) {
      let options = {
        'method': 'POST',
        'url': 'http://localhost:3000/auth/login',
        'headers': {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "username": formEmail,
          "password": formPassword
        })
      };
      request(options, function (error, response) {
        if (error) throw error;
        resolve(JSON.parse(response.body));
      });

    });

    try {
      if(isLoading) return;
      setIsLoading(true)
      let res = await loginPromise;
      console.log('login res', res)

      setSessionStorage({currentUser: res.user})
      dispatch({type: 'login', payload: {currentUserEmail: res.user.email, favorite_cards: res.user.favorite_cards, fuck: 'fuck' }})
      navigate('/');
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <TextField
        required
        id="outlined-required"
        label="Email"
        onChange={(e) => {
          setFormEmail(e.target.value);
        }}
      />
      <TextField
        id="outlined-password-input"
        label="Password"
        type="password"
        autoComplete="current-password"
        onChange={(e) => {
          setFormPassword(e.target.value);
        }}
      />
      <Button onClick={(e) => {
        loginUser()
      }}>
      Login
      {isLoading && (<Loader width={15} height={15} borderWidth={6}></Loader>)}
      </Button>
    </Box>
  )
}

function RegisterForm(props){
  const navigate = useNavigate();
  let [isLoading, setIsLoading] = useState(false);

  let [formEmail, setFormEmail] = useState("");
  let [formPassword, setFormPassword] = useState("");

  useEffect(()=>{
    const {currentUser} = getSessionStorage();
    if(currentUser) navigate('/')
  }, [navigate])

  let registerUser = async () => {
    let registerPromise = new Promise(function(resolve, reject) {
      let options = {
        'method': 'POST',
        'url': 'http://localhost:3000/users/',
        'headers': {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
          'email': formEmail,
          'password': formPassword
        }
      };
      request(options, function (error, response) {
        if (error) throw error;
        resolve(response.body);
      });

    });

    try {
      if(isLoading) return;
      setIsLoading(true)
      let res = await registerPromise;
      console.log('login res', res)
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false);
    }
  };

  return(
    <Box>
      <TextField
        required
        id="outlined-required"
        label="Email"
        onChange={(e) => {
          setFormEmail(e.target.value);
        }}
      />
      <TextField
        id="outlined-password-input"
        label="Password"
        type="password"
        autoComplete="current-password"
        onChange={(e) => {
          setFormPassword(e.target.value);
        }}
      />
      <Button onClick={(e) => {
        registerUser()
      }}>Register
      { isLoading && (<Loader width={15} height={15} borderWidth={6}></Loader>) }
      </Button>
    </Box>
  )
}

function Logout() {
  const { userState, dispatch } = useContext(UserContext);
  let navigate = useNavigate();

  useEffect(() => {
    removeSessionStorage();
    dispatch({ type: 'logout' });
    navigate("/");
  },[]);
  return (
    <></>
  )
};

function NavBar(props){
  const { userState, dispatch } = useContext(UserContext);
  console.log('userState in NavBar', userState);
  let navigate = useNavigate();

  return (
    <Box>
      <Box>FST PokemonTcg</Box>
      <Button onClick={(e)=>{
        navigate('/')
      }}>FST PokemonTcg</Button>
      {!userState.isLogin && (
        <React.Fragment>
        <Button onClick={(e)=>{
          navigate('/register')
        }}>SignUp</Button>
        <Button onClick={(e) => {
          navigate('/login')
        }}>Login</Button>
        </React.Fragment>
      )}
      {userState.isLogin && (
        <React.Fragment>
        <Button onClick={(e) => {navigate('/favorite_list')}}>Favorite list<FavoriteIcon></FavoriteIcon></Button>
        <Button onClick={(e)=>{
          navigate('/logout');
        }}>Logout</Button>
        <Box>{userState.currentUserEmail}</Box>
        </React.Fragment>
      )}
    </Box>
  );
}

function QueryBlock(props){
  const { userState, dispatch } = useContext(UserContext);
  console.log('userState in QueryBlock', userState);

  const [isQuerying, setIsQuerying] = useState(false);//is querying API state now
  let [isUpdating, setIsUpdating] = useState(false);

  const [formName, setFormDataName] = useState('');
  const [formType, setFormType] = useState('');
  const [formHp, setFormHp] = useState([0, 500]);
  const [formRarity, setFormRarity] = useState('');

  const [lastTimeQueryForm, setLastTimeQueryForm] = useState({});

  const [queryResult, setQueryResult] = useState(null);
  const [queryResultCardsArray, setQueryResultCardsArray] = useState([]);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMoreCards = async () => {
    try {
      if(isQuerying) return;
      else setIsQuerying(true);


      setIsLoadingMore(true);
      let res = await queryCardsAPI(lastTimeQueryForm, queryResult.page + 1);
      setQueryResultCardsArray([...queryResultCardsArray, ...res.data]);
      setQueryResult(res);

      //same as in queryCards
      if(res.data.length && res.count === res.pageSize) {
        setCanLoadMore(true);
        setLastTimeQueryForm(lastTimeQueryForm);
      }
      else setCanLoadMore(false);
    } catch (e) {
      console.log(e);
    } finally {
      setIsQuerying(false);
      setIsLoadingMore(false);
    }
  };

  const queryCards = async () => {
    try {
      if(isQuerying) return;
      else setIsQuerying(true);

      //Controller loader animation, load more button and remove last time querying cards
      setQueryResultCardsArray([]);
      setCanLoadMore(false);

      let form = {
        name: formName,
        type: formType,
        hp: formHp,
        rarity: formRarity
      };

      let res = await queryCardsAPI(form);
      setQueryResultCardsArray(res.data);
      setQueryResult(res);

      //same as in loadMoreCards
      if(res.data.length && res.count === res.pageSize) {
        setCanLoadMore(true);
        setLastTimeQueryForm(form);
      }
      else setCanLoadMore(false);
    } catch (e) {
      setQueryResultCardsArray([]);
      console.log(e);
    } finally {
      setIsQuerying(false);
    }
  };

  const queryCardsAPI = async (form = {
    name: '',
    type: '',
    formHp: [0,500],
    rarity: ''
  }, page = 1) => {
    console.log('form.name', form.name)
    console.log('form.type', form.type)
    console.log('form.hp', form.hp)
    console.log('form.rarity', form.rarity)
    console.log('page', page)
    let queryString = '';
    if(form.name.length) queryString += `name:"*${form.name}*" `;
    if(form.type.length) queryString += `types:${form.type} `;
    if(form.rarity.length) queryString += `rarity:"${form.rarity}" `

    queryString += `hp:[${form.hp[0]} TO ${form.hp[1]}] `

    console.log('queryString', queryString)
    return new Promise(function(resolve) {
      try {
        request({
          method: 'GET',
          uri: `https://api.pokemontcg.io/v2/cards/?q=${queryString}&pageSize=${QUERYING_API_PAGE_SIZE}&page=${page}`,
          q: queryString,
        }, function(err, res, body){
          if(err) throw err
          else resolve(JSON.parse(body))
        });
      } catch (e) {
        throw e
      }
    })
  };

  let addTo = async (cardObject) => {
    if(isUpdating) return

    const currentUser = getCurrentUser();
    if(_.isEmpty(currentUser)) return;

    let foundIndex = currentUser.favorite_cards.findIndex((cardInCurrentUser) => cardInCurrentUser.id === cardObject.id);
    if(foundIndex >= 0) return;

    currentUser.favorite_cards.push(cardObject);
    setSessionStorage({currentUser})

    try {
      await getUpdateUserPromise(currentUser, {favorite_cards: currentUser.favorite_cards || []})
    } catch (e) {
      console.log(e)
    } finally {
      setIsUpdating(false);
    }
  };

  let removeFrom = async (cardId) => {
    console.log(`card id = ${cardId}`);
    if(isUpdating) return
    const currentUser = getCurrentUser();
    if(_.isEmpty(currentUser)) return;

    let foundIndex = currentUser.favorite_cards.findIndex((cardInCurrentUser) => cardInCurrentUser.id === cardId);
    if(foundIndex < 0) return;
    currentUser.favorite_cards.splice(foundIndex, 1);
    setSessionStorage({currentUser})

    try {
      setIsUpdating(true);
      await getUpdateUserPromise(currentUser, {favorite_cards: currentUser.favorite_cards || []})
    } catch (e) {
      console.log(e)
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box>
      <TextField id="outlined-basic" label="name" variant="outlined" onChange={(e) => {setFormDataName(e.target.value)}} />
      <FormControl>
        <InputLabel id="demo-simple-select-label">Type</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={formType}
          label="Type"
          onChange={(e)=>{
            setFormType(e.target.value);
          }}
        >
          <MenuItem value={''}>None</MenuItem>
          {types.map((type) => (
            <MenuItem value={type}>{type}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box width="500px">
      <Slider
        min={0} max={500}
        getAriaLabel={() => 'HP range'}
        value={formHp}
        onChange={(e, newValue)=>{
          setFormHp(newValue)
        }}
        valueLabelDisplay="auto"
        getAriaValueText={(e) => `${formHp}`}
      />
      </Box>

      <FormControl>
        <InputLabel id="demo-simple-select-label">Rarity</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={formRarity}
          label="Rarity"
          onChange={(e)=>{
            setFormRarity(e.target.value);
          }}
        >
          <MenuItem value={''}>None</MenuItem>
          {rarities.map((rarity) => (
            <MenuItem value={rarity}>{rarity}</MenuItem>
          ))}
        </Select>
        <Button onClick={(e)=>{
          queryCards();
        }}>Query</Button>
      </FormControl>

      { queryResultCardsArray.length > 0 && (<CardList cards={queryResultCardsArray} addTo={addTo} removeFrom={removeFrom}></CardList>)}
      <Box display="flex" justifyContent="center">
        { isQuerying && (
          <Loader width={60} height={60} borderWidth={15}></Loader>
        )}
        { canLoadMore && !isLoadingMore && (
          <Button onClick={(e)=>{
            loadMoreCards()
          }}>Load more</Button>
        )}
      </Box>
    </Box>
  );
}

function PokemonCard(props){
  const { card, userIsLogin,  addTo, removeFrom } = props;

  const { userState, dispatch } = useContext(UserContext);
  console.log('userState in PokemonCard', userState);

  let [isUpdating, setIsUpdating] = useState(false);
  let useStyleClasses = makeStyles((theme) => ({
    card_style: {
      marginTop: '10px',
      marginBottom: '10px',
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingLeft: '5px',
      paddingRight: '5px'
    },
  }))
  let styleClass = useStyleClasses();

  return(
  <Card sx={{ width: 200 }} className={styleClass.card_style}>
    <CardMedia
      component="img"
      image={card.images.large}
    />
    <CardContent>
      <Typography variant="h5" gutterBottom component="div">{card.name || 'Name not exist'}</Typography>
      <Typography variant="subtitle2" gutterBottom component="div">
        Supertype: {card.supertype|| 'No data'}
      </Typography>
      {card.types && card.types.length > 0 && (
       <Typography variant="subtitle2" gutterBottom component="div">
          Type: {card.types|| 'No data'}
        </Typography>
      )}
      <Typography variant="subtitle2" gutterBottom component="div">
        HP: {card.hp || 'No data'}
      </Typography>
      <Typography variant="subtitle2" gutterBottom component="div">
        Rarity: {card.rarity|| 'No data'}
      </Typography>
      <Box display="flex" justifyContent="flex-end">
        <IconButton color="primary" onClick={(e)=>{
          removeFrom(card.id);
        }}>
          <FavoriteIcon></FavoriteIcon>
        </IconButton>
        <IconButton color="primary" onClick={(e)=>{
          addTo(card);
        }}>
          <FavoriteBorderIcon></FavoriteBorderIcon>
        </IconButton>
      </Box>
      {userIsLogin && (
        <Box display="flex" flexWrap="wrap" justifyContent="flex-end">
          <Button onClick={(e) => {
            removeFrom(card.id);
          }} color="info">
            <DeleteIcon></DeleteIcon>
          </Button>
        </Box>
      )}
    </CardContent>
  </Card>)
}

function Loader(props){
  const { width, height, borderWidth } = props;
  let useStyles = makeStyles({
    loader: {
      border: `${borderWidth || 15}px solid #f3f3f3`,
      borderTop: `${borderWidth || 15}px solid #555555`,
      borderRadius: "50%",
      width: `${width || 60}px`,
      height: `${height || 60}px`,
      animation: "App-logo-spin 2s linear infinite",
    }
  })
  let classes = useStyles();
  return (
    <div className={classes.loader}></div>
  )
}
export default App;
