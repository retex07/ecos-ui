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
import Footer from '../Footer';

import { changeActiveTab, getActiveTabTitle, getShowTabsStatus, getTabs, setTabs } from '../../actions/pageTabs';
import { initMenuSettings } from '../../actions/menu';
import { MENU_TYPE, pagesWithOnlyContent, URL } from '../../constants';

import './App.scss';

const LoginForm = lazy(() => import('../LoginForm'));

const BPMNDesignerPage = lazy(() => import('../../pages/BPMNDesignerPage'));
const DashboardPage = lazy(() => import('../../pages/Dashboard'));
const DashboardSettingsPage = lazy(() => import('../../pages/DashboardSettings'));
const JournalsPage = lazy(() => import('../../pages/JournalsPage'));
const MyTimesheetPage = lazy(() => import('../../pages/Timesheet/MyTimesheetPage'));
const SubordinatesTimesheetPage = lazy(() => import('../../pages/Timesheet/SubordinatesTimesheetPage'));
const VerificationTimesheetPage = lazy(() => import('../../pages/Timesheet/VerificationTimesheetPage'));
const DelegatedTimesheetsPage = lazy(() => import('../../pages/Timesheet/DelegatedTimesheetsPage'));

const EcosFormPage = lazy(() => import('../../pages/debug/EcosFormPage'));
const FormIOPage = lazy(() => import('../../pages/debug/FormIOPage'));

class App extends Component {
  componentDidMount() {
    const { getShowTabsStatus, getTabs, initMenuSettings } = this.props;

    getShowTabsStatus();
    getTabs();
    initMenuSettings();
  }

  get isOnlyContent() {
    const url = get(this.props, ['history', 'location', 'pathname'], '/');

    return pagesWithOnlyContent.includes(url);
  }

  get wrapperStyle() {
    const tabs = document.querySelector('.page-tab');
    const alfrescoHeader = document.querySelector('#alf-hd');
    const alfrescoFooter = document.querySelector('#alf-ft');
    let height = ['3px'];

    if (tabs) {
      const style = window.getComputedStyle(tabs);
      const outerHeight = tabs.clientHeight + parseInt(style['margin-top'], 10) + parseInt(style['margin-bottom'], 10);

      height.push(`${outerHeight}px`);
    }

    if (alfrescoHeader) {
      const style = window.getComputedStyle(alfrescoHeader);
      const outerHeight = alfrescoHeader.clientHeight + parseInt(style['margin-top'], 10) + parseInt(style['margin-bottom'], 10);

      height.push(`${outerHeight}px`);
    }

    if (alfrescoFooter) {
      const style = window.getComputedStyle(alfrescoFooter);
      const outerHeight = alfrescoFooter.clientHeight + parseInt(style['margin-top'], 10) + parseInt(style['margin-bottom'], 10);

      height.push(`${outerHeight}px`);
    }

    return { height: `calc(100vh - (${height.join(' + ')}))` };
  }

  renderMenu() {
    const { menuType } = this.props;

    if (this.isOnlyContent) {
      return null;
    }

    if (menuType === MENU_TYPE.LEFT) {
      return <Menu />;
    }

    return null;
  }

  renderHeader() {
    if (this.isOnlyContent) {
      return null;
    }

    return (
      <div id="alf-hd">
        <Header />
        <Notification />
      </div>
    );
  }

  renderTabs() {
    const { changeActiveTab, isShow, tabs, setTabs, getActiveTabTitle, isLoadingTitle, isMobile } = this.props;

    return (
      <PageTabs
        homepageLink={URL.DASHBOARD}
        isShow={isShow && !this.isOnlyContent && !isMobile}
        tabs={tabs}
        saveTabs={setTabs}
        changeActiveTab={changeActiveTab}
        getActiveTabTitle={getActiveTabTitle}
        isLoadingTitle={isLoadingTitle}
      />
    );
  }

  renderStickyPush() {
    if (this.isOnlyContent) {
      return null;
    }

    return <div className="sticky-push" />;
  }

  renderFooter() {
    if (this.isOnlyContent) {
      return null;
    }

    return <Footer key="card-details-footer" theme={this.props.theme} />;
  }

  renderReduxModal() {
    if (this.isOnlyContent) {
      return null;
    }

    return <ReduxModal />;
  }

  render() {
    const { isInit, isInitFailure, isAuthenticated, isMobile, theme } = this.props;

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
    const basePageClassNames = classNames('ecos-base-page', { 'ecos-base-page_headless': this.isOnlyContent });

    return (
      <div className={appClassNames}>
        {this.renderReduxModal()}

        <div className="ecos-sticky-wrapper" id="sticky-wrapper">
          {this.renderHeader()}
          <div className={basePageClassNames}>
            {this.renderMenu()}

            <div className="ecos-main-area">
              {this.renderTabs()}
              <div className="ecos-main-content" style={this.wrapperStyle}>
                <Suspense fallback={null}>
                  <Switch>
                    <Route exact path="/share/page/bpmn-designer" render={() => <Redirect to={URL.BPMN_DESIGNER} />} />
                    <Route path={URL.DASHBOARD_SETTINGS} component={DashboardSettingsPage} />
                    <Route path={URL.DASHBOARD} exact component={DashboardPage} />
                    <Route path={URL.BPMN_DESIGNER} component={BPMNDesignerPage} />
                    <Route path={URL.JOURNAL} component={JournalsPage} />
                    <Route path={URL.TIMESHEET} exact component={MyTimesheetPage} />
                    <Route path={URL.TIMESHEET_SUBORDINATES} component={SubordinatesTimesheetPage} />
                    <Route path={URL.TIMESHEET_FOR_VERIFICATION} component={VerificationTimesheetPage} />
                    <Route path={URL.TIMESHEET_DELEGATED} component={DelegatedTimesheetsPage} />
                    <Route path={URL.TIMESHEET_IFRAME} exact component={MyTimesheetPage} />
                    <Route path={URL.TIMESHEET_IFRAME_SUBORDINATES} component={SubordinatesTimesheetPage} />
                    <Route path={URL.TIMESHEET_IFRAME_FOR_VERIFICATION} component={VerificationTimesheetPage} />
                    <Route path={URL.TIMESHEET_IFRAME_DELEGATED} component={DelegatedTimesheetsPage} />

                    {/* temporary routes */}
                    <Route path="/v2/debug/formio-develop" component={FormIOPage} />
                    <Route path="/v2/debug/ecos-form-example" component={EcosFormPage} />

                    <Redirect to={URL.DASHBOARD} />
                  </Switch>
                </Suspense>
              </div>
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
