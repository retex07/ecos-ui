import React from 'react';
import PropTypes from 'prop-types';
import set from 'lodash/set';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import DashboardService from '../../services/dashboard';
import { t } from '../../helpers/util';
import { EditTabs, ScrollArrow } from '../../components/common';
import { IcoBtn } from '../../components/common/btns';
import { RemoveDialog } from '../../components/common/dialogs';

import './style.scss';

class SetTabs extends React.Component {
  static propTypes = {
    activeTabKey: PropTypes.string,
    tabs: PropTypes.array,
    setData: PropTypes.func
  };

  static defaultProps = {
    activeTabKey: '',
    tabs: []
  };

  state = {
    scrollTabToEnd: false,
    updateScrollPosition: false,
    removedTab: null,
    editableTab: 0
  };

  doScrollEnd() {
    this.setState({ scrollTabToEnd: true }, () => {
      this.setState({ scrollTabToEnd: false });
    });
  }

  doScrollCheck() {
    this.setState({ updateScrollPosition: true }, () => {
      this.setState({ updateScrollPosition: false });
    });
  }

  onClickTabLayout = tab => {
    let { activeTabKey, setData } = this.props;

    if (tab.idLayout !== activeTabKey) {
      setData && setData({ activeTabKey: tab.idLayout });
    }
  };

  onCreateTab = () => {
    const { tabs, setData } = this.props;
    const idLayout = DashboardService.newIdLayout;
    const newTab = DashboardService.defaultDashboardTab(idLayout);

    newTab.label = '';
    newTab.isNew = true;

    tabs.push(newTab);
    setData && setData({ tabs });
    this.doScrollEnd();
  };

  onEditTab = (tab, index) => {
    const { tabs, setData } = this.props;
    const { label, idLayout } = tab;

    set(tabs, [index], { label, idLayout });
    setData && setData({ tabs });
  };

  onStartEditTab = (position = 0) => {
    this.setState({ editableTab: position });
  };

  onConfirmDeleteTab = (tab, index) => {
    this.setState({ removedTab: { ...tab, index } });
  };

  onSortTabs = sortedTabs => {
    const { setData } = this.props;

    setData &&
      setData({
        tabs: sortedTabs.map(({ label, idLayout }) => ({ label, idLayout }))
      });
  };

  onDeleteTab = () => {
    const {
      removedTab: { index, idLayout }
    } = this.state;
    let { tabs, activeTabKey, setData } = this.props;

    tabs.splice(index, 1);

    if (idLayout === activeTabKey) {
      activeTabKey = get(tabs, '[0].idLayout', null);
    }

    this.closeDialog();
    setData && setData({ tabs, activeTabKey });
    this.doScrollCheck();
  };

  closeDialog = () => {
    this.setState({ removedTab: null });
  };

  render() {
    const { tabs, activeTabKey } = this.props;
    const { scrollTabToEnd, removedTab, editableTab, updateScrollPosition } = this.state;
    const empty = isEmpty(tabs);

    return (
      <>
        <h6 className="ecos-dashboard-settings__container-subtitle">{t('dashboard-settings.edit-number-contents')}</h6>
        <div className="ecos-dashboard-settings__layout-tabs-wrapper">
          {!empty && (
            <ScrollArrow
              medium
              changeScrollPosition={editableTab !== 0}
              scrollToEnd={scrollTabToEnd}
              updateWhenDataChange={updateScrollPosition}
              className="ecos-dashboard-settings__layout-tabs-arrows"
              selectorToObserve="div.ecos-tabs.ecos-dashboard-settings__layout-tabs-wrap"
            >
              <EditTabs
                className="ecos-dashboard-settings__layout-tabs-wrap"
                classNameTab="ecos-dashboard-settings__layout-tabs-item"
                hasHover
                hasHint
                items={tabs}
                keyField={'idLayout'}
                disabled={tabs.length < 2}
                activeTabKey={activeTabKey}
                onDelete={this.onConfirmDeleteTab}
                onSort={this.onSortTabs}
                onEdit={this.onEditTab}
                onStartEdit={this.onStartEditTab}
                onClick={this.onClickTabLayout}
              />
            </ScrollArrow>
          )}
          {empty && <div className="ecos-dashboard-settings__layout-tabs_empty" />}
          <IcoBtn
            icon="icon-big-plus"
            className={'ecos-dashboard-settings__layout-tabs-add-tab ecos-btn_i ecos-btn_blue2 ecos-btn_hover_blue2'}
            onClick={this.onCreateTab}
          />
        </div>
        <RemoveDialog
          isOpen={!isEmpty(removedTab)}
          title={t('dashboard-settings.remove-tab-dialog.title')}
          text={
            <>
              <div>{`${t('dashboard-settings.remove-tab-dialog.text1')} "${get(removedTab, 'label', '')}"?`}</div>
              <div>{`${t('dashboard-settings.remove-tab-dialog.text2')}`}</div>
            </>
          }
          onDelete={this.onDeleteTab}
          onCancel={this.closeDialog}
          onClose={this.closeDialog}
        />
      </>
    );
  }
}

export default SetTabs;
