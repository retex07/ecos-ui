import React, { Component } from 'react';
import get from 'lodash/get';
import debounce from 'lodash/debounce';

import UserLocalSettingsService from '../../services/userLocalSettings';

class BaseWidget extends Component {
  contentRef = React.createRef();

  get clientHeight() {
    if (!this.props.maxHeightByContent) {
      return null;
    }

    return get(this.contentRef, 'current.offsetHeight', 0);
  }

  get otherHeight() {
    return null;
  }

  get fullHeight() {
    return this.clientHeight + this.otherHeight;
  }

  setContentHeight = contentHeight => {
    this.setState({ contentHeight });
  };

  setFitHeights = fitHeights => {
    this.setState({ fitHeights });
  };

  checkHeight = debounce((force = false) => {
    if (this.state.userHeight === undefined || this.state.userHeight > this.fullHeight || force) {
      this.setState({ userHeight: this.fullHeight });
    }
  }, 400);

  handleChangeHeight = height => {
    let pureHeight = height > 0 ? height : 0;

    if (this.state.userHeight === pureHeight) {
      return;
    }

    if (pureHeight > this.fullHeight) {
      pureHeight = this.fullHeight;
    }

    UserLocalSettingsService.setDashletHeight(this.props.id, pureHeight);
    this.setState({ userHeight: pureHeight });
  };

  handleToggleContent = (isCollapsed = false) => {
    this.setState({ isCollapsed });
    UserLocalSettingsService.setProperty(this.props.id, { isCollapsed });
  };

  handleResize = width => {
    this.setState({ width });
  };
}

export default BaseWidget;