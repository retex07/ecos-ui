import React from 'react';

import { t } from '../../helpers/util';
import { ActionTypes } from '../Records/actions';
import recordActions from '../Records/actions/recordActions';
import { Btn } from '../common/btns';
import dialogManager from '../common/dialogs/Manager/DialogManager';
import { DocPreview } from '../widgets/DocPreview';

import './style.scss';

const Labels = {
  BTN_CANCEL_BP: 'business-process-viewer.button.cancel-bp',
  MSG_CANCEL_BP: 'business-process-viewer.dialog.msg'
};

export default class BusinessProcessViewer extends React.Component {
  state = {
    disabledCancelBP: false
  };

  handleCancelBP = () => {
    const { recordId } = this.props;

    this.setState({ disabledCancelBP: true });

    dialogManager.confirmDialog({
      modalClass: 'ecos-modal_width-xs',
      title: t(Labels.MSG_CANCEL_BP),
      onYes: () => {
        recordActions
          .execForRecord(recordId, {
            type: ActionTypes.CANCEL_WORKFLOW
          })
          .then(success => !success && this.setState({ disabledCancelBP: false }));
      },
      onNo: () => this.setState({ disabledCancelBP: false })
    });
  };

  render() {
    const { recordId } = this.props;
    const { disabledCancelBP } = this.state;

    return (
      <div className="ecos-business-process">
        <div className="ecos-business-process__content">
          <DocPreview height={'100%'} scale={1} recordId={recordId} noIndents />
        </div>
        <div className="ecos-business-process__actions">
          <Btn onClick={this.handleCancelBP} disabled={disabledCancelBP}>
            {t(Labels.BTN_CANCEL_BP)}
          </Btn>
        </div>
      </div>
    );
  }
}
