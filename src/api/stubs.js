import uuid from 'uuidv4';

export class DocumentsApiRequests {
  static getDocumentTypes = () => ({
    records: [
      {
        id: 'emodel/type@contracts-cat-doctype-payment',
        parent: 'emodel/type@base',
        name: 'Счет'
      },
      {
        id: 'emodel/type@base',
        parent: null,
        name: 'Базовый тип'
      },
      {
        id: 'emodel/type@uchdoc',
        parent: null,
        name: 'Учетный документ'
      },
      {
        id: 'emodel/type@act',
        parent: 'emodel/type@uchdoc',
        name: 'Акт'
      },
      {
        id: 'emodel/type@n',
        parent: 'emodel/type@uchdoc',
        name: 'Накладная'
      },
      {
        id: 'emodel/type@sf',
        parent: 'emodel/type@uchdoc',
        name: 'Счёт-фактура'
      },
      {
        id: 'emodel/type@bpmn',
        parent: null,
        name: 'BPM Процесс'
      },
      {
        id: 'emodel/type@sf1',
        parent: 'emodel/type@sf',
        name: 'Счёт-фактура #1'
      },
      {
        id: 'emodel/type@sf2',
        parent: 'emodel/type@sf',
        name: 'Счёт-фактура #2'
      },
      {
        id: 'emodel/type@sf3',
        parent: 'emodel/type@sf',
        name: 'Счёт-фактура #3'
      },
      {
        id: 'emodel/type@sf3_1',
        parent: 'emodel/type@sf3',
        name: 'Счёт-фактура #3 part #1'
      },
      {
        id: 'emodel/type@sf3_2',
        parent: 'emodel/type@sf3',
        name: 'Счёт-фактура #3 part #2'
      },
      {
        id: 'emodel/type@sf3_2_1',
        parent: 'emodel/type@sf3_2',
        name: 'Счёт-фактура #3 part #2 item #1'
      }
    ],
    errors: [],
    hasMore: false,
    totalCount: 2
  });

  static getDynamicTypes = () => ({
    records: [
      {
        id: 'alfresco/documents@123',
        type: 'emodel/type@base',
        multiple: true,
        mandatory: false
      },
      {
        id: 'alfresco/documents@125',
        type: 'emodel/type@contracts-cat-doctype-payment',
        multiple: true,
        mandatory: false
      }
    ],
    errors: [],
    hasMore: false,
    totalCount: 2
  });

  static getCountDocumentsByTypes = () => ({
    records: [[], ['alfresco/@workspace://SpacesStore/bcdcee26-c1ee-429e-927b-ef2a721790de']],
    errors: [],
    hasMore: false,
    totalCount: 2
  });

  static getDocumentsByType = () => {
    const documents = [
      {
        id: 'alfresco/@workspace://SpacesStore/123',
        loadedBy: 'Сергей Сергеевич',
        modified: '2019-01-01T00:00:00Z'
      },
      {
        id: 'alfresco/@workspace://SpacesStore/456',
        loadedBy: 'Сергей Сергеевич',
        modified: '2019-02-02T20:20:20Z'
      },
      {
        id: 'alfresco/@workspace://SpacesStore/789',
        loadedBy: 'Иван Иванович',
        modified: '2019-03-02T20:20:20Z'
      },
      {
        id: 'alfresco/@workspace://SpacesStore/101',
        loadedBy: 'Василий Петрович',
        modified: '2019-04-02T20:20:20Z'
      }
    ];
    const count = Math.random() * documents.length;

    return {
      records: documents.slice(0, count),
      errors: [],
      hasMore: false,
      totalCount: 2
    };
  };

  static getFormIdByType = () => {
    return `uiserv/eform@${uuid()}`;
  };
}
