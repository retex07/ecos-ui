import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import * as queryString from 'query-string';
import get from 'lodash/get';
import set from 'lodash/set';
import has from 'lodash/has';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import isFunction from 'lodash/isFunction';

import { NotificationManager } from 'react-notifications';

import {
  applyJournalSetting,
  checkConfig,
  createJournalSetting,
  deleteJournalSetting,
  editJournalSetting,
  execRecordsAction,
  getDashletConfig,
  getDashletEditorData,
  getJournalsData,
  goToJournalsPage,
  initJournal,
  initJournalSettingData,
  initPreview,
  openSelectedJournal,
  openSelectedPreset,
  reloadGrid,
  reloadTreeGrid,
  resetJournalSettingData,
  runSearch,
  saveDashlet,
  saveJournalSetting,
  saveRecords,
  selectJournal,
  selectPreset,
  setCheckLoading,
  setColumnsSetup,
  setDashletConfig,
  setDashletConfigByParams,
  setEditorMode,
  setGrid,
  setGridInlineToolSettings,
  setGrouping,
  setJournalConfig,
  setJournalExistStatus,
  setJournalSetting,
  setJournalSettings,
  setLoading,
  setOriginGridSettings,
  setPredicate,
  setPreviewFileName,
  setPreviewUrl,
  setSelectAllRecords,
  setSelectAllRecordsVisible,
  setSelectedJournals,
  setSelectedRecords,
  setUrl
} from '../actions/journals';
import JournalsService, { EditorService, PresetsServiceApi } from '../components/Journals/service';
import {
  DEFAULT_INLINE_TOOL_SETTINGS,
  DEFAULT_JOURNALS_PAGINATION,
  DEFAULT_PAGINATION,
  JOURNAL_DASHLET_CONFIG_VERSION
} from '../components/Journals/constants';
import { ParserPredicate } from '../components/Filters/predicates';
import Records from '../components/Records';
import { ActionTypes } from '../components/Records/actions';
import ActionsRegistry from '../components/Records/actions/actionsRegistry';
import { COLUMN_DATA_TYPE_DATE, COLUMN_DATA_TYPE_DATETIME } from '../components/Records/predicates/predicates';
import { decodeLink, getFilterParam, getSearchParams, getUrlWithoutOrigin, removeUrlSearchParams } from '../helpers/urls';
import { wrapSaga } from '../helpers/redux';
import { hasInString, t } from '../helpers/util';
import PageService from '../services/PageService';
import { JournalUrlParams, SourcesId } from '../constants';
import JournalsConverter from '../dto/journals';
import {
  selectGridPaginationMaxItems,
  selectJournalConfig,
  selectJournalData,
  selectJournalSetting,
  selectNewVersionDashletConfig,
  selectUrl
} from '../selectors/journals';
import { emptyJournalConfig } from '../reducers/journals';
import { loadDocumentLibrarySettings } from './docLib';

const getDefaultSortBy = config => {
  const params = config.params || {};
  // eslint-disable-next-line
  const defaultSortBy = params.defaultSortBy ? eval('(' + params.defaultSortBy + ')') : [];

  return defaultSortBy.map(item => ({
    attribute: item.id,
    ascending: item.order !== 'desc'
  }));
};

function getDefaultJournalSetting(journalConfig) {
  const { groupBy } = get(journalConfig, 'meta', {});
  const columns = get(journalConfig, 'columns', []);

  return {
    sortBy: getDefaultSortBy(journalConfig).map(sort => ({ ...sort })),
    groupBy: groupBy ? Array.from(groupBy) : [],
    columns: columns.map(col => ({ ...col })),
    predicate: ParserPredicate.getDefaultPredicates(columns)
  };
}

function getGridParams({ journalConfig = {}, journalSetting = {}, pagination = DEFAULT_PAGINATION }) {
  const { createVariants, actions: journalActions, groupActions } = get(journalConfig, 'meta', {});
  const { sourceId, id: journalId } = journalConfig;
  const { sortBy, groupBy, columns, predicate: journalSettingPredicate } = journalSetting;
  const predicates = isArray(journalSettingPredicate)
    ? journalSettingPredicate
    : isEmpty(journalSettingPredicate)
    ? []
    : [journalSettingPredicate];

  return {
    groupActions: groupActions || [],
    journalId,
    journalActions,
    createVariants,
    sourceId,
    sortBy: sortBy.map(sort => ({ ...sort })),
    columns: columns.map(col => ({ ...col })),
    groupBy: Array.from(groupBy),
    predicates,
    pagination: { ...pagination }
  };
}

function* sagaGetDashletEditorData({ api, logger, stateId, w }, action) {
  try {
    const config = action.payload || {};
    yield getJournalSettings(api, config.journalId, w, stateId);
  } catch (e) {
    logger.error('[journals sagaGetDashletEditorData saga error', e);
  }
}

