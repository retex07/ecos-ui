import { put, takeLatest, call } from 'redux-saga/effects';
import { validateUserRequest, validateUserSuccess, validateUserFailure } from '../actions/user';

// TODO delete
const fakeApi = {
  validate: () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          payload: {
            fullName: 'Temporary User'
          }
        });
      }, 1000);
    });
  }
};

export function* validateUser({ api }) {
  try {
    // const resp = yield call(api.auth.validate);
    const resp = yield call(fakeApi.validate); // TODO delete
    if (!resp.success) {
      return yield put(validateUserFailure());
    }

    yield put(validateUserSuccess(resp.payload));
  } catch (e) {
    // TODO use logplease
    // console.log('[validateUser saga] ' + e.message);
    yield put(validateUserFailure());
  }
}

function* userSaga(ea) {
  yield takeLatest(validateUserRequest().type, validateUser, ea);
}

export default userSaga;
