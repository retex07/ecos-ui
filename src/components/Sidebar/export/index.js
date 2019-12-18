import '../../../fonts/citeck/css/citeck.css';

import 'react-app-polyfill/ie11';

import React from 'react';
import ReactDOM from 'react-dom';
import Logger from 'logplease';
import { Provider } from 'react-redux';

import Sidebar from '../Sidebar';

import { MenuApi } from '../../../api/menu';
import { ViewApi } from '../../../api/view';
import { fakeApi } from '../../../api/fakeApi';

import { detectMobileDevice, loadThemeRequest } from '../../../actions/view';
import { initMenuSettings } from '../../../actions/menu';

import configureStore from './store';
import { i18nInit } from '../../../i18n';

const logger = Logger.create('Sidebar');
Logger.setLogLevel(Logger.LogLevels.DEBUG);

const api = {};
const store = configureStore({
  api,
  fakeApi,
  logger
});

api.menu = new MenuApi(store);
api.view = new ViewApi(store);

const render = (elementId, props, callback) => {
  store.dispatch(
    loadThemeRequest({
      onSuccess: () => {
        store.dispatch(initMenuSettings());
        store.dispatch(detectMobileDevice());

        i18nInit({ debug: false }).then(() => {
          ReactDOM.render(
            <Provider store={store}>
              <Sidebar {...props} />
            </Provider>,
            document.getElementById(elementId),
            callback
          );
        });
      }
    })
  );
};

export { render };