function* sagaGetDashletConfig({ api, logger, stateId, w }, action) {
  try {
    const config = yield call(api.journals.getDashletConfig, action.payload);

    if (config) {
      const { journalId, journalSettingId = '', customJournal, customJournalMode, journalsListIds } = config;

      yield put(setEditorMode(w(isEmpty(journalsListIds))));
      yield put(setDashletConfig(w(config)));
      yield put(initJournal(w({ journalId, journalSettingId, customJournal, customJournalMode })));
    } else {
      yield put(setEditorMode(w(true)));
    }
  } catch (e) {
    logger.error('[journals sagaGetDashletConfig saga error', e);
  }
}

function* sagaSetDashletConfigFromParams({ api, logger, stateId, w }, action) {
  try {
    const { config = {} } = action.payload;
    const configByVersion = config[JOURNAL_DASHLET_CONFIG_VERSION];

    if (isEmpty(config) || (config.version !== JOURNAL_DASHLET_CONFIG_VERSION && isEmpty(configByVersion))) {
      yield put(setEditorMode(w(true)));
      yield put(setLoading(w(false)));
      return;
    }

    yield put(setDashletConfig(w(config)));

    const { journalId, journalSettingId = '', customJournal, customJournalMode, journalsListIds } = configByVersion;
    const { recordRef } = action.payload;

    if (customJournalMode && customJournal) {
      const resolvedCustomJournal = yield _resolveTemplate(recordRef, customJournal);

      yield put(setEditorMode(w(false)));
      yield put(initJournal(w({ journalId: resolvedCustomJournal })));
      return;
    }

    const { lsJournalId } = action.payload;
    const journalsListId = get(journalsListIds, '0');
    let selectedJournals = [];

    if (!isEmpty(journalsListIds)) {
      selectedJournals = yield call(api.journals.getJournalsByIds, journalsListIds, { id: 'id', title: '.disp' });
    }

    yield put(setSelectedJournals(w(selectedJournals)));

    if (journalsListId) {
      yield put(setEditorMode(w(isEmpty(journalsListIds))));

      if (customJournalMode && customJournal) {
        const resolvedCustomJournal = yield _resolveTemplate(recordRef, customJournal);
        yield put(initJournal(w({ journalId: resolvedCustomJournal })));
      } else {
        yield put(initJournal(w({ journalId: lsJournalId || get(journalsListIds, '0', journalId), journalSettingId })));
      }
    } else {
      yield put(setEditorMode(w(true)));
      yield put(setLoading(w(false)));
    }
  } catch (e) {
    logger.error('[journals sagaSetDashletConfigFromParams saga error', e);
  }
}

function* _resolveTemplate(recordRef, template) {
  if (!recordRef || template.indexOf('$') === -1) {
    return template;
  }
  let keyExp = /\${(.+?)}/g;
  let attributesMap = {};

  let it = keyExp.exec(template);
  while (it) {
    attributesMap[it[1]] = true;
    it = keyExp.exec(template);
  }
  let attributes = Object.keys(attributesMap);

  if (!attributes.length) {
    return template;
  }

  let attsValues = yield Records.get(recordRef).load(attributes);
  for (let att in attsValues) {
    if (attsValues.hasOwnProperty(att)) {
      let value = attsValues[att] || '';
      template = template.split('${' + att + '}').join(value);
    }
  }

  return template;
}

function* sagaGetJournalsData({ api, logger, stateId, w }, { payload }) {
  try {
    const url = yield select(selectUrl, stateId);
    const { journalId, journalSettingId = '', userConfigId } = url;

    yield put(setGrid(w({ pagination: DEFAULT_JOURNALS_PAGINATION })));
    yield put(initJournal(w({ journalId, journalSettingId, userConfigId })));
  } catch (e) {
    logger.error('[journals sagaGetJournalsData saga error', e);
  }
}

function* getJournalSettings(api, journalId, w, stateId) {
  const settings = yield call([PresetsServiceApi, PresetsServiceApi.getJournalPresets], { journalId });
  const journalConfig = yield select(selectJournalConfig, stateId);

  if (isArray(settings)) {
    settings.forEach(preset => {
      set(preset, 'settings.columns', JournalsConverter.filterColumnsByConfig(get(preset, 'columns'), journalConfig.columns));
    });
  }

  yield put(setJournalSettings(w(settings)));
  return settings;
}

function* getJournalConfig(api, journalId, w) {
  const journalConfig = yield call([JournalsService, JournalsService.getJournalConfig], journalId);
  yield put(setJournalConfig(w(journalConfig)));
  return journalConfig;
}

function* getColumns({ stateId }) {
  const { journalConfig = {}, journalSetting = {}, grouping = {} } = yield select(selectJournalData, stateId);
  const groupingColumns = get(grouping, 'columns');
  const columns = yield JournalsService.resolveColumns(isEmpty(groupingColumns) ? journalSetting.columns : groupingColumns);

  if (columns.length) {
    return columns.map(setting => {
      const config = journalConfig.columns.find(column => column.attribute === setting.attribute);
      return config ? { ...config, ...setting, sortable: config.sortable } : setting;
    });
  }

  return columns;
}

