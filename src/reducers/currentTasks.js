import { handleActions } from 'redux-actions';
import { getCurrentTaskList, setCurrentTaskList, updateRequestCurrentTasks } from '../actions/currentTasks';
import { getCurrentStateById } from '../helpers/redux';

const commonInitialState = {
  updateRequestRecord: null
};

const initialState = {
  isLoading: false,
  list: []
};

const startLoading = (state, { payload: { stateId } }) => ({
  ...state,
  [stateId]: {
    ...getCurrentStateById(state, stateId, initialState),
    isLoading: true
  }
});

export default handleActions(
  {
    [getCurrentTaskList]: startLoading,
    [setCurrentTaskList]: (state, { payload: { stateId, list } }) => ({
      ...state,
      [stateId]: {
        ...getCurrentStateById(state, stateId, initialState),
        list: list,
        isLoading: false
      },
      updateRequestRecord: null
    }),
    [updateRequestCurrentTasks]: (state, { payload: { record } }) => ({
      ...state,
      updateRequestRecord: record
    })
  },
  commonInitialState
);
