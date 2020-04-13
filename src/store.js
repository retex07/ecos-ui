import { applyMiddleware, compose, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import createRootReducer, { createReducer } from './reducers';
import sagas from './sagas';

const sagaMiddleware = createSagaMiddleware();
const history = createBrowserHistory();

let optionalMiddlewares = [];
if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({
    collapsed: true,
    diff: true
    //predicate: (getState, action) => action.type.startsWith("tasks/")
  });
  optionalMiddlewares.push(logger);
}

let composeEnhancers = compose;
if (typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
}

export default function configureStore(ea) {
  const initialState = {};
  const store = createStore(
    createRootReducer(history),
    initialState,
    composeEnhancers(applyMiddleware(routerMiddleware(history), sagaMiddleware, thunk.withExtraArgument(ea), ...optionalMiddlewares))
  );

  sagaMiddleware.run(sagas, ea);
  store.asyncReducers = {}; // Async reducer registry

  return store;
}

export function getHistory() {
  return history;
}

export function injectAsyncReducer(store, name, reducer) {
  store.asyncReducers[name] = reducer;
  store.replaceReducer(createReducer(store.asyncReducers, history));
}
