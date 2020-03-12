import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { t } from '../../../helpers/util';
import { Input } from '../form';

import './style.scss';
import { Icon } from '../index';

const Labels = {
  Rules: {
    VALID_CHARACTERS: 'Допустимы латинские, русские и другие символы',
    COUNT_CHARACTERS: 'минимум 3 знака/символа',
    COUNT_DIGITS: '1 цифра',
    COUNT_CAPITALS: '1 заглавная',
    COUNT_LOWERCASE: '1 строчная'
  },
  Titles: {}
};

const BASE_RULE = /[а-яА-ЯёЁ\w\`\~\!@\#\$\%\^\&\*\(\)\-\_\+\=\|\\\/\,\.\?\<\>\[\]\;\'\{\}\:\"\ ]{3,}$/;
const RULES = [
  {
    key: 'count-characters',
    name: Labels.Rules.COUNT_CHARACTERS,
    rule: /[^\s]{3,}/
  },
  {
    key: 'count-digits',
    name: Labels.Rules.COUNT_DIGITS,
    rule: /\d+/
  },
  {
    key: 'count-capitals',
    name: Labels.Rules.COUNT_CAPITALS,
    rule: /[А-ЯЁA-Z]+/
  },
  {
    key: 'count-lowercase',
    name: Labels.Rules.COUNT_LOWERCASE,
    rule: /[a-zа-яё]+/
  }
];

class Password extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    keyValue: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    errMsgs: PropTypes.array,
    autocomplete: PropTypes.bool,
    verifiable: PropTypes.bool
  };

  static defaultProps = {
    className: '',
    keyValue: '',
    autocomplete: false,
    verifiable: false
  };

  state = {
    isShowWord: false,
    touched: false
  };

  onChange = e => {
    const { onChange, keyValue: key } = this.props;
    const value = e.target.value;

    onChange && onChange({ value, key, valid: BASE_RULE.test(String(value)) });
  };

  onFocus = () => {
    if (!this.state.touched) {
      this.setState({ touched: true });
    }
  };

  toggleEye = () => {
    this.setState(state => ({ isShowWord: !state.isShowWord }));
  };

  renderRules() {
    const { value } = this.props;
    const { touched } = this.state;

    return (
      <div className="ecos-password-rules">
        {RULES.map(item => (
          <div
            key={getKey()}
            className={classNames('ecos-password-rules__item', {
              'ecos-password-rules__item_invalid': touched && !item.rule.test(String(value || '')),
              'ecos-password-rules__item_valid': touched && item.rule.test(String(value || ''))
            })}
          >
            <Icon className="ecos-password-rules__item-icon icon-check" />
            {t(item.name)}
          </div>
        ))}
      </div>
    );
  }

  renderMessages() {
    const { verifiable, errMsgs } = this.props;

    return (
      <div className="ecos-password-messages">
        {verifiable && <div className="ecos-password-messages__item">{t(Labels.Rules.VALID_CHARACTERS)}</div>}
        {errMsgs &&
          errMsgs.map(msg => (
            <div key={getKey()} className="ecos-password-messages__item ecos-password-messages__item_error">
              {t(msg)}
            </div>
          ))}
      </div>
    );
  }

  render() {
    const { className, keyValue, autocomplete, verifiable, value, valid, errMsgs, ...addProps } = this.props;
    const { isShowWord, touched } = this.state;
    const check = BASE_RULE.test(String(value || ''));

    return (
      <div className={classNames('ecos-password', className)}>
        {verifiable && this.renderRules()}
        <div className="ecos-password-field">
          <Input
            {...addProps}
            value={value}
            type={isShowWord ? 'text' : 'password'}
            className={classNames('ecos-password-field__input ecos-input_focus ecos-input_hover', {
              'ecos-password-field__input_invalid': (verifiable && touched && !check) || (errMsgs && errMsgs.length),
              'ecos-password-field__input_valid': verifiable && touched && check
            })}
            onChange={this.onChange}
            autoComplete={autocomplete ? 'on' : 'none'}
            onFocus={this.onFocus}
          />
          <Icon
            className={classNames('ecos-password-field__icon-btn ecos-password-field__opener', {
              'icon-on': isShowWord,
              'icon-off': !isShowWord
            })}
            onClick={this.toggleEye}
          />
        </div>
        {this.renderMessages()}
      </div>
    );
  }
}

export default Password;

function getKey() {
  return Math.random() + '-' + Date.now();
}
