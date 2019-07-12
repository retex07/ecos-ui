import { call, put, takeLatest } from 'redux-saga/effects';
import {
  getAvailableWidgets,
  getDashboardConfig,
  initDashboardSettings,
  saveDashboardConfig,
  setAvailableWidgets,
  setDashboardConfig,
  setResultSaveDashboardConfig
} from '../actions/dashboardSettings';
import { setNotificationMessage } from '../actions/notification';
import { saveMenuConfig } from '../actions/menu';
import { t } from '../helpers/util';
import DashboardService from '../services/dashboard';
import DashboardSettingsConverter from '../dto/dashboardSettings';
import { SAVE_STATUS } from '../constants';

function* doInitDashboardSettingsRequest({ api, logger }, { payload }) {
  try {
    yield put(getAvailableWidgets());
    yield put(getDashboardConfig(payload));
  } catch (e) {
    yield put(setNotificationMessage(t('dashboard-settings.error1')));
    logger.error('[dashboard/settings/ doInitDashboardSettingsRequest saga] error', e.message);
  }
}

function* doGetDashboardConfigRequest({ api, logger }, { payload }) {
  try {
    const { dashboardId } = payload;
    const result = yield call(api.dashboard.getDashboardByOneOf, { dashboardId, off: { user: true } });
    const data = DashboardService.checkDashboardResult(result);
    const webConfig = DashboardSettingsConverter.getSettingsConfigForWeb(data);

    yield put(setDashboardConfig(webConfig));
  } catch (e) {
    yield put(setNotificationMessage(t('dashboard-settings.error2')));
    logger.error('[dashboard/settings/ doGetDashboardConfigRequest saga] error', e.message);
  }
}

function* doGetWidgetsRequest({ api, logger }, action) {
  try {
    const apiData = yield call(api.dashboard.getAllWidgets);

    yield put(setAvailableWidgets(apiData));
  } catch (e) {
    yield put(setNotificationMessage(t('dashboard-settings.error3')));
    logger.error('[dashboard/settings/ doGetWidgetsRequest saga] error', e.message);
  }
}

function* doSaveSettingsRequest({ api, logger }, { payload }) {
  try {
    const { dashboardId, dashboardKey } = payload;
    const serverConfig = DashboardSettingsConverter.getSettingsConfigForServer(payload);
    const { layout, menu } = serverConfig;
    const dashboardResult = yield call(api.dashboard.saveDashboardConfig, {
      config: { layout },
      dashboardId,
      dashboardKey
    });
    const parseDashboard = DashboardService.parseSaveResult(dashboardResult);

    yield put(saveMenuConfig(menu));
    yield put(
      setResultSaveDashboardConfig({
        status: parseDashboard.dashboardId ? SAVE_STATUS.SUCCESS : SAVE_STATUS.FAILURE,
        dashboardId: parseDashboard.dashboardId
      })
    );
  } catch (e) {
    yield put(setNotificationMessage(t('dashboard-settings.error4')));
    logger.error('[dashboard/settings/ doSaveSettingsRequest saga] error', e.message);
  }
}

function* saga(ea) {
  yield takeLatest(initDashboardSettings().type, doInitDashboardSettingsRequest, ea);
  yield takeLatest(getDashboardConfig().type, doGetDashboardConfigRequest, ea);
  yield takeLatest(getAvailableWidgets().type, doGetWidgetsRequest, ea);
  yield takeLatest(saveDashboardConfig().type, doSaveSettingsRequest, ea);
}

export default saga;
