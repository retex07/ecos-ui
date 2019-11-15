import { call, put, takeEvery } from 'redux-saga/effects';
import { getGeneratedBarcode, printBarcode, setGeneratedBarcode } from '../actions/barcode';
import { setNotificationMessage } from '../actions/notification';
import { t } from '../helpers/util';

function* sagaGetGeneratedBarcode({ api, logger }, { payload }) {
  const err = t('barcode-widget.saga.error1');

  try {
    const { record, stateId } = payload;
    const res = yield call(api.barcode.getGeneratedBarcode, { record });

    if (res && res.barcode) {
      yield put(setGeneratedBarcode({ stateId, barcode: res.barcode, error: '' }));
    } else {
      yield put(setGeneratedBarcode({ stateId, barcode: '', error: res.error }));
    }
  } catch (e) {
    yield put(setNotificationMessage(err));
    logger.error('[barcode/sagaGetGeneratedBarcode saga] error', e.message);
  }
}

function* sagaPrintBarcode({ api, logger }, { payload }) {
  const err = t('barcode-widget.saga.error2');

  try {
    const { record } = payload;

    yield call(api.barcode.runPrintBarcode, { record });
  } catch (e) {
    yield put(setNotificationMessage(err));
    logger.error('[barcode/sagaPrintBarcode saga] error', e.message);
  }
}

function* barcodeSaga(ea) {
  yield takeEvery(getGeneratedBarcode().type, sagaGetGeneratedBarcode, ea);
  yield takeEvery(printBarcode().type, sagaPrintBarcode, ea);
}

export default barcodeSaga;
