import React from 'react';

import BaseWidget from '../../../components/widgets/BaseWidget';
import Dashlet from '../../../components/Dashlet';
import { t } from '../../../helpers/util';
import Labels from './Labels';
import JournalsTabsContent from './JournalsTabsContent';

import './style.scss';

class JournalsTabsWidget extends BaseWidget {
  render() {
    const { instanceId } = this.props;

    return (
      <Dashlet
        title={t(Labels.WIDGET_TITLE)}
        needGoTo={false}
        onToggleCollapse={this.handleToggleContent}
        isCollapsed={this.isCollapsed}
        setRef={this.setDashletRef}
      >
        <JournalsTabsContent instanceId={instanceId} />
      </Dashlet>
    );
  }
}

export default JournalsTabsWidget;
