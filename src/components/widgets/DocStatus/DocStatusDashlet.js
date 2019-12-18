import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isMobileDevice, t } from '../../../helpers/util';
import UserLocalSettingsService from '../../../services/userLocalSettings';
import Dashlet from '../../Dashlet/Dashlet';
import DocStatus from './DocStatus';

import './style.scss';

class DocStatusDashlet extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    record: PropTypes.string.isRequired,
    classNameStatus: PropTypes.string,
    classNameDashlet: PropTypes.string,
    title: PropTypes.string,
    config: PropTypes.shape({})
  };

  static defaultProps = {
    classNameStatus: '',
    classNameDashlet: '',
    title: ''
  };

  state = {
    isSmall: false
  };

  constructor(props) {
    super(props);

    this.state.isCollapsed = UserLocalSettingsService.getProperty(props.id, 'isCollapsed');
  }

  handleToggleContent = (isCollapsed = false) => {
    this.setState({ isCollapsed });
    UserLocalSettingsService.setProperty(this.props.id, { isCollapsed });
  };

  onResize = w => {
    this.setState({ isSmall: w <= 263 });
  };

  render() {
    const { config, classNameStatus, classNameDashlet, record } = this.props;
    const { isSmall, isCollapsed } = this.state;
    const isMobile = isMobileDevice();
    const title = this.props.title || t('doc-status-widget.title');
    const isBig = !(isMobile || isSmall);

    return (
      <Dashlet
        title={title}
        className={classNames('ecos-doc-status-dashlet', classNameDashlet, { 'ecos-doc-status-dashlet_mobile': isMobile })}
        bodyClassName="ecos-doc-status-dashlet__body"
        resizable={false}
        collapsible={!isBig}
        needGoTo={false}
        actionHelp={false}
        actionReload={false}
        actionDrag={isMobile}
        actionEdit={false}
        onResize={this.onResize}
        onToggleCollapse={this.handleToggleContent}
        isCollapsed={isCollapsed}
        noHeader={isBig}
      >
        <DocStatus title={title} isMobile={isMobile || isSmall} {...config} className={classNameStatus} record={record} stateId={record} />
      </Dashlet>
    );
  }
}

export default DocStatusDashlet;