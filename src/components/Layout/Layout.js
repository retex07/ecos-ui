import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { MENU_TYPE } from '../../constants/dashboardSettings';
import Components from '../Components';
import './style.scss';

class Layout extends Component {
  static propTypes = {
    columns: PropTypes.arrayOf(
      PropTypes.shape({
        width: PropTypes.string,
        widgets: PropTypes.array
      })
    ).isRequired,
    menu: PropTypes.shape({
      type: PropTypes.oneOf(Object.keys(MENU_TYPE).map(key => MENU_TYPE[key])),
      links: PropTypes.arrayOf(PropTypes.object)
    }).isRequired
  };

  static defaultProps = {};

  get className() {
    const {
      menu: { type }
    } = this.props;
    const classes = ['ecos-layout'];

    // if (type === MENU_TYPE.LEFT) {
    //   classes.push('ecos-layout_left-menu');
    // }

    return classes.join(' ');
  }

  renderMenuItem = link => {
    return (
      <Link className="ecos-layout__menu-item" to={link.link} title={link.title} key={link.position}>
        <div className="ecos-layout__menu-item-title">{link.title}</div>
        <i className="ecos-btn__i ecos-layout__menu-item-i-next" />
        <i className="ecos-btn__i icon-drag ecos-layout__menu-item-i-drag" />
      </Link>
    );
  };

  renderMenu() {
    const {
      menu: { type, links }
    } = this.props;

    if (type === MENU_TYPE.LEFT) {
      return;
    }

    return <div className="ecos-layout__menu">{links.map(this.renderMenuItem)}</div>;
  }

  renderWidgets(widgets = []) {
    const components = [];

    widgets.forEach((widget, index) => {
      const Widget = Components.get(widget.name);

      components.push(
        <React.Suspense fallback={<div>Loading...</div>} key={`${widget.name}-${index}`}>
          <Widget {...widget.props} />
        </React.Suspense>
      );
    });

    return components;
  }

  renderColumn = (column, index) => {
    const { columns } = this.props;
    const styles = {
      minWidth: column.width,
      width: column.width,
      height: '100%',
      borderRadius: '5px'
    };
    const otherWidth = columns
      .map(column => column.width || '')
      .filter(item => item !== '')
      .join(' + ');
    const withoutSize = columns.filter(column => !column.width).length;

    if (!column.width) {
      styles.width = `calc((100% - ${otherWidth}) / ${withoutSize})`;
    }

    return (
      <div className="ecos-layout__column" key={index} style={styles}>
        {this.renderWidgets(column.widgets)}
      </div>
    );
  };

  renderColumns() {
    const { columns } = this.props;

    if (!columns) {
      return null;
    }

    return <div className="ecos-layout__column-wrapper">{columns.map(this.renderColumn)}</div>;
  }

  render() {
    return (
      <div className={this.className}>
        {this.renderMenu()}
        {this.renderColumns()}
      </div>
    );
  }
}

export default Layout;
