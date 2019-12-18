import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { UncontrolledTooltip } from 'reactstrap';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'react-redux';
import get from 'lodash/get';

import { addNewVersion, getVersions, getVersionsComparison, setActiveVersion, toggleModal } from '../../../actions/versionsJournal';
import { selectLabelsVersions } from '../../../selectors/versionsJournal';
import UserLocalSettingsService from '../../../services/userLocalSettings';
import { t, arrayCompare } from '../../../helpers/util';
import { MIN_WIDTH_DASHLET_LARGE, MIN_WIDTH_DASHLET_SMALL } from '../../../constants/index';
import { BASE_HEIGHT, MODAL, TOOLTIP } from '../../../constants/versionsJournal';

import BaseWidget from '../BaseWidget';
import { Avatar, DefineHeight, Icon, Loader } from '../../common/index';
import { Btn, IcoBtn } from '../../common/btns/index';
import { Dropdown, Headline } from '../../common/form/index';
import Dashlet from '../../Dashlet/Dashlet';
import AddModal from './AddModal';
import ChangeVersionModal from './ChangeVersionModal';
import ComparisonModal from './ComparisonModal';

import './style.scss';

const mapStateToProps = (state, ownProps) => {
  const id = get(ownProps, ['id']);
  const isMobile = get(state, ['view', 'isMobile'], false);

  return {
    id,
    isMobile,
    versions: get(state, ['versionsJournal', id, 'versions']),
    versionsLabels: selectLabelsVersions(state, id, isMobile),
    isLoading: get(state, ['versionsJournal', id, 'listIsLoading']),

    addModalIsLoading: get(state, ['versionsJournal', id, 'addModalIsLoading']),
    addModalIsShow: get(state, ['versionsJournal', id, 'addModalIsShow']),
    addModalErrorMessage: get(state, ['versionsJournal', id, 'addModalErrorMessage']),

    changeVersionModalIsShow: get(state, ['versionsJournal', id, 'changeVersionModalIsShow']),
    changeVersionModalIsLoading: get(state, ['versionsJournal', id, 'changeVersionModalIsLoading']),
    changeVersionModalErrorMessage: get(state, ['versionsJournal', id, 'changeVersionModalErrorMessage']),

    comparison: get(state, ['versionsJournal', id, 'comparison']),
    comparisonModalIsShow: get(state, ['versionsJournal', id, 'comparisonModalIsShow']),
    comparisonModalIsLoading: get(state, ['versionsJournal', id, 'comparisonModalIsLoading']),
    comparisonModalErrorMessage: get(state, ['versionsJournal', id, 'comparisonModalErrorMessage'])
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  getVersionsList: () => dispatch(getVersions({ record: ownProps.record, id: ownProps.id })),
  getVersionsComparison: payload =>
    dispatch(
      getVersionsComparison({
        ...payload,
        record: ownProps.record,
        id: ownProps.id
      })
    ),
  addNewVersion: payload => dispatch(addNewVersion({ ...payload, record: ownProps.record, id: ownProps.id })),
  toggleModal: key => dispatch(toggleModal({ key, record: ownProps.record, id: ownProps.id })),
  setActiveVersion: payload => dispatch(setActiveVersion({ ...payload, record: ownProps.record, id: ownProps.id }))
});

