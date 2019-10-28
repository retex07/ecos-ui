import React, { Component, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Redirect, Route, Switch } from 'react-router';
import { NotificationContainer } from 'react-notifications';
import classNames from 'classnames';
import get from 'lodash/get';

import Header from '../Header';
import Notification from '../Notification';
import Menu from '../Sidebar/Sidebar';
import ReduxModal from '../ReduxModal';
import PageTabs from '../PageTabs';

import { changeActiveTab, getActiveTabTitle, getShowTabsStatus, getTabs, setTabs } from '../../actions/pageTabs';
import { initMenuSettings } from '../../actions/menu';
import { MENU_TYPE, URL } from '../../constants';

import './App.scss';

const LoginForm = lazy(() => import('../LoginForm'));

const BPMNDesignerPage = lazy(() => import('../../pages/BPMNDesignerPage'));
const DashboardPage = lazy(() => import('../../pages/Dashboard'));
const DashboardSettingsPage = lazy(() => import('../../pages/DashboardSettings'));
const JournalsPage = lazy(() => import('../../pages/JournalsPage'));

const EcosFormPage = lazy(() => import('../../pages/debug/EcosFormPage'));
const FormIOPage = lazy(() => import('../../pages/debug/FormIOPage'));

class App extends Component {
  componentDidMount() {
    const { getShowTabsStatus, getTabs, initMenuSettings } = this.props;

    getShowTabsStatus();
    getTabs();
    initMenuSettings();
  }

  renderMenu() {
    const { menuType } = this.props;

    if (menuType === MENU_TYPE.LEFT) {
      return <Menu />;
    }

    return null;
  }

  render() {
    const {
      changeActiveTab,
      isInit,
      isInitFailure,
      isAuthenticated,
      isMobile,
      isShow,
      tabs,
      setTabs,
      getActiveTabTitle,
      isLoadingTitle,
      theme
    } = this.props;

    if (!isInit) {
      // TODO: Loading component
      return null;
    }

    if (isInitFailure) {
      // TODO: Crash app component
      return null;
    }

    if (!isAuthenticated) {
      return (
        <Suspense fallback={null}>
          <LoginForm theme={theme} />
        </Suspense>
      );
    }

    const appClassNames = classNames('app-container', { mobile: isMobile });

    return (
      <div className={appClassNames}>
        <ReduxModal />

        <div className="ecos-sticky-wrapper" id="sticky-wrapper">
          <div id="alf-hd">
            <Header />
            <Notification />
          </div>
          <div className="ecos-base-content">
            {this.renderMenu()}

            <div className="ecos-base-side">
              <PageTabs
                homepageLink={URL.DASHBOARD}
                isShow={isShow && !isMobile}
                tabs={tabs}
                saveTabs={setTabs}
                changeActiveTab={changeActiveTab}
                getActiveTabTitle={getActiveTabTitle}
                isLoadingTitle={isLoadingTitle}
              />

              <Suspense fallback={null}>
                <Switch>
                  {/*<Route path="/share/page" exact component={DashboardPage} />*/}
                  <Route exact path="/share/page/bpmn-designer" render={() => <Redirect to={URL.BPMN_DESIGNER} />} />
                  <Route exact path="/share" render={() => <Redirect to={URL.DASHBOARD} />} />
                  {/* TODO delete redirect some day */}
                  <Route path={URL.DASHBOARD_SETTINGS} component={DashboardSettingsPage} />
                  <Route path={URL.DASHBOARD} exact component={DashboardPage} />
                  <Route path={URL.BPMN_DESIGNER} component={BPMNDesignerPage} />
                  <Route path={URL.JOURNAL} component={JournalsPage} />
                  {/* temporary routes */}
                  <Route path="/v2/debug/formio-develop" component={FormIOPage} />
                  <Route path="/v2/debug/ecos-form-example" component={EcosFormPage} />
                  <Route path={URL.JOURNAL_OLD} component={JournalsPage} />
                  <Route path={URL.CARD_DETAILS} component={CardDetailsPage} />
                  <Route path={URL.JOURNAL_DASHBOARD} component={JournalsDashboardPage} />
                  <Route path={URL.WIDGET_DOC_PREVIEW} component={DocPreviewPage} />
                  <Route path={URL.WIDGET_PROPERTIES} component={PropertiesPage} />
                  <Route path={URL.WIDGET_COMMENTS} component={CommentsWidgetPage} />
                  <Route path={URL.WIDGET_TASKS} exact component={TasksDashletPage} />
                  <Route path={URL.CURRENT_TASKS} component={CurrentTasksPage} />
                  <Route path={URL.WIDGET_DOC_STATUS} exact component={DocStatusPage} />
                  <Route path={URL.WIDGET_EVENTS_HISTORY} exact component={EventsHistoryPage} />
                  <Route path={URL.WIDGET_VERSIONS_JOURNAL} component={VersionsJournalWidgetPage} />
                  <Route path={URL.WIDGET_DOC_ASSOCIATIONS} component={DocAssociations} />
                  {/*<Route component={NotFoundPage} />*/}
                </Switch>
              </Suspense>
            </div>
          </div>
        </div>

        <NotificationContainer />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isInit: get(state, ['app', 'isInit']),
  isInitFailure: get(state, ['app', 'isInitFailure']),
  isMobile: get(state, ['view', 'isMobile']),
  theme: get(state, ['view', 'theme']),
  isAuthenticated: get(state, ['user', 'isAuthenticated']),
  isShow: get(state, ['pageTabs', 'isShow']),
  tabs: get(state, ['pageTabs', 'tabs']),
  isLoadingTitle: get(state, ['pageTabs', 'isLoadingTitle']),
  menuType: get(state, ['menu', 'type'])
});

const mapDispatchToProps = dispatch => ({
  getShowTabsStatus: () => dispatch(getShowTabsStatus()),
  getTabs: () => dispatch(getTabs()),
  setTabs: tabs => dispatch(setTabs(tabs)),
  changeActiveTab: tabs => dispatch(changeActiveTab(tabs)),
  getActiveTabTitle: () => dispatch(getActiveTabTitle()),
  initMenuSettings: () => dispatch(initMenuSettings())
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
