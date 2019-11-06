import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import getCadespluginAPI from 'async-cadesplugin';

import { Btn } from '../common/btns';
import { EsignApi } from '../../api/esign';
import { selectStateByKey } from '../../selectors/esign';
import { init, getCertificates } from '../../actions/esign';

// const esignApi = new EsignApi();

class Esign extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpenModal: false
    };

    this.props.init();
  }

  async sign() {
    const certificates = await this.state.api.getValidCertificates();

    console.warn('certificates => ', certificates);

    try {
      const base64DataToSign = btoa('Hello world');
      const api = await getCadespluginAPI();
      const certificate = await api.getFirstValidCertificate();
      const signature = await api.signBase64(certificate.thumbprint, base64DataToSign);

      console.log(await certificate.privateKey.ProviderName, await certificate.privateKey.ProviderType);
    } catch (error) {
      console.log(error.message);
    }
  }

  handleClickSign = () => {
    this.props.getCertificates();
    this.setState({ isOpenModal: true });
    // documentSign('workspace://SpacesStore/e617a72f-02fa-4fcd-9ba3-685cd8b3f9f6')
  };

  getRefInfo() {
    // esignApi.getDocumentData(this.props.nodeRef).then(
    //   async function(result) {
    //     const base64 = get(result, 'data.0.base64');
    //     const certificate = await this.state.api.getFirstValidCertificate();
    //
    //     this.setState({ base64 });
    //     const signature = await this.state.api.signBase64(certificate.thumbprint, base64);
    //
    //     console.warn('signature => ', signature);
    //   }.bind(this)
    // );
  }

  render() {
    return (
      <>
        <Btn className="ecos-btn_blue ecos-btn_hover_light-blue" onClick={this.handleClickSign} disabled={this.state.api === null}>
          Подписать
        </Btn>
      </>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...selectStateByKey(state, ownProps.nodeRef)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  init: () => dispatch(init(ownProps.nodeRef)),
  getCertificates: () => dispatch(getCertificates(ownProps.nodeRef))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Esign);
