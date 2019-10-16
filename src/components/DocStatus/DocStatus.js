import * as React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import { changeDocStatus, getCheckDocStatus, getDocStatus, initDocStatus, resetDocStatus, updateDocStatus } from '../../actions/docStatus';
import { selectStateDocStatusById } from '../../selectors/docStatus';
import DocStatusService from '../../services/docStatus';
import { deepClone } from '../../helpers/util';
import { Loader } from '../common';
import { IcoBtn } from '../common/btns';
import { Caption, Dropdown } from '../common/form';

import './style.scss';

const mapStateToProps = (state, context) => {
  const stateDS = selectStateDocStatusById(state, context.stateId);

  return {
    status: stateDS.status,
    isUpdating: stateDS.isUpdating,
    countAttempt: stateDS.countAttempt,
    isLoading: stateDS.isLoading,
    availableToChangeStatuses: stateDS.availableToChangeStatuses,
    updateRequestRecord: state.docStatus.updateRequestRecord
  };
};

const mapDispatchToProps = dispatch => ({
  initDocStatus: payload => dispatch(initDocStatus(payload)),
  changeDocStatus: payload => dispatch(changeDocStatus(payload)),
  getDocStatus: payload => dispatch(getDocStatus(payload)),
  getCheckDocStatus: payload => dispatch(getCheckDocStatus(payload)),
  updateDocStatus: payload => dispatch(updateDocStatus(payload)),
  resetDocStatus: payload => dispatch(resetDocStatus(payload))
});

const MAX_ATTEMPT = 10;

class DocStatus extends React.Component {
  static propTypes = {
    record: PropTypes.string.isRequired,
    stateId: PropTypes.string.isRequired,
    className: PropTypes.string,
    title: PropTypes.string,
    isMobile: PropTypes.bool
  };

  static defaultProps = {
    className: '',
    title: '',
    isMobile: false
  };

  state = {
    wasChanged: false
  };

  checkDocStatusPing = debounce(() => {
    const { stateId, record, getCheckDocStatus } = this.props;

    getCheckDocStatus({ stateId, record });
  }, 2000);

  componentDidMount() {
    const { stateId, record, initDocStatus } = this.props;

    initDocStatus({ stateId, record });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { stateId, record, isLoading, getDocStatus, updateDocStatus } = this.props;

    if (nextProps.updateRequestRecord === record) {
      updateDocStatus({ stateId });
    }

    if (!isLoading) {
      if (nextProps.isUpdating && nextProps.countAttempt < MAX_ATTEMPT) {
        this.checkDocStatusPing();
      } else if (!nextProps.isUpdating || nextProps.countAttempt === MAX_ATTEMPT) {
        this.checkDocStatusPing.cancel();

        if (isEmpty(nextProps.status)) {
          getDocStatus({ stateId, record });
        }
      }
    }
  }

  componentWillUnmount() {
    const { resetDocStatus, stateId } = this.props;

    resetDocStatus({ stateId });
  }

  get isNoStatus() {
    const { status = {} } = this.props;

    return status.id === DocStatusService.NO_STATUS.id;
  }

  get isReadField() {
    const { availableToChangeStatuses } = this.props;

    return isEmpty(availableToChangeStatuses);
  }

  get isShowLoader() {
    const { isLoading, isUpdating, countAttempt, status } = this.props;

    return isLoading || (isUpdating && countAttempt < MAX_ATTEMPT) || isEmpty(status);
  }

  onChangeStatus = () => {
    const { stateId, record, changeDocStatus } = this.props;

    this.setState({ wasChanged: true });
    changeDocStatus({ stateId, record });
  };

  renderReadField() {
    const { status = {} } = this.props;
    const classStatus = classNames('ecos-doc-status__data ecos-doc-status__data_read', {
      'ecos-doc-status__data_no-status': this.isNoStatus
    });

    return (
      <div className={classStatus} title={status.name}>
        {status.name}
      </div>
    );
  }

  renderManualField() {
    const { availableToChangeStatuses = [], status } = this.props;
    const source = deepClone(availableToChangeStatuses);
    const classStatus = classNames('ecos-btn_drop-down ecos-btn_full-width ecos-btn_narrow', {
      'ecos-btn_blue': !this.isNoStatus || this.isShowLoader
    });

    source.push(status);

    return (
      <div className="ecos-doc-status__data ecos-doc-status__data_manual">
        <Dropdown source={source} value={status.id} valueField={'id'} titleField={'name'} onChange={this.onChangeStatus} hideSelected>
          <IcoBtn invert icon={'icon-down'} className={classStatus} loading={this.isShowLoader} />
        </Dropdown>
      </div>
    );
  }

  render() {
    const { isMobile, title } = this.props;
    const { wasChanged } = this.state;

    return (
      <div className={classNames('ecos-doc-status', { 'ecos-doc-status_narrow': !isMobile })}>
        {this.isShowLoader && !wasChanged ? (
          <Loader className="ecos-doc-status__loader" />
        ) : (
          <>
            {!isMobile && (
              <Caption middle className="ecos-doc-status__title">
                {title}
              </Caption>
            )}
            {this.isReadField && this.renderReadField()}
            {!this.isReadField && this.renderManualField()}
          </>
        )}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DocStatus);
