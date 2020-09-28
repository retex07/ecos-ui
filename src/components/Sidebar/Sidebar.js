import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import get from 'lodash/get';

import {
  collapseAllItems,
  fetchLargeLogoSrc,
  fetchSlideMenuItems,
  fetchSmallLogoSrc,
  getSiteDashboardEnable,
  setInitExpandableItems,
  toggleIsOpen
} from '../../actions/slideMenu';
import { isExistValue } from '../../helpers/util';
import { SourcesId } from '../../constants';
import Records from '../Records';
import Logo from './Logo';
import List from './List';

import './style.scss';

class Sidebar extends React.Component {
  slideMenuToggle = null;

  state = {
    fetchItems: false
  };

  componentDidMount() {
    this.props.fetchSmallLogoSrc();
    this.props.fetchLargeLogoSrc();
    this.props.getSiteDashboardEnable();

    this.slideMenuToggle = document.getElementById('slide-menu-toggle');
    this.recordMenu = Records.get(`${SourcesId.MENU}@${this.props.idMenu}`);
    this.updateWatcher = this.recordMenu.watch('subMenu{.json}', () => {
      this.setState({ fetchItems: false });
    });

    if (this.slideMenuToggle) {
      this.slideMenuToggle.addEventListener('click', this.toggleSlideMenu);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (isExistValue(this.props.versionMenu) && !this.state.fetchItems) {
      this.setState({ fetchItems: true }, this.props.fetchSlideMenuItems);
    }
  }

  componentWillUnmount() {
    if (this.slideMenuToggle) {
      this.slideMenuToggle.removeEventListener('click', this.toggleSlideMenu);
    }

    this.recordMenu && this.updateWatcher && this.recordMenu.unwatch(this.updateWatcher);
  }

  toggleSlideMenu = () => {
    const isOpen = this.props.isOpen;

    this.props.toggleIsOpen(!isOpen);

    if (isOpen) {
      this.props.collapseAllItems();
    } else {
      this.props.setInitExpandableItems();
    }
  };

  render() {
    const { isOpen, isReady, largeLogoSrc, smallLogoSrc, items, homeLink } = this.props;

    if (!isReady) {
      return null;
    }
    return (
      <div
        className={classNames('ecos-sidebar', {
          'ecos-sidebar_expanded': isOpen,
          'ecos-sidebar_collapsed': !isOpen
        })}
      >
        <div className={classNames('ecos-sidebar-head', { 'ecos-sidebar-head_expanded': isOpen })}>
          <Logo large={isOpen} logos={{ large: largeLogoSrc, small: smallLogoSrc }} link={homeLink} />
        </div>
        <Scrollbars
          style={{ height: '100%' }}
          className="ecos-sidebar-scroll"
          autoHide
          renderTrackVertical={props => <div {...props} className="ecos-sidebar-scroll-v" />}
          renderTrackHorizontal={() => <div hidden />}
          renderView={props => <div {...props} className="ecos-sidebar-scroll-area" />}
        >
          <List items={items} isExpanded />
        </Scrollbars>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  idMenu: get(state, 'menu.id'),
  versionMenu: get(state, 'menu.version'),
  isOpen: get(state, 'slideMenu.isOpen'),
  isReady: get(state, 'slideMenu.isReady'),
  items: get(state, 'slideMenu.items', []),
  smallLogoSrc: get(state, 'slideMenu.smallLogo'),
  largeLogoSrc: get(state, 'slideMenu.largeLogo'),
  expandableItems: get(state, 'slideMenu.expandableItems'),
  homeLink: get(state, 'app.homeLink')
});

const mapDispatchToProps = dispatch => ({
  fetchSlideMenuItems: _ => dispatch(fetchSlideMenuItems(_)),
  fetchSmallLogoSrc: () => dispatch(fetchSmallLogoSrc()),
  fetchLargeLogoSrc: () => dispatch(fetchLargeLogoSrc()),
  toggleIsOpen: isOpen => dispatch(toggleIsOpen(isOpen)),
  getSiteDashboardEnable: () => dispatch(getSiteDashboardEnable()),
  setInitExpandableItems: () => dispatch(setInitExpandableItems()),
  collapseAllItems: () => dispatch(collapseAllItems())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
