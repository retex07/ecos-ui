import { call, put, select, takeLatest } from 'redux-saga/effects';
import get from 'lodash/get';
import {
  fetchCreateCaseWidgetData,
  fetchSiteMenuData,
  fetchUserMenuData,
  goToPageFromSiteMenu,
  runSearchAutocompleteItems,
  setCreateCaseWidgetIsCascade,
  setCreateCaseWidgetItems,
  setSearchAutocompleteItems,
  setSiteMenuItems,
  setUserMenuItems
} from '../actions/header';
import { setDashboardIdentification } from '../actions/dashboard';
import { setUserThumbnail } from '../actions/user';
import { makeSiteMenu, makeUserMenuItems, processCreateVariantsItems } from '../helpers/menu';
import { PROXY_URI } from '../constants/alfresco';
import { URL } from '../constants';
import { changeUrlLink } from '../components/PageTabs/PageTabs';
import { checkUrl } from '../helpers/urls';
import MenuService from '../services/menu';

function* fetchCreateCaseWidget({ api, logger }) {
  try {
    const resp = yield call(api.menu.getCreateVariantsForAllSites);
    const createVariants = processCreateVariantsItems(resp);

    yield put(setCreateCaseWidgetItems(createVariants));

    const isCascadeMenu = yield call(api.app.getEcosConfig, 'default-ui-create-menu');
    yield put(setCreateCaseWidgetIsCascade(isCascadeMenu === 'cascad'));
  } catch (e) {
    logger.error('[fetchCreateCaseWidget saga] error', e.message);
  }
}

function* fetchUserMenu({ api, fakeApi, logger }) {
  try {
    const userName = yield select(state => state.user.userName);
    const isAvailable = yield select(state => state.user.isAvailable);
    const isMutable = yield select(state => state.user.isMutable);

    // TODO use real api
    const isExternalAuthentication = yield call(fakeApi.getIsExternalAuthentication);

    const menuItems = makeUserMenuItems(userName, isAvailable, isMutable, isExternalAuthentication);
    yield put(setUserMenuItems(menuItems));

    const userNodeRef = yield select(state => state.user.nodeRef);
    if (userNodeRef) {
      const userPhotoSize = yield call(api.user.getPhotoSize, userNodeRef);
      if (userPhotoSize > 0) {
        const photoUrl = PROXY_URI + `citeck/ecos/image/thumbnail?nodeRef=${userNodeRef}&property=ecos:photo&width=150`;
        yield put(setUserThumbnail(photoUrl));
      }
    }
  } catch (e) {
    logger.error('[fetchUserMenu saga] error', e.message);
  }
}

function* fetchSiteMenu({ api, fakeApi, logger }) {
  try {
    const isDashboardPage = checkUrl(URL.DASHBOARD) && !checkUrl(URL.DASHBOARD_SETTINGS);
    const menuItems = makeSiteMenu({ isDashboardPage });
    yield put(setSiteMenuItems(menuItems));
  } catch (e) {
    logger.error('[fetchSiteMenu saga] error', e.message);
  }
}

function* filterSiteMenu({ api, logger }, { payload }) {
  try {
    const menuItems = makeSiteMenu({
      isDashboardPage: Boolean(get(payload, ['identification', 'id'], null))
    });
    yield put(setSiteMenuItems(menuItems));
  } catch (e) {
    logger.error('[filterSiteMenu saga] error', e.message);
  }
}

function* goToPageSiteMenu({ api, fakeApi, logger }, { payload }) {
  try {
    const link = yield MenuService.processTransitSiteMenuItem(payload);

    changeUrlLink(link, { openNewTab: true });
  } catch (e) {
    logger.error('[fetchSiteMenu saga] error', e.message);
  }
}

function* sagaRunSearchAutocomplete({ api, fakeApi, logger }, { payload }) {
  try {
    const documents = yield api.menu.getLiveSearchDocuments(payload, 0);
    const sites = yield api.menu.getLiveSearchSites(payload);
    const people = yield api.menu.getLiveSearchPeople(payload);
    const noResults = !(sites.totalRecords + documents.totalRecords + people.totalRecords);

    yield put(setSearchAutocompleteItems({ documents, sites, people, noResults }));
  } catch (e) {
    logger.error('[fetchSiteMenu saga] error', e.message);
  }
}

function* headerSaga(ea) {
  yield takeLatest(fetchCreateCaseWidgetData().type, fetchCreateCaseWidget, ea);
  yield takeLatest(fetchUserMenuData().type, fetchUserMenu, ea);
  yield takeLatest(fetchSiteMenuData().type, fetchSiteMenu, ea);
  yield takeLatest(setDashboardIdentification().type, filterSiteMenu, ea);
  yield takeLatest(goToPageFromSiteMenu().type, goToPageSiteMenu, ea);
  yield takeLatest(runSearchAutocompleteItems().type, sagaRunSearchAutocomplete, ea);
}

export default headerSaga;
