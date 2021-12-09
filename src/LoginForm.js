import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  UserContext,
  Loader,
  setSessionStorage,
  color_white,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} from './App.js';

import * as validate from 'validate.js';
import request from 'request';

export default function LoginForm(){
  const { userState, dispatch } = useContext(UserContext);
  console.log('userState in LoginForm', userState);

  const navigate = useNavigate();
  let [isLoading, setIsLoading] = useState(false);

  let [formEmail, setFormEmail] = useState("");
  let [formPassword, setFormPassword] = useState("");

  //For form input validation
  let [formEmailValidationError, setFormEmailValidationError] = useState(false);
  let [formEmailValidationErrorMessage, setFormEmailValidationErrorMessage] = useState("");

  let [formPasswordValidationError, setFormPasswordValidationError] = useState(false);
  let [formPasswordValidationErrorMessage, setFormPasswordValidationErrorMessage] = useState("");
  //

  useEffect(()=>{
    console.log('userState.isLogin', userState.isLogin)
    if(userState.isLogin) navigate("/")
  }, [navigate])

  let loginUser = async () => {
    let validateEmailError = validate.single(formEmail, {presence: {allowEmpty: false}, email: true});
    if(validateEmailError) {
      setFormEmailValidationError(true);
      setFormEmailValidationErrorMessage(validateEmailError[0]);
      return;
    }

    let validatePasswordError = validate.single(formPassword, {presence: {allowEmpty: false}, length: {minimum: MIN_PASSWORD_LENGTH, maximum
: MAX_PASSWORD_LENGTH}});

    if(validatePasswordError) {
      setFormPasswordValidationError(true);
      setFormPasswordValidationErrorMessage(validatePasswordError[0]);
      return;
    }

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
      if(res.statusCode === 401) {
        setFormPasswordValidationError(true);
        setFormEmailValidationError(true);
        setFormEmailValidationErrorMessage("Email or password not correct.");
        throw new Error("Login user authentication error!");
      }

      setSessionStorage({currentUser: res.user})
      dispatch({type: 'login', payload: { currentUserEmail: res.user.email, favorite_cards: res.user.favorite_cards }})
      navigate('/');
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false);
    }
  };

  let useStyles = makeStyles((theme)=> ({
    login_block_container:{
      borderRadius: "5px",
      width: "400px",
      margin: "40px auto 10px auto",
      padding: "15px 30px 15px 30px",
      backgroundColor: color_white,
    },
    login_block_control: {
      marginTop: "10px",
      marginBottom: "10px",
    }
  }));
  const classes = useStyles();
  return (
    <Box className={classes.login_block_container}>
      <Box className={classes.login_block_control}>
        <TextField fullWidth
        required
        error={formEmailValidationError}
        helperText={formEmailValidationErrorMessage}
        id="outlined-required"
        label="Email"
        onChange={(e) => {
          setFormEmailValidationError(false);
          setFormEmailValidationErrorMessage("");
          setFormEmail(e.target.value);
        }}
        />
      </Box>
      <Box className={classes.login_block_control}>
        <TextField fullWidth
        id="outlined-password-input"
        error={formPasswordValidationError}
        helperText={formPasswordValidationErrorMessage}
        label={`Password(${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} char)`}
        type="password"
        autoComplete="current-password"
        onChange={(e) => {
          setFormPasswordValidationError(false);
          setFormPasswordValidationErrorMessage("");
          setFormPassword(e.target.value);
        }}
        />
      </Box>

      <Button onClick={(e) => {
        loginUser()
      }}>
      Login
      {isLoading && (<Loader width={15} height={15} borderWidth={6}></Loader>)}
      </Button>
    </Box>
  )
}
