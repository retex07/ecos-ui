import React, { Fragment, Component } from 'react';
import { BaseEditor } from '../editors';

export default class BaseFormatter extends Component {
  static getFilterValue(cell) {
    return this.prototype.value(cell);
  }

  static getEditor(editorProps, value) {
    return <BaseEditor {...editorProps} value={value} />;
  }

  value(cell) {
    return cell || '';
  }

  render() {
    return <Fragment>{this.value(this.props.cell)}</Fragment>;
  }
}
