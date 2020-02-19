import queryString from 'query-string';
import get from 'lodash/get';

import { t } from '../helpers/util';
import { IGNORE_TABS_HANDLER_ATTR_NAME, LINK_HREF, LINK_TAG, OPEN_IN_BACKGROUND, TITLE } from '../constants/pageTabs';
import { URL } from '../constants';
import { PageApi } from '../api';
import { decodeLink, isNewVersionPage } from '../helpers/urls';

const pageApi = new PageApi();

export const PageTypes = {
  DASHBOARD: 'dashboard',
  JOURNALS: 'journals',
  SETTINGS: 'dashboard/settings',
  BPMN_DESIGNER: 'bpmn-designer',
  TIMESHEET: 'timesheet'
};

export const Events = {
  CHANGE_URL_LINK_EVENT: 'CHANGE_URL_LINK_EVENT'
};

const CHANGE_URL = document.createEvent('Event');
CHANGE_URL.initEvent(Events.CHANGE_URL_LINK_EVENT, true, true);

export default class PageService {
  static getType(link) {
    const _link = link || window.location.href;
    const found = queryString.parseUrl(_link).url.split('/v2/');

    return get(found, '[1]', '');
  }

  static getKey({ link, type }) {
    const _link = link || window.location.href;
    const _type = type || PageService.getType(_link);

    const urlProps = queryString.parseUrl(_link);

    switch (_type) {
      case PageTypes.SETTINGS:
        return urlProps.query.dashboardId || '';
      case PageTypes.DASHBOARD:
        return urlProps.query.recordRef || '';
      case PageTypes.JOURNALS:
        return urlProps.query.journalsListId || '';
      default:
        return '';
    }
  }

  static keyId({ link, type, key }) {
    const _type = type || PageService.getType(link);
    const _key = key || PageService.getKey({ link, type });

    return `${_type}-${_key}`;
  }

  static getPage({ link, type }) {
    const _type = type || PageService.getType(link);

    return PageService.pages[_type] || getDefaultPage();
  }

  static pages = Object.freeze({
    [PageTypes.DASHBOARD]: {
      getTitle: ({ recordRef }) => {
        return recordRef ? pageApi.getRecordTitle(recordRef) : staticTitle(TITLE.HOMEPAGE);
      }
    },
    [PageTypes.JOURNALS]: {
      getTitle: ({ journalId }) => {
        return pageApi.getJournalTitle(journalId);
      }
    },
    [PageTypes.SETTINGS]: {
      getTitle: ({ recordRef, journalId }) => {
        const prom = recordRef ? pageApi.getRecordTitle(recordRef) : pageApi.getJournalTitle(journalId);

        return prom.then(title => `${t(TITLE[URL.DASHBOARD_SETTINGS])} ${title}`);
      }
    },
    [PageTypes.BPMN_DESIGNER]: {
      getTitle: () => {
        return staticTitle(TITLE[URL.BPMN_DESIGNER]);
      }
    },
    [PageTypes.TIMESHEET]: {
      getTitle: () => {
        return staticTitle(TITLE.TIMESHEET);
      }
    }
  });

  /**
   *
   * @param link - string
   * @param params
   *    link - string,
   *    checkUrl - bool,
   *    openNewTab - bool,
   *    openNewBrowserTab - bool,
   *    reopenBrowserTab - bool,
   *    closeActiveTab - bool
   *    openInBackground - bool
   */
  static changeUrlLink = (link = '', params = {}) => {
    CHANGE_URL.params = { link, ...params };
    document.dispatchEvent(CHANGE_URL);
  };

  /**
   * Create link params from event & extra params || make the transition
   * @param event
   * @param linkIgnoreAttr
   * @returns {{link: string | undefined, isActive: boolean}} | undefined
   */
  static definePropsLink = ({ event }) => {
    const { type, currentTarget, params } = event || {};
    const linkIgnoreAttr = IGNORE_TABS_HANDLER_ATTR_NAME;

    if (type === Events.CHANGE_URL_LINK_EVENT) {
      const { openNewTab, openNewBrowserTab, reopenBrowserTab, openInBackground, link, ...props } = params || {};

      event.preventDefault();

      let target = '';

      if (openNewBrowserTab) {
        target = '_blank';
      } else if (reopenBrowserTab) {
        target = '_self';
      }

      if (target) {
        const tab = window.open(link, target);

        tab.focus();

        return;
      }

      if (openInBackground) {
        return {
          ...props,
          link,
          isActive: false
        };
      }

      return {
        ...props,
        link,
        isActive: true,
        reopen: !openNewTab
      };
    }

    let elem = currentTarget;

    if ((!elem || elem.tagName !== LINK_TAG) && event.target) {
      elem = event.target.closest('a[href]');
    }

    if (!elem || elem.tagName !== LINK_TAG || !!elem.getAttribute(linkIgnoreAttr)) {
      return;
    }

    const link = decodeLink(elem.getAttribute(LINK_HREF));

    if (!link || !isNewVersionPage(link)) {
      return;
    }

    event.preventDefault();

    const isBackgroundOpening = elem.getAttribute(OPEN_IN_BACKGROUND);

    return {
      link,
      isActive: !(isBackgroundOpening || (event.button === 0 && event.ctrlKey))
    };
  };
}

function staticTitle(keyTitle) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(t(keyTitle));
    }, 80);
  });
}

function getDefaultPage() {
  return Object.freeze({
    getTitle: () => staticTitle(TITLE.NO_NAME)
  });
}
