import { handleActions } from 'redux-actions';
import {
  getSubordinatesTimesheetByParams,
  initSubordinatesTimesheetEnd,
  initSubordinatesTimesheetStart,
  modifyStatus,
  setLoading,
  setMergedList,
  setPopupMessage,
  setStatusList,
  setSubordinatesTimesheetByParams,
  setUpdatingEventDayHours
} from '../../actions/timesheet/subordinates';

const initialState = {
  isLoading: false,
  mergedList: [],
  subordinates: [],
  calendarEvents: [],
  statuses: [],
  updatingHours: {},
  popupMsg: ''
};

Object.freeze(initialState);

export default handleActions(
  {
    [initSubordinatesTimesheetStart]: (state, actions) => ({
      ...state,
      isLoading: true,
      mergedList: [],
      subordinates: [],
      calendarEvents: [],
      statuses: []
    }),
    [initSubordinatesTimesheetEnd]: (state, actions) => ({
      ...state,
      mergedList: actions.payload.mergedList,

      subordinates: actions.payload.subordinates.records,
      calendarEvents: actions.payload.calendarEvents,
      statuses: actions.payload.statuses.records,

      isLoading: false
    }),
    [getSubordinatesTimesheetByParams]: (state, actions) => ({
      ...state,
      isLoading: true,
      mergedList: [],
      calendarEvents: [],
      statuses: []
    }),
    [setSubordinatesTimesheetByParams]: (state, actions) => ({
      ...state,
      isLoading: false,
      mergedList: actions.payload.mergedList,
      calendarEvents: actions.payload.calendarEvents,
      statuses: actions.payload.statuses.records
    }),
    [setMergedList]: (state, actions) => ({
      ...state,
      mergedList: actions.payload,
      isLoading: false
    }),
    [setStatusList]: (state, actions) => ({
      ...state,
      statuses: actions.payload.records
    }),
    [modifyStatus]: (state, actions) => ({
      ...state,
      isLoading: true
    }),
    [setLoading]: (state, actions) => ({
      ...state,
      isLoading: actions.payload
    }),
    [setPopupMessage]: (state, actions) => ({
      ...state,
      popupMsg: actions.payload
    }),
    [setUpdatingEventDayHours]: (state, actions) => ({
      ...state,
      updatingHours: actions.payload
    })
  },
  initialState
);
