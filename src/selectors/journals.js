import { createSelector } from 'reselect';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import { defaultState } from '../reducers/journals';

const selectState = (state, key) => get(state, ['journals', key], { ...defaultState }) || {};

export const selectJournalSettings = createSelector(
  selectState,
  ownState => get(ownState, 'journalSetting', defaultState.journalSetting)
);
export const selectJournals = createSelector(
  selectState,
  ownState => get(ownState, 'journals', [])
);

export const selectJournalUiType = createSelector(
  (journals, id) => journals.find(journal => journal.nodeRef === id),
  journal => get(journal, 'uiType')
);

export const selectUrl = (state, id) => get(state, ['journals', id, 'url']) || {};

export const selectJournalData = selectState;

export const selectJournalsListIds = createSelector(
  selectState,
  selectJournals,
  (ownState, journals) => {
    const journalsListIds = get(ownState, 'config.journalsListIds', []);

    if (isEmpty(journals)) {
      return [];
    }

    return journalsListIds.map(id => {
      return journals.find(item => item.type === id.substr(id.indexOf('@') + 1));
    });
  }
);
