import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import './index.css';

import createApp from './components/app';
import createLauncher from './components/launcher';
import createGame from './components/game';

const [App, Launcher, Game] = [
  createApp(React),
  createLauncher(React),
  createGame(React)
];

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Launcher} />
      <Route path="game" component={Game} />
    </Route>
  </Router>,
  document.getElementById('root')
);
