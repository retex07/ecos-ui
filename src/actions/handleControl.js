import { PROXY_URI, URL_PAGECONTEXT } from '../constants/alfresco';
import { getCurrentUserName, t } from '../helpers/util';
import { showModal } from './modal';
import ecosFetch from '../helpers/ecosFetch';

export function leaveSiteRequest({ site, siteTitle, user, userFullName }) {
  return (dispatch, getState, api) => {
    const url = `${PROXY_URI}api/sites/${encodeURIComponent(site)}/memberships/${encodeURIComponent(user)}`;
    return ecosFetch(url, { method: 'DELETE' })
      .then(resp => {
        if (resp.status !== 200) {
          return dispatch(
            showModal({
              title: 'Failure',
              content: t('message.leave-failure', { '0': userFullName, '1': siteTitle }),
              buttons: [
                {
                  label: t('button.close-modal'),
                  isCloseButton: true
                }
              ]
            })
          );
        }

        dispatch(
          showModal({
            content: t('message.leaving', { '0': userFullName, '1': siteTitle })
          })
        );

        window.location.href = URL_PAGECONTEXT + 'user/' + encodeURIComponent(user) + '/dashboard';
      })
      .catch(err => {
        console.log('error', err);
      });
  };
}

export function joinSiteRequest({ site, siteTitle, user, userFullName }) {
  return (dispatch, getState, api) => {
    const url = `${PROXY_URI}api/sites/${encodeURIComponent(site)}/memberships`;
    const data = {
      role: 'SiteConsumer',
      person: {
        userName: user
      }
    };

    return ecosFetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(resp => {
        if (resp.status !== 200) {
          console.log('joinSiteRequest err', resp);
          return;
        }

        dispatch(
          showModal({
            content: t('message.joining', { '0': user, '1': site })
          })
        );

        window.location.reload();
      })
      .catch(err => {
        console.log('error', err);
      });
  };
}

export function becomeSiteManagerRequest({ site, siteTitle, user, userFullName }) {
  return (dispatch, getState, api) => {
    const url = `${PROXY_URI}api/sites/${encodeURIComponent(site)}/memberships`;
    const data = {
      role: 'SiteManager',
      person: {
        userName: user ? user : getCurrentUserName()
      }
    };

    return ecosFetch(url, { headers: { Accept: 'application/json' }, body: data })
      .then(resp => {
        if (resp.status !== 200) {
          console.log('becomeSiteManagerRequest err', resp);
          return;
        }

        window.location.reload();
      })
      .catch(err => {
        console.log('error', err);
      });
  };
}

export function requestSiteMembership({ site, siteTitle, user, userFullName }) {
  return (dispatch, getState, api) => {
    const url = `${PROXY_URI}api/sites/${encodeURIComponent(site)}/invitations`;
    const data = {
      invitationType: 'MODERATED',
      inviteeRoleName: 'SiteConsumer',
      inviteeUserName: user,
      inviteeComments: ''
    };

    return ecosFetch(url, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: data
    })
      .then(resp => {
        // console.log('requestSiteMembership resp', resp);
        if (resp.status !== 200) {
          const responseMessage = resp.message;
          const requestPendingMessage = 'A request to join this site is in pending'; // NOTE: This is a string-literal in Share's "Site.java" file
          const failedBecausePending = responseMessage && responseMessage.indexOf(requestPendingMessage) !== -1;
          const failureMessage = failedBecausePending ? 'message.request-join-site-pending-failure' : 'message.request-join-site-failure';
          dispatch(
            showModal({
              content: t(failureMessage)
            })
          );
          return;
        }

        return dispatch(
          showModal({
            title: t('message.request-join-success-title'),
            content: t('message.request-join-success', { '0': user, '1': siteTitle || site }),
            onCloseCallback: () => {
              window.location.href = URL_PAGECONTEXT + 'user/' + encodeURIComponent(user) + '/dashboard';
            },
            buttons: [
              {
                label: t('button.leave-site.confirm-label'),
                isCloseButton: true
              }
            ]
          })
        );
      })
      .catch(err => {
        console.log('error', err);
      });
  };
}