function* getJournalSetting(api, { journalSettingId, journalConfig, sharedSettings, stateId }, w) {
  try {
    const { journalSetting: _journalSetting = {} } = yield select(selectJournalData, stateId);
    let journalSetting;

    if (sharedSettings) {
      journalSetting = sharedSettings;
    } else {
      journalSettingId = journalSettingId || journalConfig.journalSettingId;

      if (!journalSettingId) {
        journalSettingId = yield call(api.journals.getLsJournalSettingId, journalConfig.id);
      }

      if (journalSettingId) {
        const preset = yield call([PresetsServiceApi, PresetsServiceApi.getPreset], { id: journalSettingId });

        if (isEmpty(preset)) {
          NotificationManager.error(t('journal.presets.error.get-one'));
          journalSetting = null;
        } else {
          journalSetting = { ...preset.settings };
        }

        if (!journalSetting) {
          yield call(api.journals.setLsJournalSettingId, journalConfig.id, '');
        }
      }

      if (!journalSetting && hasInString(window.location.href, JournalUrlParams.JOURNAL_SETTING_ID)) {
        const url = removeUrlSearchParams(window.location.href, JournalUrlParams.JOURNAL_SETTING_ID);

        window.history.replaceState({ path: url }, '', url);

        journalSetting = getDefaultJournalSetting(journalConfig);
      }

      if (isEmpty(journalSettingId) && isEmpty(journalSetting)) {
        journalSetting = getDefaultJournalSetting(journalConfig);
      }
    }

    journalSetting = { ..._journalSetting, ...journalSetting, id: journalSettingId };
    journalSetting.columns = yield JournalsService.resolveColumns(journalSetting.columns);
    journalSetting.columns = JournalsConverter.filterColumnsByConfig(journalSetting.columns, journalConfig.columns);

    if (!isEmpty(journalSetting.predicate)) {
      JournalsConverter.filterPredicatesByConfigColumns(journalSetting.predicate, journalSetting.columns);
    }

    yield put(setJournalSetting(w(journalSetting)));
    yield put(initJournalSettingData(w({ journalSetting })));

    return journalSetting;
  } catch (e) {
    console.error('[journals getJournalSetting saga error', e);
  }
}

function* getJournalSharedSettings(api, id) {
  return id ? yield call(api.userConfig.getConfig, { id }) : null;
}

function* sagaInitJournalSettingData({ api, logger, stateId, w }, action) {
  try {
    const { journalSetting = {}, predicate } = action.payload;
    const columnsSetup = {
      columns: JournalsConverter.injectId(journalSetting.columns),
      sortBy: cloneDeep(journalSetting.sortBy)
    };
    const grouping = {
      columns: cloneDeep(journalSetting.groupBy.length ? journalSetting.grouping.columns : []),
      groupBy: cloneDeep(journalSetting.groupBy)
    };

    const journalConfig = yield select(selectJournalConfig, stateId);
    const filteredPredicate = JournalsConverter.filterPredicatesByConfigColumns(
      cloneDeep(predicate || journalSetting.predicate),
      journalConfig.columns
    );

    yield put(setPredicate(w(filteredPredicate)));
    yield put(setColumnsSetup(w(columnsSetup)));
    yield put(setGrouping(w(grouping)));

    yield put(
      setOriginGridSettings(
        w({
          predicate: filteredPredicate,
          columnsSetup,
          grouping
        })
      )
    );
  } catch (e) {
    logger.error('[journals sagaInitJournalSettingData saga error', e);
  }
}

function* sagaResetJournalSettingData({ api, logger, stateId, w }, action) {
  try {
    const { journalConfig, originGridSettings, predicate, columnsSetup, grouping } = yield select(selectJournalData, stateId);

    if (!isEqual(originGridSettings, { predicate, columnsSetup, grouping })) {
      const journalConfig = yield select(selectJournalConfig, stateId);
      const filteredPredicate = JournalsConverter.filterPredicatesByConfigColumns(
        cloneDeep(originGridSettings.predicate),
        journalConfig.columns
      );

      yield put(setPredicate(w(filteredPredicate)));
      yield put(setColumnsSetup(w(originGridSettings.columnsSetup)));
      yield put(setGrouping(w(originGridSettings.grouping)));

      return;
    }

    const journalSettingId = action.payload;

    yield getJournalSetting(api, { journalSettingId, journalConfig, stateId }, w);
  } catch (e) {
    logger.error('[journals sagaResetJournalSettingData saga error', e);
  }
}

