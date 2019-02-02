import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, } from 'redux';
import thunk from "redux-thunk";
import rootReducer from './reducers'
import App from './App';
import { createGlobalStyle } from 'styled-components';
import * as serviceWorker from './serviceWorker';

const store = createStore(rootReducer, applyMiddleware(thunk));
const GlobalStyles = createGlobalStyle`
  html, body {
    @import url('https://fonts.googleapis.com/css?family=Lobster');
    box-sizing: border-box;
  }
  *, *::after, *::before {
    box-sizing: inherit;
    margin: 0;
    padding: 0;
  }
`;

ReactDOM.render(
  <Provider store={store}>
    <React.Fragment>
      <GlobalStyles/>
      <App />
    </React.Fragment>
  </Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
