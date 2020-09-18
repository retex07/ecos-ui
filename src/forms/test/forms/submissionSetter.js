import Harness from '../../test/harness';

const initData = {
  data: {
    container: {
      name: 'Alex',
      lastName: 'Blume',
      age: 15
    },
    submit: false
  },
  metadata: {}
};

export default {
  title: 'Submittion test.',
  form: {
    components: [
      {
        label: 'Container',
        mask: false,
        tableView: true,
        type: 'container',
        input: true,
        key: 'container',
        components: [
          {
            label: 'Name',
            allowMultipleMasks: false,
            showWordCount: false,
            showCharCount: false,
            tableView: true,
            type: 'textfield',
            input: true,
            key: 'name',
            widget: {
              type: ''
            },
            placeholder: '',
            prefix: '',
            customClass: '',
            suffix: '',
            multiple: false,
            defaultValue: null,
            protected: false,
            unique: false,
            persistent: true,
            hidden: false,
            clearOnHide: true,
            dataGridLabel: false,
            labelPosition: 'top',
            labelWidth: 30,
            labelMargin: 3,
            description: '',
            errorLabel: '',
            tooltip: '',
            hideLabel: false,
            tabindex: '',
            disabled: false,
            autofocus: false,
            dbIndex: false,
            customDefaultValue: '',
            calculateValue: '',
            refreshOn: '',
            clearOnRefresh: false,
            validateOn: 'change',
            validate: {
              required: false,
              custom: '',
              customPrivate: false,
              minLength: '',
              maxLength: '',
              minWords: '',
              maxWords: '',
              pattern: ''
            },
            conditional: {
              show: null,
              when: null,
              eq: ''
            },
            mask: false,
            inputType: 'text',
            inputMask: '',
            id: 'ecdnsr'
          },
          {
            columns: [
              {
                components: [
                  {
                    label: 'Last Name',
                    allowMultipleMasks: false,
                    showWordCount: false,
                    showCharCount: false,
                    tableView: true,
                    type: 'textfield',
                    input: true,
                    key: 'lastName',
                    widget: {
                      type: ''
                    },
                    placeholder: '',
                    prefix: '',
                    customClass: '',
                    suffix: '',
                    multiple: false,
                    defaultValue: null,
                    protected: false,
                    unique: false,
                    persistent: true,
                    hidden: false,
                    clearOnHide: true,
                    dataGridLabel: false,
                    labelPosition: 'top',
                    labelWidth: 30,
                    labelMargin: 3,
                    description: '',
                    errorLabel: '',
                    tooltip: '',
                    hideLabel: false,
                    tabindex: '',
                    disabled: false,
                    autofocus: false,
                    dbIndex: false,
                    customDefaultValue: '',
                    calculateValue: '',
                    refreshOn: '',
                    clearOnRefresh: false,
                    validateOn: 'change',
                    validate: {
                      required: false,
                      custom: '',
                      customPrivate: false,
                      minLength: '',
                      maxLength: '',
                      minWords: '',
                      maxWords: '',
                      pattern: ''
                    },
                    conditional: {
                      show: null,
                      when: null,
                      eq: ''
                    },
                    mask: false,
                    inputType: 'text',
                    inputMask: '',
                    id: 'entjs8'
                  }
                ],
                width: 6,
                offset: 0,
                push: 0,
                pull: 0,
                type: 'column',
                input: true,
                key: '',
                tableView: true,
                label: '',
                placeholder: '',
                prefix: '',
                customClass: '',
                suffix: '',
                multiple: false,
                defaultValue: null,
                protected: false,
                unique: false,
                persistent: true,
                hidden: false,
                clearOnHide: true,
                dataGridLabel: false,
                labelPosition: 'top',
                labelWidth: 30,
                labelMargin: 3,
                description: '',
                errorLabel: '',
                tooltip: '',
                hideLabel: false,
                tabindex: '',
                disabled: false,
                autofocus: false,
                dbIndex: false,
                customDefaultValue: '',
                calculateValue: '',
                widget: null,
                refreshOn: '',
                clearOnRefresh: false,
                validateOn: 'change',
                validate: {
                  required: false,
                  custom: '',
                  customPrivate: false
                },
                conditional: {
                  show: null,
                  when: null,
                  eq: ''
                },
                id: 'ejvq5sq'
              },
              {
                components: [
                  {
                    label: 'Age',
                    mask: false,
                    tableView: true,
                    type: 'number',
                    input: true,
                    key: 'age',
                    placeholder: '',
                    prefix: '',
                    customClass: '',
                    suffix: '',
                    multiple: false,
                    defaultValue: null,
                    protected: false,
                    unique: false,
                    persistent: true,
                    hidden: false,
                    clearOnHide: true,
                    dataGridLabel: false,
                    labelPosition: 'top',
                    labelWidth: 30,
                    labelMargin: 3,
                    description: '',
                    errorLabel: '',
                    tooltip: '',
                    hideLabel: false,
                    tabindex: '',
                    disabled: false,
                    autofocus: false,
                    dbIndex: false,
                    customDefaultValue: '',
                    calculateValue: '',
                    widget: null,
                    refreshOn: '',
                    clearOnRefresh: false,
                    validateOn: 'change',
                    validate: {
                      required: false,
                      custom: '',
                      customPrivate: false,
                      min: '',
                      max: '',
                      step: 'any',
                      integer: ''
                    },
                    conditional: {
                      show: null,
                      when: null,
                      eq: ''
                    },
                    id: 'etzejs8'
                  }
                ],
                width: 6,
                offset: 0,
                push: 0,
                pull: 0,
                type: 'column',
                input: true,
                key: '',
                tableView: true,
                label: '',
                placeholder: '',
                prefix: '',
                customClass: '',
                suffix: '',
                multiple: false,
                defaultValue: null,
                protected: false,
                unique: false,
                persistent: true,
                hidden: false,
                clearOnHide: true,
                dataGridLabel: false,
                labelPosition: 'top',
                labelWidth: 30,
                labelMargin: 3,
                description: '',
                errorLabel: '',
                tooltip: '',
                hideLabel: false,
                tabindex: '',
                disabled: false,
                autofocus: false,
                dbIndex: false,
                customDefaultValue: '',
                calculateValue: '',
                widget: null,
                refreshOn: '',
                clearOnRefresh: false,
                validateOn: 'change',
                validate: {
                  required: false,
                  custom: '',
                  customPrivate: false
                },
                conditional: {
                  show: null,
                  when: null,
                  eq: ''
                },
                id: 'e3h50ec'
              }
            ],
            label: 'Columns',
            mask: false,
            tableView: false,
            type: 'columns',
            input: false,
            key: 'columns',
            conditional: {
              show: '',
              when: '',
              json: '',
              eq: ''
            },
            customConditional: '',
            placeholder: '',
            prefix: '',
            customClass: '',
            suffix: '',
            multiple: false,
            defaultValue: null,
            protected: false,
            unique: false,
            persistent: false,
            hidden: false,
            clearOnHide: false,
            dataGridLabel: false,
            labelPosition: 'top',
            labelWidth: 30,
            labelMargin: 3,
            description: '',
            errorLabel: '',
            tooltip: '',
            hideLabel: false,
            tabindex: '',
            disabled: false,
            autofocus: false,
            dbIndex: false,
            customDefaultValue: '',
            calculateValue: '',
            widget: null,
            refreshOn: '',
            clearOnRefresh: false,
            validateOn: 'change',
            validate: {
              required: false,
              custom: '',
              customPrivate: false
            },
            autoAdjust: false,
            id: 'egl50l'
          }
        ],
        placeholder: '',
        prefix: '',
        customClass: '',
        suffix: '',
        multiple: false,
        defaultValue: null,
        protected: false,
        unique: false,
        persistent: true,
        hidden: false,
        clearOnHide: true,
        dataGridLabel: false,
        labelPosition: 'top',
        labelWidth: 30,
        labelMargin: 3,
        description: '',
        errorLabel: '',
        tooltip: '',
        hideLabel: false,
        tabindex: '',
        disabled: false,
        autofocus: false,
        dbIndex: false,
        customDefaultValue: '',
        calculateValue: '',
        widget: null,
        refreshOn: '',
        clearOnRefresh: false,
        validateOn: 'change',
        validate: {
          required: false,
          custom: '',
          customPrivate: false
        },
        conditional: {
          show: null,
          when: null,
          eq: ''
        },
        tree: true,
        id: 'enm95bq'
      },
      {
        type: 'button',
        label: 'Submit',
        key: 'submit',
        disableOnInvalid: true,
        theme: 'primary',
        input: true,
        tableView: true,
        placeholder: '',
        prefix: '',
        customClass: '',
        suffix: '',
        multiple: false,
        defaultValue: null,
        protected: false,
        unique: false,
        persistent: false,
        hidden: false,
        clearOnHide: true,
        dataGridLabel: true,
        labelPosition: 'top',
        labelWidth: 30,
        labelMargin: 3,
        description: '',
        errorLabel: '',
        tooltip: '',
        hideLabel: false,
        tabindex: '',
        disabled: false,
        autofocus: false,
        dbIndex: false,
        customDefaultValue: '',
        calculateValue: '',
        widget: null,
        refreshOn: '',
        clearOnRefresh: false,
        validateOn: 'change',
        validate: {
          required: false,
          custom: '',
          customPrivate: false
        },
        conditional: {
          show: null,
          when: null,
          eq: ''
        },
        size: 'md',
        leftIcon: '',
        rightIcon: '',
        block: false,
        action: 'submit',
        id: 'elaidi'
      }
    ]
  },
  tests: {
    'Should set submittion in form with container and layout components'(form, done) {
      Harness.testSubmission(form, initData);
      done();
    }
  }
};
