import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';

import { isMobileDevice, t } from '../../helpers/util';
import { DocScaleOptions, MIN_WIDTH_DASHLET_LARGE, MIN_WIDTH_DASHLET_SMALL } from '../../constants';
import UserLocalSettingsService from '../../services/userLocalSettings';
import Dashlet from '../Dashlet/Dashlet';
import DocPreview from './DocPreview';
import BaseWidget from '../BaseWidget';

import './style.scss';

const isMobile = isMobileDevice();

class DocPreviewDashlet extends BaseWidget {
  static propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    fileName: PropTypes.string,
    classNamePreview: PropTypes.string,
    classNameDashlet: PropTypes.string,
    config: PropTypes.shape({
      link: PropTypes.string.isRequired
    }),
    dragHandleProps: PropTypes.object,
    canDragging: PropTypes.bool,
    maxHeightByContent: PropTypes.bool
  };

  static defaultProps = {
    title: t('doc-preview.preview'),
    classNamePreview: '',
    fileName: '',
    classNameDashlet: '',
    dragHandleProps: {},
    maxHeightByContent: true
  };

  docPreviewRef = React.createRef();

  constructor(props) {
    super(props);

    UserLocalSettingsService.checkOldData(props.id);

    this.state = {
      width: MIN_WIDTH_DASHLET_SMALL,
      userHeight: UserLocalSettingsService.getDashletHeight(props.id),
      scale: isMobile ? DocScaleOptions.PAGE_WHOLE : UserLocalSettingsService.getDashletScale(props.id) || DocScaleOptions.AUTO,
      isCollapsed: UserLocalSettingsService.getProperty(props.id, 'isCollapsed'),
      fitHeights: {}
    };
  }

  get otherHeight() {
    if (!this.props.maxHeightByContent) {
      return null;
    }

    return get(this.docPreviewRef, 'current.refToolbar.current.offsetHeight', 0) + 24 + 14;
  }

  onResize = width => {
    this.setState({ width });
  };

  setUserScale = scale => {
    if (scale && !isMobile) {
      UserLocalSettingsService.setDashletScale(this.props.id, scale);
    }
  };

  setContainerPageHeight = height => {
    if (height !== this.state.userHeight) {
      this.setState({
        userHeight: height,
        fitHeights: {
          ...this.state.fitHeights,
          max: height
        }
      });
    }
  };

  render() {
    const { title, config, classNamePreview, classNameDashlet, dragHandleProps, canDragging, fileName } = this.props;
    const { width, userHeight, fitHeights, scale, isCollapsed } = this.state;
    const classesDashlet = classNames('ecos-doc-preview-dashlet', classNameDashlet, {
      'ecos-doc-preview-dashlet_small': width < MIN_WIDTH_DASHLET_LARGE && !isMobile,
      'ecos-doc-preview-dashlet_mobile': isMobile,
      'ecos-doc-preview-dashlet_mobile_small': isMobile && width < 400
    });

    return (
      <Dashlet
        title={title}
        bodyClassName="ecos-doc-preview-dashlet__body"
        className={classesDashlet}
        actionReload={false}
        actionEdit={false}
        actionHelp={false}
        needGoTo={false}
        canDragging={canDragging}
        onResize={this.onResize}
        onChangeHeight={this.handleChangeHeight}
        dragHandleProps={dragHandleProps}
        resizable
        contentMaxHeight={this.clientHeight + this.otherHeight}
        getFitHeights={this.setFitHeights}
        onToggleCollapse={this.handleToggleContent}
        isCollapsed={isCollapsed}
      >
        <DocPreview
          ref={this.docPreviewRef}
          forwardedRef={this.contentRef}
          link={config.link}
          height={userHeight}
          className={classNamePreview}
          minHeight={fitHeights.min}
          maxHeight={fitHeights.max}
          scale={scale}
          fileName={fileName}
          setUserScale={this.setUserScale}
          getContainerPageHeight={this.setContainerPageHeight}
          resizable
          isCollapsed={isCollapsed}
        />
      </Dashlet>
    );
  }
}

export default DocPreviewDashlet;
