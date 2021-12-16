import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { makeStyles } from '@mui/styles';

import { Box, Button, Typography } from '@mui/material';
import { Card, CardMedia, CardContent, CardActions } from '@mui/material';

import IconButton from '@material-ui/core/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  UserContext,
} from '../App.js'

export default function PokemonCard(props){
  const { card,  addTo, removeFrom } = props;

  const { userState, dispatch } = useContext(UserContext);

  let [isInFavoriteListPage, setIsInFavoriteListPage] = useState(useLocation().pathname === '/favorite_list');

  let [inFavoriteCards, setInFavoriteCards] = useState(false);
  useEffect(() => {
    let foundIndex = userState.favorite_cards.findIndex((cardInCurrentUser) => cardInCurrentUser.id === card.id);
    if(foundIndex >= 0) setInFavoriteCards(true);
    else setInFavoriteCards(false);
  }, [userState, card.id]);


  let useStyleClasses = makeStyles((theme) => ({
    card_style: {
      marginTop: '10px',
      marginBottom: '10px',
      // marginLeft: 'auto',
      // marginRight: 'auto',
      marginLeft: '7.5px',
      marginRight: '7.5px',
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
      {userState.isLogin && !isInFavoriteListPage && (
        <Box display="flex" justifyContent="flex-end">
          {inFavoriteCards && (
            <IconButton color="primary" onClick={(e)=>{
              removeFrom(card.id);
            }}>
            <FavoriteIcon></FavoriteIcon>
            </IconButton>
          )}
          {!inFavoriteCards && (
            <IconButton color="primary" onClick={(e)=>{
              addTo(card);
            }}>
            <FavoriteBorderIcon></FavoriteBorderIcon>
            </IconButton>
          )}
        </Box>
      )}
      {userState.isLogin && isInFavoriteListPage && (
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
