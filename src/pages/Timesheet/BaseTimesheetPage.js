import React from 'react';
import debounce from 'lodash/debounce';

import { deepClone, t } from '../../helpers/util';
import { CommonLabels } from '../../helpers/timesheet/dictionary';
import { getDaysOfMonth, getNewDateByDayNumber } from '../../helpers/timesheet/util';
import CommonTimesheetService from '../../services/timesheet/common';
import { TunableDialog } from '../../components/common/dialogs';
import { CommentModal } from '../../components/Timesheet';

import './style.scss';

class BaseTimesheetPage extends React.Component {
  constructor(props) {
    super(props);

    this.cacheDays = new Map();

    this.state = {
      currentDate: new Date(),
      dateTabs: CommonTimesheetService.getPeriodFiltersTabs(),
      statusTabs: [],
      daysOfMonth: this.getDaysOfMonth(new Date()),
      isDelegated: false,
      turnOnTimerPopup: false,
      isOpenCommentModal: false,
      isOpenSelectUserModal: false,
      currentTimesheetData: null
    };
  }

  get selectedStatus() {
    const { statusTabs } = this.state;

    return statusTabs.find(item => item.isActive) || {};
  }

  get configGroupBtns() {
    return [{}, {}];
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { popupMsg } = nextProps;

    this.resetPopupMsgTimer(popupMsg);
  }

  getDaysOfMonth = currentDate => {
    //   if (this.cacheDays.has(currentDate)) {
    //     return this.cacheDays.get(currentDate);
    //   }
    const days = getDaysOfMonth(currentDate);
    //   this.cacheDays.set(currentDate, days);
    return days;
  };

  resetPopupMsgTimer(popupMsg) {
    const { turnOnTimerPopup } = this.state;

    if (!!popupMsg && !turnOnTimerPopup) {
      this.setState({ turnOnTimerPopup: true });
      debounce(() => {
        this.handleClosePopup();
        this.setState({ turnOnTimerPopup: false });
      }, 10000)();
    }
  }

  handleClosePopup() {
    this.props.setPopupMessage && this.props.setPopupMessage('');
  }

  handleChangeActiveDateTab(tabIndex) {
    const dateTabs = deepClone(this.state.dateTabs);

    dateTabs.forEach((tab, index) => {
      tab.isActive = index === tabIndex;
    });

    this.setState({ dateTabs });
  }

  handleChangeStatusTab(tabIndex, callback = () => null) {
    const statusTabs = deepClone(this.state.statusTabs);

    statusTabs.forEach((tab, index) => {
      tab.isActive = index === tabIndex;
    });

    this.setState({ statusTabs }, callback);
  }

  handleChangeCurrentDate(currentDate, callback = () => null) {
    this.setState({ currentDate, daysOfMonth: this.getDaysOfMonth(currentDate) }, callback);
  }

  handleChangeEventDayHours(data) {
    const { type: eventType, number, value, userName } = data;
    const date = getNewDateByDayNumber(this.state.currentDate, number);

    this.props.modifyEventDayHours && this.props.modifyEventDayHours({ value, date, eventType, number, userName });
  }

  handleResetEventDayHours(data) {
    const { type: eventType, number, value, userName } = data;
    const date = getNewDateByDayNumber(this.state.currentDate, number);

    this.props.resetEventDayHours && this.props.resetEventDayHours({ value, date, eventType, number, userName });
  }

  clearCommentModalData() {
    this.setState({
      isOpenCommentModal: false,
      currentTimesheetData: null
    });
  }

  handleCloseCommentModal = () => {
    this.clearCommentModalData();
  };

  handleOpenCommentModal = (data = {}) => {
    this.setState({
      isOpenCommentModal: true,
      currentTimesheetData: deepClone(data)
    });
  };

  handleSendCommentModal = comment => {
    const { outcome, ...data } = this.state.currentTimesheetData || {};

    this.handleChangeStatus({ ...data, comment }, outcome);

    this.clearCommentModalData();
  };

  renderNoData() {
    return (
      <div className="ecos-timesheet__white-block">
        <div className="ecos-timesheet__no-data">{CommonLabels.NO_DATA_BY_FILTERS}</div>
      </div>
    );
  }

  renderCommentModal(isRequired = false) {
    const { isOpenCommentModal } = this.state;

    return (
      <CommentModal
        isOpen={isOpenCommentModal}
        isRequired={isRequired}
        onCancel={this.handleCloseCommentModal}
        onSend={this.handleSendCommentModal}
      />
    );
  }

  renderPopupMessage() {
    const { popupMsg } = this.props;

    return (
      <TunableDialog isOpen={!!popupMsg} content={popupMsg} onClose={this.handleClosePopup.bind(this)} title={t(CommonLabels.NOTICE)} />
    );
  }

  render() {
    return null;
  }
}

export default BaseTimesheetPage;