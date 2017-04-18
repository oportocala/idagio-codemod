import { omit, includes } from 'lodash';

import { isRavenInstalled } from '../client/Raven';
import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';
import {
  PLAYER_PROGRESS,
  ADD_TO_ANALYTICS_PROGRESS_BUFFER,
  FLUSH_ANALYTICS_PROGRESS_BUFFER,
} from '../ActionTypes';

import createLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import apiMiddleware from '../middleware/api';
import analyticsMiddleware from '../middleware/analytics';
import connectionMiddleware from '../middleware/connection';
import authMiddleware from '../middleware/auth';
import keyboardMiddleware from '../middleware/keyboard';
import playerMiddleware from '../middleware/player';

import reducers from '../reducers';

import { REHYDRATE } from 'redux-persist/constants';
import { autoRehydrate } from 'redux-persist';
import createActionBuffer from 'redux-action-buffer';

const middleware = [
  thunkMiddleware,
  routerMiddleware(browserHistory),
  apiMiddleware,
  authMiddleware,
];

if (__CLIENT__) {
  window.analytics ? middleware.push(analyticsMiddleware) : null;
  middleware.push(connectionMiddleware);
  middleware.push(keyboardMiddleware);
  middleware.push(playerMiddleware);
  middleware.unshift(createActionBuffer(REHYDRATE)); // unshift to put it first
}

if (__CLIENT__ && process.env.ENV !== 'production') {
  const logger = createLogger({
    collapsed: true,
    logger: console,
    predicate: (getState, action) => {
      const hiddenFromLog = [
        PLAYER_PROGRESS,
        ADD_TO_ANALYTICS_PROGRESS_BUFFER,
        FLUSH_ANALYTICS_PROGRESS_BUFFER,
      ];
      return !includes(hiddenFromLog, action.type);
    },
  });

  middleware.push(logger);
}

if (isRavenInstalled) {
  const ravenMiddleware = () => next => action => {
    try {
      return next(action);
    } catch (err) {
      Raven.captureException(err, {
        extra: {
          action: omit(action, 'response'),
        },
      });
    }

    return null;
  };

  middleware.push(ravenMiddleware);
}

const devToolsShouldLoad = typeof window === 'object' &&
  typeof window.devToolsExtension !== 'undefined' &&
  process.env.ENV !== 'production';

const createStoreWithMiddleware = compose(
  autoRehydrate(),
  applyMiddleware(...middleware),
  devToolsShouldLoad ? window.devToolsExtension() : f => f
)(createStore);


export default function createApplicationStore(initialData = {}) {
  return createStoreWithMiddleware(reducers, initialData);
}
