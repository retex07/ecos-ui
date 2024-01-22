import { handleActions } from 'redux-actions';
import pick from 'lodash/pick';

import { deleteStateById, startLoading, updateState } from '../helpers/redux';
import {
  filterHeatdata,
  filterJournal,
  getJournal,
  getModel,
  resetDashlet,
  setJournal,
  setModel,
  setNewData
} from '../actions/processStatistics';

const initialState = {
  isLoadingJournal: false,
  isLoadingModel: false,
  data: [],
  totalCount: 0,
  journalConfig: null,
  model: null,
  heatmapData: null,
  isNewData: false
};

export default handleActions(
  {
    [getModel]: startLoading(initialState, 'isLoadingModel'),
    [filterHeatdata]: startLoading(initialState, 'isLoadingModel'),
    [getJournal]: startLoading(initialState, 'isLoadingJournal'),
    [filterJournal]: startLoading(initialState, 'isLoadingJournal'),
    [setModel]: (state, { payload }) =>
      updateState(state, payload.stateId, { ...pick(payload, 'model', 'heatmapData'), isLoadingModel: false }),
    [setJournal]: (state, { payload }) =>
      updateState(state, payload.stateId, { ...pick(payload, 'data', 'journalConfig', 'totalCount'), isLoadingJournal: false }),
    [setNewData]: (state, { payload }) => updateState(state, payload.stateId, { stateId: payload.stateId, isNewData: payload.isNewData }),
    [resetDashlet]: (state, { payload: { stateId } }) => deleteStateById(state, stateId)
  },
  {}
);
