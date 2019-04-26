import React, { Component } from 'react';
import connect from 'react-redux/es/connect/connect';
import Grouping from '../../Grouping/Grouping';
import PanelBar from '../../common/PanelBar/PanelBar';
import { setGrouping } from '../../../actions/journals';
import { t, trigger } from '../../../helpers/util';

import './JournalsGrouping.scss';

const mapStateToProps = state => ({
  journalConfig: state.journals.journalConfig,
  grouping: state.journals.grouping
});

const mapDispatchToProps = dispatch => ({
  setGrouping: grouping => dispatch(setGrouping(grouping))
});

class JournalsGrouping extends Component {
  onGrouping = grouping => {
    trigger.call(this, 'onChange', grouping);
  };

  render() {
    const {
      journalConfig: { columns = [] },
      grouping
    } = this.props;

    if (!columns.length) {
      return null;
    }

    return (
      <PanelBar
        header={t('journals.grouping.header')}
        className={'journals-grouping__panel-bar'}
        css={{ headerClassName: 'panel-bar__header_upper' }}
      >
        <Grouping
          className={'journals-grouping'}
          list={columns}
          grouping={grouping}
          valueField={'attribute'}
          titleField={'text'}
          onGrouping={this.onGrouping}
        />
      </PanelBar>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JournalsGrouping);
