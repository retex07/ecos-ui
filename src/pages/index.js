import React, { lazy } from 'react';

import { Pages } from '../constants';

const LoginPage = lazy(() => import('../components/LoginForm'));
const BPMNDesignerPage = lazy(() => import('./BPMNDesignerPage'));
const DashboardPage = lazy(() => import('./Dashboard'));
const DashboardSettingsPage = lazy(() => import('./DashboardSettings'));
const JournalsPage = lazy(() => import('./JournalsPage'));
const DevToolsPage = lazy(() => import('./DevTools'));
const CMMNEditorPage = lazy(() => import('./CMMNEditor'));
const MyTimesheetPage = lazy(() => import('./Timesheet/MyTimesheetPage'));
const SubordinatesTimesheetPage = lazy(() => import('./Timesheet/SubordinatesTimesheetPage'));
const VerificationTimesheetPage = lazy(() => import('./Timesheet/VerificationTimesheetPage'));
const DelegatedTimesheetsPage = lazy(() => import('./Timesheet/DelegatedTimesheetsPage'));

const FormIOPage = lazy(() => import('./debug/FormIOPage'));
const TreePage = lazy(() => import('./debug/Tree'));

export default ({ pageKey, footer, ...props }) => {
  let Page = null;

  switch (pageKey) {
    case Pages.LOGIN:
      return <LoginPage {...props} />;
    case Pages.BPMN:
      Page = BPMNDesignerPage;
      break;
    case Pages.DASHBOARD_SETTINGS:
      Page = DashboardSettingsPage;
      break;
    case Pages.DASHBOARD:
      Page = DashboardPage;
      break;
    case Pages.DEV_TOOLS:
      Page = DevToolsPage;
      break;
    case Pages.JOURNAL:
      Page = JournalsPage;
      break;
    case Pages.TIMESHEET_MY:
      Page = MyTimesheetPage;
      break;
    case Pages.TIMESHEET_SUBORDINATES:
      Page = SubordinatesTimesheetPage;
      break;
    case Pages.TIMESHEET_VERIFICATION:
      Page = VerificationTimesheetPage;
      break;
    case Pages.TIMESHEET_DELEGATED:
      Page = DelegatedTimesheetsPage;
      break;
    case Pages.DEBUG_FORMIO:
      Page = FormIOPage;
      break;
    case Pages.DEBUG_TREE:
      Page = TreePage;
      break;
    case Pages.CMMN_EDITOR:
      Page = CMMNEditorPage;
      break;
    default:
  }

  return (
    <>
      <div className="app-content">
        <Page {...props} />
      </div>
      {footer}
    </>
  );
};
