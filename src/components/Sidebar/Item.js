import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Tooltip } from 'reactstrap';

import { setSelected } from '../../helpers/slideMenu';
import { setScrollTop, setSelectedId, toggleExpanded } from '../../actions/slideMenu';
import SS from '../../services/sidebar';
import { Icon } from '../common';
import ClickOutside from '../ClickOutside';
import List from './List';
import RemoteBadge from './RemoteBadge';
import { ItemBtn, ItemIcon, ItemLink } from './item-components';

class Item extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.object,
    level: PropTypes.number,
    isDefExpanded: PropTypes.bool,
    noIcon: PropTypes.bool,
    noBadge: PropTypes.bool,
    noToggle: PropTypes.bool
  };

  static defaultProps = {
    data: [],
    level: 0,
    isDefExpanded: true,
    noIcon: true,
    noBadge: true,
    isRemoteBadge: false,
    noToggle: true
  };

  state = {
    isExpanded: false,
    styleProps: {}
  };

  constructor(props) {
    super(props);

    const { actionType } = this.parseData(props);
    const styleProps = SS.getPropsStyleLevel({ level: props.level, actionType });

    this.state.isExpanded = styleProps.isDefExpanded;
    this.state.styleProps = styleProps;
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const isNestedListExpandedNext = this.getIsNestedListExpanded(nextProps);

    if (!nextProps.isOpen && this.props.isOpen) {
      this.setState({ isExpanded: this.state.styleProps.isDefExpanded });
    }

    if (nextProps.isOpen && isNestedListExpandedNext) {
      this.setState({ isExpanded: isNestedListExpandedNext || this.state.styleProps.isDefExpanded });
    }
  }

  parseData(props = this.props) {
    const { data, isSiteDashboardEnable } = props;

    return {
      itemId: get(data, 'id', ''),
      items: get(data, 'items', null),
      actionType: get(data, 'action.type', ''),
      itemUrl: SS.getPropsUrl(data, { isSiteDashboardEnable })
    };
  }

  get hasSubItems() {
    const { items } = this.parseData();

    return !isEmpty(items);
  }

  get noMove() {
    return this.hasSubItems;
  }

  get isDropList() {
    const { isOpen, level } = this.props;

    return !isOpen && SS.DROP_MENU_BEGIN_FROM === level + 1;
  }

  get isSelectedItem() {
    const { selectedId } = this.props;
    const { itemId } = this.parseData();

    return selectedId === itemId;
  }

  get isLink() {
    const { actionType } = this.parseData();

    return ![SS.ActionTypes.CREATE_SITE].includes(actionType);
  }

  getIsNestedListExpanded(props = this.props) {
    const { expandableItems } = props;
    const { itemId } = this.parseData();

    return expandableItems && (expandableItems.find(fi => fi.id === itemId) || {}).isNestedListExpanded;
  }

  getMover() {
    if (this.noMove) {
      return ({ children }) => <div className="ecos-sidebar-item__link">{children}</div>;
    }

    return this.isLink ? ItemLink : ItemBtn;
  }

  getItemContainer() {
    const { level, id, isOpen } = this.props;
    const { items } = this.parseData();
    const { isExpanded, styleProps = {} } = this.state;
    const {
      collapsed: { divInsteadName }
    } = styleProps;
    const itemSeparator = !isOpen && divInsteadName;

    return ({ children }) => (
      <>
        <div
          id={id}
          className={classNames('ecos-sidebar-item', `ecos-sidebar-item_lvl-${level}`, {
            'ecos-sidebar-item_no-action': this.noMove,
            'ecos-sidebar-item_no-items': !this.hasSubItems,
            'ecos-sidebar-item_expanded': isExpanded && this.hasSubItems,
            'ecos-sidebar-item_selected': this.isSelectedItem,
            'ecos-sidebar-item_separator': itemSeparator
          })}
          onClick={this.onToggleList}
        >
          {!itemSeparator && children}
        </div>
        {this.isDropList && (
          <Tooltip
            target={id}
            isOpen={isExpanded}
            placement="right"
            trigger="click"
            boundariesElement="div.ecos-base-content"
            className="ecos-sidebar-list-tooltip"
            innerClassName="ecos-sidebar-list-tooltip-inner"
            arrowClassName="ecos-sidebar-list-tooltip-arrow"
          >
            <ClickOutside handleClickOutside={this.onCloseTooltip} onClick={this.onCloseTooltip}>
              <List isExpanded data={items} level={level + 1} />
            </ClickOutside>
          </Tooltip>
        )}
      </>
    );
  }

  onToggleList = e => {
    const { itemId } = this.parseData();
    const { styleProps = {} } = this.state;
    const { noToggle } = styleProps;

    if (this.noMove && !noToggle) {
      const { isExpanded } = this.state;

      this.setState({ isExpanded: !isExpanded });
      this.props.setExpanded && this.props.setExpanded(itemId);
      e.stopPropagation();
    }
  };

  onCloseTooltip = () => {
    const { isOpen } = this.props;
    const { isExpanded } = this.state;

    if (!isOpen && isExpanded) {
      this.setState({ isExpanded: false });
    }
  };

  onClickItem = () => {
    if (this.isLink || !this.hasSubItems) {
      const { itemId } = this.parseData();
      const { setSelectItem } = this.props;

      setSelectItem(itemId);
    }
  };

  renderLabel() {
    const { isOpen, isSiteDashboardEnable, data } = this.props;
    const { styleProps = {} } = this.state;
    const { noIcon } = styleProps;
    const extraParams = { isSiteDashboardEnable };

    const Mover = this.getMover();

    return (
      <Mover data={data} extraParams={extraParams} onClick={this.onClickItem}>
        {!noIcon && <ItemIcon iconName={data.icon} title={isOpen ? '' : data.label} />}
        <div className="ecos-sidebar-item__label">{data.label}</div>
      </Mover>
    );
  }

  renderBadge() {
    const { isOpen, data } = this.props;
    const { styleProps = {} } = this.state;
    const { noBadge, isRemoteBadge } = styleProps;

    return !noBadge && isRemoteBadge ? <RemoteBadge data={data} isOpen={isOpen} /> : null;
  }

  renderToggle() {
    const { isOpen } = this.props;
    const { isExpanded, styleProps = {} } = this.state;
    const { noToggle } = styleProps;

    return this.hasSubItems && !noToggle ? (
      <Icon
        className={classNames('ecos-sidebar-item__toggle', {
          'ecos-sidebar-item__toggle_v': isOpen,
          'ecos-sidebar-item__toggle_h icon-right': !isOpen,
          'icon-down': !isExpanded && isOpen,
          'icon-up': isExpanded && isOpen
        })}
      />
    ) : null;
  }

  render() {
    const { isOpen, data, level } = this.props;
    const { isExpanded } = this.state;
    const { items } = this.parseData();

    if (isEmpty(data)) {
      return null;
    }

    const ItemContainer = this.getItemContainer();

    return (
      <>
        <ItemContainer>
          {this.renderLabel()}
          {this.renderBadge()}
          {this.renderToggle()}
        </ItemContainer>
        {!this.isDropList && (
          <List isExpanded={isExpanded || (!isOpen && level > SS.DROP_MENU_BEGIN_FROM)} data={items} level={level + 1} />
        )}
      </>
    );
  }
}

const mapStateToProps = state => ({
  isOpen: state.slideMenu.isOpen,
  isSiteDashboardEnable: state.slideMenu.isSiteDashboardEnable,
  selectedId: state.slideMenu.selectedId,
  expandableItems: state.slideMenu.expandableItems
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  setSelectItem: id => {
    setSelected(id);
    dispatch(setSelectedId(id));
  },
  setExpanded: id => dispatch(toggleExpanded(id)),
  setScrollTop: value => dispatch(setScrollTop(value))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item);
