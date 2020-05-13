import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'reactstrap';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';

import { arrayCompare, t } from '../../../helpers/util';
import { EcosIcon, Icon, Tooltip } from '../../common';
import { Badge, Checkbox } from '../../common/form';
import { SortableContainer, SortableElement, SortableHandle } from '../../Drag-n-Drop';
import Actions from './Actions';

import './style.scss';

const ItemInterface = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  dndIdx: PropTypes.number,
  name: PropTypes.string,
  icon: PropTypes.shape({
    type: PropTypes.string,
    value: PropTypes.string
  }),
  bage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  selected: PropTypes.bool,
  multiple: PropTypes.bool,
  mandatory: PropTypes.bool,
  locked: PropTypes.bool,
  items: PropTypes.array,
  actionConfig: PropTypes.array
};

const Labels = {
  EMPTY: 'tree-component.empty',
  TIP_CANT_CHANGE: 'tree-component.tooltip.cannot-be-changes'
};

const STEP_LVL = 1;
const TOP_LVL = 1;

//при отсутствии класса у нужного элемента добавить > [`${prefixClassName}--item-[описание элемента]`]: !!prefixClassName

class TreeItem extends Component {
  static propTypes = {
    item: PropTypes.shape(ItemInterface),
    isChild: PropTypes.bool,
    isMajor: PropTypes.bool,
    openAll: PropTypes.bool,
    level: PropTypes.number,
    prefixClassName: PropTypes.string,
    onToggleSelect: PropTypes.func,
    onClickAction: PropTypes.func,
    renderExtraItemComponents: PropTypes.func
  };

  static defaultProps = {
    item: {},
    isChild: false,
    isMajor: false,
    openAll: false,
    level: TOP_LVL,
    prefixClassName: '',
    onClickAction: () => null
  };

  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.openAll
    };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const { item, isChild, openAll } = this.props;
    const { isOpen } = this.state;

    return (
      nextState.isOpen !== isOpen ||
      !arrayCompare(nextProps.item.items, item.items) ||
      nextProps.item.id !== item.id ||
      nextProps.item.selected !== item.selected ||
      JSON.stringify(nextProps.item.actionConfig) !== JSON.stringify(item.actionConfig) ||
      nextProps.openAll !== openAll ||
      nextProps.isChild !== isChild
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.openAll !== this.props.openAll && this.props.openAll !== this.state.isOpen) {
      this.setState({ isOpen: this.props.openAll });
    }
  }

  get title() {
    const { item } = this.props;

    if (item.locked) {
      return t(Labels.TIP_CANT_CHANGE);
    }

    if (item.selected) {
      return '';
    }

    return t(Labels.TIP_CANT_CHANGE);
  }

  get hasGrandchildren() {
    const { item } = this.props;

    return !!item && !isEmpty(item.items) && item.items.some(child => !!child.items.length);
  }

  handleToggleOpen = () => {
    this.setState(state => ({ isOpen: !state.isOpen }));
  };

  handleToggleCheck = ({ checked }) => {
    const { item, selectable } = this.props;

    if (checked === item.selected || item.locked || !selectable) {
      return;
    }

    this.props.onToggleSelect({ id: this.props.item.id, checked });
  };

  handleActionItem = action => {
    this.props.onClickAction({ action, id: this.props.item.id });
  };

  renderArrow() {
    const { item } = this.props;
    const { isOpen } = this.state;

    if (!item || isEmpty(item.items)) {
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
    const {
      item,
      openAll,
      level,
      draggable,
      dragLvlTo,
      prefixClassName,
      onToggleSelect,
      onClickAction,
      moveInLevel,
      moveInParent,
      renderExtraItemComponents
    } = this.props;
    const { isOpen } = this.state;

    if (!item || isEmpty(item.items)) {
      return null;
    }

    return (
      <Collapse isOpen={isOpen} className="ecos-tree__item-element-children">
        {isOpen &&
          item.items.map((child, index) => (
            <TreeItem
              item={child}
              key={child.id}
              index={index}
              isChild
              prefixClassName={prefixClassName}
              level={level + STEP_LVL}
              onToggleSelect={onToggleSelect}
              onClickAction={onClickAction}
              openAll={openAll}
              draggable={draggable}
              dragLvlTo={dragLvlTo}
              moveInLevel={moveInLevel}
              moveInParent={moveInParent}
              parentKey={item.id}
              renderExtraItemComponents={renderExtraItemComponents}
            />
          ))}
      </Collapse>
    );
  }

  render() {
    const {
      isChild,
      item,
      selectable,
      prefixClassName,
      dragLvlTo,
      draggable,
      level,
      index,
      moveInLevel,
      moveInParent,
      parentKey = '',
      isMajor,
      renderExtraItemComponents
    } = this.props;
    const { isOpen } = this.state;
    const { items, selected, locked, icon, name, actionConfig } = item || {};
    const canDrag = draggable && item.draggable !== false && (dragLvlTo == null || dragLvlTo >= level);
    const key = `key_${level}_${index}_${item.id}`.replace(/[\s\-]*/g, '');

    const itemElement = (
      <div
        className={classNames('ecos-tree__item', {
          'ecos-tree__item_child': isChild,
          'ecos-tree__item_parent': items && items.length,
          'ecos-tree__item_open': isOpen,
          'ecos-tree__item_not-selected': !selected,
          'ecos-tree__item_locked': locked,
          'ecos-tree__item_has-grandchildren': this.hasGrandchildren,
          'ecos-tree__item_major': isMajor,
          [`ecos-tree__item-level--${level}`]: true,
          [`${prefixClassName}--item-container`]: !!prefixClassName
        })}
      >
        <div className={classNames('ecos-tree__item-element', { [`${prefixClassName}--item-element`]: !!prefixClassName })}>
          {this.renderArrow()}
          {selectable && (
            <Checkbox
              className="ecos-tree__item-element-check"
              onChange={this.handleToggleCheck}
              checked={selected}
              disabled={locked}
              title={this.title}
            />
          )}
          {/*todo icon*/}
          {!!icon && <EcosIcon code={item.icon.code} data={item.icon} source="menu" className="ecos-tree__item-element-icon" />}
          {item.badge != null && <Badge text={String(item.badge)} className="ecos-tree__item-element-badge" />}
          <Tooltip target={key} text={t(name)} showAsNeeded uncontrolled autohide>
            <div
              className={classNames('ecos-tree__item-element-label', {
                'ecos-tree__item-element-label_locked': item.locked
              })}
              id={key}
            >
              {t(name)}
            </div>
          </Tooltip>
          {renderExtraItemComponents && <div className="ecos-tree__item-element-custom-components">{renderExtraItemComponents(item)}</div>}
          <div className="ecos-tree__item-element-space" />
          {actionConfig && !!actionConfig.length && (
            <div className="ecos-tree__item-element-actions">
              <Actions actionConfig={actionConfig} onClick={this.handleActionItem} />
            </div>
          )}
          {canDrag && (
            <SortableHandle>
              <i className="icon-drag ecos-tree__item-element-drag" />
            </SortableHandle>
          )}
        </div>
        {this.renderChildren()}
      </div>
    );

    const dragProps = {};

    moveInLevel && (dragProps.collection = level);
    moveInParent && (dragProps.collection += parentKey);

    return canDrag ? (
      <SortableElement key={key} index={item.dndIdx} disabled={locked} {...dragProps}>
        {itemElement}
      </SortableElement>
    ) : (
      itemElement
    );
  }
}

