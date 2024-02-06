import { delay, takeEvery } from 'redux-saga';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import endsWith from 'lodash/endsWith';
import isFunction from 'lodash/isFunction';

import { BPMN_MODELS_PAGE_MAX_ITEMS, EDITOR_PAGE_CONTEXT } from '../constants/bpmn';
import { t } from '../helpers/util';
import {
  getNextModels,
  getTotalCount,
  setTotalCount,
  updateModels,
  deleteCategory,
  deleteCategoryRequest,
  importProcessModelRequest,
  initRequest,
  initModels,
  saveCategoryRequest,
  savePagePosition,
  setCategories,
  setCategoryCollapseState,
  setCategoryData,
  setIsReady,
  setCreateVariants,
  setModelsInfoByCategoryId,
  setViewType,
  createModel,
  setIsModelsLoading,
  getFullModels
} from '../actions/bpmn';
import { INFO_DIALOG_ID } from '../components/common/dialogs/Manager/DialogManager';
import { showModal } from '../actions/modal';
import { selectAllCategories, selectAllModels, selectModelsInfoByCategoryId } from '../selectors/bpmn';
import { getPagePositionState, savePagePositionState } from '../helpers/bpmn';
import Records from '../components/Records';
import FormManager from '../components/EcosForm/FormManager';

function* doInitRequest({ api, logger }) {
  try {
    const categories = yield call(api.bpmn.fetchCategories);
    const createVariants = yield call(api.bpmn.fetchCreateVariants);

    yield put(setCategories(categories));
    yield put(setCreateVariants(createVariants));

    let pagePosition = JSON.parse(yield call(getPagePositionState));
    if (pagePosition) {
      // TODO: optimization
      if (pagePosition.openedCategories) {
        for (let categoryId of pagePosition.openedCategories) {
          const existedCategory = categories.find(category => category.id === categoryId);
          if (existedCategory) {
            yield put(setCategoryCollapseState({ id: categoryId, isOpen: true }));
          }
        }
      }

      if (pagePosition.viewType) {
        yield put(setViewType(pagePosition.viewType));
      }
    }

    yield put(setIsReady(true));

    if (pagePosition && pagePosition.scrollTop) {
      document.body.scrollTo(0, pagePosition.scrollTop);
    }
  } catch (e) {
    logger.error('[bpmn doInitRequest saga] error', e);
  }
}

function* doInitModels({ api, logger }, { payload }) {
  try {
    const { categoryId } = payload;

    yield put(setIsModelsLoading({ categoryId, isLoading: true }));

    const page = {
      page: 0,
      maxItems: BPMN_MODELS_PAGE_MAX_ITEMS
    };

    const modelsResponse = yield call(api.bpmn.fetchProcessModels, { categoryId, page });

    const models = modelsResponse.records;
    const hasMore = modelsResponse.hasMore;

    yield put(
      setModelsInfoByCategoryId({
        categoryId,
        models,
        hasMore,
        page,
        force: true
      })
    );
  } catch (e) {
    const { categoryId } = payload;

    yield put(setIsModelsLoading({ categoryId, isLoading: false }));
    logger.error('[bpmn doInitModels saga] error', e);
  }
}

function* doGetTotalCount({ api, logger }) {
  try {
    const totalCount = yield call(api.bpmn.fetchTotalCount);

    yield put(setTotalCount(totalCount));
  } catch (e) {
    logger.error('[bpmn doGetTotalCount saga] error', e);
  }
}

function* doGetNextModels({ api, logger }, { payload }) {
  try {
    const { categoryId } = payload;

    yield put(
      setModelsInfoByCategoryId({
        categoryId,
        isNextModelsLoading: true
      })
    );

    const modelsInfo = yield select(state => selectModelsInfoByCategoryId(state, { categoryId }));

    const page = modelsInfo.page;

    page.page = page.page + 1;
    page.skipCount = page.page * page.maxItems;

    const modelsResponse = yield call(api.bpmn.fetchProcessModels, { categoryId, page });

    const models = modelsResponse.records;
    const hasMore = modelsResponse.hasMore;

    yield put(
      setModelsInfoByCategoryId({
        categoryId,
        models,
        hasMore,
        isNextModelsLoading: false,
        page
      })
    );
  } catch (e) {
    logger.error('[bpmn doInitModels saga] error', e);
  }
}

