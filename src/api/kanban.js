import Records from '../components/Records';
import { SourcesId } from '../constants';

export class KanbanApi {
  getBoardList({ journalId }) {
    return [{ id: 'draft', name: { ru: 'название', en: 'name' } }, { id: 'draft2', name: { ru: 'название2', en: 'name2' } }];
    return Records.get(`${SourcesId.RESOLVED_JOURNAL}@${journalId}`).load('boardRefs[]{id:?id,name}');
  }

  getBoardConfig({ boardId }) {
    return {
      id: 'board-identifier', // идентификатор доски
      name: { ru: 'Активные задачи', en: 'Active tasks' }, // имя доски для отображения
      readOnly: false, // возможно ли перемещать сущности между статусами
      typeRef: 'emodel/type@some-type', // ссылка на тип
      journalRef: 'uiserv/journal@active-tasks', // ссылка на журнал
      cardFormRef: 'uiserv/form@ECOSUI1242CARD', // ссылка на форму для карточки
      actions: ['uiserv/action@view-task', 'uiserv/action@view-task-in-background', 'uiserv/action@edit-task'], // действия
      columns: [
        {
          id: 'some-id1',
          name: { ru: 'Русское имя', en: 'English name' }
        },
        {
          id: 'some-id2',
          name: { ru: 'Русское имя', en: 'English name' }
        },
        {
          id: 'some-id3',
          name: { ru: 'Русское имя', en: 'English name' }
        },
        {
          id: 'some-id12',
          name: { ru: 'Русское имя', en: 'English name' }
        },
        {
          id: 'some-id23',
          name: { ru: 'Русское имя', en: 'English name' }
        },
        {
          id: 'some-id34',
          name: { ru: 'Русское имя', en: 'English name' }
        }
      ]
    };
    return Records.get(`${SourcesId.RESOLVED_BOARD}@${boardId}`).load('?json');
  }
}
