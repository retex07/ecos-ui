import { handleActions } from 'redux-actions';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';

import {
  initState,
  runSearch,
  setColumnsSetup,
  setCustomJournal,
  setCustomJournalMode,
  setDashletConfig,
  setEditorMode,
  setGrid,
  setGridInlineToolSettings,
  setGrouping,
  setJournalConfig,
  setJournals,
  setJournalSetting,
  setJournalSettings,
  setJournalsItem,
  setJournalsList,
  setJournalsListItem,
  setOnlyLinked,
  setPredicate,
  setPreviewFileName,
  setPreviewUrl,
  setRecordRef,
  setSelectAllRecords,
  setSelectAllRecordsVisible,
  setSelectedRecords,
  setSettingItem,
  setUrl
} from '../actions/journals';
import { setLoading } from '../actions/loader';
import { t } from '../helpers/util';
import { handleAction, handleState } from '../helpers/redux';
import {
  DEFAULT_INLINE_TOOL_SETTINGS,
  DEFAULT_PAGINATION,
  JOURNAL_SETTING_DATA_FIELD,
  JOURNAL_SETTING_ID_FIELD
} from '../components/Journals/constants';

export const defaultState = {
  loading: true,
  editorMode: false,

  url: {},

  grid: {
    data: [],
    columns: [],
    total: 0,
    createVariants: [],
    predicate: {},
    groupBy: [],
    sortBy: [],
    pagination: DEFAULT_PAGINATION,
    minHeight: null,
    editingRules: {},
    search: ''
  },

  journalsList: [],
  journals: [],
  journalSettings: [],

  config: null,
  initConfig: null,
  journalConfig: {
    meta: { createVariants: [] }
  },
  recordRef: null,

  predicate: null,
  columnsSetup: {
    columns: [],
    sortBy: []
  },
  grouping: {
    columns: [],
    groupBy: []
  },

  journalSetting: {
    title: '',
    sortBy: [],
    groupBy: [],
    columns: [],
    predicate: null,
    permissions: {
      Write: true
      // Delete: true
    }
  },

  selectedRecords: [],
  selectAllRecords: false,
  selectAllRecordsVisible: false,

  inlineToolSettings: DEFAULT_INLINE_TOOL_SETTINGS,

  previewUrl: '',
  previewFileName: '',
  zipNodeRef: null,

  isLoadingPerformGroupActions: false,
  performGroupActionResponse: []
};

const initialState = {};

Object.freeze(initialState);
Object.freeze(defaultState);