function* getGridData(api, params, stateId) {
  const { recordRef, journalConfig, journalSetting } = yield select(selectJournalData, stateId);
  const config = yield select(state => selectNewVersionDashletConfig(state, stateId));
  const onlyLinked = get(config, 'onlyLinked');

  const { pagination: _pagination, predicates: _predicates, searchPredicate, grouping, ...forRequest } = params;
  const predicates = ParserPredicate.replacePredicatesType(JournalsConverter.cleanUpPredicate(_predicates));
  const pagination = get(forRequest, 'groupBy.length') ? { ..._pagination, maxItems: undefined } : _pagination;
  const settings = JournalsConverter.getSettingsForDataLoaderServer({
    ...forRequest,
    recordRef,
    pagination,
    predicates,
    onlyLinked,
    searchPredicate,
    journalSetting
  });

  if (get(grouping, 'groupBy', []).length) {
    settings.columns = grouping.columns;
  }

  const resultData = yield call([JournalsService, JournalsService.getJournalData], journalConfig, settings);
  const journalData = JournalsConverter.getJournalDataWeb(resultData);
  const recordRefs = journalData.data.map(d => d.id);
  const resultActions = yield call([JournalsService, JournalsService.getRecordActions], journalConfig, recordRefs);
  const actions = JournalsConverter.getJournalActions(resultActions);
  const columns = yield getColumns({ stateId });

  return { ...journalData, columns, actions };
}

function* loadGrid(api, { journalSettingId, journalConfig, userConfigId, stateId }, w) {
  const sharedSettings = yield getJournalSharedSettings(api, userConfigId) || {};

  if (!isEmpty(sharedSettings) && !isEmpty(sharedSettings.columns)) {
    sharedSettings.columns = yield JournalsService.resolveColumns(sharedSettings.columns);
  }

  const journalSetting = yield getJournalSetting(api, { journalSettingId, journalConfig, sharedSettings, stateId }, w);
  const url = yield select(selectUrl, stateId);
  const journalData = yield select(selectJournalData, stateId);

  const pagination = get(sharedSettings, 'pagination') || get(journalData, 'grid.pagination') || {};
  const params = getGridParams({ journalConfig, journalSetting, pagination });
  const search = url.search || journalSetting.search;

  let gridData = yield getGridData(api, { ...params }, stateId);
  let searchData = {};

  if (search) {
    yield put(setGrid(w({ search })));
    searchData = { search };
  }

  if (search && !url.search) {
    yield put(setUrl({ stateId, ...url, search }));
  }

  const searchPredicate = yield getSearchPredicate({ ...w({ stateId }), grid: { ...gridData, ...searchData } });

  if (!isEmpty(searchPredicate)) {
    params.searchPredicate = searchPredicate;
    gridData = yield getGridData(api, params, stateId);
  }

  const editingRules = yield getGridEditingRules(api, gridData);
  let selectedRecords = [];

  if (!!userConfigId) {
    if (isEmpty(get(sharedSettings, 'selectedItems'))) {
      selectedRecords = get(gridData, 'data', []).map(item => item.id);
    } else {
      selectedRecords = sharedSettings.selectedItems;
    }
  }

  if (!isEmpty(gridData.columns)) {
    gridData.columns = JournalsConverter.filterColumnsByConfig(gridData.columns, journalConfig.columns);
  }

  if (!isEmpty(gridData.predicate)) {
    JournalsConverter.filterPredicatesByConfigColumns(gridData.predicates, journalConfig.columns);
  }

  if (!isEmpty(params.predicate)) {
    JournalsConverter.filterPredicatesByConfigColumns(params.predicates, journalConfig.columns);
  }

  yield put(setSelectedRecords(w(selectedRecords)));
  yield put(setSelectAllRecordsVisible(w(false)));
  yield put(setGridInlineToolSettings(w(DEFAULT_INLINE_TOOL_SETTINGS)));
  yield put(setPreviewUrl(w('')));
  yield put(setPreviewFileName(w('')));
  yield put(setGrid(w({ ...params, ...gridData, editingRules })));
}

function* getGridEditingRules(api, gridData) {
  const { data = [], columns = [] } = gridData;
  let editingRules = yield data.map(function*(row) {
    const canEditing = yield call(api.journals.checkRowEditRules, row.id);
    let byColumns = false;

    if (canEditing) {
      byColumns = yield columns.map(function*(column) {
        const isProtected = yield call(api.journals.checkCellProtectedFromEditing, row.id, column.dataField);

        return {
          [column.dataField]: !isProtected
        };
      });

      byColumns = byColumns.reduce(
        (current, result) => ({
          ...result,
          ...current
        }),
        {}
      );
    }

    return {
      [row.id]: byColumns
    };
  });

  editingRules = editingRules.reduce(
    (current, result) => ({
      ...result,
      ...current
    }),
    {}
  );

  return editingRules;
}

function* sagaReloadGrid({ api, logger, stateId, w }, { payload = {} }) {
  try {
    yield put(setLoading(w(true)));

    const journalData = yield select(selectJournalData, stateId);
    const { grid, selectAllRecordsVisible, selectedRecords } = journalData;
    const searchPredicate = get(payload, 'searchPredicate') || (yield getSearchPredicate({ logger, stateId }));
    const params = { ...grid, ...payload, searchPredicate };
    const gridData = yield getGridData(api, params, stateId);
    const editingRules = yield getGridEditingRules(api, gridData);
    const pageRecords = get(gridData, 'data', []).map(item => item.id);

    let _selectedRecords = isArray(selectedRecords) ? selectedRecords : [];
    let _selectAllPageRecords = false;

    if (selectAllRecordsVisible) {
      _selectAllPageRecords = true;
      _selectedRecords = pageRecords;
    } else if (pageRecords.every(rec => selectedRecords.includes(rec))) {
      _selectAllPageRecords = true;
    }

    yield put(setSelectAllRecords(w(_selectAllPageRecords)));
    yield put(setSelectedRecords(w(_selectedRecords)));
    yield put(setGrid(w({ ...params, ...gridData, editingRules })));
    yield put(setLoading(w(false)));
  } catch (e) {
    logger.error('[journals sagaReloadGrid saga error', e);
  }
}

