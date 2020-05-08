import _ from 'lodash';
import isEmpty from 'lodash/isEmpty';
import { evaluate as formioEvaluate } from 'formiojs/utils/utils';

import { SelectJournal } from '../../../../components/common/form';
import Records from '../../../../components/Records';
import EcosFormUtils from '../../../../components/EcosForm/EcosFormUtils';
import { Attributes } from '../../../../constants';
import BaseReactComponent from '../base/BaseReactComponent';
import { SortOrderOptions, TableTypes, DisplayModes } from './constants';
import GqlDataSource from '../../../../components/common/grid/dataSource';
import { trimFields } from '../../../../helpers/util';

export default class SelectJournalComponent extends BaseReactComponent {
  static schema(...extend) {
    return BaseReactComponent.schema(
      {
        label: 'SelectJournal',
        key: 'selectJournal',
        type: 'selectJournal',
        customPredicateJs: null,
        presetFilterPredicatesJs: null,
        hideCreateButton: false,
        hideEditRowButton: false,
        hideDeleteRowButton: false,
        isFullScreenWidthModal: false,
        isSelectedValueAsText: false,
        isTableMode: false,
        sortAttribute: Attributes.DBID,
        sortAscending: SortOrderOptions.ASC.value,
        source: {
          type: TableTypes.JOURNAL,
          viewMode: DisplayModes.DEFAULT
        }
      },
      ...extend
    );
  }

  static get builderInfo() {
    return {
      title: 'Select Journal',
      icon: 'fa fa-th-list',
      group: 'advanced',
      weight: 0,
      schema: SelectJournalComponent.schema()
    };
  }

  get defaultSchema() {
    return SelectJournalComponent.schema();
  }

  checkConditions(data) {
    let result = super.checkConditions(data);

    if (!this.component.customPredicateJs) {
      return result;
    }

    let customPredicate = this.evaluate(this.component.customPredicateJs, {}, 'value', true);
    if (!_.isEqual(customPredicate, this.customPredicateValue)) {
      this.customPredicateValue = customPredicate;
      this.updateReactComponent(component => component.setCustomPredicate(customPredicate));
    }

    return result;
  }

  getComponentToRender() {
    return SelectJournal;
  }

  _fetchAsyncProperties = source => {
    return new Promise(async resolve => {
      if (!source) {
        return resolve({ error: new Error('Empty source') });
      }

      if (source.type === 'custom') {
        const component = this.component;
        const record = this.getRecord();
        const attribute = this.getAttributeToEdit();
        const columns = await Promise.all(
          source.custom.columns.map(async item => {
            const col = { ...item };
            let additionalInfo = {};

            if (!col.type || !col.title) {
              additionalInfo = await record.load(`.edge(n:"${item.name}"){title,type,multiple}`);
            }

            if (item.formatter) {
              col.formatter = this.evaluate(item.formatter, {}, 'value', true);
            }

            return { ...col, ...additionalInfo };
          })
        );

        let customCreateVariants = null;

        if (component.customCreateVariantsJs) {
          try {
            customCreateVariants = this.evaluate(component.customCreateVariantsJs, {}, 'value', true);
          } catch (e) {
            console.error(e);
          }
        }

        let createVariantsPromise = Promise.resolve([]);

        if (customCreateVariants) {
          let fetchCustomCreateVariantsPromise;

          if (customCreateVariants.then) {
            fetchCustomCreateVariantsPromise = customCreateVariants;
          } else {
            fetchCustomCreateVariantsPromise = Promise.resolve(customCreateVariants);
          }

          createVariantsPromise = Promise.all(
            (await fetchCustomCreateVariantsPromise).map(variant => {
              if (_.isObject(variant)) {
                return variant;
              }

              return Records.get(variant)
                .load('.disp')
                .then(dispName => {
                  return {
                    recordRef: variant,
                    label: dispName
                  };
                });
            })
          );
        } else if (attribute) {
          createVariantsPromise = EcosFormUtils.getCreateVariants(record, attribute);
        }

        try {
          const createVariants = await createVariantsPromise;
          let columnsMap = {};
          let formatters = {};

          columns.forEach(item => {
            const key = `.edge(n:"${item.name}"){title,type,multiple}`;

            columnsMap[key] = item;

            if (item.formatter) {
              formatters[item.name] = item.formatter;
            }
          });

          let columnsInfoPromise;
          let inputsPromise;

          if (createVariants.length < 1 || columns.length < 1) {
            columnsInfoPromise = await Promise.all(
              columns.map(async item => {
                let data = item;
                const text = item.title ? this.t(item.title) : '';

                return {
                  default: true,
                  type: data.type,
                  text: text || data.title,
                  multiple: data.multiple,
                  attribute: data.name
                };
              })
            );
            inputsPromise = Promise.resolve({});
          } else {
            let cvRecordRef = createVariants[0].recordRef;
            columnsInfoPromise = Records.get(cvRecordRef)
              .load(Object.keys(columnsMap))
              .then(loadedAtt => {
                let cols = [];

                for (let i in columnsMap) {
                  if (!columnsMap.hasOwnProperty(i)) {
                    continue;
                  }

                  const originalColumn = columnsMap[i];
                  const isManualAttributes = originalColumn.setAttributesManually;

                  cols.push({
                    default: true,
                    type: isManualAttributes && originalColumn.type ? originalColumn.type : loadedAtt[i].type,
                    text: isManualAttributes ? this.t(originalColumn.title) : loadedAtt[i].title,
                    multiple: isManualAttributes ? originalColumn.multiple : loadedAtt[i].multiple,
                    attribute: originalColumn.name
                  });
                }

                return cols;
              });

            inputsPromise = EcosFormUtils.getRecordFormInputsMap(cvRecordRef);
          }

          Promise.all([columnsInfoPromise, inputsPromise])
            .then(columnsAndInputs => {
              let [columns, inputs] = columnsAndInputs;

              for (let column of columns) {
                let input = inputs[column.attribute] || {};
                let computedDispName = _.get(input, 'component.computed.valueDisplayName', '');

                if (computedDispName) {
                  //Is this filter required?
                  column.formatter = {
                    name: 'FormFieldFormatter',
                    params: input
                  };
                }

                if (formatters.hasOwnProperty(column.attribute)) {
                  column.formatter = formatters[column.attribute];
                }
              }

              resolve(GqlDataSource.getColumnsStatic(columns));
            })
            .catch(err => {
              console.error(err);
              columnsInfoPromise.then(columns => {
                resolve(GqlDataSource.getColumnsStatic(columns));
              });
            });
        } catch (e) {
          return resolve({ error: new Error(`Can't fetch create variants: ${e.message}`) });
        }
      } else {
        resolve();
      }
    });
  };

