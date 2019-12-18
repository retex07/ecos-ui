import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { getBase64Barcode } from '../../../actions/barcode';
import { getBarcodePrintUrl } from '../../../helpers/urls';
import { t } from '../../../helpers/util';
import { Btn } from '../../common/btns/index';

import './style.scss';

const mapStateToProps = (state, context) => {
  const stateB = state.barcode[context.stateId] || {};

  return {
    barcode: stateB.barcode,
    error: stateB.error,
    isLoading: stateB.isLoading
  };
};

const mapDispatchToProps = dispatch => ({
  generateBase64Barcode: payload => dispatch(getBase64Barcode(payload))
});

class Barcode extends React.Component {
  static propTypes = {
    record: PropTypes.string.isRequired,
    stateId: PropTypes.string.isRequired,
    className: PropTypes.string
  };

  static defaultProps = {
    className: ''
  };

  componentDidMount() {
    const { generateBase64Barcode, record, stateId } = this.props;

    generateBase64Barcode({ stateId, record });
  }

  runGenerateBarcode = () => {
    const { stateId, record, generateBase64Barcode } = this.props;

    generateBase64Barcode({ stateId, record });
  };

  runPrint = () => {
    const { record } = this.props;
    const url = getBarcodePrintUrl(record);

    window.open(url, '_blank');
  };

  render() {
    const { isLoading, barcode, error, className } = this.props;

    return (
      <div className={classNames('ecos-barcode', className)}>
        <div className="ecos-barcode__container">
          {error && <div className="ecos-barcode__error">{error}</div>}
          <Btn
            className="ecos-btn_blue ecos-btn_full-width ecos-btn_focus_no"
            loading={isLoading}
            disabled={isLoading}
            onClick={this.runGenerateBarcode}
          >
            {!barcode ? t('barcode-widget.btn.generate') : t('barcode-widget.btn.generate-new')}
          </Btn>
          {barcode && <img className="ecos-barcode__image" src={barcode} alt={t('barcode-widget.dashlet.title')} />}
        </div>
        <Btn className="ecos-btn_blue ecos-btn_full-width ecos-btn_focus_no" onClick={this.runPrint} disabled={!!error}>
          {t('barcode-widget.btn.print')}
        </Btn>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Barcode);