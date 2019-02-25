import { put, takeLatest, call, select } from 'redux-saga/effects';
import {
  fetchSmallLogoSrc,
  fetchLargeLogoSrc,
  fetchSlideMenuItems,
  setSmallLogo,
  setLargeLogo,
  setSlideMenuItems,
  setSlideMenuExpandableItems,
  setSelectedId,
  setIsReady
} from '../actions/slideMenu';
import { selectedMenuItemIdKey, fetchExpandableItems } from '../helpers/slideMenu';

function* fetchSmallLogo({ api, fakeApi, logger }) {
  try {
    const themeName = yield select(state => state.view.theme);
    const logoSrc = yield call(fakeApi.getSmallLogoSrc, themeName);
    yield put(setSmallLogo(logoSrc));
  } catch (e) {
    logger.error('[fetchSmallLogo saga] error', e.message);
  }
}

function* fetchLargeLogo({ api, fakeApi, logger }) {
  try {
    const themeName = yield select(state => state.view.theme);
    const logoSrc = yield call(fakeApi.getLargeLogoSrc, themeName);
    yield put(setLargeLogo(logoSrc));
  } catch (e) {
    logger.error('[fetchLargeLogo saga] error', e.message);
  }
}

function* fetchSlideMenu({ api, fakeApi, logger }) {
  try {
    const apiData = yield call(api.menu.getSlideMenuItems);
    const menuItems = apiData.items;
    // console.log('menuItems', menuItems);

    let selectedId = null;
    if (sessionStorage && sessionStorage.getItem) {
      selectedId = sessionStorage.getItem(selectedMenuItemIdKey);
      yield put(setSelectedId(selectedId));
    }

    const expandableItems = fetchExpandableItems(menuItems, selectedId);

    yield put(setSlideMenuItems(menuItems));
    yield put(setSlideMenuExpandableItems(expandableItems));
    yield put(setIsReady(true));
  } catch (e) {
    logger.error('[fetchSlideMenu saga] error', e.message);
  }
}

function* headerSaga(ea) {
  yield takeLatest(fetchSmallLogoSrc().type, fetchSmallLogo, ea);
  yield takeLatest(fetchLargeLogoSrc().type, fetchLargeLogo, ea);
  yield takeLatest(fetchSlideMenuItems().type, fetchSlideMenu, ea);
}

export default headerSaga;
