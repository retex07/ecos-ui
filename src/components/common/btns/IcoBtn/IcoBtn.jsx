import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import PointsLoader from '../../PointsLoader/PointsLoader';

export default class IcoBtn extends Component {
  static propTypes = {
    invert: PropTypes.bool,
    loading: PropTypes.bool,
    className: PropTypes.string,
    icon: PropTypes.string
  };

  static defaultProps = {
    invert: false,
    loading: false,
    className: '',
    icon: ''
  };

  get elIcon() {
    const { invert, children, icon } = this.props;
    const position = invert ? 'right' : 'left';

    return <i className={classNames('ecos-btn__i', { [`ecos-btn__i_${position}`]: children }, icon)} />;
  }

  render() {
    const { className, invert, children, icon, loading, ...props } = this.props;
    const cssClasses = classNames('ecos-btn', className);

    const text = <span className={'ecos-btn__text'}>{children}</span>;
    const first = invert ? text : this.elIcon;
    const second = invert ? this.elIcon : text;

    return (
      <button {...props} className={cssClasses}>
        {loading && <PointsLoader />}
        {!loading && first}
        {!loading && second}
      </button>
    );
  }
}
