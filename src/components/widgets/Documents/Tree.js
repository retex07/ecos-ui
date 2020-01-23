import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'reactstrap';
import classNames from 'classnames';

import { Icon } from '../../common';
import { Checkbox, Badge } from '../../common/form';
import { arrayCompare, t } from '../../../helpers/util';
import { GrouppedTypeInterface } from './propsInterfaces';

const LABELS = {
  EMPTY: 'Ничего не найдено',
  NOT_SELECTED: 'Не выбран для отображения'
};

class TreeItem extends Component {
  static propTypes = {
    item: PropTypes.shape(GrouppedTypeInterface),
    isChild: PropTypes.bool,
    className: PropTypes.string,
    onOpenSettings: PropTypes.func,
    onToggleSelect: PropTypes.func
  };

  static defaultProps = {
    item: {},
    isChild: false,
    className: ''
  };

  state = {
    isOpen: false
  };

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const { item, isChild } = this.props;
    const { isOpen } = this.state;

    if (
      nextState.isOpen !== isOpen ||
      !arrayCompare(nextProps.item.items, item.items) ||
      nextProps.item.id !== item.id ||
      nextProps.item.isSelected !== item.isSelected ||
      nextProps.isChild !== isChild
    ) {
      return true;
    }

    return false;
  }

  handleToggleOpen = () => {
    this.setState(state => ({ isOpen: !state.isOpen }));
  };

  handleToggleCheck = ({ checked }) => {
    if (checked === this.props.item.isSelected) {
      return;
    }

    this.props.onToggleSelect({ id: this.props.item.id, checked });
  };

  handleToggleSettings = () => {
    this.props.onOpenSettings(this.props.item.id);
  };

  renderArrow() {
    const { item } = this.props;
    const { isOpen } = this.state;

    if (!item.items.length) {
      return null;
    }

    return (
      <Icon
        className={classNames('ecos-tree__item-element-arrow icon-right', {
          'ecos-tree__item-element-arrow_open': isOpen
        })}
        onClick={this.handleToggleOpen}
      />
    );
  }

  renderChildren() {
    const { item, onToggleSelect, onOpenSettings } = this.props;
    const { isOpen } = this.state;

    if (!item.items.length) {
      return null;
    }

    return (
      <Collapse isOpen={isOpen} className="ecos-tree__item-element-children">
        {item.items.map(item => (
          <TreeItem item={item} isChild key={item.id} onToggleSelect={onToggleSelect} onOpenSettings={onOpenSettings} />
        ))}
      </Collapse>
    );
  }

  renderSettings() {
    const { item } = this.props;

    if (!item.isSelected) {
      return null;
    }

    return <Icon className="icon-settings ecos-tree__item-element-settings" onClick={this.handleToggleSettings} />;
  }

  renderBadge() {
    const { item } = this.props;

    if (item.isSelected) {
      return null;
    }

    return <Badge text={t(LABELS.NOT_SELECTED)} className="ecos-tree__item-element-badge" />;
  }

  render() {
    const { isChild, item } = this.props;
    const { isOpen } = this.state;

    return (
      <div
        className={classNames('ecos-tree__item', {
          'ecos-tree__item_child': isChild,
          'ecos-tree__item_parent': item.items.length,
          'ecos-tree__item_open': isOpen,
          'ecos-tree__item_not-selected': !item.isSelected
        })}
      >
        <div className="ecos-tree__item-element">
          {this.renderArrow()}
          <Checkbox className="ecos-tree__item-element-check" onChange={this.handleToggleCheck} checked={item.isSelected} />
          <div className="ecos-tree__item-element-label">{item.name}</div>
          {this.renderBadge()}
          {this.renderSettings()}
        </div>
        {this.renderChildren()}
      </div>
    );
  }
}

class Tree extends Component {
  static propTypes = {
    data: PropTypes.array,
    groupBy: PropTypes.string,
    className: PropTypes.string,
    onOpenSettings: PropTypes.func,
    onToggleSelect: PropTypes.func
  };

  static defaultProps = {
    data: [],
    groupBy: '',
    className: '',
    onOpenSettings: () => {},
    onToggleSelect: () => {}
  };

  get formattedTree() {
    const { data, groupBy } = this.props;

    if (!groupBy) {
      return data;
    }

    const getChilds = (filtered = [], types = filtered) => {
      return filtered.map(item => {
        if (!item[groupBy]) {
          return item;
        }

        return {
          ...item,
          items: getChilds(types.filter(type => type[groupBy] && type[groupBy] === item.id), types)
        };
      });
    };

    return data
      .filter(item => item[groupBy] === null)
      .map(item => ({
        ...item,
        items: getChilds(data.filter(type => type[groupBy] === item.id), data)
      }));
  }

  renderEmpty() {
    const { data } = this.props;

    if (data.length) {
      return null;
    }

    return <div className="ecos-tree__empty">{t(LABELS.EMPTY)}</div>;
  }

  renderTree() {
    const { onToggleSelect } = this.props;
    const data = this.formattedTree;

    if (!data.length) {
      return null;
    }

    return data.map(item => (
      <TreeItem item={item} key={item.id} onToggleSelect={onToggleSelect} onOpenSettings={this.props.onOpenSettings} />
    ));
  }

  render() {
    const { className } = this.props;

    return (
      <div className={classNames('ecos-tree', className)}>
        {this.renderTree()}
        {this.renderEmpty()}
      </div>
    );
  }
}

export default Tree;
