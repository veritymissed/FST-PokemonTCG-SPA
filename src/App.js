import React, { useState, useEffect, useReducer, useContext } from 'react';
import './App.css';

import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { makeStyles } from '@mui/styles';

import NavBar from './components/NavBar'
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import FavoriteCardList from './components/FavoriteCardList';
import QueryBlock from './components/QueryBlock';

import request from 'request';

import * as raritiesEsModule from './static/rarities.json';
import * as typesEsModule from './static/types.json';

export const rarities = raritiesEsModule.default.data;
export const types = typesEsModule.default.data;

export const color_purple = "#5052c9";
export const color_white = "#f5f6f7";
export const font_weight = "700";

//LoginForm & RegisterForm
export const MIN_PASSWORD_LENGTH = 4;
export const MAX_PASSWORD_LENGTH = 20;

export const QUERYING_API_PAGE_SIZE = 8;

const initialUserState = {
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
    case 'update_favorite_cards':
      const { favorite_cards, ...oldState} = state;
      console.log('update_favorite_cards', { ...oldState, favorite_cards: action.payload.favorite_cards });
      return { ...oldState, favorite_cards: action.payload.favorite_cards };
    case 'logout':
      return initialUserState;
    default:
      throw new Error();
  }
};

export const UserContext = React.createContext(null);

export function setSessionStorage(session){
  removeSessionStorage();
  let jsonStringOfNewSession = JSON.stringify(session);
  localStorage.setItem("session", jsonStringOfNewSession)
}

function removeSessionStorage(){
  localStorage.removeItem("session");
}

export function getSessionStorage(){
  const sessionCookie = localStorage.getItem("session");
  if(sessionCookie === "undefined" || !sessionCookie) return {};
  else return JSON.parse(sessionCookie);
}

export function getCurrentUser(){
  const {currentUser} = getSessionStorage();
  return currentUser;
}

export const getUpdateUserPromise = function(updatingUser, form){
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
  let currentUserInLocalStorage = getCurrentUser();
  let init;
  if(currentUserInLocalStorage){
    init = {
      isLogin: true,
      currentUserEmail: currentUserInLocalStorage.email,
      favorite_cards: currentUserInLocalStorage.favorite_cards
    };
  }
  else init = initialUserState;

  const [userState, dispatch] = useReducer(reducer, initialUserState, () => {
    return init
  });

  useEffect(() => {
    let currentUserInLocalStorage = getCurrentUser();
    if(currentUserInLocalStorage){
      dispatch({type: 'login', payload: {currentUserEmail: currentUserInLocalStorage.email, favorite_cards: currentUserInLocalStorage.favorite_cards }});
    }
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

function Logout() {
  const { userState, dispatch } = useContext(UserContext);
  let navigate = useNavigate();

  useEffect(() => {
    removeSessionStorage();
    dispatch({ type: 'logout' });
    navigate("/");
  },[navigate, dispatch]);
  return (
    <></>
  )
};

export function Loader(props){
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
