# Pokémon TCG Client Side Application

## Application overview

- Homepage (Querying cards API and displayed block)

- Register page

- Login page

- Favorite card page (Logged user only)

## Home page - Pokémon TCG API querying part

- Query cards according to the parameters (Name, Type, Rarity, HP)

- Load next page of result of the current querying parameters.

- Added card into favorite list (logged user only)

![Query](https://user-images.githubusercontent.com/6461602/146106069-3fe3e021-6a56-481e-8404-0a03dca85b71.png)

![Add](https://user-images.githubusercontent.com/6461602/146106238-a1797644-8ae3-42e9-a2f1-f28c90af09c7.png)

## Favorite card page (Logged user only)

- View all of favorite cards

- Remove cards from favorite card list

![Favorite](https://user-images.githubusercontent.com/6461602/146107415-1e32b541-561e-4a9d-8480-73d49722509f.png)

## Login page

- Non-blank email

- 4-20 (configured in `MIN_PASSWORD_LENGTH / MAX_PASSWORD_LENGTH` ) char in password

![LoginForm](https://user-images.githubusercontent.com/6461602/146107528-74a2f32c-75c6-4c6e-89e1-453721a32ae3.png)

## Register page

- Non-blank email

- 4-20 char in password

- Password repeat checked

![RegisterForm](https://user-images.githubusercontent.com/6461602/146107513-8c734b56-1ae1-4e0c-b99c-7bfe23aa7e56.png)

## Configuration and constants

```js

// in App.js
//LoginForm & RegisterForm
export const MIN_PASSWORD_LENGTH = 4;
export const MAX_PASSWORD_LENGTH = 20;

//Pokémon TCG API querying each page size
const QUERYING_API_PAGE_SIZE = 8;

```

## core

```js
const initialUserState = {
  isLogin: false,
  currentUserEmail: null,
  favorite_cards: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'login':
      const { isLogin, ...updatePayload } = action.payload;
      return { isLogin: true , ...updatePayload };
    ...
    default:
      throw new Error();
  }
};

//
export const UserContext = React.createContext(null);

<UserContext.Provider value={{userState, dispatch}}>
<Router>
  <NavBar></NavBar>
  <Routes>
    <Route path="/" element={<QueryBlock />}></Route>
    ...
  </Routes>
</Router>
</UserContext.Provider>

```


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\

### If you don't have the server

```sh
yarn global add serve

serve -s build
```
