import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';

import { getTextByLocale, t } from '../../../helpers/util';

import {
  COLUMN_DATA_TYPE_ASSOC,
  COLUMN_DATA_TYPE_AUTHORITY,
  COLUMN_DATA_TYPE_AUTHORITY_GROUP,
  COLUMN_DATA_TYPE_CATEGORY,
  COLUMN_DATA_TYPE_NODEREF,
  COLUMN_DATA_TYPE_TEXT
} from '../../common/form/SelectJournal/predicates';

const NOT_SORTABLE_TYPES = [
  COLUMN_DATA_TYPE_ASSOC,
  COLUMN_DATA_TYPE_AUTHORITY,
  COLUMN_DATA_TYPE_AUTHORITY_GROUP,
  COLUMN_DATA_TYPE_CATEGORY,
  COLUMN_DATA_TYPE_NODEREF
];

const GROUPABLE_TYPES = [
  COLUMN_DATA_TYPE_ASSOC,
  COLUMN_DATA_TYPE_AUTHORITY,
  COLUMN_DATA_TYPE_AUTHORITY_GROUP,
  COLUMN_DATA_TYPE_CATEGORY,
  COLUMN_DATA_TYPE_NODEREF,
  COLUMN_DATA_TYPE_TEXT
];

const DEFAULT_INNER_SCHEMA = ['disp:.disp'].join(',');

const getBoolOrElse = (value, orElse) => {
  if (value == null) {
    if (isFunction(orElse)) {
      return orElse();
    } else {
      return orElse;
    }
  }
  return value;
};

class JournalColumnsResolver {
  async resolve(columns) {
    if (!columns) {
      columns = [];
    }
    return columns.map(c => this._resolveColumn(c));
  }

  _resolveColumn(column) {
    const type = column.type || 'text';
    const name = column.name || column.attribute;
    const label = this._getColumnLabel(column);
    const multiple = column.multiple === true;

    const attribute = column.schema || column.attribute || column.name;
    const attSchema = attribute + (multiple ? '[]' : '') + '{' + (column.innerSchema || DEFAULT_INNER_SCHEMA) + '}';

    const editable = attribute === column.name && getBoolOrElse(column.editable, true);
    const searchable = getBoolOrElse(column.searchable, () => attribute === name);
    const sortable = getBoolOrElse(column.sortable, () => NOT_SORTABLE_TYPES.indexOf(type) === -1);
    const groupable = getBoolOrElse(column.groupable, () => GROUPABLE_TYPES.indexOf(type) === -1);
    const hidden = getBoolOrElse(column.hidden, false);
    const visible = getBoolOrElse(column.visible, () => getBoolOrElse(column.default, true));
    const defaultValue = getBoolOrElse(column['default'], true);

    const params = column.params || {};

    return {
      ...column,
      name,
      type,
      label,
      params,
      hidden,
      visible,
      editable,
      sortable,
      multiple,
      groupable,
      searchable,
      attribute,
      attSchema,
      text: label,
      dataField: name,
      default: defaultValue
    };
  }

  _getColumnLabel(column) {
    let label;
    if (column.label) {
      label = isObject(column.label) ? getTextByLocale(column.label) : column.label;
    }
    label = label || column.text || column.name;
    return label ? t(label) : t('journal.cell.no-label');
  }
}

const INSTANCE = new JournalColumnsResolver();
export default INSTANCE;
