import { call, put, takeLatest } from 'redux-saga/effects';
import { setNotificationMessage } from '../actions/notification';
import { setLoading } from '../actions/loader';
import { getAllMenuItems, getUserMenuConfig, initMenuSettings, setAllMenuItems, setUserMenuConfig } from '../actions/menu';
import { t } from '../helpers/util';

import * as mock from '../api/mock/dashboardSettings';

function* doInitMenuSettings({ api, logger }, action) {
  try {
    yield put(setLoading(true));
    yield doGetMenuItemsRequest({ api, logger }, action);
    yield doGetUserMenuConfigRequest({ api, logger }, action);
    yield put(setLoading(false));
  } catch (e) {
    yield put(setNotificationMessage(t('Ошибка получения меню')));
    logger.error('[dashboard/ doGetDashboardRequest saga] error', e.message);
  }
}

function* doGetMenuItemsRequest({ api, logger }, action) {
  try {
    const apiData = yield call(api.menu.getSlideMenuItems);
    const menuItems = apiData.items;

    yield put(setAllMenuItems(menuItems));
  } catch (e) {
    yield put(setNotificationMessage(t('Ошибка. Пункты меню не получены')));
    logger.error('[dashboard/settings/ doGetMenuItemsRequest saga] error', e.message);
  }
}

function* doGetUserMenuConfigRequest({ api, logger }, { payload }) {
  try {
    yield put(setLoading(true));
    // todo test data
    const menu = yield call(mock.getMenuConfig);
    yield put(setUserMenuConfig(menu));
    yield put(setLoading(false));
  } catch (e) {
    yield put(setNotificationMessage(t('Ошибка получения меню')));
    logger.error('[dashboard/ doGetDashboardRequest saga] error', e.message);
  }
}

function* saga(ea) {
  yield takeLatest(getUserMenuConfig().type, doGetUserMenuConfigRequest, ea);
  yield takeLatest(initMenuSettings().type, doInitMenuSettings, ea);
  yield takeLatest(getAllMenuItems().type, doGetMenuItemsRequest, ea);
}

export default saga;
