import uuidV4 from 'uuid/v4';
import { deepClone, t } from '../../helpers/util';
import { MENU_TYPE } from '../../constants';
import { LAYOUT_TYPE } from '../../constants/layout';

export function getWidgets() {
  return [
    {
      label: 'Предпросмотр',
      name: 'doc-preview'
    },
    {
      label: 'Журнал',
      name: 'journal'
    }
  ];
}

export function getMenuConfig() {
  return {
    type: MENU_TYPE.TOP,
    links: [
      {
        label: 'Журнал',
        position: 0,
        link: '/share/page/journals'
      },
      {
        label: 'Журнал дашборд и ещё много-много текста в этой ссылке',
        position: 1,
        link: '/share/page/journalsDashboard'
      },
      {
        label: 'Настройка дашборда',
        position: 2,
        link: '/dashboard/settings'
      },
      {
        label: 'Настройка дашборда',
        position: 3,
        link: '/dashboard/settings'
      },
      {
        label: 'Настройка дашборда',
        position: 4,
        link: '/dashboard/settings'
      }
    ]
  };
}

export function getLayoutConfig() {
  return {
    layout: {
      type: LAYOUT_TYPE.TWO_COLUMNS_BS,
      columns: [
        {
          width: '30%',
          widgets: [
            {
              label: 'Предпросмотр',
              id: uuidV4(),
              name: 'doc-preview',
              props: {
                id: 'doc-preview-1',
                config: {
                  link:
                    '/share/proxy/alfresco/slingshot/node/content/workspace/SpacesStore/801da94d-c08a-472c-8cdd-0d50248adb0b/Договор%20№44.pdf',
                  height: '500px',
                  scale: 1
                }
              }
            }
          ]
        },
        {
          // width: '60%',
          widgets: [
            {
              label: 'Предпросмотр',
              id: uuidV4(),
              name: 'doc-preview',
              props: {
                id: 'doc-preview-0',
                config: {
                  link:
                    '/share/proxy/alfresco/slingshot/node/content/workspace/SpacesStore/2557e4b7-725f-40f3-95da-6175a67d3b3f/sample.pdf',
                  height: '200px',
                  scale: 0.5
                }
              }
            },
            {
              label: 'Журнал',
              name: 'journal',
              id: uuidV4()
            }
          ]
        }
        // {
        //   width: '40%',
        //   widgets: [
        //     {
        //      label: 'Предпросмотр',
        //         id: 'doc-preview-2',
        //       name: 'doc-preview',
        //       props: {
        //         config: {
        //           link:
        //             '/share/proxy/alfresco/slingshot/node/content/workspace/SpacesStore/801da94d-c08a-472c-8cdd-0d50248adb0b/Договор%20№44.pdf',
        //           height: '500px',
        //           scale: 1
        //         }
        //       }
        //     }
        //   ]
        // }
      ]
    }
  };
}

export function getMenuItems() {
  return [
    { id: 1, name: t('Главная') },
    { id: 2, name: t('Домашняя') },
    { id: 22, name: t('Дашборд') },
    { id: 23, name: t('Настройки') },
    { id: 24, name: t('Заказы') },
    { id: 25, name: t('Клиенты') },
    { id: 26, name: t('Отчеты') },
    { id: 27, name: t('Банкеты') },
    { id: 28, name: t('Парковки') },
    { id: 29, name: t('ГСМ') },
    { id: 21, name: t('Договоры') },
    { id: 222, name: t('Встречи') },
    { id: 221, name: t('Календарь событий') },
    { id: 223, name: t('График отпусков') },
    { id: 224, name: t('Основные ссылки') },
    { id: 225, name: t('Социальные сети') },
    { id: 232, name: t('Социальные сети') },
    { id: 234, name: t('Социальные сети') },
    { id: 228, name: t('Открытие источники (они больше закрытые, чем открытые)') },
    { id: 226, name: t('Открытие источники (они больше закрытые, чем открытые)') }
  ];
}

export function setDataWidgets(items) {
  return items.map(item => {
    return item.map(source => {
      const widget = deepClone(source);

      widget.id = uuidV4();

      switch (widget.name) {
        case 'doc-preview': {
          widget.props = {
            id: widget.id,
            config: {
              height: '500px',
              link: '/share/proxy/alfresco/demo.pdf',
              scale: 1
            }
          };
          break;
        }
        case 'journal': {
          break;
        }
        default:
          break;
      }

      return widget;
    });
  });
}
