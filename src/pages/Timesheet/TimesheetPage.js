import React, { Component } from 'react';
import moment from 'moment';
import 'moment-business-days';
import { withRouter } from 'react-router-dom';
import { Route, Switch } from 'react-router';
import get from 'lodash/get';

import Timesheet, { Tabs, DateSlider } from '../../components/Timesheet';
import { changeUrlLink } from '../../components/PageTabs/PageTabs';
import { deepClone, t } from '../../helpers/util';

import { URL, pagesWithOnlyContent } from '../../constants';
import './style.scss';

class TimesheetPage extends Component {
  constructor(props) {
    super(props);

    const {
      history: { location }
    } = props;

    this.state = {
      eventTypes: [
        {
          title: 'Работа в дневное время',
          name: 'daytime-work',
          color: '#00C308',
          canEdit: true
        },
        {
          title: 'Работа в ночное время',
          name: 'night-work',
          color: '#4133DF',
          canEdit: true
        },
        {
          title: 'Работа в выходные и праздничные дни (отгул + оплата)',
          name: 'weekends-holidays-work-holiday-and-compensation',
          color: '#33DFD5',
          canEdit: true
        },
        {
          title: 'Работа в выходные и праздничные дни (двойная оплата)',
          name: 'weekends-holidays-work-doubled-compensation',
          color: '#3382df',
          canEdit: true
        },
        {
          title: 'Сверхурочная работа',
          name: 'overtime-work',
          color: '#DF8633',
          canEdit: true
        },
        {
          title: 'Ежегодный основной оплачиваемый отпуск',
          name: 'annual-basic-paid-leave',
          color: '#DF3386',
          canEdit: false
        },
        {
          title: 'Отпуск без сохранения заработной платы',
          name: 'basic-unpaid-leave',
          color: '#ff41e3',
          canEdit: false
        },
        {
          title: 'Отпуск 1 из 5',
          name: 'one-of-five',
          color: '#d51842',
          canEdit: false
        },
        {
          title: 'Отпуск за работу в условиях крайнего севера',
          name: 'north-paid-leave',
          color: '#e89972',
          canEdit: false
        },
        {
          title: 'Дополнительный отпуск за работу во вредных условиях труда',
          name: 'harmful-paid-leave',
          color: '#c0ac70',
          canEdit: false
        },
        {
          title: 'Отпуск за ненормированный рабочий день',
          name: 'irregular-paid-leave',
          color: '#ff9953',
          canEdit: false
        },
        {
          title: 'Командировка',
          name: 'business-trip',
          color: '#ff3ecb',
          canEdit: false
        },
        {
          title: 'Отсутствие',
          name: 'absence',
          color: '#af9fff',
          canEdit: true
        },
        {
          title: 'Отгул',
          name: 'compensatory-leave',
          color: '#29bd8d',
          canEdit: true
        }
      ],
      subordinatesEvents: [
        {
          user: 'Афанасьев Сергей Петрович',
          organization: 'ООО СтройИнвест',
          eventTypes: [
            {
              title: 'Работа в дневное время',
              name: 'daytime-work',
              color: '#00C308',
              canEdit: true
            },
            {
              title: 'Работа в ночное время',
              name: 'night-work',
              color: '#4133DF',
              canEdit: true
            },
            {
              title: 'Работа в выходные и праздничные дни (отгул + оплата)',
              name: 'weekends-holidays-work-holiday-and-compensation',
              color: '#33DFD5',
              canEdit: true
            }
          ]
        },
        {
          user: 'Николенко Елена Сергеевна',
          organization: 'ООО СтройТехЦентр',
          eventTypes: [
            {
              title: 'Работа в выходные и праздничные дни (отгул + оплата)',
              name: 'weekends-holidays-work-holiday-and-compensation',
              color: '#33DFD5',
              canEdit: true
            },
            {
              title: 'Работа в выходные и праздничные дни (двойная оплата)',
              name: 'weekends-holidays-work-doubled-compensation',
              color: '#3382df',
              canEdit: true
            },
            {
              title: 'Сверхурочная работа',
              name: 'overtime-work',
              color: '#DF8633',
              canEdit: true
            }
          ]
        },
        {
          user: 'Петров Андрей Андреевич',
          organization: 'ООО СтройТехЦентр',
          eventTypes: [
            {
              title: 'Работа в дневное время',
              name: 'daytime-work',
              color: '#00C308',
              canEdit: true
            },
            {
              title: 'Ежегодный основной оплачиваемый отпуск',
              name: 'annual-basic-paid-leave',
              color: '#DF3386',
              canEdit: false
            },
            {
              title: 'Отсутствие',
              name: 'absence',
              color: '#af9fff',
              canEdit: true
            },
            {
              title: 'Отгул',
              name: 'compensatory-leave',
              color: '#29bd8d',
              canEdit: true
            }
          ]
        }
      ],
      sheetTabs: [
        {
          name: 'Мой табель',
          link: this.isOnlyContent ? URL.TIMESHEET_IFRAME : URL.TIMESHEET,
          isActive: [URL.TIMESHEET, URL.TIMESHEET_IFRAME].includes(location.pathname),
          isAvailable: true
        },
        {
          name: 'Табели подчиненных',
          link: this.isOnlyContent ? URL.TIMESHEET_IFRAME_SUBORDINATES : URL.TIMESHEET_SUBORDINATES,
          isActive: [URL.TIMESHEET_SUBORDINATES, URL.TIMESHEET_IFRAME_SUBORDINATES].includes(location.pathname),
          isAvailable: true
        }
      ],
      dateTabs: [
        {
          name: 'Месяц',
          isActive: true,
          isAvailable: true
        },
        {
          name: 'Год',
          isActive: false,
          isAvailable: false
        }
      ],
      currentDate: new Date(),
      daysOfMonth: this.getDaysOfMonth(new Date())
    };
  }