function* sagaReloadTreeGrid({ api, logger, stateId, w }) {
  try {
    yield put(setLoading(w(true)));

    const gridData = yield call(api.journals.getTreeGridData);
    const editingRules = yield getGridEditingRules(api, gridData);

    yield put(setGrid(w({ ...gridData, editingRules })));

    yield put(setLoading(w(false)));
  } catch (e) {
    logger.error('[journals sagaReloadTreeGrid saga error', e);
  }
}

function* sagaSaveDashlet({ api, logger, stateId, w }, action) {
  try {
    const { id, config } = action.payload;

    yield call(api.journals.saveDashletConfig, config, id);
    yield put(getDashletConfig(w(id)));
  } catch (e) {
    logger.error('[journals sagaSaveDashlet saga error', e);
  }
}

function* sagaInitJournal({ api, logger, stateId, w }, action) {
  try {
    yield put(setLoading(w(true)));

    const { journalId, journalSettingId, userConfigId, customJournal, customJournalMode } = action.payload;
    const id = !customJournalMode || !customJournal ? journalId : customJournal;

    let { journalConfig } = yield select(selectJournalData, stateId);

    const isEmptyConfig = isEqual(journalConfig, emptyJournalConfig);
    const isNotExistsJournal = yield call([JournalsService, JournalsService.isNotExistsJournal], id);

    yield put(setJournalExistStatus(w(isNotExistsJournal !== true)));

    if (isEmpty(journalConfig) || isEmptyConfig) {
      journalConfig = yield getJournalConfig(api, id, w);

      yield getJournalSettings(api, journalConfig.id, w, stateId);
    }

    yield loadGrid(
      api,
      {
        journalSettingId,
        journalConfig,
        userConfigId,
        stateId
      },
      (...data) => ({ ...w(...data), logger })
    );
    yield call(loadDocumentLibrarySettings, journalConfig.id, w);

    yield put(setLoading(w(false)));
  } catch (e) {
    yield put(setLoading(w(false)));
    logger.error('[journals sagaInitJournal saga error', e);
  }
}

function* sagaOpenSelectedPreset({ api, logger, stateId, w }, action) {
  try {
    const selectedId = action.payload;
    const query = getSearchParams();

    if (query[JournalUrlParams.JOURNAL_SETTING_ID] === undefined && selectedId === undefined) {
      return;
    }

    const { journalSetting } = yield select(selectJournalData, stateId);

    if (journalSetting.id === selectedId) {
      return;
    }

    query[JournalUrlParams.JOURNAL_SETTING_ID] = selectedId || undefined;
    query[JournalUrlParams.USER_CONFIG_ID] = undefined;

    const url = queryString.stringifyUrl({ url: getUrlWithoutOrigin(), query });

    yield call([PageService, PageService.changeUrlLink], url, { updateUrl: true });
    yield put(selectPreset(w(selectedId)));
  } catch (e) {
    logger.error('[journals sagaOpenSelectedJournal saga error', e);
  }
}

function* sagaSelectPreset({ api, logger, stateId, w }, action) {
  try {
    const journalSettingId = action.payload;
    const { journalConfig } = yield select(selectJournalData, stateId);

    yield put(setLoading(w(true)));
    yield call(api.journals.setLsJournalSettingId, journalConfig.id, journalSettingId);
    yield loadGrid(api, { journalSettingId, journalConfig, stateId }, w);
    yield put(setLoading(w(false)));
  } catch (e) {
    logger.error('[journals sagaSelectPreset saga error', e);
  }
}

function* sagaOpenSelectedJournal({ api, logger, stateId, w }, action) {
  try {
    const query = getSearchParams();

    if (query[JournalUrlParams.JOURNAL_ID] === (action.payload || undefined)) {
      return;
    }

    yield put(setLoading(w(true)));

    const exceptionalParams = [JournalUrlParams.JOURNALS_LIST_ID];

    for (let key in query) {
      if (!exceptionalParams.includes(key)) {
        query[key] = undefined;
      }
    }

    query[JournalUrlParams.JOURNAL_ID] = action.payload;

    const url = queryString.stringifyUrl({ url: getUrlWithoutOrigin(), query });

    yield call(PageService.changeUrlLink, url, { openNewTab: true, pushHistory: true });
  } catch (e) {
    logger.error('[journals sagaOpenSelectedJournal saga error', e);
  }
}

