import { call, put, takeEvery } from 'redux-saga/effects';

import { getJournal, getModel, setJournal, setModel } from '../actions/processStatistics';
import JournalsService from '../components/Journals/service/journalsService';
import JournalsConverter from '../dto/journals';
import { DEFAULT_PAGINATION } from '../components/Journals/constants';

const getSettings = ({ predicates, record }) => {
  return JournalsConverter.getSettingsForDataLoaderServer({
    // predicate: { att: 'document', val: [record], t: PREDICATE_CONTAINS },
    predicates,
    pagination: DEFAULT_PAGINATION //todo?
  });
};

function* sagaGetJournal({ api, logger }, { payload }) {
  const { record, stateId, selectedJournal } = payload;

  try {
    const journalConfig = yield call([JournalsService, JournalsService.getJournalConfig], selectedJournal, true);
    const res = yield call([JournalsService, JournalsService.getJournalData], journalConfig, getSettings({}));

    yield put(setJournal({ stateId, data: res.records, journalConfig }));
  } catch (e) {
    yield put(setJournal({ stateId, data: [], journalConfig: null }));
    logger.error('[processStatistics/sagaGetJournal] error', e);
  }
}

function* sagaGetModel({ api, logger }, { payload }) {
  const { record, stateId } = payload;

  try {
    const model = yield call(api.cmmn.getModel, record);
    const heatmap = yield call(api.cmmn.getHeatmapData, record);

    yield put(setModel({ stateId, model, heatmapData: heatmap.records }));
  } catch (e) {
    yield put(setModel({ stateId, model: null }));
    logger.error('[processStatistics/sagaGetModel] error', e);
  }
}

function* eventsHistorySaga(ea) {
  yield takeEvery(getModel().type, sagaGetModel, ea);
  yield takeEvery(getJournal().type, sagaGetJournal, ea);
  // yield takeEvery(getJournal().type, sagaFilterEventsHistory, ea);
}

export default eventsHistorySaga;
