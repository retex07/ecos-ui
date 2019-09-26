import React from 'react';
import ReactDOM from 'react-dom';
import BaseComponent from '../base/BaseComponent';
import SelectOrgstruct from '../../../../components/common/form/SelectOrgstruct';
import { isNodeRef } from '../../../../helpers/util';
import isEqual from 'lodash/isEqual';
import Formio from 'formiojs/Formio';

import Records from '../../../../components/Records';

let authorityRefsByName = {};

export default class SelectOrgstructComponent extends BaseComponent {
  static schema(...extend) {
    return BaseComponent.schema(
      {
        label: 'SelectOrgstruct',
        key: 'selectOrgstruct',
        type: 'selectOrgstruct'
      },
      ...extend
    );
  }

  static get builderInfo() {
    return {
      title: 'Select Orgstruct',
      icon: 'fa fa-th-list',
      group: 'advanced',
      weight: 0,
      schema: SelectOrgstructComponent.schema()
    };
  }

  get defaultSchema() {
    return SelectOrgstructComponent.schema();
  }

  /**
   * Check if a component is eligible for multiple validation (Cause: https://citeck.atlassian.net/browse/ECOSCOM-2489)
   *
   * @return {boolean}
   */
  validateMultiple() {
    return false;
  }

  createViewOnlyValue(container) {
    this.reactContainer = this.ce('dd');
    container.appendChild(this.reactContainer);
    this.renderReactComponent();
  }

  build() {
    if (this.viewOnly) {
      return this.viewOnlyBuild();
    }

    this.restoreValue();

    this.createElement();

    const labelAtTheBottom = this.component.labelPosition === 'bottom';
    if (!labelAtTheBottom) {
      this.createLabel(this.element);
    }

    this.reactContainer = this.ce('div');
    this.element.appendChild(this.reactContainer);

    if (this.shouldDisable) {
      this.disabled = true;
    }

    this.errorContainer = this.element;
    this.createErrorElement();

    this.renderReactComponent();

    // this.setInputStyles(this.inputsContainer);

    if (labelAtTheBottom) {
      this.createLabel(this.element);
    }

    this.createDescription(this.element);

    // this.attachLogic();
  }

  renderReactComponent(config = {}) {
    let self = this;
    let component = this.component;
    let allUsersGroup = this.component.allUsersGroup;
    let allowedAuthorityType = this.component.allowedAuthorityType || '';
    let allowedGroupType = this.component.allowedGroupType || '';
    let allowedGroupSubType = this.component.allowedGroupSubType || '';
    const allowedAuthorityTypes = allowedAuthorityType.split(',').map(item => item.trim());
    const allowedGroupTypes = allowedGroupType.split(',').map(item => item.trim());

    allowedGroupSubType = allowedGroupSubType.trim();
    const allowedGroupSubTypes = allowedGroupSubType.length > 0 ? allowedGroupSubType.split(',').map(item => item.trim()) : [];

    const onChange = this.onValueChange.bind(this);

    let renderControl = function() {
      ReactDOM.render(
        <SelectOrgstruct
          defaultValue={self.dataValue}
          isCompact={component.isCompact}
          multiple={component.multiple}
          placeholder={component.placeholder}
          disabled={component.disabled}
          allUsersGroup={allUsersGroup}
          allowedAuthorityTypes={allowedAuthorityTypes}
          allowedGroupTypes={allowedGroupTypes}
          allowedGroupSubTypes={allowedGroupSubTypes}
          onChange={onChange}
          viewOnly={self.viewOnly}
          onError={err => {
            // this.setCustomValidity(err, false);
          }}
        />,
        self.reactContainer
      );
    };

    renderControl();
  }

  refreshDOM() {
    if (this.reactContainer) {
      this.renderReactComponent();
    }
  }

  onValueChange(value) {
    this.dataValue = value;
    this.triggerChange();
    this.refreshDOM();
  }

  get emptyValue() {
    return this.component.multiple ? [] : '';
  }

  getValue() {
    return this.dataValue;
  }

  _getAuthorityRef(authority, callback) {
    this._requestedAuthority = authority;
    let self = this;

    if (!authority) {
      callback(authority);
      return;
    }

    if (isNodeRef(authority)) {
      callback(authority);
      return;
    }

    let cacheValue = authorityRefsByName[authority];
    if (cacheValue) {
      if (cacheValue.then) {
        cacheValue.then(record => {
          if (isNodeRef(record)) {
            authorityRefsByName[authority] = record;
            if (self._requestedAuthority === authority) {
              callback(record);
            }
          } else {
            authorityRefsByName[authority] = null;
          }
        });
      } else {
        callback(cacheValue);
      }
      return;
    }

    let query = {
      language: 'fts-alfresco'
    };
    if (authority.indexOf('GROUP_') === 0) {
      query.query = '=cm:authorityName:"' + authority + '"';
    } else {
      query.query = '=cm:userName:"' + authority + '"';
    }

    authorityRefsByName[authority] = Records.queryOne(query);

    this._getAuthorityRef(authority, callback);
  }

  setValue(value, flags) {
    if (isEqual(value, this.emptyValue) && this.component.currentUserByDefault && !this.viewOnly && this.options.formMode === 'CREATE') {
      if (Array.isArray(value)) {
        value = [Formio.getUser()];
      } else {
        value = Formio.getUser();
      }
    }

    if (isEqual(value, this.dataValue)) {
      return null;
    }

    let self = this;

    let setValueImpl = function(value) {
      if (self.reactContainer && value !== self.dataValue) {
        ReactDOM.unmountComponentAtNode(self.reactContainer);
      }

      self.dataValue = value || self.component.defaultValue || self.emptyValue;
      self.refreshDOM();

      return self.updateValue(flags);
    };

    if (Array.isArray(value)) {
      let promises = [];
      for (let auth of value) {
        promises.push(
          new Promise(resolve => {
            this._getAuthorityRef(auth, resolve);
          })
        );
      }
      Promise.all(promises).then(values => {
        setValueImpl(values);
      });
    } else {
      this._getAuthorityRef(value, setValueImpl);
    }
  }
}
