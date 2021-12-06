import React from 'react';
import cloneDeep from 'lodash/cloneDeep';

import EcosModal from '../../common/EcosModal';
import EcosFormBuilder from './EcosFormBuilder';
import DialogManager from '../../common/dialogs/Manager';
import { t } from '../../../helpers/export/util';

const Labels = {
  CLOSE_CONFIRM_DESCRIPTION: 'ecos-form.builder.confirm-close.description'
};

export default class EcosFormBuilderModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formDefinition: {},
      isModalOpen: false
    };
  }

  show(formDefinition, onSubmit) {
    this.setState({
      isModalOpen: true,
      formDefinition: cloneDeep(formDefinition),
      onSubmit
    });
  }

  hide() {
    this.setState({
      isModalOpen: false
    });
  }

  toggleVisibility() {
    DialogManager.confirmDialog({
      text: t(Labels.CLOSE_CONFIRM_DESCRIPTION),
      onYes: () => {
        this.setState(({ isModalOpen }) => ({
          isModalOpen: !isModalOpen
        }));
      }
    });
  }

  onSubmit = form => {
    if (this.state.onSubmit) {
      this.state.onSubmit(form);
    }
    this.hide();
  };

  render() {
    const { isModalOpen, formDefinition } = this.state;

    return (
      <EcosModal
        reactstrapProps={{
          backdrop: 'static'
        }}
        className="ecos-modal_width-extra-lg"
        title={t('eform.modal.title.constructor')}
        isOpen={isModalOpen}
        hideModal={this.toggleVisibility}
      >
        <EcosFormBuilder formDefinition={formDefinition} onSubmit={this.onSubmit} onCancel={this.toggleVisibility} />
      </EcosModal>
    );
  }
}
