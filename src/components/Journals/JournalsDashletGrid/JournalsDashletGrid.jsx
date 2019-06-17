import React, { Component } from 'react';
import connect from 'react-redux/es/connect/connect';
import { Grid, InlineTools, Tools, EmptyGrid } from '../../common/grid';
import Loader from '../../common/Loader/Loader';
import { IcoBtn } from '../../common/btns';
import { goToCardDetails, goToNodeEditPage } from '../urlManager';
import { t, trigger } from '../../../helpers/util';
import {
  reloadGrid,
  deleteRecords,
  saveRecords,
  setSelectedRecords,
  setSelectAllRecords,
  setSelectAllRecordsVisible,
  setGridInlineToolSettings,
  goToJournalsPage
} from '../../../actions/journals';

const mapStateToProps = state => ({
  loading: state.journals.loading,
  grid: state.journals.grid,
  journalConfig: state.journals.journalConfig,
  selectedRecords: state.journals.selectedRecords,
  selectAllRecords: state.journals.selectAllRecords,
  selectAllRecordsVisible: state.journals.selectAllRecordsVisible
});

const mapDispatchToProps = dispatch => ({
  reloadGrid: options => dispatch(reloadGrid(options)),
  deleteRecords: records => dispatch(deleteRecords(records)),
  saveRecords: ({ id, attributes }) => dispatch(saveRecords({ id, attributes })),
  setSelectedRecords: records => dispatch(setSelectedRecords(records)),
  setSelectAllRecords: need => dispatch(setSelectAllRecords(need)),
  setSelectAllRecordsVisible: visible => dispatch(setSelectAllRecordsVisible(visible)),
  setGridInlineToolSettings: settings => dispatch(setGridInlineToolSettings(settings)),
  goToJournalsPage: row => dispatch(goToJournalsPage(row))
});

class JournalsDashletGrid extends Component {
  filters = [];
  selectedRow = {};

  setSelectedRecords = e => {
    const props = this.props;
    props.setSelectedRecords(e.selected);
    props.setSelectAllRecordsVisible(e.all);

    if (!e.all) {
      props.setSelectAllRecords(false);
    }
  };

  setSelectAllRecords = () => {
    const props = this.props;
    props.setSelectAllRecords(!props.selectAllRecords);

    if (!props.selectAllRecords) {
      props.setSelectedRecords([]);
    }
  };

  onFilter = predicates => {
    const props = this.props;
    const { columns } = props.journalConfig;

    this.filters = predicates;

    this.reloadGrid({ columns, predicates });
  };

  reloadGrid(options) {
    this.hideGridInlineToolSettings();
    this.props.reloadGrid({ ...options });
  }

  sort = e => {
    this.reloadGrid({
      sortBy: [
        {
          attribute: e.column.attribute,
          ascending: !e.ascending
        }
      ]
    });
  };

  setSelectedRow(row) {
    this.selectedRow = row;
  }

  getSelectedRow() {
    return this.selectedRow;
  }

  clearSelectedRow() {
    this.selectedRow = {};
  }

  showGridInlineToolSettings = options => {
    this.setSelectedRow(options.row);
    this.props.setGridInlineToolSettings(options);
  };

  hideGridInlineToolSettings = () => {
    this.clearSelectedRow();
    this.props.setGridInlineToolSettings({ height: 0, top: 0, row: {} });
  };

  goToJournalPageWithFilter = () => {
    const selectedRow = this.getSelectedRow();
    this.props.goToJournalsPage(selectedRow);
  };

  goToCardDetails = () => {
    const selectedRow = this.getSelectedRow();
    goToCardDetails(selectedRow.id);
  };

  goToNodeEditPage = () => {
    const selectedRow = this.getSelectedRow();
    goToNodeEditPage(selectedRow.id);
  };

  inlineTools = () => {
    const inlineToolsActionClassName = 'ecos-btn_i ecos-btn_brown ecos-btn_width_auto ecos-btn_hover_t-dark-brown ecos-btn_x-step_10';
    const tools = [
      <IcoBtn icon={'icon-on'} onClick={this.goToCardDetails} className={inlineToolsActionClassName} />,
      <IcoBtn icon={'icon-download'} className={inlineToolsActionClassName} />,
      <IcoBtn icon={'icon-edit'} onClick={this.goToNodeEditPage} className={inlineToolsActionClassName} />,
      <IcoBtn icon={'icon-delete'} onClick={this.deleteRecord} className={inlineToolsActionClassName} />
    ];

    if (this.props.selectedRecords.length) {
      return null;
    }

    if (!this.props.notGoToJournalPageWithFilter) {
      tools.push(<IcoBtn onClick={this.goToJournalPageWithFilter} icon={'icon-big-arrow'} className={inlineToolsActionClassName} />);
    }

    return <InlineTools tools={tools} />;
  };

  deleteRecord = () => {
    const selectedRow = this.getSelectedRow();
    this.props.deleteRecords([selectedRow.id]);
    this.clearSelectedRow();
    this.hideGridInlineToolSettings();
  };

  deleteRecords = () => {
    const { selectedRecords, deleteRecords } = this.props;
    deleteRecords(selectedRecords);
  };

  tools = () => {
    const toolsActionClassName = 'ecos-btn_i_sm ecos-btn_grey4 ecos-btn_hover_t-dark-brown';
    const {
      selectAllRecordsVisible,
      selectAllRecords,
      grid: { total }
    } = this.props;

    return (
      <Tools
        onSelectAll={this.setSelectAllRecords}
        selectAllVisible={selectAllRecordsVisible}
        selectAll={selectAllRecords}
        total={total}
        tools={[
          <IcoBtn icon={'icon-download'} className={toolsActionClassName} title={t('grid.tools.zip')} />,
          <IcoBtn icon={'icon-copy'} className={toolsActionClassName} />,
          <IcoBtn icon={'icon-big-arrow'} className={toolsActionClassName} />,
          <IcoBtn icon={'icon-delete'} className={toolsActionClassName} title={t('grid.tools.delete')} onClick={this.deleteRecords} />
        ]}
      />
    );
  };

  onRowClick = row => {
    trigger.call(this, 'onRowClick', row);
  };

  render() {
    const {
      selectedRecords,
      selectAllRecords,
      saveRecords,
      className,
      loading,
      grid: {
        data,
        columns,
        sortBy,
        pagination: { maxItems }
      },
      doInlineToolsOnRowClick = false
    } = this.props;

    return (
      <div className={'ecos-journal-dashlet__grid'}>
        <EmptyGrid maxItems={maxItems} diff={15}>
          {loading ? (
            <Loader />
          ) : (
            <Grid
              data={data}
              columns={columns}
              className={className}
              freezeCheckboxes
              filterable
              editable
              multiSelectable
              sortBy={sortBy}
              changeTrOptionsByRowClick={doInlineToolsOnRowClick}
              filters={this.filters}
              inlineTools={this.inlineTools}
              tools={this.tools}
              onSort={this.sort}
              onFilter={this.onFilter}
              onSelect={this.setSelectedRecords}
              onRowClick={doInlineToolsOnRowClick && this.onRowClick}
              onMouseLeave={!doInlineToolsOnRowClick && this.hideGridInlineToolSettings}
              onChangeTrOptions={this.showGridInlineToolSettings}
              onScrolling={this.hideGridInlineToolSettings}
              onEdit={saveRecords}
              selected={selectedRecords}
              selectAll={selectAllRecords}
            />
          )}
        </EmptyGrid>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(JournalsDashletGrid);
