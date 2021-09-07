import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import get from 'lodash/get';
import isEqualWith from 'lodash/isEqualWith';
import isEqual from 'lodash/isEqual';
import { Scrollbars } from 'react-custom-scrollbars';
import { DragDropContext } from 'react-beautiful-dnd';
import { getNextPage, moveCard } from '../../../actions/kanban';
import { selectKanbanProps } from '../../../selectors/kanban';
import { PointsLoader } from '../../common';
import HeaderColumn from './HeaderColumn';
import Column from './Column';

import './style.scss';

function mapStateToProps(state, props) {
  return selectKanbanProps(state, props.stateId);
}

function mapDispatchToProps(dispatch, props) {
  return {
    getNextPage: () => dispatch(getNextPage({ stateId: props.stateId })),
    moveCard: data => dispatch(moveCard({ stateId: props.stateId, ...data }))
  };
}

class Kanban extends React.Component {
  refBody = React.createRef();
  refScroll = React.createRef();

  state = {
    isDragging: false
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const height = get(this.refBody, 'current.clientHeight');

    if (!isEqualWith(prevProps.dataCards, this.props.dataCards, isEqual) && !!height) {
      if (this.getHeight() > height && !this.isNoMore()) {
        // this.props.getNextPage();
      }
    }
  }

  getHeight(changes = 0) {
    return this.props.maxHeight - 40 + changes;
  }

  isNoMore = () => {
    const { totalCount, dataCards } = this.props;

    return totalCount !== 0 && totalCount === dataCards.reduce((count, card) => card.records.length + count, 0);
  };

  handleScrollFrame = (scroll = {}) => {
    if (!this.isNoMore() && scroll.scrollTop + scroll.clientHeight === scroll.scrollHeight) {
      // this.props.getNextPage();
    }
  };

  handleDragStart = result => {
    this.toggleScroll(true);
  };

  handleDragEnd = result => {
    this.toggleScroll(false);
    const cardRef = get(result, 'draggableId');
    const cardIndex = get(result, 'source.index');
    const fromColumnRef = get(result, 'source.droppableId');
    const toColumnRef = get(result, 'destination.droppableId');

    if (fromColumnRef === toColumnRef) {
      return;
    }

    this.props.moveCard({ cardIndex, cardRef, fromColumnRef, toColumnRef });
  };

  toggleScroll = flag => {
    this.setState({ isDragging: flag });
    const elmScrollView = get(this.refScroll, 'current.view');

    if (elmScrollView) {
      elmScrollView.style.overflow = flag ? 'hidden' : 'scroll';
      elmScrollView.style.paddingRight = flag ? '6px' : '0';
    }
  };

  renderColumn = (data, index) => {
    const { stateId } = this.props;

    return <Column key={`col_${data.id}`} data={data} stateId={stateId} columnIndex={index} />;
  };

  render() {
    const { isDragging } = this.state;
    const { columns = [], dataCards = [], isLoading, isFirstLoading } = this.props;
    const cols = columns || Array(3).map((_, id) => ({ id }));

    return (
      <div className="ecos-kanban" style={{ '--count-col': cols.length }}>
        <Scrollbars
          autoHeight
          autoHeightMin={this.getHeight()}
          autoHeightMax={this.getHeight()}
          renderThumbVertical={props => <div {...props} className="ecos-kanban__scroll_v" />}
          renderTrackHorizontal={props => <div {...props} className="ecos-kanban__scroll_h" />}
          onScrollFrame={this.handleScrollFrame}
          ref={this.refScroll}
        >
          <div className="ecos-kanban__head">
            {cols.map((data, index) => {
              return (
                <HeaderColumn data={data} index={index} isReady={!isFirstLoading} totalCount={get(dataCards, [index, 'totalCount'])} />
              );
            })}
          </div>
          <div
            className={classNames('ecos-kanban__body', {
              'ecos-kanban__body_dragging': isDragging,
              'ecos-kanban__body_end': this.isNoMore()
            })}
            ref={this.refBody}
          >
            <DragDropContext onDragEnd={this.handleDragEnd} onDragStart={this.handleDragStart}>
              {columns.map(this.renderColumn)}
            </DragDropContext>
          </div>
          {isLoading && !isFirstLoading && <PointsLoader className="ecos-kanban__loader" color={'light-blue'} />}
        </Scrollbars>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Kanban);
