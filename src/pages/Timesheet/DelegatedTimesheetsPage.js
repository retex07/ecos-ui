import React from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';

import { deepClone, t } from '../../helpers/util';
import { CommonLabels, DelegateTimesheetLabels } from '../../helpers/timesheet/dictionary';
import { DelegationTypes, ServerStatusKeys, ServerStatusOutcomeKeys, TimesheetTypes } from '../../constants/timesheet';
import { BaseConfigGroupButtons } from '../../helpers/timesheet/util';
import CommonTimesheetService from '../../services/timesheet/common';
import DelegatedTimesheetService from '../../services/timesheet/delegated';
import {
  declineDelegation,
  getDelegatedTimesheetByParams,
  modifyEventDayHours,
  modifyStatus,
  resetDelegatedTimesheet,
  resetEventDayHours,
  setPopupMessage
} from '../../actions/timesheet/delegated';

import { Loader } from '../../components/common';
import { Btn } from '../../components/common/btns';
import Timesheet, { DateSlider, Tabs } from '../../components/Timesheet';
import BaseTimesheetPage from './BaseTimesheetPage';

const initDType = DelegationTypes.FILL;
const initStatus = ServerStatusKeys.CORRECTION;

class DelegatedTimesheetsPage extends BaseTimesheetPage {
  constructor(props) {
    super(props);

    const delegationTypes = DelegatedTimesheetService.getDelegationType();

    this.state.statusTabs = CommonTimesheetService.getStatusFilters(TimesheetTypes.DELEGATED, initDType);
    this.state.currentStatus = initStatus;
    this.state.delegationTypeTabs = delegationTypes.map(item => ({ ...item, isActive: initDType === item.type }));
    this.state.delegatedTo = '';
    this.state.delegationRejected = true;
  }

  componentDidMount() {
    this.getData();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    super.componentWillReceiveProps(nextProps, nextContext);

    const { innerCounts } = this.props;

    if (JSON.stringify(innerCounts) !== JSON.stringify(nextProps.innerCounts)) {
      const delegationTypeTabs = this.state.delegationTypeTabs.map(item => ({
        ...item,
        badge: nextProps.innerCounts[item.type] || 0
      }));

      const sheetTabs = this.state.sheetTabs.map(item => ({
        ...item,
        badge: item.key === TimesheetTypes.DELEGATED ? nextProps.innerCounts.all || 0 : null
      }));

      this.setState({ delegationTypeTabs, sheetTabs });
    }
  }

  componentWillUnmount() {
    this.props.resetDelegatedTimesheet();
  }

  get selectedDType() {
    const { delegationTypeTabs } = this.state;

    return (delegationTypeTabs.find(item => item.isActive) || {}).type;
  }

  get configGroupBtns() {
    const status = this.selectedStatus;
    const delegationType = this.selectedDType;
    const key = Array.isArray(status.key) ? status.key[0] : status.key;

    if (delegationType === DelegationTypes.FILL) {
      return [
        {
          id: 'ecos-timesheet__table-group-btn_off-delegation_id',
          className: 'ecos-timesheet__table-group-btn_off-delegation',
          title: t(CommonLabels.STATUS_BTN_OFF_DELEGATION),
          onClick: data => this.handleClickOffDelegation(data)
        },
        {
          ...BaseConfigGroupButtons.SENT_APPROVE,
          onClick: data => this.handleOpenCommentModal({ ...data, outcome: ServerStatusOutcomeKeys.TASK_DONE })
        }
      ];
    }

    if (delegationType === DelegationTypes.APPROVE) {
      switch (key) {
        case ServerStatusKeys.CORRECTION:
          return [
            {},
            {
              ...BaseConfigGroupButtons.APPROVE,
              onClick: data => this.handleChangeStatus(data, ServerStatusOutcomeKeys.TASK_DONE)
            }
          ];
        case ServerStatusKeys.MANAGER_APPROVAL:
          return [
            {
              ...BaseConfigGroupButtons.SENT_IMPROVE,
              onClick: data => this.handleOpenCommentModal({ ...data, outcome: ServerStatusOutcomeKeys.SEND_BACK })
            },
            {
              ...BaseConfigGroupButtons.APPROVE,
              onClick: data => this.handleChangeStatus(data, ServerStatusOutcomeKeys.APPROVE)
            }
          ];
        default:
          return [{}, {}];
      }
    }

    return [{}, {}];
  }

  getData = () => {
    const { currentDate } = this.state;
    const delegationType = this.selectedDType;

    this.props.getDelegatedTimesheetByParams && this.props.getDelegatedTimesheetByParams({ currentDate, delegationType });
  };

  handleChangeCurrentDate(currentDate) {
    super.handleChangeCurrentDate(currentDate, this.getData);
  }

