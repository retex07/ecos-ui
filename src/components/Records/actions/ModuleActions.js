import DialogManager from '../../common/dialogs/Manager';
import Records from '../Records';

export const ModuleActionTypes = {
  MODULE_COPY: 'module-copy'
};

export const ModuleCopyAction = {
  execute: async ({ record }) => {
    const currentModuleId = await record.load('moduleId', true);

    if (!currentModuleId) {
      DialogManager.showInfoDialog({
        title: 'Копирование невозможно',
        text: 'Модуль не может быть копирован так как отсутствует moduleId'
      });
      return false;
    }

    return new Promise((resolve, reject) => {
      DialogManager.showFormDialog({
        title: 'Копировать',
        formData: {
          moduleId: currentModuleId
        },
        formDefinition: {
          display: 'form',
          components: [
            {
              label: 'Новый идентификатор',
              type: 'textfield',
              key: 'moduleId'
            },
            {
              label: 'Подтвердить',
              type: 'button',
              theme: 'primary',
              action: 'submit'
            }
          ]
        },
        onSubmit: async submission => {
          const moduleId = submission.data.moduleId;
          const newRecId = record.id.replace(currentModuleId, moduleId);
          const existingId = await Records.get(newRecId).load('moduleId', true);

          if (existingId) {
            throw 'Модуль с таким ID уже существует';
          }

          record.att('moduleId', submission.data.moduleId);
          record
            .save()
            .then(resolve)
            .catch(reject);
        }
      });
    });
  },

  getDefaultModel: () => {
    return {
      name: 'module.copy',
      type: ModuleCopyAction.MODULE_COPY,
      icon: 'icon-copy'
    };
  }
};
