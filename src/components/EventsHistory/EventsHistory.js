import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { Scrollbars } from 'react-custom-scrollbars';

import { DefineHeight } from '../common';
import { selectDataEventsHistoryByStateId } from '../../selectors/eventsHistory';
import { filterEventsHistory, getEventsHistory, resetEventsHistory } from '../../actions/eventsHistory';
import EventsHistoryService from '../../services/eventsHistory';
import EventsHistoryList from './EventsHistoryList';

import './style.scss';

const mapStateToProps = (state, context) => {
  const ahState = selectDataEventsHistoryByStateId(state, context.stateId) || {};

  return {
    list: ahState.list,
    isLoading: ahState.isLoading,
    columns: isEmpty(ahState.columns)
      ? isEmpty(context.myColumns)
        ? EventsHistoryService.config.columns
        : context.myColumns
      : ahState.columns,
    isMobile: state.view.isMobile
  };
};

const mapDispatchToProps = dispatch => ({
  getEventsHistory: payload => dispatch(getEventsHistory(payload)),
  filterEventsHistory: payload => dispatch(filterEventsHistory(payload)),
  resetEventsHistory: payload => dispatch(resetEventsHistory(payload))
});

class EventsHistory extends React.Component {
  static propTypes = {
    record: PropTypes.string.isRequired,
    stateId: PropTypes.string.isRequired,
    className: PropTypes.string,
    isSmallMode: PropTypes.bool,
    isMobile: PropTypes.bool,
    isLoading: PropTypes.bool,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    minHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    myColumns: PropTypes.array
  };

  static defaultProps = {
    className: '',
    isSmallMode: false,
    isMobile: false,
    isLoading: false,
    myColumns: []
  };

  state = {
    contentHeight: 0
  };

  _filter = React.createRef();

  componentDidMount() {
    this.getEventsHistory();
  }

  componentWillUnmount() {
    const { resetEventsHistory, stateId } = this.props;

    resetEventsHistory({ stateId });
  }

  getEventsHistory = () => {
    const { getEventsHistory, record, stateId, columns } = this.props;

    getEventsHistory({
      stateId,
      record,
      columns
    });
  };

  setHeight = contentHeight => {
    this.setState({ contentHeight });
  };

  onFilter = predicates => {
    const { filterEventsHistory, record, stateId, columns } = this.props;

    filterEventsHistory({
      stateId,
      record,
      columns,
      predicates
    });
  };

  renderEventList() {
    const { isLoading, isMobile, isSmallMode, list, columns } = this.props;

    return (
      <EventsHistoryList
        list={list}
        columns={columns}
        isLoading={isLoading}
        isSmallMode={isSmallMode}
        isMobile={isMobile}
        onFilter={this.onFilter}
      />
    );
  }

  render() {
    const { isLoading, isMobile, className, height, minHeight, maxHeight, list } = this.props;
    const { contentHeight } = this.state;

    const filterHeight = get(this._filter, 'current.offsetHeight', 0);
    const fixHeight = height ? height - filterHeight : null;

    return (
      <div className={classNames('ecos-event-history', className)}>
        <div ref={this._filter}>
          {/*{(isMobile || isSmallMode) && (
            <DropdownFilter columns={columns} className={`${this.className}__filter`} onFilter={this.onFilter} />
          )}*/}
        </div>
        {isMobile ? (
          this.renderEventList()
        ) : (
          <Scrollbars
            style={{ height: contentHeight || '100%' }}
            className={this.className}
            renderTrackVertical={props => <div {...props} className={`${this.className}__v-scroll`} />}
          >
            <DefineHeight
              fixHeight={fixHeight}
              maxHeight={maxHeight - filterHeight}
              minHeight={minHeight}
              isMin={isLoading || isEmpty(list)}
              getOptimalHeight={this.setHeight}
            >
              {this.renderEventList()}
            </DefineHeight>
          </Scrollbars>
        )}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventsHistory);
