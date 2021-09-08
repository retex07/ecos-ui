import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ReactResizeDetector from 'react-resize-detector';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import merge from 'lodash/merge';

import {
  applyJournalSetting,
  createJournalSetting,
  execJournalAction,
  execRecordsAction,
  getJournalsData,
  onJournalSettingsSelect,
  reloadGrid,
  restoreJournalSettingData,
  runSearch,
  saveJournalSetting,
  setGrid,
  setSelectAllRecords,
  setSelectedRecords,
  setUrl
} from '../../actions/journals';
import { selectDocLibFolderTitle, selectIsDocLibEnabled } from '../../selectors/docLib';
import { selectSettingsColumns, selectSettingsData, selectSettingsFilters, selectSettingsGrouping } from '../../selectors/journals';
import { JournalUrlParams as JUP, SourcesId } from '../../constants';
import { animateScrollTo, getBool, getScrollbarWidth, objectCompare, t } from '../../helpers/util';
import { equalsQueryUrls, getSearchParams, goToCardDetailsPage, removeUrlSearchParams, updateCurrentUrl } from '../../helpers/urls';
import { wrapArgs } from '../../helpers/redux';
import { showModalJson } from '../../helpers/tools';
import FormManager from '../EcosForm/FormManager';
import { ActionTypes } from '../Records/actions';

import { JOURNAL_MIN_HEIGHT, JOURNAL_VIEW_MODE } from './constants';
import JournalsDashletPagination from './JournalsDashletPagination';
import JournalsMenu from './JournalsMenu';
import JournalsSettingsBar from './JournalsSettingsBar';
import JournalsHead from './JournalsHead';
import JournalsContent from './JournalsContent';
import SettingsModal from './SettingsModal';
import { JournalsGroupActionsTools } from './JournalsTools';
import DocLibBreadcrumbs from './DocLib/DocLibBreadcrumbs';
import DocLibSettingsBar from './DocLib/DocLibSettingsBar';
import DocLibPagination from './DocLib/DocLibPagination';
import DocLibGroupActions from './DocLib/DocLibGroupActions';
import FilesViewer from './DocLib/FilesViewer';

import './Journals.scss';