class VersionsJournal extends BaseWidget {
  static propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    versions: PropTypes.arrayOf(
      PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string,
        middleName: PropTypes.string,
        userName: PropTypes.string,
        comment: PropTypes.string,
        version: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        name: PropTypes.string,
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        url: PropTypes.string.isRequired,
        avatar: PropTypes.string
      })
    ),
    versionsLabels: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        text: PropTypes.string,
        shortText: PropTypes.string
      })
    ),
    isLoading: PropTypes.bool,

    addModalIsLoading: PropTypes.bool,
    addModalIsShow: PropTypes.bool,
    addModalErrorMessage: PropTypes.string,

    changeVersionModalIsShow: PropTypes.bool,
    changeVersionModalIsLoading: PropTypes.bool,
    changeVersionModalErrorMessage: PropTypes.string,

    maxHeightByContent: PropTypes.bool
  };

  static defaultProps = {
    versions: [],
    versionsLabels: [],
    isLoading: false,

    addModalIsLoading: false,
    addModalIsShow: false,
    addModalErrorMessage: '',

    changeVersionModalIsShow: false,
    changeVersionModalIsLoading: false,
    changeVersionModalErrorMessage: '',

    maxHeightByContent: true
  };

  constructor(props) {
    super(props);

    UserLocalSettingsService.checkOldData(props.id);

    const state = {
      width: 290,
      selectedVersion: null,
      comparisonFirstVersion: null,
      comparisonSecondVersion: null,
      editorHeight: BASE_HEIGHT,
      contentHeight: null,
      fitHeights: {},
      userHeight: UserLocalSettingsService.getDashletHeight(props.id),
      isCollapsed: UserLocalSettingsService.getProperty(props.id, 'isCollapsed')
    };

    this.state = { ...state, ...VersionsJournal.getDefaultSelectedVersions(props) };

    this.topPanel = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.comparisonFirstVersion && props.versionsLabels.length) {
      return { ...VersionsJournal.getDefaultSelectedVersions(props) };
    }

    return null;
  }

  static getDefaultSelectedVersions(props) {
    const state = {
      comparisonFirstVersion: null,
      comparisonSecondVersion: null
    };

    if (props.versionsLabels.length) {
      const [comparisonSecondVersion, comparisonFirstVersion] = props.versionsLabels.slice(0, 2);

      if (comparisonFirstVersion) {
        state.comparisonFirstVersion = comparisonFirstVersion.id;
      }

      if (comparisonSecondVersion) {
        state.comparisonSecondVersion = comparisonSecondVersion.id;
      }
    }

    return state;
  }

  componentDidMount() {
    this.props.getVersionsList();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!arrayCompare(prevProps.versionsLabels, this.props.versionsLabels)) {
      this.setState({
        ...VersionsJournal.getDefaultSelectedVersions(this.props)
      });
    }
  }

  handleToggleAddModal = () => {
    this.props.toggleModal(MODAL.ADD);
  };

  handleToggleChangeVersionModal = () => {
    this.props.toggleModal(MODAL.CHANGE_VERSION);
  };

  handleAddNewVersion = data => {
    this.props.addNewVersion(data);
  };

  handleSetActiveVersion = data => {
    const { selectedVersion } = this.state;

    this.props.setActiveVersion({
      ...data,
      versionId: selectedVersion.id,
      version: selectedVersion.version
    });
  };

  handleOpenSetActiveVersionModal = version => {
    this.handleToggleChangeVersionModal();
    this.setState({ selectedVersion: version });
  };

  handleSelectFirstVersion = data => {
    this.setState({ comparisonFirstVersion: data.id });
  };

  handleSelectSecondVersion = data => {
    this.setState({ comparisonSecondVersion: data.id });
  };

  handleClickShowComparisonModal = () => {
    const { comparisonFirstVersion, comparisonSecondVersion } = this.state;

    this.props.toggleModal(MODAL.COMPARISON);
    this.props.getVersionsComparison({ comparisonFirstVersion, comparisonSecondVersion });
  };

  handleClickHideComparisonModal = () => {
    this.props.toggleModal(MODAL.COMPARISON);
  };

  get scrollableHeight() {
    let scrollableHeight = this.state.contentHeight;

    scrollableHeight -= get(this.topPanel, 'current.offsetHeight', 0);

    return scrollableHeight;
  }

  get otherHeight() {
    return get(this.topPanel, 'current.offsetHeight', 0);
  }

  renderAddButton(isModal = false) {
    const { id, record } = this.props;

    if (!record) {
      return null;
    }

    if (isModal) {
      return (
        <Btn className="ecos-btn_blue ecos-btn_hover_light-blue ecos-vj__btn-add" onClick={this.handleToggleAddModal}>
          <Icon className="icon-plus ecos-vj__btn-add-icon" />
          <span className="ecos-vj__btn-add-title">{t('versions-journal-widget.add-version')}</span>
        </Btn>
      );
    }

    return (
      <span key="add-button">
        <IcoBtn
          id={`${TOOLTIP.ADD_NEW_VERSION}-${id}`}
          key="action-open-modal"
          icon="icon-plus"
          onClick={this.handleToggleAddModal}
          className="ecos-btn_i dashlet__btn_hidden dashlet__btn_next ecos-btn_grey2 ecos-btn_width_auto ecos-btn_hover_t-light-blue"
        />
        <UncontrolledTooltip
          placement="top"
          boundariesElement="window"
          key="action-open-modal-tooltip"
          innerClassName="ecos-vj__tooltip"
          arrowClassName="ecos-vj__tooltip-arrow"
          target={`${TOOLTIP.ADD_NEW_VERSION}-${id}`}
        >
          {t('versions-journal-widget.add-version')}
        </UncontrolledTooltip>
      </span>
    );
  }

  renderVersionActions(version, isMobile = false) {
    const { id } = this.props;
    const key = `${version.id.replace(/[:@/]/gim, '')}-${id}`;

    return (
      <div
        className={classNames('ecos-vj__version-actions', {
          'ecos-vj__version-actions_mobile': isMobile
        })}
      >
        <Icon
          id={`${TOOLTIP.SET_ACTUAL_VERSION}-${key}`}
          onClick={this.handleOpenSetActiveVersionModal.bind(null, version)}
          className="icon-actual ecos-vj__version-actions-item"
        />
        <UncontrolledTooltip
          placement="top"
          boundariesElement="window"
          innerClassName="ecos-vj__tooltip"
          arrowClassName="ecos-vj__tooltip-arrow"
          target={`${TOOLTIP.SET_ACTUAL_VERSION}-${key}`}
        >
          {t('versions-journal-widget.set-current')}
        </UncontrolledTooltip>
        <a href={version.url} download data-external id={`${TOOLTIP.DOWNLOAD_VERSION}-${key}`}>
          <Icon className="icon-download ecos-vj__version-actions-item" />
        </a>
        <UncontrolledTooltip
          placement="top"
          boundariesElement="window"
          innerClassName="ecos-vj__tooltip"
          arrowClassName="ecos-vj__tooltip-arrow"
          target={`${TOOLTIP.DOWNLOAD_VERSION}-${key}`}
        >
          {t('versions-journal-widget.download')}
        </UncontrolledTooltip>
      </div>
    );
  }

  renderVersion = (version, showActions = true) => {
    const { id, isMobile } = this.props;
    const key = `${version.id.replace(/[:@/]/gim, '')}-${id}`;

    return (
      <div className="ecos-vj__version" key={key}>
        <Headline className="ecos-vj__headline">
          <div className="ecos-vj__version-number">{version.version}</div>
          <div className="ecos-vj__version-title">{version.name}</div>
          {showActions && !isMobile && this.renderVersionActions(version)}
        </Headline>
        <div className="ecos-vj__version-body">
          <div className="ecos-vj__version-author">
            <Avatar
              url={version.avatar}
              className={classNames('ecos-vj__version-author-avatar', {
                'ecos-vj__version-author-avatar_big': isMobile
              })}
              classNameEmpty="ecos-vj__version-author-avatar_empty"
            />

            <div className="ecos-vj__version-author-name">
              {!isMobile && <div className="ecos-vj__version-author-name-item">{version.userName}</div>}

              {isMobile && (
                <>
                  <div className="ecos-vj__version-author-name-item">
                    {version.firstName} {version.middleName}
                  </div>
                  <div className="ecos-vj__version-author-name-item">{version.lastName}</div>
                </>
              )}

              <div className="ecos-vj__version-date">
                <Icon className="icon-clock ecos-vj__version-date-icon" />
                {version.date}
              </div>
            </div>
          </div>

          {version.comment && (
            <div
              className={classNames('ecos-vj__version-comment', {
                'ecos-vj__version-comment_mobile': isMobile
              })}
            >
              {version.comment}
            </div>
          )}
          {showActions && isMobile && this.renderVersionActions(version, isMobile)}
        </div>
      </div>
    );
  };

  renderMessage = (message = '') => <div className="ecos-vj__message">{message}</div>;

  renderActualVersion() {
    const { versions } = this.props;

    if (!versions) {
      return null;
    }

    const version = versions[0];
    const versionBlock = version
      ? this.renderVersion(version, false)
      : this.renderMessage(t('versions-journal-widget.no-current-versions'));

    return (
      <>
        <div className="ecos-vj__title">{t('versions-journal-widget.current-version')}</div>
        {versionBlock}
      </>
    );
  }

  renderOldVersions() {
    const { versions } = this.props;

    if (!versions) {
      return null;
    }

    const [, ...oldVersions] = versions;
    const versionsBlock = oldVersions.length
      ? oldVersions.map(version => this.renderVersion(version))
      : this.renderMessage(t('versions-journal-widget.no-old-versions'));

    return (
      <>
        <div className="ecos-vj__title">{t('versions-journal-widget.old')}</div>
        {versionsBlock}
      </>
    );
  }

  renderModal() {
    const { addModalIsShow, changeVersionModalIsShow, comparisonModalIsShow } = this.props;

    if (addModalIsShow) {
      const { versions, addModalIsLoading, addModalErrorMessage } = this.props;
      const currentVersion = get(versions, '[0].version', 1);

      return (
        <AddModal
          isShow
          title={t('versions-journal-widget.add')}
          currentVersion={currentVersion}
          onHideModal={this.handleToggleAddModal}
          onCreate={this.handleAddNewVersion}
          isLoading={addModalIsLoading}
          errorMessage={addModalErrorMessage}
        />
      );
    }

    if (changeVersionModalIsShow) {
      const { versions, changeVersionModalErrorMessage, changeVersionModalIsLoading } = this.props;

      return (
        <ChangeVersionModal
          isShow
          title={t('versions-journal-widget.set-current-version')}
          currentVersion={versions[0].version}
          onHideModal={this.handleToggleChangeVersionModal}
          onCreate={this.handleSetActiveVersion}
          isLoading={changeVersionModalIsLoading}
          errorMessage={changeVersionModalErrorMessage}
        />
      );
    }

    if (comparisonModalIsShow) {
      const { versions, comparison, comparisonModalIsLoading, isMobile } = this.props;
      const { comparisonFirstVersion, comparisonSecondVersion } = this.state;
      const selectedVersions = [versions.find(v => v.id === comparisonFirstVersion), versions.find(v => v.id === comparisonSecondVersion)];

      return (
        <ComparisonModal
          isShow
          isMobile={isMobile}
          isLoading={comparisonModalIsLoading}
          comparison={comparison}
          versions={selectedVersions}
          onHideModal={this.handleClickHideComparisonModal}
        />
      );
    }

    return null;
  }

  renderLoading() {
    const { isLoading } = this.props;

    if (!isLoading) {
      return null;
    }

    return <Loader blur className="ecos-vj__loader" />;
  }

  renderComparison() {
    const { isMobile, versionsLabels } = this.props;
    const { comparisonFirstVersion, comparisonSecondVersion, width } = this.state;

    if (versionsLabels.length < 2) {
      return null;
    }

    const isSmall = isMobile || width <= MIN_WIDTH_DASHLET_LARGE;
    let comparisonButtonIsDisabled = false;

    if (comparisonSecondVersion && comparisonFirstVersion) {
      comparisonButtonIsDisabled = comparisonFirstVersion === comparisonSecondVersion;
    }

    return (
      <div
        className={classNames('ecos-vj__comparison', {
          'ecos-vj__comparison_small': isSmall
        })}
      >
        <Dropdown
          source={versionsLabels}
          value={comparisonFirstVersion}
          valueField="id"
          titleField={isSmall ? 'shortText' : 'text'}
          className="ecos-vj__comparison-dropdown"
          menuClassName="ecos-vj__comparison-dropdown-list"
          onChange={this.handleSelectFirstVersion}
          hideSelected
          withScrollbar
          scrollbarHeightMax="200px"
        >
          <IcoBtn
            invert
            icon="icon-down ecos-vj__comparison-dropdown-toggle-icon"
            className="ecos-vj__comparison-dropdown-toggle ecos-btn_transparent"
          />
        </Dropdown>

        <Dropdown
          source={versionsLabels}
          value={comparisonSecondVersion}
          valueField="id"
          titleField={isSmall ? 'shortText' : 'text'}
          className="ecos-vj__comparison-dropdown"
          menuClassName="ecos-vj__comparison-dropdown-list"
          onChange={this.handleSelectSecondVersion}
          hideSelected
          withScrollbar
          scrollbarHeightMax={'200px'}
        >
          <IcoBtn
            invert
            icon="icon-down ecos-vj__comparison-dropdown-toggle-icon"
            className="ecos-vj__comparison-dropdown-toggle ecos-btn_transparent"
          />
        </Dropdown>

        <Btn
          className={classNames('ecos-btn', 'ecos-vj__btn-comparison', {
            'ecos-btn_blue': !isMobile,
            'ecos-btn_hover_light-blue': !isMobile,
            'ecos-vj__btn-comparison_mobile': isMobile
          })}
          disabled={comparisonButtonIsDisabled}
          onClick={this.handleClickShowComparisonModal}
        >
          {t('versions-journal-widget.diff')}
        </Btn>
      </div>
    );
  }

  renderBody() {
    const { isMobile } = this.props;
    const body = (
      <div ref={this.contentRef}>
        {this.renderActualVersion()}
        {this.renderOldVersions()}
      </div>
    );

    if (isMobile) {
      return body;
    }

    const { userHeight = 0, fitHeights, contentHeight } = this.state;
    const fixHeight = userHeight ? userHeight : null;

    return (
      <Scrollbars autoHide style={{ height: contentHeight - this.otherHeight || '100%' }}>
        <DefineHeight fixHeight={fixHeight} maxHeight={fitHeights.max} minHeight={1} getOptimalHeight={this.setContentHeight}>
          {body}
        </DefineHeight>
      </Scrollbars>
    );
  }

  render() {
    const { isMobile, versionsLabels } = this.props;
    const { isCollapsed } = this.state;

    return (
      <Dashlet
        title={t('versions-journal-widget.title')}
        className="ecos-vj"
        titleClassName="ecos-vj__dashboard-title"
        style={{ minWidth: MIN_WIDTH_DASHLET_SMALL }}
        needGoTo={false}
        actionEdit={false}
        actionHelp={false}
        actionReload={false}
        resizable
        contentMaxHeight={this.clientHeight + this.otherHeight}
        onResize={this.handleResize}
        onChangeHeight={this.handleChangeHeight}
        customButtons={[!isMobile && this.renderAddButton()]}
        getFitHeights={this.setFitHeights}
        onToggleCollapse={this.handleToggleContent}
        isCollapsed={isCollapsed}
      >
        {(versionsLabels.length > 1 || isMobile) && (
          <div className="ecos-vj__block" ref={this.topPanel}>
            {this.renderComparison()}

            {isMobile && this.renderAddButton(isMobile)}
          </div>
        )}

        {this.renderBody()}
        {this.renderModal()}
        {this.renderLoading()}
      </Dashlet>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VersionsJournal);