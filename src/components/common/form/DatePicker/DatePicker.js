import React, { Component } from 'react';
import ReactDatePicker from 'react-datepicker';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';

import { t } from '../../../../helpers/util';
import Input from '../Input';

import './DatePicker.scss';

class CustomInput extends Component {
  render() {
    return <Input {...this.props} />;
  }
}

export default class DatePicker extends Component {
  static propTypes = {
    className: PropTypes.string,
    dateFormat: PropTypes.string,
    selected: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    showIcon: PropTypes.bool,
    showTimeInput: PropTypes.bool,
    wrapperClasses: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
  };

  static defaultProps = {
    className: '',
    dateFormat: 'P',
    selected: null
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen
    };
  }

  get timeProps() {
    if (this.props.showTimeInput || this.props.showTimeSelect) {
      return {
        timeInputLabel: `${t('ecos-forms.datepicker.time-label')}:`,
        timeCaption: `${t('ecos-forms.datepicker.time-label')}`,
        dateFormat: 'P hh:mm'
      };
    }

    return {};
  }

  get monthProps() {
    return {
      previousMonthButtonLabel: t('ecos-forms.datepicker.month-prev-label'),
      nextMonthButtonLabel: t('ecos-forms.datepicker.month-next-label')
    };
  }

  get selected() {
    let selected = this.props.selected || this.props.value || null;

    if (selected && !(selected instanceof Date)) {
      selected = new Date(selected);
    }

    if (window.isNaN(selected)) {
      selected = null;
    }

    return selected;
  }

  handleToggleCalendar = () => {
    this.setState(state => ({ isOpen: !state.isOpen }));
  };

  handleInputClick = event => {
    const { onInputClick } = this.props;

    if (isFunction(onInputClick)) {
      event.persist();
      onInputClick(event);
    }

    this.setState({ isOpen: true });
  };

  setInputFocus = () => {
    !this.props.disabled && !this.props.readOnly && this.datePickerInput && this.datePickerInput.focus();
  };

  renderIcon = () => {
    return this.props.showIcon ? <span className="icon icon-calendar ecos-datepicker__icon" onClick={this.handleToggleCalendar} /> : null;
  };

  render() {
    const { className, showIcon, dateFormat, wrapperClasses, value, onChangeValue, ...otherProps } = this.props;
    const { isOpen } = this.state;

    return (
      <div className={classNames('ecos-datepicker', { 'ecos-datepicker_show-icon': showIcon }, wrapperClasses)}>
        <ReactDatePicker
          {...otherProps}
          {...this.timeProps}
          {...this.monthProps}
          open={isOpen}
          customInput={<CustomInput forwardedRef={el => (this.datePickerInput = el)} />}
          dateFormat={dateFormat}
          selected={this.selected}
          className={classNames('ecos-input_hover', className)}
          calendarClassName="ecos-datepicker__calendar"
          onSelect={this.setInputFocus}
          onInputClick={this.handleInputClick}
        />
        {this.renderIcon()}
      </div>
    );
  }
}
