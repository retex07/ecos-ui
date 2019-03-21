export default [
  {
    type: 'datagrid',
    input: true,
    label: 'Documents',
    key: 'documents',
    tooltip: 'The questions you would like to ask in this survey question.',
    weight: 50,
    defaultValue: [{ label: '', value: '' }],
    components: [
      {
        label: 'Label',
        key: 'label',
        input: true,
        type: 'textfield'
      },
      {
        label: 'Value',
        key: 'value',
        input: true,
        type: 'textfield',
        allowCalculateOverride: true,
        calculateValue: { _camelCase: [{ var: 'row.label' }] }
      }
    ]
  }
];