const mapStateToProps = (state, props) => {
  const newState = state.journals[props.stateId] || {};

  return {
    isAdmin: get(state, 'user.isAdmin'),
    isMobile: get(state, 'view.isMobile'),
    pageTabsIsShow: get(state, 'pageTabs.isShow'),
    journalConfig: newState.journalConfig,
    journalSetting: newState.journalSetting,
    predicate: newState.predicate,
    gridPredicates: get(newState, 'grid.predicates', []),
    grid: newState.grid,
    selectedRecords: newState.selectedRecords,
    selectAllRecords: newState.selectAllRecords,
    selectAllRecordsVisible: newState.selectAllRecordsVisible,
    isLoading: newState.loading,
    urlParams: newState.url,
    _url: window.location.href,
    isDocLibEnabled: selectIsDocLibEnabled(state, props.stateId),
    docLibFolderTitle: selectDocLibFolderTitle(state, props.stateId),

    settingsFiltersData: selectSettingsFilters(state, props.stateId),
    settingsColumnsData: selectSettingsColumns(state, props.stateId),
    settingsGroupingData: selectSettingsGrouping(state, props.stateId),
    settingsData: selectSettingsData(state, props.stateId)
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const w = wrapArgs(props.stateId);

  return {
    setSelectedRecords: records => dispatch(setSelectedRecords(w(records))),
    setSelectAllRecords: need => dispatch(setSelectAllRecords(w(need))),
    execRecordsAction: (records, action, context) => dispatch(execRecordsAction(w({ records, action, context }))),
    execJournalAction: (records, action, context) => dispatch(execJournalAction(w({ records, action, context }))),
    getJournalsData: options => dispatch(getJournalsData(w(options))),
    reloadGrid: () => dispatch(reloadGrid(w({}))),
    runSearch: text => dispatch(runSearch({ text, stateId: props.stateId })),
    clearSearch: () => dispatch(setGrid({ search: '', stateId: props.stateId })),
    restoreJournalSettingData: setting => dispatch(restoreJournalSettingData(w(setting))),
    setUrl: urlParams => dispatch(setUrl(w(urlParams))),
    onJournalSettingsSelect: id => dispatch(onJournalSettingsSelect(w(id))),
    applySettings: settings => dispatch(applyJournalSetting(w(settings))),
    createJournalSetting: (journalId, settings) => dispatch(createJournalSetting(w({ journalId, settings }))),
    saveJournalSetting: (id, settings) => dispatch(saveJournalSetting(w({ id, settings })))
  };
};

const defaultDisplayElements = {
  menu: true,
  header: true,
  settings: true,
  pagination: true,
  groupActions: true,
  editJournal: true
};

const Labels = {
  J_SHOW_MENU: 'journals.action.show-menu',
  J_SHOW_MENU_SM: 'journals.action.show-menu_sm',
  DL_SHOW_MENU: 'journals.action.show-folder-tree',
  DL_SHOW_MENU_SM: 'journals.action.show-folder-tree_sm'
};

class Journals extends React.Component {
  _journalRef = null;
  _journalBodyRef = null;
  _beforeJournalBlockRef = null;
  _journalFooterRef = null;
  _journalMenuRef = null;
  _toggleMenuTimerId = null;

  constructor(props) {
    super(props);

    this.state = {
      menuOpen: false,
      isReset: false,
      isForceUpdate: false,
      menuOpenAnimate: false,
      settingsVisible: false,
      createIsLoading: false,
      savedSetting: null,
      showPreview: getBool(get(getSearchParams(), JUP.SHOW_PREVIEW)),
      viewMode: getBool(get(getSearchParams(), JUP.VIEW_MODE))
    };
  }

  static getDerivedStateFromProps(props, state) {
    let newState = {};
    const journalId = get(props, ['urlParams', JUP.JOURNAL_ID]);

    if (props.isActivePage && journalId !== state.journalId) {
      newState = merge(newState, { journalId });
    }

    if (
      !state.isReset &&
      state.settingsVisible &&
      state.savedSetting &&
      !objectCompare(props.predicate, get(state, 'savedSetting.predicate', {}))
    ) {
      const savedSetting = merge(state.savedSetting, { predicate: props.predicate });
      newState = merge(newState, { savedSetting });
    }

    if (!newState) {
      return null;
    }

    return newState;
  }

  componentDidMount() {
    this.props.setUrl(getSearchParams());
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { _url, urlParams, stateId, isActivePage, isLoading, getJournalsData, reloadGrid, setUrl } = this.props;
    const {
      journalId: stateJournalId,
      showPreview: stateShowPreview,
      viewMode: stateViewMode,
      isForceUpdate: stateIsForceUpdate
    } = this.state;

    const prevJournalId = get(prevProps.urlParams, JUP.JOURNAL_ID);
    const newJournalId = get(urlParams, JUP.JOURNAL_ID);
    const urlShowPreview = getBool(get(getSearchParams(), JUP.SHOW_PREVIEW));
    const urlViewMode = get(getSearchParams(), JUP.VIEW_MODE);

    let newState;
    let newUrl;

    const isNewJournalOnActive =
      isActivePage &&
      ((prevProps.isActivePage && newJournalId && newJournalId !== prevJournalId) || stateJournalId !== prevState.journalId);

    const isEqualQuery = equalsQueryUrls({
      urls: [_url, prevProps._url],
      ignored: [JUP.SHOW_PREVIEW, JUP.VIEW_MODE, JUP.DOCLIB_FOLDER_ID, JUP.DOCLIB_SEARCH]
    });

    const isActiveChanged = newJournalId && isActivePage && prevProps.isActivePage && !isEqualQuery;

    if (isActiveChanged || prevProps.stateId !== stateId) {
      setUrl(getSearchParams());
    }

    if (newJournalId && (isNewJournalOnActive || prevProps.stateId !== stateId)) {
      getJournalsData();
    }

    const isSameSearchParam = equalsQueryUrls({ urls: [_url, prevProps._url], compareBy: [JUP.SEARCH] });

    if ((isActivePage && stateIsForceUpdate) || (isActiveChanged && !isSameSearchParam)) {
      newState = merge(newState, { isForceUpdate: false });
      reloadGrid();
    }

    if (prevProps.isActivePage && !isActivePage && isLoading) {
      newState = merge(newState, { isForceUpdate: true });
    }

    if (isActivePage && urlShowPreview !== stateShowPreview) {
      newUrl = merge(newUrl, { showPreview: stateShowPreview });
    }

    if (isActivePage && urlViewMode !== stateViewMode) {
      newUrl = merge(newUrl, { viewMode: stateViewMode });
    }

    newState && this.setState(newState);
    newUrl && updateCurrentUrl(newUrl);
  }

  componentWillUnmount() {
    this.onForceUpdate.cancel();
    this.setHeight.cancel();
    this.onEditJournal.cancel();

    if (this._toggleMenuTimerId) {
      window.clearTimeout(this._toggleMenuTimerId);
      this._toggleMenuTimerId = null;
    }
  }

  get isOpenGroupActions() {
    const { grid, selectedRecords, selectAllRecords } = this.props;

    if (isEmpty(selectedRecords) && !selectAllRecords) {
      return false;
    }

    const forRecords = get(grid, 'actions.forRecords', {});
    const forQuery = get(grid, 'actions.forQuery', {});
    const groupActions = (selectAllRecords ? forQuery.actions : forRecords.actions) || [];

    return !isEmpty(groupActions);
  }

  get displayElements() {
    return {
      ...defaultDisplayElements,
      ...(this.props.displayElements || {}),
      editJournal: get(this.props, 'displayElements.editJournal', true) && this.props.isAdmin && get(this.props, 'journalConfig.id')
    };
  }

  get isDocLibMode() {
    const { viewMode } = this.state;

    return viewMode === JOURNAL_VIEW_MODE.DOC_LIB;
  }

  setJournalRef = ref => {
    if (ref) {
      this._journalRef = ref;
    }
  };

  setJournalBodyRef = ref => {
    if (ref) {
      this._journalBodyRef = ref;
    }
  };

  setJournalBodyGroupRef = ref => {
    if (ref) {
      this._beforeJournalBlockRef = ref;
    }
  };

  setJournalFooterRef = ref => {
    if (ref) {
      this._journalFooterRef = ref;
    }
  };

  setJournalMenuRef = ref => {
    if (ref) {
      this._journalMenuRef = ref;
    }
  };

  onForceUpdate = debounce(() => {
    this.setState({ isForceUpdate: true }, () => this.setState({ isForceUpdate: false }));
  }, 250);

  getSearchText = () => {
    const { isActivePage, urlParams } = this.props;

    if (!isActivePage) {
      return '';
    }

    return get(getSearchParams(), JUP.SEARCH, get(urlParams, JUP.SEARCH, ''));
  };

  addRecord = createVariant => {
    const { createIsLoading } = this.state;

    if (createIsLoading) {
      return;
    }

    this.setState({ createIsLoading: true });

    FormManager.createRecordByVariant(createVariant, {
      onSubmit: record => {
        goToCardDetailsPage(record.id);
      },
      onReady: () => {
        this.setState({ createIsLoading: false });
      },
      onAfterHideModal: () => {
        this.setState({ createIsLoading: false });
      }
    });
  };

  saveSettings = (id, settings) => {
    const { saveJournalSetting } = this.props;

    saveJournalSetting(id, settings);
  };

  createSettings = settings => {
    const {
      journalConfig: { id },
      createJournalSetting
    } = this.props;

    createJournalSetting(id, settings);
    this.toggleSettings();
  };

  applySettings = (isChangedPredicates, settings) => {
    this.props.applySettings({ settings });
    if (isChangedPredicates) {
      const { clearSearch } = this.props;
      const url = removeUrlSearchParams(window.location.href, JUP.SEARCH);

      window.history.replaceState({ path: url }, '', url);
      clearSearch();
    }

    this.toggleSettings();
  };

  toggleSettings = () => {
    const { settingsVisible } = this.state;

    this.setState({ settingsVisible: !settingsVisible, savedSetting: null, isReset: false });
  };

  togglePreview = () => {
    this.setState(state => ({ showPreview: !state.showPreview, viewMode: undefined }));
  };

  showDocLibrary = () => {
    this.setState(() => ({ viewMode: JOURNAL_VIEW_MODE.DOC_LIB, showPreview: false }));
  };

  showGrid = () => {
    this.setState({ showPreview: false, viewMode: undefined });
  };

  onEditJournal = throttle(
    () => {
      this.props.execJournalAction(`${SourcesId.JOURNAL}@${this.props.journalConfig.id}`, { type: ActionTypes.EDIT });
    },
    300,
    { leading: false, trailing: true }
  );

  onToggleMenu = () => {
    if (this._toggleMenuTimerId) {
      window.clearTimeout(this._toggleMenuTimerId);
    }

    this.setState({ menuOpenAnimate: !this.state.menuOpenAnimate });

    if (this.state.menuOpen) {
      animateScrollTo(this._journalRef, {
        scrollLeft: this._journalRef.scrollLeft - get(this, '_journalMenuRef.offsetWidth', 0)
      });
    }

    this._toggleMenuTimerId = window.setTimeout(
      () => {
        this.setState({ menuOpen: !this.state.menuOpen }, () => {
          if (this.props.isMobile) {
            return;
          }

          if (this.state.menuOpen) {
            animateScrollTo(
              this._journalRef,
              {
                scrollLeft: this._journalRef.scrollLeft + get(this, '_journalMenuRef.offsetWidth', 0)
              },
              500
            );
          }
        });
      },
      this.state.menuOpen ? 500 : 0
    );
  };

  onSearch = text => {
    if (text === get(this.props, ['urlParams', JUP.SEARCH], '')) {
      return;
    }

    const searchParams = {
      ...getSearchParams(),
      search: text
    };
    this.props.setUrl(searchParams);
    this.props.runSearch(text);
  };

  onResize = (w, h) => {
    const height = parseInt(h);

    if (!h || Number.isNaN(height) || height === this.state.height) {
      return;
    }

    this.setHeight(height);
  };

  setHeight = debounce(height => {
    this.setState({ height });
  }, 500);

  onSelectAllRecords = () => {
    const { setSelectAllRecords, selectAllRecords, setSelectedRecords } = this.props;

    setSelectAllRecords(!selectAllRecords);

    if (!selectAllRecords) {
      setSelectedRecords([]);
    }
  };

  onExecuteGroupAction = action => {
    const { selectAllRecords } = this.props;

    if (!selectAllRecords) {
      const records = get(this.props, 'selectedRecords', []);

      this.props.execRecordsAction(records, action);
    } else {
      const query = get(this.props, 'grid.query');

      this.props.execRecordsAction(query, action);
    }
  };

  getJournalContentMaxHeight = () => {
    const { additionalHeights, footerRef } = this.props;
    const journalMinHeight = 175;
    let height = document.body.offsetHeight;

    height -= get(document.querySelector('#alf-hd'), 'offsetHeight', 0);
    height -= get(document.querySelector('.page-tab'), 'offsetHeight', 0);

    if (this._beforeJournalBlockRef) {
      height -= get(this._beforeJournalBlockRef, 'offsetHeight', 0);
    }

    if (this._journalFooterRef) {
      height -= get(this._journalFooterRef, 'offsetHeight', 0);
      height -= 15; // for indent under pagination
    }

    if (footerRef) {
      height -= get(footerRef, 'offsetHeight', 0);
    }

    if (this._journalBodyRef) {
      const styles = window.getComputedStyle(this._journalBodyRef, null);

      height -= parseInt(styles.getPropertyValue('padding-top'), 10) || 0;
      height -= parseInt(styles.getPropertyValue('padding-bottom'), 10) || 0;
    }

    height -= getScrollbarWidth();

    if (!Number.isNaN(additionalHeights)) {
      height += additionalHeights;
    }

    return height < journalMinHeight ? journalMinHeight : height;
  };

  renderHeader = () => {
    if (this.displayElements.header) {
      const { menuOpen, viewMode } = this.state;
      const { isMobile, docLibFolderTitle, journalConfig } = this.props;
      const title = this.isDocLibMode ? docLibFolderTitle : get(this.props, 'journalConfig.meta.title', '');
      let showLabel = isMobile ? t(Labels.J_SHOW_MENU_SM) : t(Labels.J_SHOW_MENU);

      if (this.isDocLibMode) {
        showLabel = isMobile ? t(Labels.DL_SHOW_MENU_SM) : t(Labels.DL_SHOW_MENU);
      }

      const displayConfigPopup = event => {
        if (event.ctrlKey && event.shiftKey) {
          event.stopPropagation();
          !!journalConfig && showModalJson(journalConfig, 'Journal Config');
        }
      };

      return (
        <>
          <div onClick={displayConfigPopup}>
            <JournalsHead
              title={title}
              showLabel={showLabel}
              viewMode={viewMode}
              menuOpen={menuOpen}
              isMobile={isMobile}
              hasBtnMenu={this.displayElements.menu}
              hasBtnEdit={this.displayElements.editJournal}
              onToggleMenu={this.onToggleMenu}
              onEditJournal={this.onEditJournal}
            />
          </div>
        </>
      );
    }
  };

  renderSettings = () => {
    if (!this.displayElements.settings) {
      return null;
    }

    const {
      settingsFiltersData,
      stateId,
      journalConfig,
      grid,
      isMobile,
      selectedRecords,
      reloadGrid,
      isDocLibEnabled,
      settingsData,
      settingsColumnsData,
      settingsGroupingData,
      isLoading
    } = this.props;
    const { showPreview, settingsVisible, isReset, createIsLoading } = this.state;

    if (this.isDocLibMode) {
      return <DocLibSettingsBar stateId={stateId} showGrid={this.showGrid} togglePreview={this.togglePreview} isMobile={isMobile} />;
    }

    return (
      <>
        <SettingsModal
          {...settingsData}
          filtersData={settingsFiltersData}
          columnsData={settingsColumnsData}
          groupingData={settingsGroupingData}
          isReset={isReset}
          isOpen={settingsVisible}
          onClose={this.toggleSettings}
          onApply={this.applySettings}
          onCreate={this.createSettings}
          onSave={this.saveSettings}
        />

        <JournalsSettingsBar
          grid={grid}
          journalConfig={journalConfig}
          stateId={stateId}
          showPreview={showPreview}
          toggleSettings={this.toggleSettings}
          togglePreview={this.togglePreview}
          showDocLibrary={this.showDocLibrary}
          showGrid={this.showGrid}
          refresh={reloadGrid}
          onSearch={this.onSearch}
          addRecord={this.addRecord}
          isMobile={isMobile}
          searchText={this.getSearchText()}
          selectedRecords={selectedRecords}
          isDocLibEnabled={isDocLibEnabled}
          createIsLoading={createIsLoading}
          isLoading={isLoading}
        />
      </>
    );
  };

  renderGroupActions = () => {
    if (this.displayElements.groupActions) {
      const { stateId, grid, isMobile, selectedRecords, selectAllRecordsVisible, selectAllRecords } = this.props;

      if (this.isDocLibMode) {
        return <DocLibGroupActions isMobile={isMobile} stateId={stateId} />;
      }

      return (
        <JournalsGroupActionsTools
          isMobile={isMobile}
          selectAllRecordsVisible={selectAllRecordsVisible}
          selectAllRecords={selectAllRecords}
          grid={grid}
          selectedRecords={selectedRecords}
          onExecuteAction={this.onExecuteGroupAction}
          onGoTo={this.onGoTo}
          onSelectAll={this.onSelectAllRecords}
        />
      );
    }
  };

  renderPagination = () => {
    if (this.displayElements.pagination) {
      const { stateId, isMobile } = this.props;

      if (this.isDocLibMode) {
        return <DocLibPagination stateId={stateId} hasPageSize isMobile={isMobile} />;
      }

      return (
        <JournalsDashletPagination
          stateId={stateId}
          hasPageSize
          className={classNames('ecos-journal__pagination', { 'ecos-journal__pagination_mobile': isMobile })}
        />
      );
    }
  };

  renderMenu = () => {
    if (this.displayElements.menu) {
      const { stateId, pageTabsIsShow, isMobile, isActivePage } = this.props;
      const { menuOpen, menuOpenAnimate, height, viewMode } = this.state;

      return (
        <div
          className={classNames('ecos-journal__menu', {
            'ecos-journal__menu_with-tabs': pageTabsIsShow,
            'ecos-journal__menu_mobile': isMobile,
            'ecos-journal__menu_expanded': menuOpenAnimate,
            'ecos-journal__menu_expanded-document-library': menuOpenAnimate && this.isDocLibMode
          })}
        >
          <JournalsMenu
            height={height}
            forwardedRef={this.setJournalMenuRef}
            stateId={stateId}
            open={menuOpen}
            onClose={this.onToggleMenu}
            isActivePage={isActivePage}
            viewMode={viewMode}
          />
        </div>
      );
    }
  };

  render() {
    const { stateId, journalConfig, pageTabsIsShow, isMobile, isActivePage, className, bodyClassName } = this.props;
    const { showPreview, height } = this.state;

    if (!journalConfig || !journalConfig.columns || !journalConfig.columns.length) {
      return null;
    }

    return (
      <ReactResizeDetector handleHeight onResize={this.onResize}>
        <div
          ref={this.setJournalRef}
          className={classNames('ecos-journal', className, {
            'ecos-journal_mobile': isMobile,
            'ecos-journal_scroll': height <= JOURNAL_MIN_HEIGHT
          })}
        >
          <div
            ref={this.setJournalBodyRef}
            className={classNames('ecos-journal__body', bodyClassName, {
              'ecos-journal__body_with-tabs': pageTabsIsShow,
              'ecos-journal__body_mobile': isMobile,
              'ecos-journal__body_with-preview': showPreview
            })}
          >
            <div className="ecos-journal__body-group" ref={this.setJournalBodyGroupRef}>
              {this.isDocLibMode && <DocLibBreadcrumbs stateId={stateId} />}
              {this.renderHeader()}
              {this.renderSettings()}
              {this.renderGroupActions()}
            </div>

            {this.isDocLibMode ? (
              <FilesViewer stateId={stateId} isMobile={isMobile} />
            ) : (
              <JournalsContent
                stateId={stateId}
                showPreview={showPreview && !isMobile}
                maxHeight={this.getJournalContentMaxHeight()}
                isActivePage={isActivePage}
                onOpenSettings={this.toggleSettings}
              />
            )}

            <div className="ecos-journal__footer" ref={this.setJournalFooterRef}>
              {this.renderPagination()}
            </div>
          </div>

          {this.renderMenu()}
        </div>
      </ReactResizeDetector>
    );
  }
}

Journals.propTypes = {
  stateId: PropTypes.string,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  additionalHeights: PropTypes.number,
  isActivePage: PropTypes.bool,
  displayElements: PropTypes.shape({
    menu: PropTypes.bool,
    header: PropTypes.bool,
    settings: PropTypes.bool,
    pagination: PropTypes.bool,
    groupActions: PropTypes.bool
  })
};

Journals.defaultProps = {
  className: '',
  bodyClassName: '',
  additionalHeights: 0,
  displayElements: { ...defaultDisplayElements }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Journals);
