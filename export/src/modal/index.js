import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import EcosModal from '../../../src/components/common/EcosModal';

const EMPTY_HEADER_TITLE = ' ';

class ModalWrapper extends React.Component {
  state = {
    isOpen: true
  };

  componentDidMount() {
    if (typeof this.props.getInstance === 'function') {
      this.props.getInstance(this);
    }
  }

  close = (callback) => {
    this.setState({
      isOpen: false
    }, () => {
      if (typeof this.props.onHideModal === 'function') {
        this.props.onHideModal();
      }
      if (typeof callback === 'function') {
        callback();
      }
    });
  };

  render() {
    let classNames = [];
    if (this.props.className) {
      classNames.push(this.props.className);
    }
    if (this.props.title === EMPTY_HEADER_TITLE) {
      classNames.push('ecos-modal_empty-header');
    }

    return (
      <EcosModal
        isOpen={this.state.isOpen}
        hideModal={this.close}
        title={this.props.title}
        className={classNames.join(' ')}
        zIndex={9000}
        reactstrapProps={this.props.reactstrapProps}
      >
        {this.props.children}
      </EcosModal>
    );
  }
}

ModalWrapper.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.string,
  onHideModal: PropTypes.func,
  getInstance: PropTypes.func,
  reactstrapProps: PropTypes.object,
};

class Modal {
  open = (node, config = {}, callback) => {
    this.el = document.createElement('div');
    document.body.appendChild(this.el);

    if (config.rawHtml) {
      node = <div dangerouslySetInnerHTML={{__html: node}} />
    }

    ReactDOM.render(
      <ModalWrapper
        title={config.title || config.header || EMPTY_HEADER_TITLE}
        className={config.class}
        onHideModal={this.destroy}
        getInstance={el => this.modal = el}
        reactstrapProps={config.reactstrapProps}
      >
        {node}
      </ModalWrapper>,
      this.el,
      callback
    );
  };

  close = (callback) => {
    this.modal.close(callback);
  };

  destroy = () => {
    ReactDOM.unmountComponentAtNode(this.el);
    document.body.removeChild(this.el);
  };
}

export default Modal;
