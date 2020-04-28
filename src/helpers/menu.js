import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

import { URL } from '../constants';
import { HandleControlTypes } from './handleControl';
import { createProfileUrl } from './urls';

export const makeUserMenuItems = (userName, isAvailable, isMutable, isExternalAuthentication) => {
  const availability = 'make-' + (isAvailable === false ? '' : 'not') + 'available';

  let userMenuItems = [];

  userMenuItems.push(
    {
      id: 'HEADER_USER_MENU_MY_PROFILE',
      label: 'header.my-profile.label',
      target: '_blank',
      targetUrl: createProfileUrl(encodeURIComponent(userName))
    },
    {
      id: 'HEADER_USER_MENU_AVAILABILITY',
      label: 'header.' + availability + '.label',
      targetUrl: '/share/page/components/deputy/make-available?available=' + (isAvailable === false ? 'true' : 'false'),
      control:
        isAvailable === false
          ? null
          : {
              type: HandleControlTypes.ALF_SHOW_MODAL_MAKE_UNAVAILABLE,
              payload: {
                targetUrl: '/share/page/components/deputy/make-available?available=' + (isAvailable === false ? 'true' : 'false')
              }
            }
    }
  );

  // if (isMutable) {
  //   userMenuItems.push({
  //     id: 'HEADER_USER_MENU_PASSWORD',
  //     label: 'header.change-password.label',
  //     targetUrl: '/share/page/user/' + encodeURIComponent(userName) + '/change-password'
  //   });
  // }

  userMenuItems.push(
    {
      id: 'HEADER_USER_MENU_FEEDBACK',
      label: 'header.feedback.label',
      targetUrl: 'https://www.citeck.ru/feedback',
      targetUrlType: 'FULL_PATH',
      target: '_blank'
    },
    {
      id: 'HEADER_USER_MENU_REPORTISSUE',
      label: 'header.reportIssue.label',
      targetUrl:
        'mailto:support@citeck.ru?subject=Ошибка в работе Citeck EcoS: краткое описание&body=Summary: Короткое описание проблемы (продублировать в теме письма)%0A%0ADescription:%0AПожалуйста, детально опишите возникшую проблему, последовательность действий, которая привела к ней. При необходимости приложите скриншоты.',
      targetUrlType: 'FULL_PATH',
      target: '_blank'
    }
  );

  if (!isExternalAuthentication) {
    userMenuItems.push({
      id: 'HEADER_USER_MENU_LOGOUT',
      label: 'header.logout.label',
      control: {
        type: HandleControlTypes.ALF_DOLOGOUT
      }
    });
  }

  return userMenuItems;
};

export function processMenuItemsFromOldMenu(oldMenuItems) {
  let siteMenuItems = [];

  for (let item of oldMenuItems) {
    if (!item.config) {
      continue;
    }

    let newItem = {
      id: item.id,
      label: item.config.label
    };

    if (item.config.targetUrl) {
      if (item.config.targetUrlType && item.config.targetUrlType === 'FULL_PATH') {
        newItem.targetUrl = item.config.targetUrl;
      } else {
        newItem.targetUrl = '/share/page/' + item.config.targetUrl;
      }

      if (item.config.targetUrlLocation && item.config.targetUrlLocation === 'NEW') {
        newItem.target = '_blank';
      }
    }

    if (item.config.publishTopic) {
      newItem.control = {
        type: item.config.publishTopic
      };
      if (item.config.publishPayload) {
        newItem.control.payload = item.config.publishPayload;
      }
    }

    siteMenuItems.push(newItem);
  }

  return siteMenuItems;
}

export function makeSiteMenu(params = {}) {
  const isDashboardPage = get(params, ['isDashboardPage'], false);
  const menu = [
    // {
    //   id: 'HOME_PAGE',
    //   label: 'header.site-menu.home-page',
    //   targetUrl: URL.DASHBOARD,
    //   targetUrlType: 'FULL_PATH'
    // },
    {
      id: 'SETTINGS_HOME_PAGE',
      label: 'header.site-menu.page-settings',
      targetUrl: URL.DASHBOARD_SETTINGS,
      targetUrlType: 'FULL_PATH'
    },
    {
      id: 'GO_ADMIN_PAGE',
      label: 'header.site-menu.admin-page',
      targetUrl: URL.BPMN_DESIGNER,
      targetUrlType: 'FULL_PATH'
    }
  ];

  return menu.filter(item => {
    let status = true;

    if (!isDashboardPage) {
      status = item.id !== 'SETTINGS_HOME_PAGE';
    }

    return status;
  });
}

export function getIconClassMenu(id, specialClass) {
  switch (id) {
    case 'HEADER_USER_MENU_MY_PROFILE':
      return 'icon-User_avatar';
    case 'HEADER_USER_MENU_AVAILABILITY':
      return specialClass;
    case 'HEADER_USER_MENU_PASSWORD':
      return '';
    case 'HEADER_USER_MENU_FEEDBACK':
      return 'icon-notify-dialogue';
    case 'HEADER_USER_MENU_REPORTISSUE':
      return 'icon-big_alert';
    case 'HEADER_USER_MENU_LOGOUT':
      return 'icon-exit';
    case 'HEADER_SITE_INVITE':
      return '';
    case 'HEADER_CUSTOMIZE_SITE_DASHBOARD':
      return '';
    case 'HEADER_EDIT_SITE_DETAILS':
      return '';
    case 'HEADER_CUSTOMIZE_SITE':
      return '';
    case 'HEADER_LEAVE_SITE':
      return '';
    case 'HEADER_SITE_JOURNALS':
      return '';
    default:
      return '';
  }
}

export function getSpecialClassByState(id, params = {}) {
  if (!isEmpty(params)) {
    const colorOn = 'icon_on';
    const colorOff = 'icon_off';

    switch (id) {
      case 'HEADER_USER_MENU_AVAILABILITY':
        return params.available ? `icon-User_avatar_on ${colorOn}` : `icon-User_avatar_off ${colorOff}`;
      default:
        return false;
    }
  }

  return false;
}
