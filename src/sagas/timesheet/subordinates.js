import { put, select, takeLatest, takeEvery } from 'redux-saga/effects';
import { TimesheetMessages } from '../../helpers/timesheet/dictionary';
import {
  getSubordinatesTimesheetByParams,
  modifyEventDayHours,
  modifyStatus,
  resetEventDayHours,
  setLoading,
  setMergedList,
  setPopupMessage,
  setSubordinatesTimesheetByParams,
  setUpdatingEventDayHours,
  delegateTo,
  setDelegatedTo,
  removeDelegation
} from '../../actions/timesheet/subordinates';
import { selectTSubordinatesDelegatedTo, selectTSubordinatesMergedList, selectTSubordinatesUpdatingHours } from '../../selectors/timesheet';
import { selectUserName } from '../../selectors/user';
import SubordinatesTimesheetConverter from '../../dto/timesheet/subordinates';
import CommonTimesheetService from '../../services/timesheet/common';
import SubordinatesTimesheetService from '../../services/timesheet/subordinates';
import DelegationTimesheetConverter from '../../dto/timesheet/delegated';
import { DelegationTypes } from '../../constants/timesheet';

function* sagaGetSubordinatesTimesheetByParams({ api, logger }, { payload }) {
  try {
    const { currentDate, status } = payload;
    const userName = yield select(selectUserName);

    const subordinates = yield api.timesheetSubordinates.getSubordinatesList({ userName });

    const userNames = CommonTimesheetService.getUserNameList(subordinates.records);

    const requestList = yield api.timesheetSubordinates.getRequestListByStatus({
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      userNames,
      statuses: Array.isArray(status) ? status : [status]
    });

    const userNamesPure = CommonTimesheetService.getUserNameList(requestList.records);

    const calendarEvents = yield api.timesheetCommon.getTimesheetCalendarEventsList({
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      userNames: userNamesPure
    });

    const delegationStatus = yield api.timesheetDelegated.getDelegationInfo({ user: userName, delegationType: DelegationTypes.APPROVE });
    const deputy = DelegationTimesheetConverter.getDelegationInfo(delegationStatus.records);

    const list = SubordinatesTimesheetService.mergeManyToOneList({
      peopleList: subordinates.records,
      calendarEvents,
      requestList: requestList.records
    });

    const mergedList = SubordinatesTimesheetConverter.getSubordinatesEventsListForWeb(list);

    yield put(setSubordinatesTimesheetByParams({ mergedList, deputy }));
  } catch (e) {
    logger.error('[timesheetSubordinates sagaGetSubordinatesTimesheetByParams saga] error', e.message);
  }
}

function* sagaModifyTaskStatus({ api, logger }, { payload }) {
  try {
    const currentUser = yield select(selectUserName);
    const { outcome, taskId, userName, comment } = payload;

    const mergedList = yield select(selectTSubordinatesMergedList);

    yield api.timesheetCommon.modifyStatus({
      outcome,
      taskId,
      currentUser,
      comment
    });

    const newMergedList = CommonTimesheetService.deleteRecordLocalByUserName(mergedList, userName);

    yield put(setMergedList(newMergedList));
  } catch (e) {
    yield put(setLoading(false));
    yield put(setPopupMessage(e.message || TimesheetMessages.ERROR_SAVE_STATUS));
    logger.error('[timesheetSubordinates sagaModifyTaskStatus saga] error', e.message);
  }
}

function* sagaModifyEventDayHours({ api, logger }, { payload }) {
  const updatingHoursState = yield select(selectTSubordinatesUpdatingHours);
  const firstState = CommonTimesheetService.setUpdatingHours(updatingHoursState, payload);

  yield put(setUpdatingEventDayHours(firstState));

  try {
    yield api.timesheetCommon.modifyEventHours({ ...payload });

    const updatingHoursState = yield select(selectTSubordinatesUpdatingHours);
    const secondState = CommonTimesheetService.setUpdatingHours(updatingHoursState, payload, true);

    yield put(setUpdatingEventDayHours(secondState));
  } catch (e) {
    const updatingHoursState = yield select(selectTSubordinatesUpdatingHours);
    const thirdState = CommonTimesheetService.setUpdatingHours(updatingHoursState, { ...payload, hasError: true });

    yield put(setUpdatingEventDayHours(thirdState));
    yield put(setPopupMessage(e.message || TimesheetMessages.ERROR_SAVE_EVENT_HOURS));
    logger.error('[timesheetSubordinates sagaModifyStatus saga] error', e.message);
  }
}

function* sagaResetEventDayHours({ api, logger }, { payload }) {
  const updatingHoursState = yield select(selectTSubordinatesUpdatingHours);

  try {
    const firstState = CommonTimesheetService.setUpdatingHours(updatingHoursState, payload, true);

    yield put(setUpdatingEventDayHours(firstState));
  } catch (e) {
    const updatingHoursState = yield select(selectTSubordinatesUpdatingHours);
    const secondState = CommonTimesheetService.setUpdatingHours(updatingHoursState, { ...payload, hasError: true });

    yield put(setUpdatingEventDayHours(secondState));
    yield put(setPopupMessage(e.message || TimesheetMessages.ERROR_SAVE_EVENT_HOURS));
    logger.error('[timesheetSubordinates sagaResetEventDayHours saga] error', e.message);
  }
}

function* sagaDelegateTo({ api, logger }, { payload }) {
  const deputy = DelegationTimesheetConverter.getDeputyData(payload.deputy);
  const userName = yield select(selectUserName);

  try {
    yield api.timesheetDelegated.setRecord({
      userName,
      deputyName: deputy.name,
      delegationType: payload.delegationType
    });

    yield put(setDelegatedTo(deputy));
  } catch (e) {
    yield put(setPopupMessage(e.message || TimesheetMessages.ERROR_DELEGATE_TO));
    logger.error('[timesheetSubordinates sagaDelegateTo saga] error', e.message);
  }
}

function* sagaRemoveDelegation({ api, logger }) {
  const userName = yield select(selectUserName);
  const deputyName = yield select(selectTSubordinatesDelegatedTo);

  try {
    yield api.timesheetDelegated.removeRecord({ userName, deputyName, delegationType: DelegationTypes.APPROVE });

    yield put(setDelegatedTo(DelegationTimesheetConverter.getDeputyData()));
  } catch (e) {
    yield put(setPopupMessage(e.message || TimesheetMessages.ERROR_REMOVE_DELEGATED_TO));
    logger.error('[timesheetSubordinates sagaRemoveDelegation saga] error', e.message);
  }
}

function* saga(ea) {
  yield takeLatest(getSubordinatesTimesheetByParams().type, sagaGetSubordinatesTimesheetByParams, ea);
  yield takeLatest(modifyStatus().type, sagaModifyTaskStatus, ea);
  yield takeEvery(modifyEventDayHours().type, sagaModifyEventDayHours, ea);
  yield takeLatest(resetEventDayHours().type, sagaResetEventDayHours, ea);
  yield takeLatest(delegateTo().type, sagaDelegateTo, ea);
  yield takeLatest(removeDelegation().type, sagaRemoveDelegation, ea);
}

export default saga;