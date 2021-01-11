import AdminSectionService from '../AdminSectionService';

const groupSectionList = [
  {
    label: 'Управление системой',
    sections: [{ label: 'Инструменты разработчика', type: 'DEV_TOOLS', config: {} }]
  },
  {
    label: 'Управление процессами',
    sections: [{ label: 'Модели бизнес-процессов', type: 'BPM', config: {} }]
  },
  {
    label: 'Модель',
    sections: [{ label: 'Типы данных', type: 'JOURNAL', config: { journalId: 'ecos-types' } }]
  }
];

describe('AdminSection Service', () => {
  const BPM = { label: 'Модели бизнес-процессов', type: 'BPM', config: {} };

  describe('Method getSelectedSectionIndex', () => {
    it('found active in section', () => {
      const returnValue = AdminSectionService.getSelectedSectionIndex(groupSectionList[1].sections, BPM);
      expect(returnValue).toEqual(0);
    });

    it('no active in section', () => {
      const returnValue = AdminSectionService.getSelectedSectionIndex(groupSectionList[1].sections, undefined);
      expect(returnValue).toEqual(-1);
    });

    it('no section', () => {
      const returnValue = AdminSectionService.getSelectedSectionIndex(null, BPM);
      expect(returnValue).toEqual(-1);
    });
  });

  describe('Method getActiveSectionInGroups', () => {
    it('was found', () => {
      const returnValue = AdminSectionService.getActiveSectionInGroups(groupSectionList, i => i.type === BPM.type);
      expect(returnValue).toEqual(BPM);
    });

    it('unknown', () => {
      const returnValue = AdminSectionService.getActiveSectionInGroups(groupSectionList, i => i.type === null);
      expect(returnValue).toBeUndefined();
    });

    it('no groups', () => {
      const returnValue = AdminSectionService.getActiveSectionInGroups(null, i => i.type === null);
      expect(returnValue).toBeUndefined();
    });
  });
});
