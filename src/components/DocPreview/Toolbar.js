import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import { IcoBtn } from '../common/btns';
import { Dropdown, Input } from '../common/form';
import { getScaleModes, t } from '../../helpers/util';

const CUSTOM = 'custom';
const ZOOM_STEP = 0.15;

class Toolbar extends Component {
  static propTypes = {
    isPDF: PropTypes.bool.isRequired,
    ctrClass: PropTypes.string.isRequired,
    scale: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    totalPages: PropTypes.number.isRequired,
    onChangeSettings: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired
  };

  static defaultProps = {
    scale: 'auto'
  };

  className = 'ecos-btn_sq_sm ecos-btn_tight';

  constructor(props) {
    super(props);

    this.state = {
      scale: props.scale,
      currentPage: 1,
      isFullscreen: false,

      selectedZoom: '',
      isCustom: false
    };
  }

  componentDidMount() {
    const { scale } = this.state;

    this.onChangeZoomOption(this.zoomOptions.find(el => el.scale === scale));
  }

  componentWillReceiveProps(nextProps) {
    const { scrollPage: currentPage, calcScale: scale } = nextProps;

    if (currentPage !== this.props.scrollPage) {
      this.setState({ currentPage });
    }

    if (scale !== this.props.calcScale) {
      this.setState({ scale });
    }
  }

  get _toolbar() {
    const { ctrClass } = this.props;

    return `${ctrClass}__toolbar`;
  }

  get _group() {
    return `${this._toolbar}__group`;
  }

  get zoomOptions() {
    const { selectedZoom, scale } = this.state;
    const zooms = getScaleModes();

    if (selectedZoom === CUSTOM) {
      zooms.push({ id: CUSTOM, title: `${Math.round(scale * 10000) / 100}%`, scale });
    }

    return zooms;
  }

  handlePrev = () => {
    const { currentPage } = this.state;

    this.goToPage(null, currentPage - 1);
  };

  handleNext = () => {
    const { currentPage } = this.state;

    this.goToPage(null, currentPage + 1);
  };

  goToPage = (event, page = 1) => {
    const { totalPages } = this.props;
    const { currentPage } = this.state;
    let newPage = page;

    if (event) {
      newPage = parseInt(event.target.value);
      newPage = Number.isNaN(newPage) ? currentPage : newPage;
      newPage = newPage > totalPages ? totalPages : newPage;
      newPage = newPage < 1 ? currentPage : newPage;
    }

    if (newPage) {
      this.setState({ currentPage: newPage });

      if (newPage > 0 && newPage <= totalPages) {
        this.onChangeSettings({ ...this.state, currentPage: newPage });
      }
    }
  };

  onChangeZoomOption = ({ id, scale }) => {
    let newState = { ...this.state, selectedZoom: id, scale };

    this.setState(newState);
    this.onChangeSettings(newState);
  };

  setScale = direction => {
    const { scale } = this.state;
    const selectedZoom = CUSTOM;
    let currentScale = parseFloat(scale);

    if (Number.isNaN(currentScale)) {
      currentScale = 1;
    }

    currentScale += direction * ZOOM_STEP;
    currentScale = +Number(currentScale).toFixed(2);

    let newState = { ...this.state, selectedZoom, scale: currentScale };

    this.setState(newState);
    this.triggerScaleChange(newState);
  };

  triggerScaleChange = debounce(newState => {
    this.onChangeSettings(newState);
  }, 300);

  setFullScreen = () => {
    this.props.onFullscreen(true);
  };

  onChangeSettings = newState => {
    const { ...output } = newState;

    this.props.onChangeSettings(output);
  };

  renderPager() {
    const { currentPage } = this.state;
    const { totalPages } = this.props;

    return (
      <div className={classNames(`${this._group} ${this._toolbar}__pager`)}>
        <IcoBtn
          icon={'icon-left'}
          className={classNames(this.className, `${this._toolbar}__pager__prev`, { 'ecos-btn_disabled': currentPage === 1 })}
          onClick={this.handlePrev}
        />
        {!!totalPages && (
          <Fragment>
            <Input type="text" onChange={this.goToPage} value={currentPage} className={classNames(`${this._toolbar}__pager__input`)} />
            <span className={`${this._toolbar}__pager__text`}> {`${t('doc-preview.out-of')} ${totalPages}`} </span>
          </Fragment>
        )}
        <IcoBtn
          icon={'icon-right'}
          className={classNames(this.className, `${this._toolbar}__pager__next`, { 'ecos-btn_disabled': currentPage === totalPages })}
          onClick={this.handleNext}
        />
      </div>
    );
  }

  renderZoom() {
    const { scale, selectedZoom } = this.state;

    return (
      <div className={classNames(`${this._group} ${this._toolbar}__zoom`)}>
        <IcoBtn
          icon={'icon-minus'}
          className={classNames(this.className, { 'ecos-btn_disabled': scale <= ZOOM_STEP })}
          onClick={e => this.setScale(-1)}
        />
        <IcoBtn icon={'icon-plus'} className={this.className} onClick={e => this.setScale(1)} />
        <Dropdown source={this.zoomOptions} value={selectedZoom} valueField={'id'} titleField={'title'} onChange={this.onChangeZoomOption}>
          <IcoBtn
            invert={'true'}
            icon={'icon-down'}
            className={`${this.className} ecos-btn_drop-down ${this._toolbar}__zoom__btn-select`}
          />
        </Dropdown>
        <IcoBtn icon={'glyphicon glyphicon-fullscreen'} className={this.className} onClick={this.setFullScreen} />
      </div>
    );
  }

  renderExtraBtns() {
    return (
      <div className={classNames(`${this._group} ${this._toolbar}__extra-btns`)}>
        <IcoBtn icon={'icon-download'} className={this.className} onClick={this.props.onDownload} title={t('doc-preview.download')} />
      </div>
    );
  }

  render() {
    const { isPDF } = this.props;

    return (
      <div className={classNames(this._toolbar)}>
        {isPDF && this.renderPager()}
        {this.renderZoom()}
        {this.renderExtraBtns()}
      </div>
    );
  }
}

export default Toolbar;
