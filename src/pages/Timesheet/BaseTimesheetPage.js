import React from 'react';
import debounce from 'lodash/debounce';
import { deepClone } from '../../helpers/util';
import { getDaysOfMonth, isOnlyContent } from '../../helpers/timesheet/util';
import CommonTimesheetService from '../../services/timesheet/common';
import { changeUrlLink } from '../../components/PageTabs/PageTabs';

import './style.scss';

class BaseTimesheetPage extends React.Component {
  constructor(props) {
    super(props);

    const {
      history: { location }
    } = props;

    this.cacheDays = new Map();

    this.state = {
      currentDate: new Date(),
      sheetTabs: CommonTimesheetService.getSheetTabs(this.isOnlyContent, location),
      dateTabs: CommonTimesheetService.getPeriodFiltersTabs(),
      statusTabs: [],
      daysOfMonth: this.getDaysOfMonth(new Date()),
      isDelegated: false,
      turnOnTimerPopup: false
    };
  }

  get isOnlyContent() {
    return isOnlyContent(this.props);
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

  handleChangeActiveSheetTab(tabIndex) {
    const sheetTabs = deepClone(this.state.sheetTabs);

    sheetTabs.forEach((tab, index) => {
      tab.isActive = index === tabIndex;

      if (tab.isActive) {
        changeUrlLink(tab.link);
      }
    });

    this.setState({ sheetTabs });
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

  handleChangeCurrentDate(currentDate) {
    this.setState({ currentDate, daysOfMonth: this.getDaysOfMonth(currentDate) });
  }

  render() {
    return null;
  }
}

export default BaseTimesheetPage;
