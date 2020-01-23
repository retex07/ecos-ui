import { put, select, takeEvery, call } from 'redux-saga/effects';
import get from 'lodash/get';
import set from 'lodash/set';

import { selectTypeNames, selectDynamicTypes, selectAvailableTypes } from '../selectors/documents';
import {
  init,
  initSuccess,
  getAvailableTypes,
  setAvailableTypes,
  setDynamicTypes,
  getDocumentsByType,
  setDocuments,
  toggleType,
  saveSettings,
  saveSettingsFinally,
  uploadFiles,
  uploadFilesSuccess
} from '../actions/documents';
import DocumentsConverter from '../dto/documents';

function* sagaInitWidget({ api, logger }, { payload }) {
  try {
    yield* sagaGetAvailableTypes({ api, logger }, { payload: payload.record });
    yield* sagaGetDynamicTypes({ api, logger }, { payload });

    yield put(initSuccess(payload.record));
  } catch (e) {
    logger.error('[documents sagaInitWidget saga error', e.message);
  }
}

function* sagaToggleType({ api, logger }, { payload }) {
  try {
    const availableTypes = yield select(state => selectAvailableTypes(state, payload.record));
    const mutableItem = availableTypes.find(item => item.id === payload.id);
    const dynamicTypes = yield select(state => selectDynamicTypes(state, payload.record));
    const index = dynamicTypes.findIndex(item => item.type === payload.id);
    const typesNames = yield select(state => selectTypeNames(state, payload));

    mutableItem.isSelected = payload.checked;

    if (!~index) {
      const formId = yield call(api.documents.getFormIdByType, payload.id);

      dynamicTypes.push(DocumentsConverter.getFormattedDynamicType({ ...mutableItem, formId }));
    } else {
      dynamicTypes.splice(index, 1);
    }

    // todo: realy need it?
    yield put(
      setAvailableTypes({
        record: payload.record,
        types: availableTypes
      })
    );

    yield put(
      setDynamicTypes({
        record: payload.record,
        dynamicTypes: DocumentsConverter.getDynamicTypes({ types: dynamicTypes, typesNames })
      })
    );
  } catch (e) {
    logger.error('[documents sagaToggleType saga error', e.message);
  }
}

function* sagaGetDynamicTypes({ api, logger }, { payload }) {
  try {
    const { records: dynamicTypes, errors: dtErrors } = yield call(api.documents.getDynamicTypes, payload.record);

    if (dtErrors.length) {
      throw new Error(dtErrors.join(' '));
    }

    let combinedTypes = DocumentsConverter.combineTypes(dynamicTypes, get(payload, 'config.types', []));
    const typeNames = yield select(state => selectTypeNames(state, payload.record));
    const dynamicTypeKeys = combinedTypes.map(record => record.type);

    const { records: countDocuments, errors: documentsErrors } = yield call(
      api.documents.getCountDocumentsByTypes,
      payload.record,
      dynamicTypeKeys
    );

    if (documentsErrors.length) {
      throw new Error(documentsErrors.join(' '));
    }

    combinedTypes = yield combinedTypes
      .map(function*(item) {
        if (item.formId) {
          return item;
        }

        const formId = yield call(api.documents.getFormIdByType, item.type);

        if (!formId) {
          return null;
        }

        return {
          ...item,
          formId
        };
      })
      .filter(item => item !== null);

    if (combinedTypes.length === 1) {
      yield* sagaGetDocumentsByType(
        { api, logger },
        {
          payload: {
            record: payload.record,
            type: combinedTypes[0].type
          }
        }
      );
    }

    yield put(
      setDynamicTypes({
        record: payload.record,
        dynamicTypes: DocumentsConverter.getDynamicTypes({ types: combinedTypes, typeNames, countByTypes: countDocuments })
      })
    );

    const types = yield select(state => selectAvailableTypes(state, payload.record));

    yield put(
      setAvailableTypes({
        record: payload.record,
        types
      })
    );
  } catch (e) {
    logger.error('[documents sagaGetDynamicTypes saga error', e.message);
  }
}

function* sagaGetAvailableTypes({ api, logger }, { payload }) {
  try {
    const { records, errors } = yield call(api.documents.getDocumentTypes, payload);

    if (errors.length) {
      throw new Error(errors.join(' '));
    }

    yield put(
      setAvailableTypes({
        record: payload,
        types: DocumentsConverter.getAvailableTypes(records)
      })
    );
  } catch (e) {
    logger.error('[documents sagaGetAvailableTypes saga error', e.message);
  }
}

function* sagaGetDocumentsByType({ api, logger }, { payload }) {
  try {
    const { records, errors } = yield call(api.documents.getDocumentsByType, payload.record, payload.type);

    if (errors.length) {
      throw new Error(errors.join(' '));
    }

    const typeNames = yield select(state => selectTypeNames(state, payload.record));

    yield put(
      setDocuments({
        record: payload.record,
        documents: DocumentsConverter.getDocuments({
          documents: records,
          type: payload.type,
          typeName: typeNames[payload.type]
        })
      })
    );

    const dynamicTypes = JSON.parse(JSON.stringify(yield select(state => selectDynamicTypes(state, payload.record))));

    if (dynamicTypes.length) {
      const type = dynamicTypes.find(item => item.type === payload.type);

      set(type, 'countDocuments', records.length);
    }

    yield put(setDynamicTypes({ record: payload.record, dynamicTypes }));
  } catch (e) {
    logger.error('[documents sagaGetDocumentsByType saga error', e.message);
  }
}

function* sagaSaveSettings({ api, logger }, { payload }) {
  try {
    const dynamicTypeKeys = payload.types.map(record => record.type);

    const { records: countDocuments, errors: documentsErrors } = yield call(
      api.documents.getCountDocumentsByTypes,
      payload.record,
      dynamicTypeKeys
    );

    yield put(
      setDynamicTypes({
        record: payload.record,
        dynamicTypes: DocumentsConverter.getDynamicTypes({ types: payload.types, countByTypes: countDocuments }), //
        countDocuments
      })
    );
  } catch (e) {
    logger.error('[documents sagaSaveSettings saga error', e.message);
  } finally {
    yield put(saveSettingsFinally(payload.record));
  }
}

function* sagaUploadFiles({ api, logger }, { payload }) {
  try {
    const results = yield payload.files.map(
      yield function*(file) {
        const formData = new FormData();

        formData.append('file', file);
        formData.append('name', file.name);

        const { nodeRef = null } = yield call(api.documents.uploadFile, formData, payload.callback);

        if (!nodeRef) {
          return null;
        }

        return {
          size: file.size,
          name: file.name,
          data: { nodeRef }
        };
      }
    );

    yield call(api.documents.uploadFilesWithNodes, {
      record: payload.record,
      type: payload.type,
      content: results.filter(item => item !== null)
    });

    yield put(uploadFilesSuccess(payload.record));
  } catch (e) {
    logger.error('[documents sagaUploadFiles saga error', e.message);
  }
}

function* saga(ea) {
  yield takeEvery(init().type, sagaInitWidget, ea);
  yield takeEvery(getAvailableTypes().type, sagaGetAvailableTypes, ea);
  yield takeEvery(getDocumentsByType().type, sagaGetDocumentsByType, ea);
  yield takeEvery(toggleType().type, sagaToggleType, ea);
  yield takeEvery(saveSettings().type, sagaSaveSettings, ea);
  yield takeEvery(uploadFiles().type, sagaUploadFiles, ea);
}

export default saga;
