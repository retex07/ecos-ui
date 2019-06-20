import React, { Component, Fragment } from 'react';
import connect from 'react-redux/es/connect/connect';
import { Well } from '../../common/form';
import JournalsDashletGrid from '../JournalsDashletGrid';
import JournalsPreview from '../JournalsPreview';
import JournalsUrlManager from '../JournalsUrlManager';
import Columns from '../../common/templates/Columns/Columns';
import { initPreview } from '../../../actions/journals';

import './JournalsContent.scss';

const mapDispatchToProps = dispatch => ({
  initPreview: nodeRef => dispatch(initPreview(nodeRef))
});

const Grid = ({ showPreview, onRowClick }) => (
  <Well>
    <JournalsDashletGrid onRowClick={onRowClick} doInlineToolsOnRowClick={showPreview} className={'ecos-grid_no-top-border'} />
  </Well>
);

const Preview = () => (
  <Well className={'ecos-well_full ecos-journals-content__preview-well'}>
    <JournalsPreview />
  </Well>
);

const Pie = () => (
  <Fragment>
    <div>{'showPie'}</div>
  </Fragment>
);

class JournalsContent extends Component {
  onRowClick = row => {
    this.props.initPreview(row.id);
  };

  render() {
    let { showPreview, showPie } = this.props;

    showPie = false;

    let cols = [<Grid showPreview={showPreview} onRowClick={this.onRowClick} />];
    if (showPreview) cols = [<Grid showPreview={showPreview} onRowClick={this.onRowClick} />, <Preview />];
    if (showPie) cols = [<Pie />];

    return (
      <JournalsUrlManager params={{ showPreview }}>
        <Columns
          classNamesColumn={'columns_height_full columns__column_margin_0'}
          cols={cols}
          cfgs={[{}, { className: 'ecos-journals-content_col-step' }]}
        />
      </JournalsUrlManager>
    );
  }
}

export default connect(
  null,
  mapDispatchToProps
)(JournalsContent);
