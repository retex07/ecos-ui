import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { t } from '../../helpers/util';
import { MenuSettings as MS } from '../../constants/menu';
import IconSelect from '../../components/IconSelect';
import { EcosIcon, EcosModal } from '../../components/common';
import { Input } from '../../components/common/form';
import { Btn } from '../../components/common/btns';
import { Field } from './Field';

import './style.scss';

const Labels = {
  FIELD_NAME_LABEL: 'menu-settings.editor-item.field.name.label',
  FIELD_URL_LABEL: 'menu-settings.editor-item.field.url.label',
  FIELD_ICON_LABEL: 'menu-settings.editor-item.field.icon.label',
  FIELD_ICON_BTN_CANCEL: 'menu-settings.editor-item.field.icon.btn.cancel',
  FIELD_ICON_BTN_SELECT: 'menu-settings.editor-item.field.icon.btn.select',
  FIELD_ICON_DESC: 'icon-select.custom.tip',
  MODAL_TITLE_ADD: 'menu-settings.editor-item.title.add',
  MODAL_TITLE_EDIT: 'menu-settings.editor-item.title.edit',
  MODAL_BTN_CANCEL: 'menu-settings.editor-item.btn.cancel',
  MODAL_BTN_ADD: 'menu-settings.editor-item.btn.add',
  MODAL_BTN_EDIT: 'menu-settings.editor-item.btn.edit'
};

function EditorItemModal({ item, type, onClose, onSave, customIcons }) {
  const defaultIcon = { value: 'icon-empty-icon', type: 'icon' };
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState(defaultIcon);
  const [isOpenSelectIcon, setOpenSelectIcon] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setUrl(item.url);
      setIcon(item.icon);
    }
  }, [item]);

  const handleCancel = () => {
    onClose();
  };

  const handleApply = () => {
    onSave({ name, icon, type: type.key, edited: !!item });
  };

  const handleApplyIcon = newIcon => {
    setIcon(newIcon);
    setOpenSelectIcon(false);
  };

  const isValid = () => {
    return !name;
  };

  const title =
    (!item ? t(Labels.MODAL_TITLE_ADD) : t(Labels.MODAL_TITLE_EDIT)) + ': ' + t(type.label) + (!!item ? ` \"${item.name}\"` : '');

  return (
    <EcosModal className="ecos-menu-create-section__modal ecos-modal_width-xs" isOpen hideModal={onClose} title={title}>
      <Field label={t(Labels.FIELD_NAME_LABEL)} required>
        <Input onChange={e => setName(e.target.value)} value={name} />
      </Field>
      {/*todo valid url*/}
      {[MS.ItemTypes.ARBITRARY].includes(type.key) && (
        <Field label={t(Labels.FIELD_URL_LABEL)} required>
          <Input onChange={e => setUrl(e.target.value)} value={url} />
        </Field>
      )}
      {![MS.ItemTypes.HEADER_DIVIDER].includes(type.key) && (
        <Field label={t(Labels.FIELD_ICON_LABEL)} description={t(Labels.FIELD_ICON_DESC)}>
          <div className="ecos-menu-create-section__field-icon">
            <EcosIcon data={icon} />
            <div className="ecos--flex-space" />
            <Btn className="ecos-btn_hover_light-blue2 ecos-btn_sq_sm" onClick={() => setIcon(item.icon)}>
              {t(Labels.FIELD_ICON_BTN_CANCEL)}
            </Btn>
            <Btn className="ecos-btn_hover_light-blue2 ecos-btn_sq_sm" onClick={() => setOpenSelectIcon(true)}>
              {t(Labels.FIELD_ICON_BTN_SELECT)}
            </Btn>
          </div>
          {/*todo prefix */}
          {isOpenSelectIcon && (
            <IconSelect
              customIcons={customIcons}
              prefixIcon="icon-c"
              useFontIcons
              selectedIcon={icon}
              onClose={() => setOpenSelectIcon(false)}
              onSave={handleApplyIcon}
            />
          )}
        </Field>
      )}

      <div className="ecos-menu-create-section__buttons">
        <Btn onClick={handleCancel}>{t(Labels.MODAL_BTN_CANCEL)}</Btn>
        <Btn onClick={handleApply} className="ecos-btn_blue ecos-btn_hover_light-blue" disabled={isValid()}>
          {!!item ? t(Labels.MODAL_BTN_EDIT) : t(Labels.MODAL_BTN_ADD)}
        </Btn>
      </div>
    </EcosModal>
  );
}

EditorItemModal.propTypes = {
  className: PropTypes.string,
  type: PropTypes.object,
  item: PropTypes.object,
  onClose: PropTypes.func,
  onSave: PropTypes.func
};

EditorItemModal.defaultProps = {
  className: ''
};

export default EditorItemModal;