function* sagaSelectJournal({ api, logger, stateId, w }, action) {
  try {
    const journalId = action.payload;

    yield put(setLoading(w(true)));

    const journalConfig = yield getJournalConfig(api, journalId, w);

    yield getJournalSettings(api, journalConfig.id, w, stateId);
    yield loadGrid(api, { journalConfig, stateId }, w);
    yield put(setLoading(w(false)));
  } catch (e) {
    logger.error('[journals sagaSelectJournal saga error', e);
  }
}

function* sagaExecRecordsAction({ api, logger, stateId, w }, action) {
  try {
    const actionResult = yield call(api.recordActions.executeAction, action.payload);
    const check = isArray(actionResult) ? actionResult.some(res => res !== false) : actionResult !== false;

    if (check) {
      if (get(action, 'payload.action.type', '') !== ActionTypes.BACKGROUND_VIEW) {
        yield put(reloadGrid(w()));
      }
    }
  } catch (e) {
    logger.error('[journals sagaExecRecordsAction saga error', e, e);
  }
}

function* sagaSaveRecords({ api, logger, stateId, w }, action) {
  try {
    const { grid } = yield select(selectJournalData, stateId);
    const editingRules = yield getGridEditingRules(api, grid);
    const { id, attributes } = action.payload;
    const attribute = Object.keys(attributes)[0];
    const value = attributes[attribute];
    const tempAttributes = {};

    const currentColumn = grid.columns.find(item => item.attribute === attribute);

    const valueToSave = EditorService.getValueToSave(value, currentColumn.multiple);

    yield call(api.journals.saveRecords, {
      id,
      attributes: {
        [attribute]: valueToSave
      }
    });

    grid.columns.forEach(c => {
      tempAttributes[c.attribute] = c.attSchema;
    });

    const savedRecord = yield call(api.journals.getRecord, { id, attributes: tempAttributes, noCache: true });

    grid.data = grid.data.map(record => {
      if (record.id === id) {
        const savedValue = EditorService.getValueToSave(savedRecord[attribute], currentColumn.multiple);

        if (!isEqual(savedValue, valueToSave)) {
          savedRecord.error = attribute;
        }

        return { ...savedRecord, id };
      }

      return record;
    });

    yield put(setGrid(w({ ...grid, editingRules })));
  } catch (e) {
    logger.error('[journals sagaSaveRecords saga error', e);
  }
}

function* sagaSaveJournalSetting({ api, logger, stateId, w }, action) {
  try {
    const { settings } = action.payload;
    const { id } = yield select(selectJournalSetting, stateId);

    yield call([PresetsServiceApi, PresetsServiceApi.saveSettings], { id, settings });
  } catch (e) {
    logger.error('[journals sagaSaveJournalSetting saga error', e);
  }
}

function* sagaCreateJournalSetting({ api, logger, stateId, w }, action) {
  try {
    const { callback, ...data } = action.payload;
    const { journalConfig } = yield select(selectJournalData, stateId);

    const executor = ActionsRegistry.getHandler(ActionTypes.EDIT_JOURNAL_PRESET);
    const actionResult = yield call([executor, executor.execForRecord], `${SourcesId.PRESETS}@`, { config: { data } });

    if (actionResult && actionResult.id) {
      yield put(openSelectedPreset(w(actionResult.id)));
    }

    yield getJournalSettings(api, journalConfig.id, w, stateId);
    isFunction(callback) && callback(actionResult);
  } catch (e) {
    logger.error('[journals sagaCreateJournalSetting saga error', e);
  }
}

function* sagaDeleteJournalSetting({ api, logger, stateId, w }, action) {
  try {
    const { journalConfig } = yield select(selectJournalData, stateId);
    const executor = ActionsRegistry.getHandler(ActionTypes.DELETE);
    const actionResult = yield call([executor, executor.execForRecord], action.payload, { config: { withoutConfirm: true } });

    if (actionResult) {
      NotificationManager.success(t('record-action.edit-journal-preset.msg.deleted-success'));
    }

    yield getJournalSettings(api, journalConfig.id, w, stateId);
    yield put(openSelectedPreset(''));
  } catch (e) {
    logger.error('[journals sagaDeleteJournalSetting saga error', e);
  }
}

function* sagaEditJournalSetting({ api, logger, stateId, w }, action) {
  try {
    const recordId = action.payload;
    const { journalConfig } = yield select(selectJournalData, stateId);
    const data = yield call([PresetsServiceApi, PresetsServiceApi.getPreset], { id: recordId });

    if (!data) {
      throw Error(data);
    }

    const executor = ActionsRegistry.getHandler(ActionTypes.EDIT_JOURNAL_PRESET);

    yield call([executor, executor.execForRecord], recordId, { config: { data } });
    yield getJournalSettings(api, journalConfig.id, w, stateId);
  } catch (e) {
    NotificationManager.error(t('journal.presets.error.get-one'));
    logger.error('[journals sagaEditJournalSetting saga error', e);
  }
}

