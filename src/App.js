import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Box, TextField, Button, Typography, Icon } from '@mui/material';
import { Card, CardMedia, CardContent, CardActions } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';

import request from 'request';

import * as ponkemon_cards from './static/data/cards.json'
let cards = ponkemon_cards.default.data;


function App() {
  return (
    <div className="App">
    <Router>
      <NavBar></NavBar>
      <Routes>
        <Route path="/"></Route>
        <Route path="/login" element={<LoginForm />}></Route>
        <Route path="/register" element={<RegisterForm />}></Route>
      </Routes>
      <React.Fragment>
      <QueryBlock></QueryBlock>
      <Box display="flex" justifyContent="left" flexWrap="wrap" maxWidth="900px" mx="auto">
      {
        cards.map((card) => (
          <PokemonCard card={card}></PokemonCard>
        ))
      }
      </Box>
      </React.Fragment>
    </Router>
    </div>
  );
}

function LoginForm(){
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");

  useEffect(() => {

  },[])

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
        resolve(response.body);
      });

    });

    try {
      let res = await loginPromise;
      console.log('login res', res)
    } catch (e) {
      console.log(e)
    } finally {

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
      }}>Login</Button>
    </Box>
  )
}

function RegisterForm(props){
  let [formEmail, setFormEmail] = useState("");
  let [formPassword, setFormPassword] = useState("");

  let registerUser = async () => {
    let loginPromise = new Promise(function(resolve, reject) {
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
      let res = await loginPromise;
      console.log('login res', res)
    } catch (e) {
      console.log(e)
    } finally {

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
      }}>Register</Button>
    </Box>
  )
}

function NavBar(props){
  let navigate = useNavigate();
  let [isLogin,setIsLogin] = useState(false);

  return (
    <Box>
      <Box>FST PokemonTcg</Box>
      <Button>Favorite list</Button>
      {isLogin && (
        <React.Fragment>
        <Button>
          <FavoriteIcon></FavoriteIcon>
        </Button>
        <Button onClick={(e)=>{
          setIsLogin(false)
        }}>Logout</Button>
        </React.Fragment>
      )}
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
    </Box>
  );
}

function QueryBlock(props){
  const [isQuerying, setIsQuerying] = useState(false);

  const [formName, setFormDataName] = useState('');
  const [formSuperType, setFormSuperType] = useState('');
  const [formHp, setFormHp] = useState('');
  const [formRarity, setFormRarity] = useState('');
  const [queryResult, setQueryResult] = useState(null);

  const queryCards = async () => {
    if(isQuerying) return;
    else setIsQuerying(true);

    console.log('formName', formName)
    console.log('formSuperType', formSuperType)
    console.log('formHp', formHp)
    console.log('formRarity', formRarity)

    let queryString = '';
    if(formName.length) queryString += `name:${formName}`

    return new Promise(function(resolve) {
      try {
        request({
          method: 'GET',
          uri: `https://api.pokemontcg.io/v2/cards/?q=${queryString}`,
          q: queryString,
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
      <TextField id="outlined-basic" label="supertype" variant="outlined" onChange={(e) => {setFormSuperType(e.target.value)}}   />
      <TextField id="outlined-basic" label="hp" variant="outlined" onChange={(e) => {setFormHp(e.target.value)}}  />
      <TextField id="outlined-basic" label="rarity" variant="outlined" onChange={(e) => {setFormRarity(e.target.value)}}  />
      <Button onClick={queryCards}>Query</Button>
      { isQuerying && (
        <Loader width={60} height={60}></Loader>
      )}
      { queryResult && queryResult.length && (queryResult.map((card) => (
        <PokemonCard card={card}></PokemonCard>
      )))}
    </Box>
  );
}

function PokemonCard(props){
  const { card } = props;
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
      <Typography variant="subtitle2" gutterBottom component="div">
        HP: {card.hp || 'No data'}
      </Typography>
      <Typography variant="subtitle2" gutterBottom component="div">
        Rarity: {card.rarity|| 'No data'}
      </Typography>
    </CardContent>
  </Card>)
}

function Header(){
  return (
  <header className="App-header">
    <img src={logo} className="App-logo" alt="logo" />
    <p>
      Edit <code>src/App.js</code> and save to reload.
    </p>
    <a
      className="App-link"
      href="https://reactjs.org"
      target="_blank"
      rel="noopener noreferrer"
    >
    </a>
  </header>
  );
}

function Loader(props){
  const { width, height } = props;
  let useStyles = makeStyles({
    loader: {
      border: "16px solid #f3f3f3",
      borderTop: "16px solid #555555",
      borderRadius: "50%",
      width: `${width}px`,
      height: `${height}px`,
      animation: "App-logo-spin 2s linear infinite",
    }
  })
  let classes = useStyles();
  return (
    <div className={classes.loader}></div>
  )
}
export default App;
