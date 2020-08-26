import { call, put, takeEvery } from 'redux-saga/effects';
import isEmpty from 'lodash/isEmpty';
import { NotificationManager } from 'react-notifications';

import { changeTaskAssignee, getTaskList, setTaskAssignee, setTaskList } from '../actions/tasks';
import { setNotificationMessage } from '../actions/notification';
import { t } from '../helpers/util';
import TasksConverter from '../dto/tasks';
import TasksService from '../services/tasks';
import SidebarService from '../services/sidebar';
import Records from '../components/Records';
import { ActionTypes } from '../components/Records/actions';

function* sagaGetTasks({ api, logger }, { payload }) {
  try {
    const { record: document, stateId } = payload;
    const res = yield call(api.tasks.getTasksForUser, { document });

    if (isEmpty(res)) {
      NotificationManager.warning(t('tasks-widget.saga.error1'));
      setTaskList({ stateId, list: [], totalCount: 0 });
    } else {
      yield put(
        setTaskList({
          stateId,
          list: TasksConverter.getTaskListForWeb(res.records),
          totalCount: res.totalCount || 0
        })
      );
    }

    SidebarService.emitter.emit(SidebarService.UPDATE_EVENT);
  } catch (e) {
    yield put(setNotificationMessage(t('tasks-widget.saga.error1')));
    logger.error('[tasks/sagaGetTasks saga] error', e.message);
  }
}

function* sagaChangeTaskAssignee({ api, logger }, { payload }) {
  try {
    const { taskId, stateId, assignTo } = payload;

    const result = yield call(api.recordActions.executeAction, {
      records: taskId,
      action: { type: ActionTypes.SET_TASK_ASSIGNEE, assignTo, errorMsg: t('tasks-widget.saga.error3') }
    });

    if (result.cancel) {
      yield put(setTaskAssignee({ stateId }));
    } else {
      const updatedFields = yield call(api.tasks.getTaskStateAssign, { taskId });
      const data = yield TasksService.updateList({ stateId, taskId, updatedFields, ownerUserName: result });
      const documentRef = yield call(api.tasks.getDocumentByTaskId, taskId);

      yield put(setTaskAssignee({ stateId, ...data }));
      yield Records.get(documentRef).update();

      SidebarService.emitter.emit(SidebarService.UPDATE_EVENT);
    }
  } catch (e) {
    yield put(setNotificationMessage(t('tasks-widget.saga.error2')));
    logger.error('[tasks/sagaChangeAssigneeTask saga] error', e.message);
  }
}

function* tasksSaga(ea) {
  yield takeEvery(getTaskList().type, sagaGetTasks, ea);
  yield takeEvery(changeTaskAssignee().type, sagaChangeTaskAssignee, ea);
}

export default tasksSaga;
