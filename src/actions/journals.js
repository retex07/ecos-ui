import { createAction } from 'redux-actions';

const prefix = 'journals/';

export const getDashletConfig = createAction(prefix + 'GET_DASHLET_CONFIG');
export const setDashletConfig = createAction(prefix + 'SET_DASHLET_CONFIG');
export const saveDashlet = createAction(prefix + 'SAVE_DASHLET');
export const getDashletEditorData = createAction(prefix + 'GET_DASHLET_EDITOR_DATA');
export const setEditorMode = createAction(prefix + 'SET_EDITOR_MODE');

export const setJournalsListItem = createAction(prefix + 'SET_JOURNALS_LIST_ITEM');
export const setJournalsItem = createAction(prefix + 'SET_JOURNALS_ITEM');
export const setSettingItem = createAction(prefix + 'SET_SETTING_ITEM');
export const setJournalsList = createAction(prefix + 'SET_JOURNALS_LIST');
export const setJournals = createAction(prefix + 'SET_JOURNALS');
export const setJournalsListName = createAction(prefix + 'SET_JOURNALS_LIST_NAME');

export const setPage = createAction(prefix + 'SET_PAGE');
export const setJournalConfig = createAction(prefix + 'SET_JOURNAL_CONFIG');
export const setGrid = createAction(prefix + 'SET_GRID');
export const reloadGrid = createAction(prefix + 'RELOAD_GRID');
export const deleteRecords = createAction(prefix + 'DELETE_RECORDS');
export const saveRecords = createAction(prefix + 'SAVE_RECORDS');
export const setSelectedRecords = createAction(prefix + 'SET_SELECTED_RECORDS');
export const setSelectAllRecords = createAction(prefix + 'SET_SELECT_ALL_RECORDS');
export const setSelectAllRecordsVisible = createAction(prefix + 'SET_SELECT_ALL_RECORDS_VISIBLE');
export const setGridMinHeight = createAction(prefix + 'SET_GRID_MIN_HEIGHT');
export const setGridInlineToolSettings = createAction(prefix + 'SET_GRID_INLINE_TOOL_SETTINGS');
