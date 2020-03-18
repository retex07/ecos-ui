import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Formio from 'formiojs/Formio';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';

import '../../forms';
import CustomEventEmitter from '../../forms/EventEmitter';
import { getCurrentLocale, isMobileDevice, t } from '../../helpers/util';
import { PROXY_URI } from '../../constants/alfresco';
import Records from '../Records';
import EcosFormBuilder from './builder/EcosFormBuilder';
import EcosFormBuilderModal from './builder/EcosFormBuilderModal';
import EcosFormUtils from './EcosFormUtils';

import './formio.full.min.css';
import './glyphicon-to-fa.scss';
import '../../forms/style.scss';

export const FORM_MODE_CREATE = 'CREATE';
export const FORM_MODE_EDIT = 'EDIT';

let formCounter = 0;

class EcosForm extends React.Component {
  _formBuilderModal = React.createRef();
  _form = null;

  constructor(props) {
    super(props);

    let record = Records.getRecordToEdit(this.props.record);

    this.state = {
      containerId: 'ecos-ui-form-' + formCounter++,
      recordId: record.id,
      ...this.initState
    };
  }

  componentWillUnmount() {
    Records.releaseAll(this.state.containerId);
    if (this._form) {
      this._form.destroy();
    }
  }

  componentDidMount() {
    this.initForm();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.formId !== this.props.formId) {
      this.setState({ ...this.initState });
      this.initForm();
    }
  }

  get initState() {
    return {
      formId: 'eform@',
      error: null,
      formDefinition: {}
    };
  }

  initForm(newFormDefinition = this.state.formDefinition) {
    const { record, formKey, options: propsOptions, formId, getTitle } = this.props;
    const { recordId, containerId } = this.state;
    const self = this;
    const options = cloneDeep(propsOptions);
    const attributes = {
      definition: 'definition?json',
      customModule: 'customModule',
      title: 'title',
      i18n: 'i18n?json'
    };

    let formLoadingPromise;
    let alfConstants = (window.Alfresco || {}).constants || {};
    let proxyUri = PROXY_URI || '/';

    if (formId) {
      formLoadingPromise = EcosFormUtils.getFormById(formId, attributes);
    } else {
      formLoadingPromise = EcosFormUtils.getForm(record, formKey, attributes);
    }

    options.recordId = recordId;
    options.isMobileDevice = isMobileDevice();

    proxyUri = proxyUri.substring(0, proxyUri.length - 1);
    Formio.setProjectUrl(proxyUri);

    if (alfConstants.USERNAME) {
      Formio.setUser(alfConstants.USERNAME);
    }

    const onFormLoadingFailure = () => {
      self.setState({ error: new Error(t('ecos-form.empty-form-data')) });
      self.props.onReady && self.props.onReady();
    };

    formLoadingPromise.then(formData => {
      if (formData && formData.title) {
        getTitle && getTitle(formData.title);
      }

      if (!formData || !formData.definition) {
        onFormLoadingFailure();
        return null;
      }

      const customModulePromise = new Promise(function(resolve) {
        if (formData.customModule) {
          window.require([formData.customModule], function(Module) {
            resolve(new Module.default({ recordId }));
          });
        } else {
          resolve({});
        }
      });
      const inputs = EcosFormUtils.getFormInputs(formData.definition);
      const recordDataPromise = EcosFormUtils.getData(recordId, inputs, containerId);
      const isDebugModeOn = localStorage.getItem('enableLoggerForNewForms');

      let canWritePromise = false;

      if (options.readOnly && options.viewAsHtml) {
        canWritePromise = EcosFormUtils.hasWritePermission(recordId);
      }

      if (isDebugModeOn) {
        options.isDebugModeOn = isDebugModeOn;
      }

      Promise.all([recordDataPromise, canWritePromise]).then(([recordData, canWrite]) => {
        if (canWrite) {
          options.canWrite = canWrite;
        }

        const definition = Object.keys(newFormDefinition).length ? newFormDefinition : formData.definition;
        const formDefinition = cloneDeep(definition);
        const attributesTitles = {};

        this.setState({ formDefinition });

        EcosFormUtils.forEachComponent(formDefinition, component => {
          const edgeData = recordData.edges[component.key] || {};

          if (component.key) {
            if (edgeData.protected) {
              component.disabled = true;
            }
            if (edgeData.title) {
              attributesTitles[component.label] = edgeData.title;
            }
          }
        });

        const i18n = options.i18n || {};
        const language = options.language || getCurrentLocale();
        const defaultI18N = i18n[language] || {};
        const formI18N = (formData.i18n || {})[language] || {};

        i18n[language] = EcosFormUtils.getI18n(defaultI18N, attributesTitles, formI18N);
        options.language = language;
        options.i18n = i18n;
        options.events = new CustomEventEmitter({
          wildcard: false,
          maxListeners: 0,
          loadLimit: 200,
          onOverload: () => {
            if (self._form) {
              self._form.showErrors('Infinite loop detected');
            }
          }
        });

        const containerElement = document.getElementById(containerId);

        if (!containerElement) {
          return;
        }

        const formPromise = Formio.createForm(containerElement, formDefinition, options);

        Promise.all([formPromise, customModulePromise]).then(formAndCustom => {
          const form = formAndCustom[0];
          const customModule = formAndCustom[1];
          const handlersPrefix = 'onForm';

          self._form = form;

          form.ecos = { custom: customModule };

          if (customModule.init) {
            customModule.init({ form });
          }

          form.submission = {
            data: {
              ...(self.props.attributes || {}),
              ...recordData.submission
            }
          };

          form.on('submit', submission => {
            self.submitForm(form, submission);
          });

          for (const key in self.props) {
            if (self.props.hasOwnProperty(key) && key.startsWith(handlersPrefix)) {
              const event = key.slice(handlersPrefix.length).toLowerCase();

              if (event !== 'submit') {
                form.on(event, () => {
                  self.props[key].apply(form, arguments);
                });
              } else {
                console.warn('Please use onSubmit handler instead of onFormSubmit');
              }
            }
          }

          self.setState({ formId: formData.id });

          if (self.props.onReady) {
            self.props.onReady(form);
          }
        });
      });
    }, onFormLoadingFailure);
  }

  fireEvent(event, data) {
    let handlerName = 'on' + event.charAt(0).toUpperCase() + event.slice(1);

    if (this.props[handlerName]) {
      this.props[handlerName](data);
    }
  }

  onShowFormBuilder = callback => {
    if (this._formBuilderModal.current) {
      const { formDefinition, formId } = this.state;

      this._formBuilderModal.current.show(formDefinition, form => {
        EcosFormUtils.saveFormBuilder(form, formId).then(() => {
          this.initForm(form);
          this.props.onFormSubmitDone();
          typeof callback === 'function' && callback(form);
        });
      });
    }
  };

  submitForm = debounce(
    (form, submission) => {
      const self = this;
      const { recordId, containerId } = this.state;
      const inputs = EcosFormUtils.getFormInputs(form.component);
      const allComponents = form.getAllComponents();
      const keysMapping = EcosFormUtils.getKeysMapping(inputs);
      const inputByKey = EcosFormUtils.getInputByKey(inputs);
      const record = Records.get(recordId);

      if (submission.state) {
        record.att('_state', submission.state);
      }

      for (const key in submission.data) {
        if (submission.data.hasOwnProperty(key)) {
          const input = inputByKey[key];

          let value = submission.data[key];

          if (input && input.type === 'horizontalLine') {
            continue;
          }

          value = EcosFormUtils.processValueBeforeSubmit(value, input, keysMapping);

          const attName = keysMapping[key] || key;

          const currentComponent = allComponents.find(item => get(item, 'component.key', '') === key);
          if (!currentComponent || EcosFormUtils.isOutcomeButton(currentComponent.component)) {
            record.att(attName, value);
          } else {
            const isPersistent = get(currentComponent, 'component.persistent', true);
            switch (isPersistent) {
              case true:
                record.att(attName, value);
                break;
              case 'client-only':
                record.persistedAtt(attName, value);
                break;
              default:
                record.removeAtt(attName);
            }
          }
        }
      }

      const onSubmit = (persistedRecord, form, record) => {
        Records.releaseAll(containerId);

        if (self.props.onSubmit) {
          self.props.onSubmit(persistedRecord, form, record);
        }
      };

      const resetOutcomeButtonsValues = () => {
        const allComponents = form.getAllComponents();
        const outcomeButtonsKeys = [];

        allComponents.forEach(item => {
          if (EcosFormUtils.isOutcomeButton(item.component)) {
            outcomeButtonsKeys.push(item.component.key);
          }
        });

        for (const field in form.data) {
          if (!form.data.hasOwnProperty(field)) {
            continue;
          }

          if (outcomeButtonsKeys.includes(field)) {
            form.data[field] = undefined;
          }
        }
      };

      if (this.props.saveOnSubmit !== false) {
        record
          .save()
          .then(persistedRecord => {
            onSubmit(persistedRecord, form, record);
          })
          .catch(e => {
            form.showErrors(e, true);
            resetOutcomeButtonsValues();
          });
      } else {
        onSubmit(record, form);
      }
    },
    3000,
    {
      leading: true,
      trailing: false
    }
  );

  onReload() {
    this.initForm({});
  }

  render() {
    const { className } = this.props;
    const { error, containerId } = this.state;

    if (error) {
      return <div className={classNames('ecos-ui-form__error', className)}>{error.message}</div>;
    }

    return (
      <>
        <div className={classNames(className)} id={containerId} />
        <EcosFormBuilderModal ref={this._formBuilderModal} />
      </>
    );
  }
}

EcosForm.propTypes = {
  record: PropTypes.string,
  attributes: PropTypes.object,
  options: PropTypes.object,
  formKey: PropTypes.string,
  formId: PropTypes.string,
  onSubmit: PropTypes.func,
  onReady: PropTypes.func, // Form ready, but not rendered yet
  onFormCancel: PropTypes.func,
  // See https://github.com/formio/formio.js/wiki/Form-Renderer#events
  onFormSubmitDone: PropTypes.func,
  onFormChange: PropTypes.func,
  onFormRender: PropTypes.func,
  onFormPrevPage: PropTypes.func,
  onFormNextPage: PropTypes.func,
  // -----
  saveOnSubmit: PropTypes.bool,
  className: PropTypes.string
};

EcosForm.defaultProps = {
  className: '',
  builderModalIsShow: false,
  options: {}
};

export default EcosForm;
export { EcosForm, EcosFormBuilder, EcosFormBuilderModal };
