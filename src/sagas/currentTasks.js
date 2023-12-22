import { call, put, takeEvery } from 'redux-saga/effects';
import isEmpty from 'lodash/isEmpty';
import { NotificationManager } from 'react-notifications';

import Records from '../components/Records/Records';
import { executeAction, getCurrentTaskList, initCurrentTasks, setCurrentTaskList } from '../actions/currentTasks';
import { t } from '../helpers/util';
import { EVENTS } from '../components/widgets/BaseWidget';
import { AssignActions } from '../constants/tasks';
import TasksConverter from '../dto/tasks';
import ConfigService, { ALFRESCO_ENABLED } from '../services/config/ConfigService';

function* runInit({ api, logger }, { payload }) {
  try {
    yield* sagaGetCurrentTasks({ api, logger }, { payload });
  } catch (e) {
    logger.error('[current-tasks/runInit saga] error', e);
  }
}

function* sagaGetCurrentTasks({ api, logger }, { payload }) {
  try {
    const { record: document, stateId } = payload;
    const result = yield call(api.tasks.getCurrentTasksForUser, { document });

    if (isEmpty(result)) {
      NotificationManager.error(t('current-tasks-widget.error.get-tasks'), t('error'));
    } else {
      const currentTasksList = TasksConverter.getCurrentTaskListForWeb(result.records);
      for (let currentTask of currentTasksList) {
        const isAlfrescoEnabled = yield ConfigService.getValue(ALFRESCO_ENABLED);
        const canReadDef = isAlfrescoEnabled || currentTask.canReadDef;

        currentTask.actions = yield call(api.tasks.getCurrentTaskActionsForUser, {
          taskId: currentTask.id,
          reassignAvailable: currentTask.hasPermissionReassign,
          canReadDef
        });
      }
      yield put(
        setCurrentTaskList({
          stateId,
          list: currentTasksList,
          totalCount: result.totalCount || 0
        })
      );
    }
  } catch (e) {
    NotificationManager.error(t('current-tasks-widget.error.get-tasks'), t('error'));
    logger.error('[current-tasks/sagaGetCurrentTasks saga] error', e);
  }
}

function* sagaExecuteAction({ api, logger }, { payload }) {
  try {
    const { taskId: records, action, record, instanceRecord } = payload;

    yield call(api.recordActions.executeAction, {
      records,
      action: { ...action, actionOfAssignment: AssignActions.CLAIM, workflowFromRecord: true }
    });

    Records.get(record).update();
    instanceRecord.events.emit(EVENTS.UPDATE_TASKS_WIDGETS);
  } catch (e) {
    NotificationManager.error(t('current-tasks-widget.error.execute-action'), t('error'));
    logger.error('[current-tasks/sagaExecuteAction saga] error', e);
  }
}

function* tasksSaga(ea) {
  yield takeEvery(initCurrentTasks().type, runInit, ea);
  yield takeEvery(getCurrentTaskList().type, sagaGetCurrentTasks, ea);
  yield takeEvery(executeAction().type, sagaExecuteAction, ea);
}

export default tasksSaga;