class Tree extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape(ItemInterface)),
    groupBy: PropTypes.string,
    prefixClassName: PropTypes.string,
    selectable: PropTypes.bool,
    draggable: PropTypes.bool,
    dragLvlTo: PropTypes.number,
    openAll: PropTypes.bool,
    moveInParent: PropTypes.bool,
    moveInLevel: PropTypes.bool,
    onToggleSelect: PropTypes.func,
    onClickActionItem: PropTypes.func,
    onDragEnd: PropTypes.func,
    renderExtraItemComponents: PropTypes.func
  };

  static defaultProps = {
    data: [],
    groupBy: '',
    prefixClassName: '',
    moveInLevel: true,
    moveInParent: false,
    onToggleSelect: () => null,
    onClickActionItem: () => null,
    onDragEnd: () => null
  };

  get formattedTree() {
    const { data, groupBy } = this.props;

    if (!groupBy) {
      return data;
    }

    const getChildren = (filtered = [], types = filtered) => {
      return filtered.map(item => {
        if (!item[groupBy]) {
          return item;
        }

        return {
          ...item,
          items: getChildren(types.filter(type => type[groupBy] && type[groupBy] === item.id), types)
        };
      });
    };

    return data
      .filter(item => item[groupBy] === null)
      .map(item => ({
        ...item,
        items: getChildren(data.filter(type => type[groupBy] === item.id), data)
      }));
  }

  handleBeforeSortStart = ({ node }) => {
    node.classList.toggle('ecos-tree__item_dragging');

    this.setState({ draggableNode: node });
  };

  handleSortEnd = ({ oldIndex, newIndex }, event) => {
    const { draggableNode } = this.state;

    event.stopPropagation();
    draggableNode.classList.toggle('ecos-tree__item_dragging');

    this.setState({ draggableNode: null });
    this.props.onDragEnd(oldIndex, newIndex);
  };

  renderEmpty() {
    const { data } = this.props;

    if (data.length) {
      return null;
    }

    return <div className="ecos-tree__empty">{t(Labels.EMPTY)}</div>;
  }

  renderTree() {
    const {
      onToggleSelect,
      selectable,
      prefixClassName,
      openAll,
      draggable,
      dragLvlTo,
      onClickActionItem,
      moveInLevel,
      moveInParent,
      renderExtraItemComponents
    } = this.props;
    const data = this.formattedTree;

    if (!data.length) {
      return null;
    }

    return data.map((item, index) => (
      <TreeItem
        item={item}
        key={item.id}
        index={index}
        prefixClassName={prefixClassName}
        openAll={openAll}
        onToggleSelect={onToggleSelect}
        selectable={selectable}
        draggable={draggable}
        dragLvlTo={dragLvlTo}
        onClickAction={onClickActionItem}
        moveInLevel={moveInLevel}
        moveInParent={moveInParent}
        renderExtraItemComponents={renderExtraItemComponents}
        isMajor
      />
    ));
  }

  render() {
    const { prefixClassName, draggable } = this.props;

    const treeElement = (
      <div className={classNames('ecos-tree', { [`${prefixClassName}--tree`]: !!prefixClassName })}>
        {this.renderTree()}
        {this.renderEmpty()}
      </div>
    );

    return draggable ? (
      <SortableContainer
        axis="y"
        lockAxis="y"
        distance={3}
        onSortEnd={this.handleSortEnd}
        updateBeforeSortStart={this.handleBeforeSortStart}
        useDragHandle
      >
        {treeElement}
      </SortableContainer>
    ) : (
      treeElement
    );
  }
}

export default Tree;
