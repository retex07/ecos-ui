import React, { Component } from 'react';
import classNames from 'classnames';
import { Col, FormGroup, Label } from 'reactstrap';

import './Field.scss';

export default class Field extends Component {
  render() {
    const props = this.props;
    const cssClasses = classNames('ecos-field', props.className);

    return (
      <FormGroup row className={cssClasses}>
        <Label sm={4} md={2} className={'ecos-field__label'}>
          {props.label}
        </Label>
        <Col sm={7} md={4} className={'ecos-field__control'}>
          {props.children}
        </Col>
      </FormGroup>
    );
  }
}
