import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import app from './app';
import bpmn from './bpmn';
import header from './header';
import modal from './modal';
import notification from './notification';
import slideMenu from './slideMenu';
import user from './user';
import view from './view';
import journals from './journals';
import { rootReducer as cardDetails } from './cardDetails';
import pageTabs from './pageTabs';
import comments from './comments';

const reducers = {
  app,
  bpmn,
  cardDetails,
  header,
  modal,
  notification,
  slideMenu,
  user,
  view,
  journals,
  pageTabs,
  comments
};

export default history =>
  combineReducers({
    router: connectRouter(history),
    ...reducers
  });

export const createReducer = (asyncReducers, history) => {
  return combineReducers({
    router: connectRouter(history),
    ...reducers,
    ...asyncReducers
  });
};