function* doGetFullModels({ api, logger }, { payload }) {
  try {
    const { categoryId } = payload;

    yield put(setIsModelsLoading({ categoryId, isLoading: true }));

    const page = {
      page: 0,
      maxItems: 1000
    };

    const modelsResponse = yield call(api.bpmn.fetchProcessModels, { categoryId, page });

    const models = modelsResponse.records;
    const hasMore = modelsResponse.hasMore;

    yield put(
      setModelsInfoByCategoryId({
        categoryId,
        models,
        hasMore,
        page,
        force: true
      })
    );
  } catch (e) {
    const { categoryId } = payload;

    yield put(setIsModelsLoading({ categoryId, isLoading: false }));
    logger.error('[bpmn doGetFullModels saga] error', e);
  }
}

function* doCreateModel({ api, logger }, action) {
  try {
    const payload = action.payload || {};

    let cv = payload.createVariant;
    if (cv == null) {
      cv = yield Records.get('emodel/type@bpmn-process-def').load('createVariantsById.create-new-process-def?json', true);
    }

    if (payload.categoryId) {
      cv.attributes = {
        ...(cv.attributes || {}),
        sectionRef: payload.categoryId
      };
    }

    let newModelId;
    const saved = yield new Promise(resolve => {
      FormManager.createRecordByVariant(cv, {
        onSubmit: result => {
          newModelId = result.id;
          resolve(true);
        },
        onFormCancel: () => resolve(false)
      });
    });
    if (saved) {
      const newModel = yield call(api.bpmn.fetchModelAttributes, newModelId, true);
      const { categoryId } = newModel;

      const modelsInfo = yield select(state => selectModelsInfoByCategoryId(state, { categoryId }));
      const models = modelsInfo.models || [];

      yield put(
        setModelsInfoByCategoryId({
          categoryId,
          ...modelsInfo,
          models: [newModel, ...models],
          force: true
        })
      );
    }
  } catch (e) {
    logger.error('[bpmn doCreateModel saga] error', e);
  }
}

function* doSaveCategoryRequest({ api, logger }, action) {
  try {
    const categories = yield select(selectAllCategories);
    const currentCategory = categories.find(item => item.id === action.payload.id);

    let newId = null;

    let { canCreateDef } = currentCategory;

    if (currentCategory.isTemporary) {
      const categoryData = yield call(api.bpmn.createCategory, action.payload.code, action.payload.label, currentCategory.parentId);
      newId = categoryData.id;

      const parentCategory = categories.find(item => item.id === currentCategory.parentId);
      canCreateDef = canCreateDef || parentCategory.canCreateDef;
    } else {
      yield call(api.bpmn.updateCategory, action.payload.id, {
        title: action.payload.label,
        code: action.payload.code
      });
    }

    yield put(
      setCategoryData({
        id: action.payload.id,
        label: action.payload.label,
        code: action.payload.code,
        canCreateDef,
        newId
      })
    );
  } catch (e) {
    NotificationManager.error(t('designer.add-category.failure-message'));
    logger.error('[bpmn doSaveCategoryRequest saga] error', e);
  }
}

function* doDeleteCategoryRequest({ api, logger }, action) {
  try {
    const categoryId = action.payload;

    const allCategories = yield select(selectAllCategories);
    const allModels = yield select(selectAllModels);

    const isCategoryHasChildren =
      allCategories.findIndex(item => endsWith(item.parentId, categoryId)) !== -1 ||
      allModels.findIndex(item => item.categoryId.includes(categoryId)) !== -1;

    if (isCategoryHasChildren) {
      yield delay(100);
      yield put(
        showModal({
          dialogId: INFO_DIALOG_ID,
          title: t('designer.delete-category-dialog.failure-title'),
          text: t('designer.delete-category-dialog.failure-text')
        })
      );
      return;
    }

    yield call(api.bpmn.deleteCategory, categoryId);
    yield put(deleteCategory(categoryId));
  } catch (e) {
    logger.error('[bpmn doDeleteCategoryRequest saga] error', e);
  }
}

