import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  UserContext,
  getCurrentUser,
  setSessionStorage,
  CardList,
  getUpdateUserPromise,
} from '../App.js'

import * as _ from 'lodash';

export default function FavoriteCardList(props){
  const { userState, dispatch } = useContext(UserContext);
  console.log('userState in FavoriteCardList', userState);
  let [favoriteCardList, setFavoriteCardList] = useState(userState.favorite_cards);

  let navigate = useNavigate();
  useEffect(() => {
    if(!userState.isLogin) {
      navigate('/login');
    }
    setFavoriteCardList(userState.favorite_cards);
  },[userState]);


  let [isUpdating, setIsUpdating] = useState(false);

  let removeFrom = async (cardId) => {
    console.log(`card id = ${cardId}`);
    if(isUpdating) return
    let currentUser = getCurrentUser();
    if(_.isEmpty(currentUser)) return;

    let foundIndex = currentUser.favorite_cards.findIndex((cardInCurrentUser) => cardInCurrentUser.id === cardId);
    if(foundIndex < 0) return;
    currentUser.favorite_cards.splice(foundIndex, 1);
    setSessionStorage({currentUser})

    try {
      setIsUpdating(true);
      await getUpdateUserPromise(currentUser, {favorite_cards: currentUser.favorite_cards || []});
      dispatch({type: "update_favorite_cards", payload: {favorite_cards: currentUser.favorite_cards}});
    } catch (e) {
      console.log(e)
    } finally {
      setIsUpdating(false);
    }
  };

  return (<CardList cards={favoriteCardList} removeFrom={removeFrom}></CardList>)
}
