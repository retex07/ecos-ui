import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  getAvailableWidgets,
  getCheckUpdatedDashboardConfig,
  getDashboardConfig,
  getDashboardKeys,
  initDashboardSettings,
  saveDashboardConfig,
  setAvailableWidgets,
  setCheckUpdatedDashboardConfig,
  setDashboardConfig,
  setDashboardKeys,
  setRequestResultDashboard
} from '../actions/dashboardSettings';
import { setNotificationMessage } from '../actions/notification';
import { selectIdentificationForSet } from '../selectors/dashboard';
import { saveMenuConfig } from '../actions/menu';
import { t } from '../helpers/util';
import DashboardService from '../services/dashboard';
import DashboardSettingsConverter from '../dto/dashboardSettings';
import { RequestStatuses } from '../constants';

function* doInitDashboardSettingsRequest({ api, logger }, { payload }) {
  try {
    yield put(getDashboardConfig(payload));
  } catch (e) {
    yield put(setNotificationMessage(t('dashboard-settings.error1')));
    logger.error('[dashboard/settings/ doInitDashboardSettingsRequest saga] error', e.message);
  }
}

function* doGetDashboardConfigRequest({ api, logger }, { payload }) {
  try {
    const { dashboardId, recordRef } = payload;

    if (dashboardId) {
      const result = yield call(api.dashboard.getDashboardById, dashboardId, true);
      const data = DashboardService.checkDashboardResult(result);
      const webConfig = DashboardSettingsConverter.getSettingsConfigForWeb(data);

      yield put(setDashboardConfig(webConfig));
      yield put(getAvailableWidgets(data.type));
      yield put(getDashboardKeys(recordRef));
    } else {
      yield put(setNotificationMessage(t('dashboard-settings.error2')));
    }
  } catch (e) {
    yield put(setNotificationMessage(t('dashboard-settings.error2')));
    logger.error('[dashboard/settings/ doGetDashboardConfigRequest saga] error', e.message);
  }
}

function* doGetWidgetsRequest({ api, logger }, { payload }) {
  try {
    const apiData = yield call(api.dashboard.getWidgetsByDashboardType, payload);

    yield put(setAvailableWidgets(apiData));
  } catch (e) {
    yield put(setNotificationMessage(t('dashboard-settings.error3')));
    logger.error('[dashboard/settings/ doGetWidgetsRequest saga] error', e.message);
  }
}

function* doGetDashboardKeys({ api, logger }, { payload }) {
  try {
    const result = yield call(api.dashboard.getDashboardKeysByRef, payload);

    yield put(setDashboardKeys(result));
  } catch (e) {
    logger.error('[dashboard/settings/ doGetDashboardKeys saga] error', e.message);
  }
}

function* doCheckUpdatedSettings({ api, logger }, { payload }) {
  try {
    const identification = yield select(selectIdentificationForSet);
    const user = payload.isForAllUsers ? null : identification.user;
    const eqKey = identification.key === payload.dashboardKey;
    const hasUser = !!identification.user;

    let saveWay = DashboardService.defineWaySavingDashboard(eqKey, payload.isForAllUsers, hasUser);

    if (saveWay === DashboardService.SaveWays.CONFIRM) {
      const checkExistDashboard = yield call(api.dashboard.checkExistDashboard, {
        key: payload.dashboardKey,
        type: identification.type,
        user
      });

      saveWay = checkExistDashboard ? DashboardService.SaveWays.CONFIRM : DashboardService.SaveWays.CREATE;
    }

    yield put(setCheckUpdatedDashboardConfig({ saveWay }));
  } catch (e) {
    logger.error('[dashboard/settings/ doCheckUpdatedSettings saga] error', e.message);
  }
}

function* doSaveSettingsRequest({ api, logger }, { payload }) {
  try {
    const serverConfig = DashboardSettingsConverter.getSettingsConfigForServer({ ...payload });
    const { layouts, menu } = serverConfig;
    const identification = yield select(selectIdentificationForSet);

    const dashboardResult = yield call(api.dashboard.saveDashboardConfig, {
      config: { layouts },
      identification: { ...identification, ...(payload.newIdentification || {}) }
    });

    const parseDashboard = DashboardService.parseRequestResult(dashboardResult);

    yield call(api.dashboard.deleteFromCache, { ...identification });
    yield put(saveMenuConfig(menu));
    yield put(
      setRequestResultDashboard({
        status: parseDashboard.dashboardId ? RequestStatuses.SUCCESS : RequestStatuses.FAILURE,
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
  yield takeLatest(getDashboardKeys().type, doGetDashboardKeys, ea);
  yield takeLatest(getCheckUpdatedDashboardConfig().type, doCheckUpdatedSettings, ea);
}

export default saga;