  handleChangeDTypeTab(tabIndex) {
    const delegationTypeTabs = deepClone(this.state.delegationTypeTabs);
    let selectedDType = '';

    delegationTypeTabs.forEach((tab, index) => {
      tab.isActive = index === tabIndex;

      if (tab.isActive) {
        selectedDType = tab.type;
      }
    });

    const statusTabs = CommonTimesheetService.getStatusFilters(TimesheetTypes.DELEGATED, selectedDType);

    this.setState({ delegationTypeTabs, statusTabs }, this.getData);
  }

  handleClickOffDelegation = data => {
    console.log('handleClickOffDelegation', data);
  };

  handleChangeStatus = (data, outcome) => {
    const { taskId, userName, comment = '' } = data;

    this.props.modifyStatus && this.props.modifyStatus({ outcome, taskId, userName, comment });
  };

  renderTimesheet = () => {
    const { daysOfMonth, isDelegated } = this.state;
    const { mergedList, isLoading, updatingHours } = this.props;
    const activeStatus = this.selectedStatus;

    const filteredList = mergedList.filter(item => {
      if (Array.isArray(activeStatus.key)) {
        return activeStatus.key.includes(item.status);
      }

      return item.status === activeStatus.key;
    });

    if (filteredList.length > 0) {
      return (
        <Timesheet
          groupBy={'user'}
          configGroupBtns={this.configGroupBtns}
          eventTypes={filteredList}
          daysOfMonth={daysOfMonth}
          isAvailable={!isDelegated}
          lockedMessage={this.lockDescription}
          onChangeHours={this.handleChangeEventDayHours.bind(this)}
          onResetHours={this.handleResetEventDayHours.bind(this)}
          updatingHours={updatingHours}
        />
      );
    }

    return isLoading ? null : this.renderNoData();
  };

  render() {
    const { sheetTabs, currentDate, statusTabs, delegationTypeTabs, currentTimesheetData } = this.state;
    const { isLoading } = this.props;
    const { outcome } = currentTimesheetData || {};

    return (
      <div className="ecos-timesheet">
        <div className="ecos-timesheet__row">
          <div className="ecos-timesheet__column">
            <div className="ecos-timesheet__title">{t(CommonLabels.TIMESHEET_TITLE)}</div>

            <div className="ecos-timesheet__type">
              <Tabs tabs={sheetTabs} className="ecos-tabs-v2_bg-white" onClick={this.handleChangeActiveSheetTab.bind(this)} />
            </div>
          </div>

          {this.selectedDType === DelegationTypes.APPROVE && (
            <div className="ecos-timesheet__column ecos-timesheet__delegation">
              <div className="ecos-timesheet__delegation-title">
                {t(CommonLabels.HEADLINE_DELEGATION)}
                <Btn className="ecos-timesheet__delegation-btn-set ecos-btn_grey7 ecos-btn_narrow">
                  {t(DelegateTimesheetLabels.DELEGATION_BTN_SET)}
                </Btn>
              </div>

              <div className="ecos-timesheet__delegation-label">{t(DelegateTimesheetLabels.DELEGATION_DESCRIPTION_1)}</div>
            </div>
          )}
        </div>

        <div className="ecos-timesheet__header">
          <div className="ecos-timesheet__header-box">
            <div className="ecos-timesheet__white-block">
              <Tabs tabs={delegationTypeTabs} isSmall onClick={this.handleChangeDTypeTab.bind(this)} />
            </div>
            <div className="ecos-timesheet__date-settings">
              <DateSlider onChange={this.handleChangeCurrentDate.bind(this)} date={currentDate} />
            </div>
          </div>

          <div className="ecos-timesheet__white-block">
            <Tabs tabs={statusTabs} isSmall onClick={this.handleChangeStatusTab.bind(this)} />
          </div>
        </div>
        <div className="ecos-timesheet__main-content">
          {isLoading && <Loader className="ecos-timesheet__loader" height={100} width={100} blur />}
          {this.renderTimesheet()}
        </div>
        {this.renderPopupMessage()}
        {this.renderCommentModal(outcome === ServerStatusOutcomeKeys.SEND_BACK)}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  mergedList: get(state, 'timesheetDelegated.mergedList', []),
  innerCounts: get(state, 'timesheetDelegated.innerCounts', []),
  updatingHours: get(state, 'timesheetDelegated.updatingHours', {}),
  isLoading: get(state, 'timesheetDelegated.isLoading', false),
  popupMsg: get(state, 'timesheetDelegated.popupMsg', '')
});

const mapDispatchToProps = dispatch => ({
  getDelegatedTimesheetByParams: payload => dispatch(getDelegatedTimesheetByParams(payload)),
  resetDelegatedTimesheet: payload => dispatch(resetDelegatedTimesheet(payload)),
  modifyStatus: payload => dispatch(modifyStatus(payload)),
  modifyEventDayHours: payload => dispatch(modifyEventDayHours(payload)),
  resetEventDayHours: payload => dispatch(resetEventDayHours(payload)),
  setPopupMessage: payload => dispatch(setPopupMessage(payload))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DelegatedTimesheetsPage);
