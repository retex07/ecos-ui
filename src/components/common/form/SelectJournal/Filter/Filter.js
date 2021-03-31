import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import { t } from '../../../../../helpers/util';
import Select from '../../../../common/form/Select';
import EditorService from '../../../../Journals/service/editors/EditorService';
import EditorScope from '../../../../Journals/service/editors/EditorScope';

import './Filter.scss';

const Filter = ({
  idx,
  text,
  predicates,
  selectedPredicate,
  onRemove,
  changePredicate,
  predicateValue,
  changePredicateValue,
  applyFilters,
  item
}) => {
  const isShow = get(selectedPredicate, 'needValue', true);
  const FilterValueComponent = React.memo(({ item }) => {
    return EditorService.getEditorControl({
      attribute: item.attribute,
      editor: item.newEditor,
      value: predicateValue,
      scope: EditorScope.FILTER,
      onUpdate: changePredicateValue,
      onKeyDown: applyFilters
    });
  });

  return (
    <li className="select-journal-filter">
      <div className="select-journal-filter__left" title={t(text)}>
        {t(text)}
      </div>
      <div className="select-journal-filter__right">
        <div className="select-journal-filter__predicate">
          <Select
            className={'select_narrow select-journal-filter__predicate-select'}
            options={predicates}
            value={selectedPredicate}
            data-idx={idx}
            onChange={changePredicate}
          />
          <div className="select-journal-filter__predicate-control">{isShow && <FilterValueComponent item={item} />}</div>
        </div>
        <span data-idx={idx} className={'icon icon-delete select-journal-filter__remove-btn'} onClick={onRemove} />
      </div>
    </li>
  );
};

Filter.propTypes = {
  text: PropTypes.string
};

export default Filter;
