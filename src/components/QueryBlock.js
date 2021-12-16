import React, { useState, useContext } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { FormControl } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import { makeStyles } from '@mui/styles';

import CardList from './CardList';

import request from 'request';
import * as _ from 'lodash';

import {
  UserContext,
  getCurrentUser,
  setSessionStorage,
  getUpdateUserPromise,
  color_white,
  types,
  rarities,
  Loader,
  QUERYING_API_PAGE_SIZE,
} from '../App.js'

export default function QueryBlock(props){
  const { userState, dispatch } = useContext(UserContext);
  // console.log('userState in QueryBlock', userState);

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
      await getUpdateUserPromise(currentUser, {favorite_cards: currentUser.favorite_cards || []});
      dispatch({type: "update_favorite_cards", payload: {favorite_cards: currentUser.favorite_cards}});
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
      dispatch({type: "update_favorite_cards", payload: {favorite_cards: currentUser.favorite_cards}});
    } catch (e) {
      console.log(e)
    } finally {
      setIsUpdating(false);
    }
  };

  let useStyles = makeStyles((theme)=> ({
    query_block_container:{
      borderRadius: "5px",
      width: "80%",
      margin: "40px auto 10px auto",
      padding: "15px 30px 15px 30px",
      backgroundColor: color_white,
      display: "flex",
    },
    slider_container: {
      color: "#626263",
      width: "400px",
      padding: "5px 5px 5px 5px",
      marginLeft: "20px",
      marginRight: "20px",
    },
    queryButtonText: {
      fontWeight: "500",
      fontSize: '16px',
      paddingTop: "10px",
      paddingBottom: "10px",
    }
  }))

  const classes = useStyles();

  let select_box_style_sx = {
    minWidth: 120,
    marginLeft: "5px",
    marginRight: "5px",
  }

  return (
    <Box >
      <Box className={classes.query_block_container}>
        <Box sx={select_box_style_sx}>
          <TextField id="outlined-basic" label="Name" variant="outlined" onChange={(e) => {setFormDataName(e.target.value)}} />
        </Box>

        <Box sx={select_box_style_sx}>
        <FormControl fullWidth>
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
        </Box>

        <Box sx={select_box_style_sx}>
        <FormControl fullWidth>
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
        </Box>

        <Box className={classes.slider_container}>
        <Box>HP range</Box>
        <Slider
        min={0} max={500}
        valueLabelDisplay="auto"
        getAriaLabel={() => 'HP range'}
        value={formHp}
        onChange={(e, newValue)=>{
          setFormHp(newValue)
        }}
        getAriaValueText={(e) => `${formHp}`}
        />
        </Box>

        <Box>
          <Button onClick={(e)=>{
            queryCards();
          }}><Box className={classes.queryButtonText}>Query</Box></Button>
        </Box>
      </Box>

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
