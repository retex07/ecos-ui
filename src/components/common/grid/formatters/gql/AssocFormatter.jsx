import React from 'react';
import uuidV4 from 'uuid/v4';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import ReactResizeDetector from 'react-resize-detector';

import { isNodeRef } from '../../../../../helpers/util';
import DefaultGqlFormatter from './DefaultGqlFormatter';
import Records from '../../../../../components/Records';
import { AssocEditor } from '../../editors';

export default class AssocFormatter extends DefaultGqlFormatter {
  static getQueryString(attribute) {
    return `.atts(n:"${attribute}"){disp,assoc}`;
  }

  static getEditor(editorProps, value, row, column) {
    return <AssocEditor {...editorProps} value={value} column={column} />;
  }

  static async getDisplayName(item) {
    if (isNodeRef(item)) {
      return Records.get(item).load('.disp');
    }

    if (typeof item === 'string') {
      return Promise.resolve(item);
    }

    if (item && item.disp) {
      return Promise.resolve(item.disp);
    }

    return Promise.resolve('');
  }

  static getDisplayText(value) {
    if (Array.isArray(value)) {
      return Promise.all(value.map(AssocFormatter.getDisplayName)).then(results => results.join(', '));
    }

    return AssocFormatter.getDisplayName(value);
  }

  constructor(props) {
    super(props);
    this.domId = '_' + uuidV4();
  }

  getId(cell) {
    return get(cell, 'assoc', '');
  }

  state = {
    displayName: '',
    isNeededTooltip: false
  };

  fetchName = false;
  domId;

  componentDidMount() {
    const { cell } = this.props;

    this.fetchName = true;
    AssocFormatter.getDisplayText(cell).then(displayName => {
      if (this.fetchName) {
        this.setState({ displayName });
        this.fetchName = false;
      }
    });
  }

  componentWillUnmount() {
    this.fetchName = false;
  }

  renderTooltipContent = () => {
    const { displayName } = this.state;
    const { cell } = this.props;
    const displayNameArray = displayName.split(', ');

    return (
      <div className="ecos-formatter-assoc__tooltip-content">
        {displayNameArray.map((name, i) => (
          <div key={`${get(cell, 'assoc', '')}_${i}`}>{name}</div>
        ))}
      </div>
    );
  };

  onResize = () => {
    const tool = this.tooltipRef.current;

    tool && tool.runUpdate();
  };

  render() {
    const { displayName, withTooltip } = this.state;
    const elementId = `value_${this.domId}`;

    return (
      <>
        <ReactResizeDetector handleWidth onResize={debounce(this.onResize, 250)} />
        <div
          className={classNames('ecos-formatter-assoc__value', { 'ecos-formatter-assoc__value_no-tooltip': !withTooltip })}
          id={elementId}
        >
          {displayName}
        </div>
        {this.renderTooltip({
          domId: this.domId,
          text: displayName,
          contentComponent: this.renderTooltipContent(),
          elementId
        })}
      </>
    );
  }
}
