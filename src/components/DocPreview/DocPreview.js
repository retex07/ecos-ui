import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import pdfjs from 'pdfjs-dist';
import Toolbar from './Toolbar';
import PdfViewer from './PdfViewer';
import ImgViewer from './ImgViewer';
import getViewer from './Viewer';
import { fileDownload, isPDFbyStr } from '../../helpers/util';

// 2.1.266 version of worker for 2.1.266 version of pdfjs-dist:
// pdfjs.GlobalWorkerOptions.workerSrc = '//cdn.jsdelivr.net/npm/pdfjs-dist@2.1.266/build/pdf.worker.min.js';
pdfjs.GlobalWorkerOptions.workerSrc = '//unpkg.com/pdfjs-dist@2.1.266/build/pdf.worker.min.js';

class DocPreview extends Component {
  static propTypes = {
    link: PropTypes.string.isRequired,
    className: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    scale: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  };

  static defaultProps = {
    className: '',
    height: 'inherit',
    scale: 0.5
  };

  className = 'ecos-doc-preview';

  constructor(props) {
    super(props);

    this.state = {
      pdf: {},
      settings: {},
      isLoading: this.isPDF,
      scrollPage: 0,
      isFullscreen: false
    };
  }

  componentDidMount() {
    if (this.isPDF) {
      const { link } = this.props;
      const loadingTask = pdfjs.getDocument(link);

      loadingTask.promise.then(
        pdf => {
          this.setState({ pdf, isLoading: false });
        },
        err => {
          console.error(`Error during loading document: ${err}`);
          this.setState({ isLoading: false });
        }
      );
    }
  }

  get isPDF() {
    const { link } = this.props;

    return isPDFbyStr(link);
  }

  onChangeSettings = settings => {
    this.setState({ settings });
  };

  onDownload = () => {
    const { link } = this.props;

    fileDownload(link);
  };

  onFullscreen = (isFullscreen = false) => {
    this.setState(state => ({
      settings: {
        ...state.settings,
        isFullscreen
      }
    }));
  };

  setScrollPage = (scrollPage = 0) => {
    this.setState(state => ({
      scrollPage,
      settings: {
        ...state.settings,
        currentPage: scrollPage
      }
    }));
  };

  setCalcScale = calcScale => {
    this.setState({ calcScale });
  };

  renderPdf() {
    const { height } = this.props;
    const { pdf, settings, isLoading } = this.state;
    const commonProps = {
      settings,
      height,
      calcScale: this.setCalcScale,
      onFullscreen: this.onFullscreen
    };
    const PDF = getViewer(PdfViewer, this.className, true);

    return <PDF pdf={pdf} isLoading={isLoading} scrollPage={this.setScrollPage} {...commonProps} />;
  }

  renderImg() {
    const { link, height } = this.props;
    const { settings } = this.state;
    const commonProps = {
      settings,
      height,
      calcScale: this.setCalcScale,
      onFullscreen: this.onFullscreen
    };
    const IMG = getViewer(ImgViewer, this.className);

    return <IMG urlImg={link} {...commonProps} />;
  }

  render() {
    const { scale, className } = this.props;
    const { pdf, scrollPage, calcScale } = this.state;
    const { _pdfInfo = {} } = pdf;
    const { numPages = 0 } = _pdfInfo;

    return (
      <div className={classNames(this.className, className)}>
        <Toolbar
          totalPages={numPages}
          ctrClass={this.className}
          isPDF={this.isPDF}
          onChangeSettings={this.onChangeSettings}
          onDownload={this.onDownload}
          onFullscreen={this.onFullscreen}
          scale={scale}
          scrollPage={scrollPage}
          calcScale={calcScale}
        />
        {this.isPDF ? this.renderPdf() : this.renderImg()}
      </div>
    );
  }
}

export default DocPreview;