export default handleActions(
  {
    [initState]: (state, action) => {
      const id = action.payload;

      return {
        ...state,
        [id]: { ...cloneDeep(defaultState), ...(state[id] || {}) }
      };
    },
    [setUrl]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return stateId
        ? {
            ...state,
            [stateId]: {
              ...(state[stateId] || {}),
              url: {
                ...action.payload
              }
            }
          }
        : {
            ...state,
            url: {
              ...action.payload
            }
          };
    },
    [setPredicate]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { predicate: action.payload });
    },
    [setPreviewUrl]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { previewUrl: action.payload });
    },
    [setPreviewFileName]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { previewFileName: action.payload });
    },
    [setColumnsSetup]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { columnsSetup: action.payload });
    },
    [setGrouping]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { grouping: action.payload });
    },
    [setJournalSettings]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, {
        journalSettings: [
          {
            [JOURNAL_SETTING_ID_FIELD]: '',
            [JOURNAL_SETTING_DATA_FIELD]: { title: t('journals.default') },
            notRemovable: true
          },
          ...Array.from(action.payload)
        ]
      });
    },
    [setJournalSetting]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return stateId
        ? {
            ...state,
            [stateId]: {
              ...(state[stateId] || {}),
              journalSetting: {
                ...(state[stateId] || {}).journalSetting,
                ...action.payload
              },
              grid: {
                ...(state[stateId] || {}).grid,
                search: ''
              }
            }
          }
        : {
            ...state,
            journalSetting: {
              ...state.journalSetting,
              ...action.payload
            }
          };
    },
    [setGridInlineToolSettings]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, {
        inlineToolSettings: action.payload,
        previewFileName: get(action.payload, ['row', 'cm:title'], '')
      });
    },
    [setJournalsListItem]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return stateId
        ? {
            ...state,
            [stateId]: {
              ...(state[stateId] || {}),
              config: {
                ...(state[stateId] || {}).config,
                journalsListId: action.payload.id
              }
            }
          }
        : {
            ...state,
            config: {
              ...state.config,
              journalsListId: action.payload.id
            }
          };
    },
    [setJournalsItem]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return stateId
        ? {
            ...state,
            [stateId]: {
              ...(state[stateId] || {}),
              config: {
                ...(state[stateId] || {}).config,
                journalId: action.payload.nodeRef,
                journalType: action.payload.type
              }
            }
          }
        : {
            ...state,
            config: {
              ...state.config,
              journalId: action.payload.nodeRef,
              journalType: action.payload.type
            }
          };
    },
    [setSettingItem]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return stateId
        ? {
            ...state,
            [stateId]: {
              ...(state[stateId] || {}),
              config: {
                ...(state[stateId] || {}).config,
                journalSettingId: action.payload
              }
            }
          }
        : {
            ...state,
            config: {
              ...state.config,
              journalSettingId: action.payload
            }
          };
    },
    [setCustomJournal]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return stateId
        ? {
            ...state,
            [stateId]: {
              ...(state[stateId] || {}),
              config: {
                ...(state[stateId] || {}).config,
                customJournal: action.payload
              }
            }
          }
        : {
            ...state,
            config: {
              ...state.config,
              customJournal: action.payload
            }
          };
    },
    [setOnlyLinked]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return stateId
        ? {
            ...state,
            [stateId]: {
              ...(state[stateId] || {}),
              config: {
                ...(state[stateId] || {}).config,
                onlyLinked: action.payload
              }
            }
          }
        : {
            ...state,
            config: {
              ...state.config,
              onlyLinked: action.payload
            }
          };
    },
    [setCustomJournalMode]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return stateId
        ? {
            ...state,
            [stateId]: {
              ...(state[stateId] || {}),
              config: {
                ...(state[stateId] || {}).config,
                customJournalMode: action.payload
              }
            }
          }
        : {
            ...state,
            config: {
              ...state.config,
              customJournalMode: action.payload
            }
          };
    },
    [setEditorMode]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { editorMode: action.payload });
    },
    [setJournalsList]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { journalsList: action.payload });
    },
    [setJournals]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { journals: action.payload });
    },
    [setGrid]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return stateId
        ? {
            ...state,
            [stateId]: {
              ...(state[stateId] || {}),
              grid: {
                ...(state[stateId] || {}).grid,
                ...action.payload
              }
            }
          }
        : {
            ...state,
            grid: {
              ...state.grid,
              ...action.payload
            }
          };
    },
    [setDashletConfig]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { initConfig: action.payload, config: action.payload });
    },
    [setJournalConfig]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { journalConfig: action.payload });
    },
    [setSelectedRecords]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { selectedRecords: action.payload });
    },
    [setSelectAllRecords]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { selectAllRecords: action.payload });
    },
    [setSelectAllRecordsVisible]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { selectAllRecordsVisible: action.payload });
    },
    [setLoading]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { loading: action.payload });
    },
    [setRecordRef]: (state, action) => {
      const stateId = action.payload.stateId;
      action = handleAction(action);

      return handleState(state, stateId, { recordRef: action.payload });
    },
    [runSearch]: (state, action) => {
      const stateId = action.payload.stateId;

      return handleState(state, stateId, {
        grid: {
          ...(state[stateId] || {}).grid,
          search: action.payload.text,
          sortBy: [],
          groupBy: [],
          pagination: {
            ...(state[stateId] || {}).grid.pagination,
            skipCount: 0,
            page: 1
          }
        }
      });
    }
  },
  initialState
);
