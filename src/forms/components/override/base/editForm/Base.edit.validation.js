import BaseEditValidation from 'formiojs/components/base/editForm/Base.edit.validation';

import { t } from '../../../../../helpers/export/util';

BaseEditValidation.push({
  type: 'checkbox',
  input: true,
  weight: 1,
  clearOnHide: true,
  key: 'optionalWhenDisabled',
  label: 'Optional when disabled',
  tooltip: 'Allow form saving if the field at once disabled, required and empty'
});

const customConditional = BaseEditValidation.find(item => item.key === 'custom-validation-js');

if (customConditional) {
  customConditional.components = [
    {
      type: 'htmlelement',
      tag: 'div',
      get content() {
        return t('form-constructor.html.htmlelement1', { additional: t('form-constructor.html.input') });
      }
    },
    {
      type: 'textarea',
      key: 'validate.custom',
      rows: 5,
      editor: 'ace',
      hideLabel: true,
      input: true
    },
    {
      type: 'htmlelement',
      tag: 'div',
      get content() {
        return t('form-constructor.html.custom-validation-code');
      }
    },
    {
      type: 'well',
      components: [
        {
          weight: 100,
          type: 'checkbox',
          get label() {
            return t('form-constructor.html.secret-validation.label');
          },
          get tooltip() {
            return t('form-constructor.html.secret-validation.description');
          },
          get description() {
            return t('form-constructor.html.secret-validation.description');
          },
          key: 'validate.customPrivate',
          input: true
        }
      ]
    }
  ];
}

export default BaseEditValidation;