function* doImportProcessModelRequest({ api, logger }, action) {
  try {
    const model = yield call(api.bpmn.importProcessModel, action.payload);
    const recordId = model.id.replace('workspace://SpacesStore/', '');

    window.location.href = `${EDITOR_PAGE_CONTEXT}#/editor/${recordId}`;

    // yield delay(100);
    //
  } catch (e) {
    logger.error('[bpmn doImportProcessModelRequest saga] error', e);
  }
}

function* doSavePagePosition({ api, logger }, action) {
  try {
    const allCategories = yield select(selectAllCategories);
    const viewType = yield select(state => state.bpmn.viewType);

    const openedCategories = [];
    allCategories.forEach(item => {
      if (item.isOpen) {
        openedCategories.push(item.id);
      }
    });

    yield call(savePagePositionState, {
      scrollTop: document.body.scrollTop,
      openedCategories,
      viewType
    });

    action.payload && isFunction(action.payload.callback) && action.payload.callback();
  } catch (e) {
    logger.error('[bpmn doShowImportModelForm saga] error', e);
  }
}

function* doUpdateModels({ api, logger }, { payload }) {
  try {
    const { modelId, resultModelId, prevCategoryId, action } = payload;

    const editedModel = yield call(api.bpmn.fetchModelAttributes, resultModelId || modelId);
    const categoryId = editedModel.categoryId;

    const modelsInfo = yield select(state => selectModelsInfoByCategoryId(state, { categoryId }));

    let prevModelsInfo = {};

    if (prevCategoryId) {
      prevModelsInfo = yield select(state => selectModelsInfoByCategoryId(state, { categoryId: prevCategoryId }));
    }

    if (action === 'edit') {
      let copyPrevModels = [];

      if (prevModelsInfo.models && prevCategoryId !== categoryId) {
        copyPrevModels = [...prevModelsInfo.models];
        const editedIndex = copyPrevModels.findIndex(model => model.id === modelId);

        copyPrevModels.splice(editedIndex, 1);
      }

      const copyModels = [...modelsInfo.models];
      const editedIndex = copyModels.findIndex(model => model.id === modelId);

      if (prevCategoryId === categoryId) {
        copyModels.splice(editedIndex, 1, editedModel);
      } else {
        copyModels.unshift(editedModel);
      }

      yield put(
        setModelsInfoByCategoryId({
          categoryId,
          ...modelsInfo,
          models: copyModels,
          prevCategoryId: prevCategoryId !== categoryId ? prevCategoryId : null,
          prevModels: copyPrevModels,
          force: true
        })
      );
    }

    if (action === 'delete') {
      let copyPrevModels = [];

      if (prevModelsInfo.models) {
        copyPrevModels = [...prevModelsInfo.models];

        // the deleted model from back doesn't know about its category, so we get "previous" category
        const deletedIndex = copyPrevModels.findIndex(model => model.id === modelId);
        copyPrevModels.splice(deletedIndex, 1);
      }

      yield put(
        setModelsInfoByCategoryId({
          categoryId: prevCategoryId,
          ...prevModelsInfo,
          models: copyPrevModels,
          force: true
        })
      );
    }
  } catch (e) {
    logger.error('[bpmn doUpdateModels saga] error', e);
  }
}

function* saga(ea) {
  yield takeEvery(initModels().type, doInitModels, ea);
  yield takeEvery(getNextModels().type, doGetNextModels, ea);
  yield takeEvery(getFullModels().type, doGetFullModels, ea);
  yield takeEvery(updateModels().type, doUpdateModels, ea);
  yield takeLatest(initRequest().type, doInitRequest, ea);
  yield takeLatest(getTotalCount().type, doGetTotalCount, ea);
  yield takeLatest(saveCategoryRequest().type, doSaveCategoryRequest, ea);
  yield takeLatest(createModel().type, doCreateModel, ea);
  yield takeLatest(deleteCategoryRequest().type, doDeleteCategoryRequest, ea);
  yield takeLatest(importProcessModelRequest().type, doImportProcessModelRequest, ea);
  yield takeLatest(savePagePosition().type, doSavePagePosition, ea);
}

export default saga;
