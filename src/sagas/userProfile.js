import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { NotificationManager } from 'react-notifications';
import set from 'lodash/set';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import {
  changePhoto,
  getAppUserThumbnail,
  getUserData,
  setAppUserThumbnail,
  setUserData,
  setUserPhoto,
  updAppUserData,
  validateUserSuccess
} from '../actions/user';
import { setNotificationMessage } from '../actions/notification';
import { t } from '../helpers/util';
import UserService from '../services/UserService';

function* sagaGetUserData({ api, logger }, { payload }) {
  const { record, stateId } = payload;

  try {
    const data = yield call(api.user.getUserDataByRef, record);

    console.warn({ data });

    if (isEmpty(data)) {
      return;
    }

    console.warn('set user data => ', { data, record });

    yield put(setUserData({ data, stateId }));
    yield put(setUserPhoto({ thumbnail: data.avatar /*UserService.getAvatarUrl(data.recordRef, data.modified)*/, stateId }));
  } catch (e) {
    yield put(setNotificationMessage(t('user-profile-widget.error.get-profile-data')));
    logger.error('[userProfile/sagaGetUserData saga] error', e.message);
  }
}

function* sagaChangePhoto({ api, logger }, { payload }) {
  const { data: file, record, stateId } = payload;

  try {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('name', file.name);

    const { nodeRef = null } = yield call(api.app.uploadFile, formData);

    if (!nodeRef) {
      throw new Error('No file recordRef');
    }

    const response = yield call(api.user.changePhoto, {
      record,
      data: {
        size: file.size,
        name: file.name,
        data: { nodeRef }
      }
    });
    let message = '';

    if (response.success) {
      const data = yield call(api.user.getUserDataByRef, record);

      yield put(setUserPhoto({ thumbnail: UserService.getAvatarUrl(data.recordRef, data.modified || Date.now()), stateId }));
      message = t('user-profile-widget.success.change-photo');
    } else {
      message = t('user-profile-widget.error.upload-profile-photo');
    }

    NotificationManager[response.success ? 'success' : 'error'](message);
  } catch (e) {
    yield put(setNotificationMessage(t('user-profile-widget.error.upload-profile-photo')));
    logger.error('[userProfile/sagaChangePhoto saga] error', e.message);
  } finally {
    yield put(setUserData({ stateId, isLoadingPhoto: false }));
  }
}

function* fetchAppUserData({ api, logger }, { payload }) {
  try {
    const resp = yield call(api.user.getUserData);

    yield put(validateUserSuccess(resp.payload));
    yield put(getAppUserThumbnail());
    set(window, 'Alfresco.constants.USERNAME', get(resp.payload, 'userName'));
  } catch (e) {
    logger.error('[user/getUpdUserData saga] error', e.message);
  }
}

function* fetchAppUserThumbnail({ api, logger }, { payload }) {
  try {
    const userData = yield select(state => state.user);
    const { recordRef, modified, avatar } = userData || {};

    console.warn({ payload, userData });

    // if (recordRef) {
    //   // const userPhotoSize = yield call(api.user.getPhotoSize, recordRef);
    //
    //   if (true/*userPhotoSize > 0*/) {
    //     const photoUrl = UserService.getAvatarUrl(recordRef, modified);
    //     yield put(setAppUserThumbnail(photoUrl));
    //   }
    // }

    if (avatar) {
      yield put(setAppUserThumbnail(avatar));
    }
  } catch (e) {
    logger.error('[user/getUpdUserData saga] error', e.message);
  }
}

function* userProfileSaga(ea) {
  yield takeEvery(getUserData().type, sagaGetUserData, ea);
  yield takeEvery(changePhoto().type, sagaChangePhoto, ea);
  yield takeLatest(updAppUserData().type, fetchAppUserData, ea);
  yield takeLatest(getAppUserThumbnail().type, fetchAppUserThumbnail, ea);
}

export default userProfileSaga;
