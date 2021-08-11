import { createAction } from 'redux-actions';

const prefix = 'journals/';

export const setLoading = createAction(prefix + 'SET_LOADING');
export const getDashletConfig = createAction(prefix + 'GET_DASHLET_CONFIG');
export const setDashletConfig = createAction(prefix + 'SET_DASHLET_CONFIG');
export const setDashletConfigByParams = createAction(prefix + 'SET_DASHLET_CONFIG_BY_PARAMS');
export const saveDashlet = createAction(prefix + 'SAVE_DASHLET');
export const getDashletEditorData = createAction(prefix + 'GET_DASHLET_EDITOR_DATA');
export const setEditorMode = createAction(prefix + 'SET_EDITOR_MODE');
export const initJournal = createAction(prefix + 'INIT_JOURNAL');

export const setJournalsItem = createAction(prefix + 'SET_JOURNALS_ITEM');
export const setSettingItem = createAction(prefix + 'SET_SETTING_ITEM');
export const setOnlyLinked = createAction(prefix + 'SET_ONLY_LINKED');
export const setCustomJournalMode = createAction(prefix + 'SET_CUSTOM_JOURNAL_MODE');
export const setCustomJournal = createAction(prefix + 'SET_CUSTOM_JOURNAL');
export const setSelectedJournals = createAction(prefix + 'SET_SELECTED_JOURNALS');

export const setJournalConfig = createAction(prefix + 'SET_JOURNAL_CONFIG');
export const checkConfig = createAction(prefix + 'CHECK_JOURNAL_CONFIG');
export const setCheckLoading = createAction(prefix + 'SET_CHECK_JOURNAL_LOADING');
export const setJournalExistStatus = createAction(prefix + 'SET_JOURNAL_EXIST_STATUS');
export const setGrid = createAction(prefix + 'SET_GRID');
export const reloadGrid = createAction(prefix + 'RELOAD_GRID');
export const reloadTreeGrid = createAction(prefix + 'RELOAD_TREE_GRID');

export const execRecordsAction = createAction(prefix + 'EXEC_RECORDS_ACTION');
export const deleteRecords = createAction(prefix + 'DELETE_RECORDS');
export const saveRecords = createAction(prefix + 'SAVE_RECORDS');
export const setSelectedRecords = createAction(prefix + 'SET_SELECTED_RECORDS');
export const setSelectAllRecords = createAction(prefix + 'SET_SELECT_ALL_RECORDS');
export const setSelectAllRecordsVisible = createAction(prefix + 'SET_SELECT_ALL_RECORDS_VISIBLE');
export const setGridInlineToolSettings = createAction(prefix + 'SET_GRID_INLINE_TOOL_SETTINGS');

export const getJournalsData = createAction(prefix + 'GET_JOURNALS_DATA');
export const saveJournalSetting = createAction(prefix + 'SAVE_JOURNAL_SETTING');
export const createJournalSetting = createAction(prefix + 'CREATE_JOURNAL_SETTING');
export const deleteJournalSetting = createAction(prefix + 'DELETE_JOURNAL_SETTING');
export const renameJournalSetting = createAction(prefix + 'RENAME_JOURNAL_SETTING');
export const setJournalSetting = createAction(prefix + 'SET_JOURNAL_SETTING');
export const setJournalSettings = createAction(prefix + 'SET_JOURNAL_SETTINGS');
export const applyJournalSetting = createAction(prefix + 'APPLY_JOURNAL_SETTING');
export const execJournalAction = createAction(prefix + 'EXEC_JOURNAL_ACTION');

export const setPredicate = createAction(prefix + 'SET_PREDICATE');
export const setOriginGridSettings = createAction(prefix + 'SET_ORIGIN_GRID_SETTINGS');
export const setColumnsSetup = createAction(prefix + 'SET_COLUMNS_SETUP');
export const setGrouping = createAction(prefix + 'SET_GROUPING');
export const initJournalSettingData = createAction(prefix + 'INIT_JOURNAL_SETTING_DATA');
export const resetJournalSettingData = createAction(prefix + 'RESET_JOURNAL_SETTING_DATA');
export const restoreJournalSettingData = createAction(prefix + 'RESTORE_JOURNAL_SETTING_DATA');

export const openSelectedJournalSettings = createAction(prefix + 'OPEN_SELECTED_JOURNAL_SETTINGS');
export const selectJournalSettings = createAction(prefix + 'SELECT_JOURNAL_SETTINGS');
export const openSelectedJournal = createAction(prefix + 'OPEN_SELECTED_JOURNAL');
export const selectJournal = createAction(prefix + 'SELECT_JOURNAL');

export const initPreview = createAction(prefix + 'INIT_PREVIEW');
export const setPreviewUrl = createAction(prefix + 'SET_PREVIEW_URL');
export const setPreviewFileName = createAction(prefix + 'SET_PREVIEW_FILE_NAME');

export const toggleViewMode = createAction(prefix + 'TOGGLE_VIEW_MODE');
export const goToJournalsPage = createAction(prefix + 'GO_TO_JOURNALS_PAGE');
export const runSearch = createAction(prefix + 'RUN_SEARCH');
export const setUrl = createAction(prefix + 'SET_URL');
export const initState = createAction(prefix + 'INIT_STATE');
export const setRecordRef = createAction(prefix + 'SET_RECORD_REF');
