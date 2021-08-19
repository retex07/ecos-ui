export const JOURNAL_SETTING_ID_FIELD = 'fileId';
export const JOURNAL_SETTING_DATA_FIELD = 'data';

export const DEFAULT_PAGINATION = {
  skipCount: 0,
  maxItems: 10,
  page: 1
};

export const PAGINATION_SIZES = [{ value: 10, label: 10 }, { value: 30, label: 30 }, { value: 50, label: 50 }, { value: 100, label: 100 }];

export const DEFAULT_INLINE_TOOL_SETTINGS = {
  height: 0,
  top: 0,
  left: 0,
  row: {},
  actions: []
};

export const JOURNAL_MIN_HEIGHT = 300;

export const JOURNAL_VIEW_MODE = {
  TABLE: 'table',
  PREVIEW: 'table-preview',
  DOC_LIB: 'document-library',
  KANBAN: 'kanban'
};

export const Labels = {
  J_SHOW_MENU: 'journals.action.show-menu',
  J_SHOW_MENU_SM: 'journals.action.show-menu_sm',
  DL_SHOW_MENU: 'journals.action.show-folder-tree',
  DL_SHOW_MENU_SM: 'journals.action.show-folder-tree_sm',
  KB_BAR_TOTAL: 'kanban.label.big-total',
  KB_COL_NO_CARD: 'kanban.label.no-card',

  V_JOURNAL: 'journals.view.label.journal',
  V_PREVIEW: 'journals.view.label.journal-preview',
  V_DOCLIB: 'journals.view.label.document-library',
  V_KANBAN: 'journals.view.label.kanban'
};

export const isTable = vm => vm === JOURNAL_VIEW_MODE.TABLE;
export const isPreview = vm => vm === JOURNAL_VIEW_MODE.PREVIEW;
export const isDocLib = vm => vm === JOURNAL_VIEW_MODE.DOC_LIB;
export const isKanban = vm => vm === JOURNAL_VIEW_MODE.KANBAN;
export const isTableOrPreview = vm => isTable(vm) || isPreview(vm);

export const JOURNAL_DASHLET_CONFIG_VERSION = 'v2';

export const COMPLEX_FILTER_LIMIT = 1;
