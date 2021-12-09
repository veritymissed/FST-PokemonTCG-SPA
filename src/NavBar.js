import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import headerIcon from './static/images/gengar.png';

import {
  UserContext,
  color_purple,
  font_size,
  font_weight,
  color_white,

} from './App.js'

export default function NavBar(props){
  const { userState, dispatch } = useContext(UserContext);
  console.log('userState in NavBar', userState);
  let navigate = useNavigate();
  const currentPath = useLocation().pathname;

  let useStyles = makeStyles({
    navbar_box: {
      display: "flex",
      padding: "8px 16px 8px 16px",
      backgroundColor: "rgb(36, 37, 38)",
      color: "#f5f6f7",
      fontSize: "16px",
    },
    active_button:{
      color: color_purple,
      fontSize: font_size,
      fontWeight: font_weight,
    },
    non_active_button: {
      color: color_white,
      fontSize: "14px",
    },
  });


  const classes = useStyles();

  return (
    <Box className={classes.navbar_box}>
      <Box sx={{flexGrow: 1}}>
        <Button onClick={(e)=>{
          navigate('/')
        }}><img height="30" src={headerIcon}/>
          <Box className={(currentPath === "/") ? classes.active_button : classes.non_active_button}>FST Pokémon Tcg</Box>
        </Button>
      </Box>

      {!userState.isLogin && (
        <Box>
        <Button onClick={(e)=>{
          navigate('/register')
        }}>
        <Box className={(currentPath === "/register") ? classes.active_button : classes.non_active_button}>Register</Box>
        </Button>
        <Button onClick={(e) => {
          navigate('/login')
        }}>
        <Box className={(currentPath === "/login") ? classes.active_button : classes.non_active_button}>Login</Box>
        </Button>
        </Box>
      )}
      {userState.isLogin && (
        <Box sx={{width: 350}}>
        <Button onClick={(e) => {navigate('/favorite_list')}}>
          <Box display="flex" className={(currentPath === "/favorite_list") ? classes.active_button : classes.non_active_button}><Box style={{lineHeight: "10px", margin: "0px 3px"}}><FavoriteIcon></FavoriteIcon></Box></Box>
        </Button>
        <Button onClick={(e)=>{
          navigate('/logout');
        }}>
          <Box className={classes.non_active_button}>Logout - {userState.currentUserEmail}</Box>
        </Button>
        </Box>
      )}
    </Box>
  );
};
