import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import {
  UserContext,
  Loader,
  setSessionStorage,
  getSessionStorage,
  color_white,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} from '../App.js'

import * as validate from 'validate.js';
import request from 'request';

export default function RegisterForm(props){
  const { dispatch } = useContext(UserContext);

  const navigate = useNavigate();
  let [isLoading, setIsLoading] = useState(false);

  let [formEmail, setFormEmail] = useState("");
  let [formPassword, setFormPassword] = useState("");
  let [formRepeatPassword, setFormRepeatPassword] = useState("");

  //For form input validation
  let [formEmailValidationError, setFormEmailValidationError] = useState(false);
  let [formEmailValidationErrorMessage, setFormEmailValidationErrorMessage] = useState("");

  let [formPasswordValidationError, setFormPasswordValidationError] = useState(false);
  let [formPasswordValidationErrorMessage, setFormPasswordValidationErrorMessage] = useState("");

  let [formRepeatPasswordValidationError, setFormRepeatPasswordValidationError] = useState(false);
  let [formRepeatPasswordValidationErrorMessage, setFormRepeatPasswordValidationErrorMessage] = useState("");

  useEffect(()=>{
    const {currentUser} = getSessionStorage();
    if(currentUser) navigate('/')
  }, [navigate])

  let registerUser = async () => {
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

    let validatePasswordRepeatError = validate({formPassword, formRepeatPassword}, {
      formRepeatPassword: {
        equality: "formPassword"
      }
    });
    console.log('validatePasswordRepeatError', validatePasswordRepeatError)
    if(validatePasswordRepeatError) {
      setFormRepeatPasswordValidationError(true);
      setFormRepeatPasswordValidationErrorMessage(validatePasswordRepeatError.formRepeatPassword[0]);
      return;
    }

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
        try {
          if (error) throw error;
          else{
            resolve({
              statusCode: response.statusCode,
              message: JSON.parse(response.body)
            });
          }
        } catch (e) {
          throw error;
        }
      });

    });

    try {
      if(isLoading) return;
      setIsLoading(true)
      let res = await registerPromise;
      console.log(res)
      if(res.statusCode !== 201) throw new Error(res.message);
      else {
        setSessionStorage({currentUser: {
          email: formEmail,
          favorite_cards: []
        }})
        dispatch({type: 'login', payload: { currentUserEmail: formEmail, favorite_cards: []}})
        navigate('/');
      }
    } catch (e) {
      console.log(e)
      setFormEmailValidationError(true);
      setFormEmailValidationErrorMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  let useStyles = makeStyles((theme)=> ({
    register_block_container:{
      borderRadius: "5px",
      width: "400px",
      margin: "40px auto 10px auto",
      padding: "15px 30px 15px 30px",
      backgroundColor: color_white,
    },
    register_block_control: {
      marginTop: "10px",
      marginBottom: "10px",
    }
  }));
  const classes = useStyles();

  return(
    <Box className={classes.register_block_container}>
      <Box className={classes.register_block_control}>
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
      <Box className={classes.register_block_control}>
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
      <Box className={classes.register_block_control}>
        <TextField fullWidth
        id="outlined-password-input"
        error={formRepeatPasswordValidationError}
        helperText={formRepeatPasswordValidationErrorMessage}
        label="Repeat password"
        type="password"
        autoComplete="current-password"
        onChange={(e) => {
          setFormRepeatPasswordValidationError(false);
          setFormRepeatPasswordValidationErrorMessage("");
          setFormRepeatPassword(e.target.value);
        }}
        />
      </Box>
      <Button onClick={(e) => {
        registerUser()
      }}>Register
      { isLoading && (<Loader width={15} height={15} borderWidth={6}></Loader>) }
      </Button>
    </Box>
  )
}
