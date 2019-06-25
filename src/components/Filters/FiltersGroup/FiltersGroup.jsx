import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Well, Label, Select } from '../../common/form';
import { Filter, FiltersCondition } from '../';
import { ParserPredicate } from '../predicates';
import { t, trigger } from '../../../helpers/util';

import './FiltersGroup.scss';

const ListItem = ({ cssItemClasses, provided, item }) => {
  return (
    <li
      className={cssItemClasses}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{ ...provided.draggableProps.style }}
    >
      {item}
    </li>
  );
};

export default class FiltersGroup extends Component {
  constructor(props) {
    super(props);
    this.portal = this.createDraggableContainer();
  }

  onChangeFilterValue = ({ val, index }) => {
    const filter = this.props.group.filters[index];
    filter.predicate.setVal(val);
    trigger.call(this, 'onChangeFilter', { filter, index, groupIndex: this.props.index });
  };

  onChangeFilterPredicate = ({ predicate, index }) => {
    const filter = this.props.group.filters[index];
    filter.predicate.setT(predicate);
    trigger.call(this, 'onChangeFilter', { filter, index, groupIndex: this.props.index });
  };

  deleteFilter = index => {
    trigger.call(this, 'onDeleteFilter', { index, groupIndex: this.props.index });
  };

  addFilter = column => {
    const filter = ParserPredicate.createFilter({ att: column.attribute, columns: this.props.columns, column });
    trigger.call(this, 'onAddFilter', { filter, groupIndex: this.props.index });
  };

  changeFilterCondition = ({ condition, index }) => {
    trigger.call(this, 'onChangeFilterCondition', { condition, index, groupIndex: this.props.index });
  };

  changeGroupFilterCondition = ({ condition }) => {
    trigger.call(this, 'onChangeGroupFilterCondition', { condition, groupIndex: this.props.index });
  };

  addGroup = condition => {
    trigger.call(this, 'onAddGroup', condition);
  };

  createDraggableContainer = () => {
    let div = document.createElement('div');
    document.body.appendChild(div);
    return div;
  };

  removeDraggableContainer = () => {
    document.body.removeChild(this.portal);
  };

  componentWillUnmount() {
    this.removeDraggableContainer();
  }

  render() {
    const { className, columns, first, group, index, droppableIdPrefix = '_' } = this.props;
    const groupConditions = ParserPredicate.getGroupConditions();
    const droppableId = `${droppableIdPrefix}${index}`;

    const dndFilters = group.filters.map((filter, idx) => (
      <Filter
        key={idx}
        index={idx}
        filter={filter}
        onChangeValue={this.onChangeFilterValue}
        onChangePredicate={this.onChangeFilterPredicate}
        onDelete={this.deleteFilter}
      >
        {idx > 0 && (
          <FiltersCondition
            index={idx}
            cross
            onClick={this.changeFilterCondition}
            condition={filter.getCondition()}
            conditions={groupConditions}
          />
        )}
      </Filter>
    ));

    return (
      <Well className={`ecos-well_full ecos-well_shadow ecos-well_radius_6 ${classNames('ecos-filters-group', className)}`}>
        <div className={'ecos-filters-group__head'}>
          {!first && (
            <FiltersCondition onClick={this.changeGroupFilterCondition} condition={group.getCondition()} conditions={groupConditions} />
          )}
          <div className={'ecos-filters-group__tools'}>
            <Label className={'ecos-filters-group__tools_step label_clear label_nowrap label_middle-grey'}>
              {t('filter-list.filter-group-add')}
            </Label>

            <Select
              className={`ecos-filters-group__select ecos-filters-group__tools_step select_narrow ${
                first ? 'ecos-select_blue' : 'ecos-select_grey'
              }`}
              placeholder={t('filter-list.criterion')}
              options={columns}
              getOptionLabel={option => option.text}
              getOptionValue={option => option.attribute}
              onChange={this.addFilter}
            />

            {first && (
              <Select
                className={'ecos-filters-group__select select_narrow ecos-select_blue'}
                placeholder={t('filter-list.condition-group')}
                options={groupConditions}
                getOptionLabel={option => option.label}
                getOptionValue={option => option.value}
                onChange={this.addGroup}
              />
            )}
          </div>
        </div>

        <Droppable droppableId={droppableId}>
          {provided => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {dndFilters.map((item, index) => {
                const draggableId = `${droppableId}_${index}`;

                return (
                  <Draggable key={index} draggableId={draggableId} index={index}>
                    {(provided, snapshot) => {
                      return snapshot.isDragging ? (
                        ReactDOM.createPortal(
                          <ListItem
                            cssItemClasses={snapshot.isDragging && 'ecos-filters-group__draggable'}
                            provided={provided}
                            item={item}
                          />,
                          this.portal
                        )
                      ) : (
                        <ListItem provided={provided} item={item} />
                      );
                    }}
                  </Draggable>
                );
              })}
              <div className={dndFilters.length ? '' : 'ecos-filters-group__empty'}>{provided.placeholder}</div>
            </ul>
          )}
        </Droppable>
      </Well>
    );
  }
}
