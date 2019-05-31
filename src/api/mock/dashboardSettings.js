import { t } from '../../helpers/util';

export function getWidgets(size) {
  const arr = new Array(size);

  for (let i = 0; i < arr.length; i++) {
    arr[i] = {
      title: i + ' string'.repeat(i + 1),
      id: `widget-${i}`
    };
  }

  return arr;
}

export function getConfigPage() {
  return {
    layoutPosition: 0,
    widgets: [],
    menu: []
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
