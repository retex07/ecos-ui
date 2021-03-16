import React from 'react';

import { t } from '../../../../../../helpers/export/util';
import { getBool } from '../../../../../../helpers/util';
import { Checkbox, Select } from '../../../../../common/form';
import BaseEditor from '../BaseEditor';

const Modes = { select: 'select', checkbox: 'checkbox' };

export default class BooleanEditor extends BaseEditor {
  static TYPE = 'boolean';

  getControl(config, scope) {
    return ({ value, onUpdate }) => {
      const mode = Modes.select;
      const _value = getBool(value);

      if (mode === Modes.checkbox) {
        return <Checkbox className="p-1" checked={_value} onChange={e => onUpdate(e.checked)} />;
      } else {
        const options = [
          { value: null, label: t('react-select.default-value.label') },
          { value: true, label: t('react-select.value-true.label') },
          { value: false, label: t('react-select.value-false.label') }
        ];

        return (
          <Select
            options={options}
            defaultValue={options.filter(item => item.value === _value) || options[0]}
            onChange={item => onUpdate(item.value)}
            isSearchable={false}
            className="select_narrow"
          />
        );
      }
    };
  }
}
