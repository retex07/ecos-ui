import { t } from '../helpers/util';
import { URL } from './';

export const IGNORE_TABS_HANDLER_ATTR_NAME = 'data-external';

export const SCROLL_STEP = 150;
export const LINK_TAG = 'A';
export const TITLE = {
  HOMEPAGE: t('Домашняя страница'),
  [URL.HOME]: t('Домашняя страница'),
  [URL.JOURNAL]: t('Журнал'),
  [URL.JOURNAL_DASHBOARD]: t('Журнал дашборд'),
  [URL.DASHBOARD]: t('Домашняя страница'),
  [URL.DASHBOARD_SETTINGS]: t('Настройки домашней страницы')
};

export const URL_MASK = {
  '^/v2/dashboard/([0-9A-Za-z-]*)/settings$': TITLE[URL.DASHBOARD_SETTINGS],
  '^/v2/dashboard/([0-9A-Za-z-]*)$': TITLE[URL.DASHBOARD]
};

export const getTitleByUrl = url => {
  const title = TITLE[url];

  if (title) {
    return title;
  }

  const key = Object.keys(URL_MASK).find(mask => new RegExp(mask).test(url));

  return URL_MASK[key];
};
