import React from 'react';
import PropTypes from 'prop-types';

import { t } from '../../../helpers/export/util';
import { Caption, Input, Textarea } from '../../common/form';
import { Btn } from '../../common/btns';

import './style.scss';

const Labels = {
  TITLE: 'doc-constructor-widget.settings.title',
  JOURNAL_TEMPLATES_ID: 'doc-constructor-widget.settings.prop.journal-templates-id',
  WIDGET_DISPLAY_CONDITION: 'doc-constructor-widget.settings.prop.widget-display-condition',
  BTN_CANCEL: 'doc-constructor-widget.settings.button.cancel',
  BTN_SAVE: 'doc-constructor-widget.settings.button.save'
};

class Settings extends React.Component {
  static propTypes = {
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    config: PropTypes.object
  };

  static defaultProps = {
    config: {}
  };

  state = {
    widgetDisplayCondition: '',
    journalTemplatesId: ''
  };

  componentDidMount() {
    const { widgetDisplayCondition, journalTemplatesId } = this.props.config;

    this.setState({ widgetDisplayCondition, journalTemplatesId });
  }

  onSave = () => {
    this.props.onSave({ ...this.state });
  };

  onCancel = () => {
    this.props.onCancel();
  };

  onChangeCondition = event => {
    this.setState({ widgetDisplayCondition: event.target.value });
  };

  onChangeJournalTemplates = event => {
    this.setState({ journalTemplatesId: event.target.value });
  };

  render() {
    return (
      <div className="ecos-doc-constructor-settings">
        <Caption middle className="ecos-doc-constructor-settings__title">
          {t(Labels.TITLE)}
        </Caption>
        <div className="ecos-doc-constructor-settings__block">
          <div className="ecos-doc-constructor-settings__subtitle">{t(Labels.JOURNAL_TEMPLATES_ID)}</div>
          <Input defaultValue={this.state.journalTemplatesId} onChange={this.onChangeJournalTemplates} />
        </div>
        <div className="ecos-doc-constructor-settings__block">
          <div className="ecos-doc-constructor-settings__subtitle">{t(Labels.WIDGET_DISPLAY_CONDITION)}</div>
          <Textarea value={this.state.widgetDisplayCondition} onChange={this.onChangeCondition} />
        </div>
        <div className="ecos-doc-constructor-settings__buttons">
          <Btn className="ecos-btn_hover_light-blue" onClick={this.onCancel}>
            {t(Labels.BTN_CANCEL)}
          </Btn>
          <Btn className="ecos-btn_blue ecos-btn_hover_light-blue" onClick={this.onSave}>
            {t(Labels.BTN_SAVE)}
          </Btn>
        </div>
      </div>
    );
  }
}

export default Settings;