  prepareColumns = columns => {
    if (isEmpty(columns)) {
      return columns;
    }

    return trimFields(columns);
  };

  getInitialReactProps() {
    let resolveProps = (journalId, columns) => {
      const component = this.component;
      let presetFilterPredicates = null;

      if (component.presetFilterPredicatesJs) {
        presetFilterPredicates = this.evaluate(component.presetFilterPredicatesJs, {}, 'value', true);
      }

      const reactComponentProps = {
        columns: this.prepareColumns(columns),
        defaultValue: this.dataValue,
        isCompact: component.isCompact,
        multiple: component.multiple,
        placeholder: component.placeholder,
        disabled: component.disabled,
        journalId: journalId,
        onChange: this.onReactValueChanged,
        viewOnly: this.viewOnly,
        viewMode: component.source.viewMode,
        displayColumns: component.displayColumns,
        hideCreateButton: component.hideCreateButton,
        hideEditRowButton: component.hideEditRowButton,
        hideDeleteRowButton: component.hideDeleteRowButton,
        isSelectedValueAsText: component.isSelectedValueAsText,
        isFullScreenWidthModal: component.isFullScreenWidthModal,
        isInlineEditingMode: this._isInlineEditingMode,
        presetFilterPredicates,
        searchField: component.searchField,
        sortBy: {
          attribute: component.sortAttribute,
          ascending: component.sortAscending !== SortOrderOptions.DESC.value
        },
        computed: {
          valueDisplayName: value => SelectJournalComponent.getValueDisplayName(this.component, value)
        },
        onError: err => {
          // this.setCustomValidity(err, false);
        }
      };

      if (this.customPredicateValue) {
        reactComponentProps.initCustomPredicate = this.customPredicateValue;
      }

      return reactComponentProps;
    };

    let journalId = this.component.journalId;

    if (!journalId) {
      let attribute = this.getAttributeToEdit();

      return this.getRecord()
        .loadEditorKey(attribute)
        .then(editorKey => {
          return resolveProps(editorKey);
        })
        .catch(() => {
          return resolveProps(null);
        });
    } else {
      return this._fetchAsyncProperties(this.component.source).then(columns => resolveProps(journalId, columns));
    }
  }

  static getValueDisplayName = (component, value) => {
    let dispNameJs = _.get(component, 'computed.valueDisplayName', null);
    let result = null;

    if (dispNameJs) {
      let model = { _ };

      if (_.isString(value)) {
        let recordId = value[0] === '{' ? EcosFormUtils.initJsonRecord(value) : value;
        model.value = Records.get(recordId);
      } else {
        model.value = value;
      }

      result = formioEvaluate(dispNameJs, model, 'disp', true);
    } else {
      result = Records.get(value).load('.disp');
    }
    return result ? result : value;
  };
}
