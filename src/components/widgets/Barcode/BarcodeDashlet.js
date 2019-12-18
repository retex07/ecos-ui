import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { isMobileDevice, t } from '../../../helpers/util';
import Dashlet from '../../Dashlet/Dashlet';
import Barcode from './Barcode';
import BaseWidget from '../BaseWidget';

import './style.scss';

class BarcodeDashlet extends BaseWidget {
  static propTypes = {
    id: PropTypes.string.isRequired,
    record: PropTypes.string.isRequired,
    title: PropTypes.string,
    classNameBarcode: PropTypes.string,
    classNameDashlet: PropTypes.string,
    config: PropTypes.shape({})
  };

  static defaultProps = {
    title: t('barcode-widget.dashlet.title'),
    classNameBarcode: '',
    classNameDashlet: ''
  };

  render() {
    const { id, title, config, classNameBarcode, classNameDashlet, record } = this.props;

    return (
      <Dashlet
        title={title}
        bodyClassName="ecos-barcode-dashlet__body"
        className={classNames('ecos-barcode-dashlet', classNameDashlet)}
        resizable={false}
        needGoTo={false}
        actionHelp={false}
        actionReload={false}
        actionDrag={isMobileDevice()}
        actionEdit={false}
      >
        <Barcode {...config} className={classNameBarcode} record={record} stateId={id} />
      </Dashlet>
    );
  }
}

export default BarcodeDashlet;