function* sagaApplyJournalSetting({ api, logger, stateId, w }, action) {
  try {
    const { settings } = action.payload;
    const { columns, groupBy, sortBy, predicate, grouping } = settings;
    const predicates = predicate ? [predicate] : [];
    const maxItems = yield select(selectGridPaginationMaxItems, stateId);
    const pagination = { ...DEFAULT_JOURNALS_PAGINATION, maxItems };

    yield put(setJournalSetting(w(settings)));
    yield put(setPredicate(w(predicate)));

    yield put(setColumnsSetup(w({ columns, sortBy })));
    yield put(setGrouping(w(grouping)));
    yield put(
      setGrid(
        w({
          columns: grouping.groupBy.length ? grouping.columns : columns
        })
      )
    );
    yield put(
      reloadGrid(
        w({
          columns: grouping.groupBy.length ? grouping.columns : columns,
          groupBy,
          sortBy,
          predicates,
          pagination,
          grouping,
          search: ''
        })
      )
    );
  } catch (e) {
    logger.error('[journals sagaApplyJournalSetting saga error', e);
  }
}

function* sagaInitPreview({ api, logger, stateId, w }, action) {
  try {
    const nodeRef = action.payload;
    const previewUrl = yield call(api.journals.getPreviewUrl, nodeRef);

    yield put(setPreviewUrl(w(previewUrl)));
  } catch (e) {
    logger.error('[journals sagaInitPreview saga error', e);
  }
}

function* sagaGoToJournalsPage({ api, logger, stateId, w }, action) {
  try {
    const journalData = yield select(selectJournalData, stateId);
    const { journalConfig = {}, grid = {} } = journalData || {};
    const { columns, groupBy = [] } = grid;
    const { criteria = [], predicate = {} } = journalConfig.meta || {};

    let row = cloneDeep(action.payload);
    let id = journalConfig.id || '';
    let filter = '';

    if (id === 'event-lines-stat') {
      //todo: move to journal config
      let eventTypeId = row['groupBy__type'];

      if (eventTypeId) {
        eventTypeId = eventTypeId.replace(`${SourcesId.TYPE}@line-`, '');
        id = 'event-lines-' + eventTypeId;
        NotificationManager.info('', t('notification.journal-will-be-opened-soon'), 1000);
        PageService.changeUrlLink('/v2/journals?journalId=' + id, { updateUrl: true });

        return;
      } else {
        console.error("[journals sagaGoToJournalsPage] Target journal can't be resolved", row);
      }
    } else {
      const journalType = get(criteria, [0, 'value']) || predicate.val;

      if (journalType && journalConfig.groupBy && journalConfig.groupBy.length) {
        const config = yield call(JournalsService.getJournalConfig, `alf_${encodeURI(journalType)}`);
        id = config.id;
      }

      if (groupBy.length) {
        for (let key in row) {
          if (!row.hasOwnProperty(key)) {
            continue;
          }

          const value = row[key];

          if (value && value.str) {
            //row[key] = value.str;
          }
        }
      } else {
        let attributes = {};

        columns.forEach(c => (attributes[c.attribute] = `${c.attribute}?str`));
        row = yield call(api.journals.getRecord, { id: row.id, attributes: attributes }) || row;
      }

      filter = getFilterParam({ row, columns, groupBy });
    }

    if (filter) {
      yield call(api.journals.setLsJournalSettingId, id, '');
    }

    const journalSetting = yield getJournalSetting(api, { journalConfig, stateId }, w);
    const params = getGridParams({ journalConfig, journalSetting });
    const predicateValue = ParserPredicate.setPredicateValue(get(params, 'predicates[0]') || [], filter);
    set(params, 'predicates', [predicateValue]);
    const gridData = yield getGridData(api, { ...params }, stateId);
    const editingRules = yield getGridEditingRules(api, gridData);

    yield put(setPredicate(w(predicateValue)));
    yield put(setJournalSetting(w({ predicate: predicateValue })));
    yield put(setSelectedRecords(w([])));
    yield put(setSelectAllRecordsVisible(w(false)));
    yield put(setGridInlineToolSettings(w(DEFAULT_INLINE_TOOL_SETTINGS)));
    yield put(setPreviewUrl(w('')));
    yield put(setPreviewFileName(w('')));
    yield put(setGrid(w({ ...params, ...gridData, editingRules })));
  } catch (e) {
    logger.error('[journals sagaGoToJournalsPage saga error]', e);
  }
}

function* getSearchPredicate({ logger, stateId, grid }) {
  try {
    const journalData = yield select(selectJournalData, stateId);
    let { journalConfig, grid: gridData = {} } = journalData;
    const fullSearch = get(journalConfig, ['params', 'full-search-predicate']);
    let predicate;

    if (!isEmpty(grid)) {
      gridData = { ...gridData, ...grid };
    }

    const { groupBy = [], search } = gridData;
    let { columns = [] } = gridData;

    columns = columns.filter(item => {
      return ![COLUMN_DATA_TYPE_DATE, COLUMN_DATA_TYPE_DATETIME].includes(item.type);
    });

    if (fullSearch) {
      predicate = JSON.parse(fullSearch);
      predicate.val = search;
    } else {
      predicate = ParserPredicate.getSearchPredicates({ text: search, columns, groupBy });
    }

    if (predicate) {
      predicate = [predicate];
    }

    if (isEmpty(search)) {
      predicate = [];
    }

    return predicate;
  } catch (e) {
    logger.error('[journals getSearchPredicate saga error', e);
  }
}

