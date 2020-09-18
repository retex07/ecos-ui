import { handleActions } from 'redux-actions';

import { treeSetDndIndex } from '../helpers/arrayOfObjects';
import {
  addJournalMenuItems,
  getGroupPriority,
  getSettingsConfig,
  removeSettings,
  resetStore,
  saveSettingsConfig,
  setAuthorities,
  setGroupPriority,
  setLastAddedItems,
  setLoading,
  setMenuItems,
  setOpenMenuSettings
} from '../actions/menuSettings';

const initialState = {
  editedId: undefined,
  items: [],
  authorities: [],
  groupPriority: [],
  isLoading: false,
  isLoadingPriority: false,
  isOpenMenuSettings: false,
  lastAddedItems: []
};

Object.freeze(initialState);

const startLoading = state => ({ ...state, isLoading: true });

export default handleActions(
  {
    [removeSettings]: startLoading,
    [saveSettingsConfig]: startLoading,

    [getSettingsConfig]: (state, { payload }) => ({
      ...state,
      isLoading: true,
      editedId: payload.id
    }),
    [setOpenMenuSettings]: (state, { payload }) => ({
      ...state,
      ...initialState,
      isOpenMenuSettings: payload
    }),
    [setMenuItems]: (state, { payload }) => ({
      ...state,
      items: treeSetDndIndex(payload),
      isLoading: false
    }),
    [setLastAddedItems]: (state, { payload }) => ({
      ...state,
      lastAddedItems: payload
    }),
    [addJournalMenuItems]: state => ({
      ...state,
      isLoading: true
    }),
    [setAuthorities]: (state, { payload }) => ({
      ...state,
      authorities: payload
    }),
    [getGroupPriority]: state => ({
      ...state,
      groupPriority: [],
      isLoadingPriority: true
    }),
    [setGroupPriority]: (state, { payload }) => ({
      ...state,
      groupPriority: treeSetDndIndex(payload),
      isLoadingPriority: false
    }),
    [setLoading]: state => ({
      ...state,
      isLoading: false
    }),
    [resetStore]: _ => initialState
  },
  initialState
);
