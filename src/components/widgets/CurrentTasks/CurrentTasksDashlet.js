import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getAdaptiveNumberStr, isSmallMode, t } from '../../../helpers/util';
import DAction from '../../../services/DashletActionService';
import { getStateId } from '../../../helpers/redux';
import Dashlet from '../../Dashlet';
import BaseWidget from '../BaseWidget';
import CurrentTasks from './CurrentTasks';

import './style.scss';
import Settings from './Settings';

// Все задачи
class CurrentTasksDashlet extends BaseWidget {
  static propTypes = {
    id: PropTypes.string.isRequired,
    record: PropTypes.string.isRequired,
    title: PropTypes.string,
    classNameTasks: PropTypes.string,
    classNameDashlet: PropTypes.string,
    config: PropTypes.shape({
      height: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    }),
    dragHandleProps: PropTypes.object,
    canDragging: PropTypes.bool,
    maxHeightByContent: PropTypes.bool
  };

  static defaultProps = {
    classNameTasks: '',
    classNameDashlet: '',
    dragHandleProps: {},
    canDragging: false,
    maxHeightByContent: false
  };

  constructor(props) {
    super(props);

    this.stateId = getStateId(props);

    this.state = {
      ...this.state,
      isSmallMode: false,
      totalCount: 0,
      isLoading: true,
      isOpenSettings: false
    };
    this.observableFieldsToUpdate = [...new Set([...this.observableFieldsToUpdate, 'tasks.active-hash'])];
  }

  get actions() {
    return {
      [DAction.Actions.RELOAD]: {
        onClick: () => this.reload()
      },
      [DAction.Actions.SETTINGS]: {
        onClick: this.onToggleSettings
      }
    };
  }

  onResize = width => {
    !!width && this.setState({ isSmallMode: isSmallMode(width) });
  };

  onToggleSettings = () => {
    this.setState(state => ({ isOpenSettings: !state.isOpenSettings }));
  };

  onSaveSettings = settings => {
    console.warn({ settings });

    this.setState({
      isOpenSettings: false
    });
  };

  setInfo = data => {
    this.setState(data);
  };

  renderSettings() {
    const { isOpenSettings } = this.state;

    if (!isOpenSettings) {
      return null;
    }

    return <Settings isOpen onHide={this.onToggleSettings} onSave={this.onSaveSettings} />;
  }

  render() {
    const { title, config, classNameTasks, classNameDashlet, record, dragHandleProps, canDragging } = this.props;
    const { isSmallMode, runUpdate, isCollapsed, totalCount, isLoading } = this.state;

    return (
      <Dashlet
        title={title || t('current-tasks-widget.title')}
        bodyClassName="ecos-current-task-list-dashlet__body"
        className={classNames('ecos-current-task-list-dashlet', classNameDashlet)}
        resizable
        contentMaxHeight={this.clientHeight}
        actionConfig={this.actions}
        needGoTo={false}
        canDragging={canDragging}
        dragHandleProps={dragHandleProps}
        onChangeHeight={this.handleChangeHeight}
        getFitHeights={this.setFitHeights}
        onResize={this.onResize}
        onToggleCollapse={this.handleToggleContent}
        isCollapsed={isCollapsed}
        badgeText={getAdaptiveNumberStr(totalCount)}
        noBody={!totalCount && !isLoading}
        setRef={this.setDashletRef}
      >
        <CurrentTasks
          {...config}
          forwardedRef={this.contentRef}
          className={classNameTasks}
          record={record}
          isSmallMode={isSmallMode}
          stateId={this.stateId}
          height={this.contentHeight}
          setInfo={this.setInfo}
          runUpdate={runUpdate}
          scrollbarProps={this.scrollbarProps}
        />

        {this.renderSettings()}
      </Dashlet>
    );
  }
}

export default CurrentTasksDashlet;