  get isOnlyContent() {
    const url = get(this.props, ['history', 'location', 'pathname'], '/');

    return pagesWithOnlyContent.includes(url);
  }

  getDaysOfMonth = currentDate =>
    Array.from({ length: moment(currentDate).daysInMonth() }, (x, i) =>
      moment(currentDate)
        .startOf('month')
        .add(i, 'days')
    ).map(day => ({
      number: day.format('D'),
      title: day.format('dd, D'),
      isBusinessDay: moment(day).isBusinessDay()
    }));

  handleChangeActiveSheetTab = tabIndex => {
    const sheetTabs = deepClone(this.state.sheetTabs);

    console.warn(sheetTabs);

    sheetTabs.forEach((tab, index) => {
      tab.isActive = index === tabIndex;

      if (tab.isActive) {
        changeUrlLink(tab.link);
      }
    });

    this.setState({ sheetTabs });
  };

  handleChangeActiveDateTab = tabIndex => {
    const dateTabs = deepClone(this.state.dateTabs);

    dateTabs.forEach((tab, index) => {
      tab.isActive = index === tabIndex;
    });

    this.setState({ dateTabs });
  };

  handleChangeCurrentDate = currentDate => {
    this.setState({ currentDate, daysOfMonth: this.getDaysOfMonth(currentDate) });
  };

  renderMyTimesheet = () => {
    const { eventTypes, daysOfMonth } = this.state;

    return <Timesheet eventTypes={eventTypes} daysOfMonth={daysOfMonth} />;
  };

  renderSubordinateTimesheet = () => {
    const { subordinatesEvents, daysOfMonth } = this.state;

    return <Timesheet groupBy={'user'} eventTypes={subordinatesEvents} daysOfMonth={daysOfMonth} />;
  };

  render() {
    const { sheetTabs, dateTabs, currentDate } = this.state;

    return (
      <div className="ecos-timesheet">
        <div className="ecos-timesheet__title">{t('Табели учёта времени')}</div>

        <div className="ecos-timesheet__type">
          <Tabs tabs={sheetTabs} onClick={this.handleChangeActiveSheetTab} />
        </div>

        <div className="ecos-timesheet__header">
          <div className="ecos-timesheet__date-settings">
            <Tabs
              tabs={dateTabs}
              isSmall
              onClick={this.handleChangeActiveDateTab}
              classNameItem="ecos-timesheet__date-settings-tabs-item"
            />
            <DateSlider onChange={this.handleChangeCurrentDate} date={currentDate} />
          </div>

          <div className="ecos-timesheet__status">Статус</div>
        </div>

        <Switch>
          <Route path={URL.TIMESHEET} exact component={this.renderMyTimesheet} />
          <Route path={URL.TIMESHEET_IFRAME} exact component={this.renderMyTimesheet} />
          <Route path={URL.TIMESHEET_SUBORDINATES} exact component={this.renderSubordinateTimesheet} />
          <Route path={URL.TIMESHEET_IFRAME_SUBORDINATES} exact component={this.renderSubordinateTimesheet} />
        </Switch>
      </div>
    );
  }
}

export default withRouter(TimesheetPage);