function* sagaSearch({ logger, w, stateId }, { payload }) {
  try {
    const urlData = queryString.parseUrl(getUrlWithoutOrigin());
    const searchText = get(payload, 'text', '');

    if (searchText && get(urlData, ['query', JournalUrlParams.SEARCH]) !== searchText) {
      set(urlData, ['query', JournalUrlParams.SEARCH], searchText);
    }

    if (searchText === '' && has(urlData, ['query', JournalUrlParams.SEARCH])) {
      delete urlData.query[JournalUrlParams.SEARCH];
    }

    if (!isEqual(getSearchParams(), urlData.query)) {
      yield put(setLoading(w(true)));
      yield call(PageService.changeUrlLink, decodeLink(queryString.stringifyUrl(urlData)), { updateUrl: true });
    }
  } catch (e) {
    logger.error('[journals sagaSearch saga error', e);
  }
}

function* sagaCheckConfig({ logger, w, stateId }, { payload }) {
  try {
    yield put(setCheckLoading(w(true)));

    const config = get(payload, get(payload, 'version'));
    const customJournalMode = get(config, 'customJournalMode');
    const id = get(config, customJournalMode ? 'customJournal' : 'journalId', '');
    const isNotExistsJournal = !!id && (yield call([JournalsService, JournalsService.isNotExistsJournal], id));

    yield put(setJournalExistStatus(w(!isNotExistsJournal)));
    yield put(setCheckLoading(w(false)));
    yield put(setEditorMode(w(isEmpty(id))));
  } catch (e) {
    logger.error('[journals sagaCheckConfig saga error', e);
  }
}

function* saga(ea) {
  yield takeEvery(getDashletConfig().type, wrapSaga, { ...ea, saga: sagaGetDashletConfig });
  yield takeEvery(setDashletConfigByParams().type, wrapSaga, { ...ea, saga: sagaSetDashletConfigFromParams });
  yield takeEvery(getDashletEditorData().type, wrapSaga, { ...ea, saga: sagaGetDashletEditorData });
  yield takeLatest(getJournalsData().type, wrapSaga, { ...ea, saga: sagaGetJournalsData });
  yield takeEvery(saveDashlet().type, wrapSaga, { ...ea, saga: sagaSaveDashlet });
  yield takeEvery(initJournal().type, wrapSaga, { ...ea, saga: sagaInitJournal });

  yield takeEvery(reloadGrid().type, wrapSaga, { ...ea, saga: sagaReloadGrid });
  yield takeEvery(reloadTreeGrid().type, wrapSaga, { ...ea, saga: sagaReloadTreeGrid });

  yield takeEvery(execRecordsAction().type, wrapSaga, { ...ea, saga: sagaExecRecordsAction });
  yield takeEvery(saveRecords().type, wrapSaga, { ...ea, saga: sagaSaveRecords });

  yield takeEvery(saveJournalSetting().type, wrapSaga, { ...ea, saga: sagaSaveJournalSetting });
  yield takeEvery(createJournalSetting().type, wrapSaga, { ...ea, saga: sagaCreateJournalSetting });
  yield takeEvery(deleteJournalSetting().type, wrapSaga, { ...ea, saga: sagaDeleteJournalSetting });
  yield takeEvery(editJournalSetting().type, wrapSaga, { ...ea, saga: sagaEditJournalSetting });
  yield takeEvery(applyJournalSetting().type, wrapSaga, { ...ea, saga: sagaApplyJournalSetting });

  yield takeEvery(selectJournal().type, wrapSaga, { ...ea, saga: sagaSelectJournal });
  yield takeEvery(openSelectedJournal().type, wrapSaga, { ...ea, saga: sagaOpenSelectedJournal });
  yield takeEvery(selectPreset().type, wrapSaga, { ...ea, saga: sagaSelectPreset });
  yield takeEvery(openSelectedPreset().type, wrapSaga, { ...ea, saga: sagaOpenSelectedPreset });

  yield takeEvery(initJournalSettingData().type, wrapSaga, { ...ea, saga: sagaInitJournalSettingData });
  yield takeEvery(resetJournalSettingData().type, wrapSaga, { ...ea, saga: sagaResetJournalSettingData });

  yield takeEvery(initPreview().type, wrapSaga, { ...ea, saga: sagaInitPreview });
  yield takeEvery(goToJournalsPage().type, wrapSaga, { ...ea, saga: sagaGoToJournalsPage });
  yield takeEvery(runSearch().type, wrapSaga, { ...ea, saga: sagaSearch });
  yield takeEvery(checkConfig().type, wrapSaga, { ...ea, saga: sagaCheckConfig });
}

export default saga;
