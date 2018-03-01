import React from 'react';
import ReactDOM from 'react-dom';
import './assets/css/bootstrap.min.css';
import './index.css';
import './App.css';
import App from './App';
import store from './store/index';
import { formatEvents } from './actions/index';
import registerServiceWorker from './registerServiceWorker';

window.store = store;
window.formatEvents = formatEvents;

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
