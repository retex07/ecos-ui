import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import isEmpty from 'lodash/isEmpty';

import { getCurrentTaskList, resetCurrentTaskList } from '../../../actions/currentTasks';
import { selectStateCurrentTasksById } from '../../../selectors/tasks';
import { DefineHeight } from '../../common/index';
import CurrentTaskList from './CurrentTaskList';

import './style.scss';

const mapStateToProps = (state, context) => {
  const currentTasksState = selectStateCurrentTasksById(state, context.stateId) || {};

  return {
    currentTasks: currentTasksState.list,
    isLoading: currentTasksState.isLoading,
    isMobile: state.view.isMobile,
    updateRequestRecord: state.currentTasks.updateRequestRecord,
    totalCount: currentTasksState.totalCount
  };
};

const mapDispatchToProps = dispatch => ({
  getCurrentTaskList: payload => dispatch(getCurrentTaskList(payload)),
  resetCurrentTaskList: payload => dispatch(resetCurrentTaskList(payload))
});

class CurrentTasks extends React.Component {
  static propTypes = {
    record: PropTypes.string.isRequired,
    stateId: PropTypes.string.isRequired,
    className: PropTypes.string,
    isSmallMode: PropTypes.bool,
    isMobile: PropTypes.bool,
    isLoading: PropTypes.bool,
    isUpdating: PropTypes.bool,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    minHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    setInfo: PropTypes.func
  };

  static defaultProps = {
    className: '',
    isSmallMode: false,
    isMobile: false,
    isLoading: false,
    setInfo: () => null
  };

  state = {
    contentHeight: 0
  };

  componentDidMount() {
    this.getCurrentTaskList();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { totalCount, isLoading, isUpdating, setInfo } = this.props;

    if (totalCount !== prevProps.totalCount) {
      setInfo({ totalCount });
    }

    if (isLoading !== prevProps.isLoading) {
      setInfo({ isLoading });
    }

    if (isUpdating && !prevProps.isUpdating) {
      this.getCurrentTaskList();
    }
  }

  componentWillUnmount() {
    const { resetCurrentTaskList, stateId } = this.props;

    resetCurrentTaskList({ stateId });
  }

  getCurrentTaskList = () => {
    const { getCurrentTaskList, stateId, record: document } = this.props;

    getCurrentTaskList({ stateId, document });
  };

  setHeight = contentHeight => {
    this.setState({ contentHeight });
  };

  renderCurrentTaskList = () => {
    const { currentTasks, isLoading, isMobile, isSmallMode, className, forwardedRef } = this.props;

    const childProps = {
      currentTasks,
      className,
      isLoading,
      isMobile,
      isSmallMode
    };

    return <CurrentTaskList forwardedRef={forwardedRef} {...childProps} />;
  };

  render() {
    const { currentTasks, isLoading, isMobile, height, minHeight, maxHeight } = this.props;

    const { contentHeight } = this.state;

    if (isMobile) {
      return this.renderCurrentTaskList();
    }

    return (
      <Scrollbars
        style={{ height: contentHeight + 7 || '100%' }}
        className="ecos-current-task-list"
        renderTrackVertical={props => <div {...props} className="ecos-current-task-list__v-scroll" />}
      >
        <DefineHeight
          fixHeight={height}
          maxHeight={maxHeight}
          minHeight={minHeight}
          isMin={isLoading || isEmpty(currentTasks)}
          getOptimalHeight={this.setHeight}
        >
          {this.renderCurrentTaskList()}
        </DefineHeight>
      </Scrollbars>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CurrentTasks);
