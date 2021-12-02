import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Box, TextField, Button, Typography, Icon } from '@mui/material';
import { Card, CardMedia, CardContent, CardActions } from '@mui/material';
import { FormControl } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';

import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
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

var howOfftenAppUseEffect = 0;

console.log('rarities', rarities)
console.log('supertypes', supertypes)
console.log('types', types)

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

function App(props) {
  useEffect(() => {
    howOfftenAppUseEffect++;
    console.log("how often APP useEffect - ", howOfftenAppUseEffect);
  },[]);

  return (
    <div className="App">
    <Router>
      <NavBar></NavBar>
      <Routes>
        <Route path="/" element={<QueryBlock />}></Route>
        <Route path="/favorite_list" element={<FavoriteCardList favoriteCardList={cards}/>}></Route>
        <Route path="/login" element={<LoginForm />}></Route>
        <Route path="/register" element={<RegisterForm />}></Route>
      </Routes>
    </Router>
    </div>
  );
}

function FavoriteCardList(props){
  let navigate = useNavigate();
  const { favoriteCardList } = props;
  const [userIsLogin, setUserIsLogin] = useState(!_.isEmpty(getCurrentUser()));
  useEffect(() => {
    if(!userIsLogin) navigate('/');
  },[navigate]);

  return (<CardList userIsLogin={userIsLogin} cards={favoriteCardList}></CardList>)
}

function CardList(props){
  const { cards, userIsLogin } = props;

  return (
    <Box display="flex" justifyContent="left" flexWrap="wrap" maxWidth="900px" mx="auto">
    {
      cards.map((card) => (
        <PokemonCard card={card} userIsLogin={userIsLogin}></PokemonCard>
      ))
    }
    </Box>
  )
}

function LoginForm(){
  const navigate = useNavigate();
  let [isLoading, setIsLoading] = useState(false);

  let [formEmail, setFormEmail] = useState("");
  let [formPassword, setFormPassword] = useState("");

  useEffect(()=>{
    const {currentUser} = getSessionStorage();
    if(currentUser) navigate('/')
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

function NavBar(props){
  let navigate = useNavigate();
  let [isLogin,setIsLogin] = useState(false);
  let [currentUser, setCurrentUser] = useState({});

  useEffect(()=>{
    const session = getSessionStorage();
    if(session?.currentUser?.email){
      setCurrentUser(session.currentUser);
      // console.log('currentUser', currentUser)
      setIsLogin(true);
    }
  }, [navigate])

  return (
    <Box>
      <Box>FST PokemonTcg</Box>
      <Button onClick={(e)=>{
        navigate('/')
      }}>FST PokemonTcg</Button>
      {!isLogin && (
        <React.Fragment>
        <Button onClick={(e)=>{
          navigate('/register')
        }}>SignUp</Button>
        <Button onClick={(e) => {
          navigate('/login')
        }}>Login</Button>
        </React.Fragment>
      )}
      {isLogin && (
        <React.Fragment>
        <Button onClick={(e) => {navigate('/favorite_list')}}>Favorite list<FavoriteIcon></FavoriteIcon></Button>
        <Button onClick={(e)=>{
          removeSessionStorage();
          setIsLogin(false)
          navigate('/')
        }}>Logout</Button>
        <Box>{currentUser.email}</Box>
        </React.Fragment>
      )}
    </Box>
  );
}

function QueryBlock(props){
  const [isQuerying, setIsQuerying] = useState(false);

  const [formName, setFormDataName] = useState('');
  const [formType, setFormType] = useState('');
  const [formHp, setFormHp] = useState([0, 500]);
  const [formRarity, setFormRarity] = useState('');
  const [queryResult, setQueryResult] = useState(null);

  const queryCards = async () => {
    if(isQuerying) return;
    else setIsQuerying(true);

    console.log('formName', formName)
    console.log('formType', formType)
    console.log('formHp', formHp)
    console.log('formRarity', formRarity)

    let queryString = '';
    if(formName.length) queryString += `name:"*${formName}*" `;
    if(formType.length) queryString += `types:${formType} `;
    if(formRarity.length) queryString += `rarity:"${formRarity}" `

    queryString += `hp:[${formHp[0]} TO ${formHp[1]}] `

    console.log('queryString', queryString)
    return new Promise(function(resolve) {
      try {
        request({
          method: 'GET',
          uri: `https://api.pokemontcg.io/v2/cards/?q=${queryString}&pageSize=20`,
          q: queryString,
          pageSize: 20,
        }, function(err, res, body){
          if(err) throw err
          else resolve(JSON.parse(body))
        });
      } catch (e) {
        throw e
      }
    })
    .then((res) => {
      setQueryResult(res.data);
    })
    .catch((error) => console.log(error))
    .finally(() => {
      setIsQuerying(false);
    });
  }

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
      </FormControl>
      <Button onClick={queryCards}>Query</Button>
      { isQuerying && (
        <Loader width={60} height={60} borderWidth={15}></Loader>
      )}
      { queryResult && queryResult.length && (<CardList cards={queryResult}></CardList>)}
    </Box>
  );
}

function PokemonCard(props){
  const { card, userIsLogin } = props;

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

  const deleteFromFavoriteList = async () => {
    if(isUpdating) return
    // console.log(`Delete ponkemon card id = ${card.id} from list`)
    const currentUser = getCurrentUser();
    if(_.isEmpty(currentUser)) return;

    let foundIndex = currentUser.favorite_cards.findIndex((cardInCurrentUser) => cardInCurrentUser.id === card.id);
    if(foundIndex < 0) return;
    // console.log('currentUser.favorite_cards', currentUser.favorite_cards)
    currentUser.favorite_cards.splice(foundIndex, 1);
    setSessionStorage({currentUser})
    // console.log('currentUser.favorite_cards', currentUser.favorite_cards)
    // console.log('found', found)
    try {
      setIsUpdating(true);
      await getUpdateUserPromise(currentUser, {favorite_cards: currentUser.favorite_cards || []})
    } catch (e) {
      console.log(e)
    } finally {
      setIsUpdating(false);
    }
  };

  const addToFavoriteList = async () => {
    if(isUpdating) return

    const currentUser = getCurrentUser();
    if(_.isEmpty(currentUser)) return;

    let foundIndex = currentUser.favorite_cards.findIndex((cardInCurrentUser) => cardInCurrentUser.id === card.id);
    if(foundIndex >= 0) return;

    currentUser.favorite_cards.push(card);
    setSessionStorage({currentUser})

    try {
      await getUpdateUserPromise(currentUser, {favorite_cards: currentUser.favorite_cards || []})
    } catch (e) {
      console.log(e)
    } finally {
      setIsUpdating(false);
    }
  }

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
      {userIsLogin && (
        <Box display="flex" flexWrap="wrap" justifyContent="flex-end">
          <Button onClick={addToFavoriteList}>
            <FavoriteIcon></FavoriteIcon>
          </Button>
          <Button onClick={deleteFromFavoriteList} color="info">
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
