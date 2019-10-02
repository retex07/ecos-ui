import isEmpty from 'lodash/isEmpty';
import isArray from 'lodash/isArray';

import { isNewVersionPage, NEW_VERSION_PREFIX } from '../helpers/export/urls';
import { getJournalPageUrl } from '../helpers/urls';
import { URL } from '../constants';
import { IGNORE_TABS_HANDLER_ATTR_NAME, REMOTE_TITLE_ATTR_NAME } from '../constants/pageTabs';
import { MenuApi } from '../api';

export default class SidebarService {
  static ActionTypes = {
    CREATE_SITE: 'CREATE_SITE',
    FILTER_LINK: 'FILTER_LINK',
    JOURNAL_LINK: 'JOURNAL_LINK',
    PAGE_LINK: 'PAGE_LINK',
    SITE_LINK: 'SITE_LINK'
  };

  static getPropsStyleLevel = ({ level, actionType }) => {
    const common = {
      noIcon: true,
      noBadge: true,
      isRemoteBadge: false,
      noToggle: true,
      isDefExpanded: true,
      noMoveIfItems: false,
      collapsed: {
        noName: false
      }
    };

    const lvls = {
      0: {
        ...common,
        collapsed: {
          ...common.collapsed,
          noName: true
        }
      },
      1: {
        ...common,
        noIcon: false,
        noToggle: false,
        isDefExpanded: false,
        noBadge: [ATypes.CREATE_SITE].includes(actionType),
        isRemoteBadge: actionType && ![ATypes.CREATE_SITE].includes(actionType)
      },
      2: {
        ...common,
        noMoveIfItems: true
      },
      3: {
        ...common
      }
    };

    return lvls[level] || {};
  };

  static getPropsUrl(item, addParams) {
    let targetUrl = null;
    let attributes = {};
    let ignoreTabHandler = true;

    if (item.action) {
      const params = item.action.params;

      switch (item.action.type) {
        case ATypes.FILTER_LINK:
        case ATypes.JOURNAL_LINK: {
          let listId = 'tasks';
          if (params.siteName) {
            listId = params.listId || 'main';
          }

          if (isNewVersionPage()) {
            targetUrl = getJournalPageUrl({
              journalsListId: params.siteName ? `site-${params.siteName}-${listId}` : `global-${listId}`,
              journalId: params.journalRef,
              journalSettingId: '', // TODO?
              nodeRef: params.journalRef,
              filter: params.filterRef
            });

            ignoreTabHandler = false;
            attributes.target = '_blank';
            attributes.rel = 'noopener noreferrer';
            // attributes[REMOTE_TITLE_ATTR_NAME] = true; // TODO
          } else {
            targetUrl = PAGE_PREFIX;
            if (params.siteName) {
              targetUrl += `/site/${params.siteName}`;
            }
            targetUrl += `/journals2/list/${listId}#`;

            if (params.journalRef) {
              targetUrl += `journal=${params.journalRef}`;
            }

            if (params.filterRef) {
              targetUrl += `&filter=${params.filterRef}`;
            } else {
              targetUrl += `&filter=`;
            }

            if (params.settings) {
              targetUrl += `&settings=${params.settings}`;
            }

            if (params.skipCount) {
              targetUrl += `&skipCount=${params.skipCount}`;
            }

            if (params.maxItems) {
              targetUrl += `&maxItems=${params.maxItems}`;
            }

            targetUrl = menuApi.getNewJournalPageUrl(params);
          }

          break;
        }
        case 'PAGE_LINK': {
          let sectionPostfix = params.section ? params.section : '';
          targetUrl = `${PAGE_PREFIX}/${params.pageId}${sectionPostfix}`;
          break;
        }
        case 'SITE_LINK': {
          if (isNewVersionPage()) {
            ignoreTabHandler = false;
            attributes.target = '_blank';
            attributes.rel = 'noopener noreferrer';

            if (addParams.isSiteDashboardEnable) {
              targetUrl = `${URL.DASHBOARD}?recordRef=site@${params.siteName}`;
              attributes[REMOTE_TITLE_ATTR_NAME] = true;
              break;
            }

            if (!isEmpty(item.items) && isArray(item.items)) {
              const journalLink = item.items.find(item => {
                return item.action.type === 'JOURNAL_LINK';
              });

              if (journalLink) {
                const params = journalLink.action.params;
                let listId = 'tasks';
                if (params.siteName) {
                  listId = params.listId || 'main';
                }
                targetUrl = getJournalPageUrl({
                  journalsListId: params.siteName ? `site-${params.siteName}-${listId}` : `global-${listId}`,
                  journalId: params.journalRef,
                  journalSettingId: '', // TODO?
                  nodeRef: params.journalRef,
                  filter: params.filterRef
                });
                break;
              }
            }

            targetUrl = `${URL.DASHBOARD}?recordRef=site@${params.siteName}`;
            attributes[REMOTE_TITLE_ATTR_NAME] = true;
          } else {
            targetUrl = `${PAGE_PREFIX}?site=${params.siteName}`;
          }
          break;
        }
        default:
          break;
      }

      switch (item.action.params.pageId) {
        case 'bpmn-designer':
          let sectionPostfix = params.section ? params.section : '';

          targetUrl = `${NEW_VERSION_PREFIX}/${params.pageId}${sectionPostfix}`;
          ignoreTabHandler = false;
          attributes.target = '_blank';
          attributes.rel = 'noopener noreferrer';
          break;
        default:
          break;
      }
    }
    if (ignoreTabHandler) {
      attributes[IGNORE_TABS_HANDLER_ATTR_NAME] = true;
    }

    return {
      targetUrl,
      attributes
    };
  }
}

const ATypes = SidebarService.ActionTypes;
const PAGE_PREFIX = '/share/page';
const menuApi = new MenuApi();
