import React, { Component } from 'react';
import connect from 'react-redux/es/connect/connect';
import Export from '../../Export/Export';
import JournalsDashletPagination from '../JournalsDashletPagination';
import { IcoBtn, TwoIcoBtn } from '../../common/btns';
import { Dropdown } from '../../common/form';
import { onJournalSelect } from '../../../actions/journals';
import { getCreateRecord } from '../urlManager';

const mapStateToProps = state => ({
  journals: state.journals.journals,
  journalConfig: state.journals.journalConfig
});

const mapDispatchToProps = dispatch => ({
  onJournalSelect: journalId => dispatch(onJournalSelect(journalId))
});

class JournalsDashletToolbar extends Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  addRecord = () => {
    let {
      journalConfig: {
        meta: { createVariants = [{}] }
      }
    } = this.props;
    createVariants = createVariants[0];
    createVariants.canCreate && window.open(getCreateRecord({ ...createVariants }), '_blank');
  };

  onChangeJournal = journal => this.props.onJournalSelect(journal.nodeRef);

  render() {
    const {
      journals,
      journalConfig,
      journalConfig: {
        meta: { nodeRef = '' }
      }
    } = this.props;

    const dom = this.ref.current;

    return (
      <div ref={this.ref} className={'ecos-journal-dashlet__toolbar'}>
        <IcoBtn
          icon={'icon-big-plus'}
          className={'ecos-btn_i ecos-btn_i-big-plus ecos-btn_blue ecos-btn_hover_light-blue ecos-btn_x-step_10'}
          onClick={this.addRecord}
        />

        <Dropdown hasEmpty source={journals} value={nodeRef} valueField={'nodeRef'} titleField={'title'} onChange={this.onChangeJournal}>
          <IcoBtn invert={'true'} icon={'icon-down'} className={'ecos-btn_drop-down ecos-btn_r_6 ecos-btn_x-step_10'} />
        </Dropdown>

        <Dropdown source={[]} value={0} valueField={'id'} titleField={'title'} isButton={true}>
          <TwoIcoBtn icons={['icon-settings', 'icon-down']} className={'ecos-btn_grey ecos-btn_settings-down ecos-btn_x-step_10'} />
        </Dropdown>

        <Export config={journalConfig} />

        <div className={'dashlet__actions'}>
          {dom && dom.offsetWidth > 550 ? <JournalsDashletPagination /> : null}
          <IcoBtn
            icon={'icon-list'}
            className={'ecos-btn_i ecos-btn_blue2 ecos-btn_width_auto ecos-btn_hover_t-light-blue ecos-btn_x-step_10'}
          />
          <IcoBtn icon={'icon-pie'} className={'ecos-btn_i ecos-btn_grey2 ecos-btn_width_auto ecos-btn_hover_t-light-blue'} />
        </div>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JournalsDashletToolbar);
