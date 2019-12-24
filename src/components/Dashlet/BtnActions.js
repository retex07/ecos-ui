import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';

import { t } from '../../helpers/util';
import { IcoBtn } from '../common/btns';

const handleClick = onClick => {
  if (typeof onClick === 'function') {
    return onClick.bind(this);
  }
};

const BtnAction = ({ id, text, icon, onClick }) => {
  return (
    <>
      <IcoBtn
        id={id}
        icon={icon}
        className="ecos-btn_i dashlet__btn_hidden ecos-btn_grey2 ecos-btn_width_auto ecos-btn_hover_t-light-blue"
        onClick={handleClick(onClick)}
      />
      {text && (
        <UncontrolledTooltip
          target={id}
          delay={0}
          placement="top"
          className="ecos-base-tooltip"
          innerClassName="ecos-base-tooltip-inner"
          arrowClassName="ecos-base-tooltip-arrow"
        >
          {text}
        </UncontrolledTooltip>
      )}
    </>
  );
};

const DropdownActions = ({ list, dashletId }) => {
  const id = `action-dropdown-${dashletId}`;

  return (
    <>
      <IcoBtn
        id={id}
        icon="icon-menu-normal-press"
        className="ecos-btn_i dashlet__btn_hidden ecos-btn_grey2 ecos-btn_width_auto ecos-btn_hover_t-light-blue"
      />
      <UncontrolledTooltip
        target={id}
        trigger="hover"
        delay={50}
        autohide={false}
        placement="bottom-end"
        className="header-action-dropmenu"
        innerClassName="header-action-dropmenu-inner"
        arrowClassName="header-action-dropmenu-arrow"
      >
        {list.map(({ id, text, icon, onClick, component }) =>
          component ? (
            <React.Fragment key={id}>
              {component} {!!text && text}
            </React.Fragment>
          ) : (
            <IcoBtn
              key={id}
              icon={icon}
              onClick={handleClick(onClick)}
              className="header-action-dropmenu__btn header-action-dropmenu__btn_with-text ecos-btn_grey6 ecos-btn_r_0"
            >
              {text}
            </IcoBtn>
          )
        )}
      </UncontrolledTooltip>
    </>
  );
};

const BtnActions = ({ actionConfig = {}, dashletId, actionRules }) => {
  const { orderActions, countShow = 4 } = actionRules || {};
  const baseOrderActions = ['edit', 'help', 'reload', 'settings'];
  const orderedActions = [];
  const actions = {
    edit: {
      icon: 'icon-edit',
      onClick: null,
      text: t('dashlet.edit.title')
    },
    help: {
      icon: 'icon-question',
      onClick: null,
      text: t('dashlet.help.title')
    },
    reload: {
      icon: 'icon-reload',
      onClick: null,
      text: t('dashlet.update.title')
    },
    settings: {
      icon: 'icon-settings',
      onClick: null,
      text: t('dashlet.settings.title')
    }
  };

  let updatedOrderActions = orderActions ? orderActions : [];

  for (const action in actionConfig) {
    actions[action] = {
      ...actions[action],
      ...actionConfig[action]
    };
  }

  if (!updatedOrderActions.length) {
    const leftoverKeys = Object.getOwnPropertyNames(actionConfig).filter(item => !baseOrderActions.includes(item));

    Array.prototype.push.apply(updatedOrderActions, baseOrderActions.concat(leftoverKeys));
  }

  updatedOrderActions = updatedOrderActions.filter(item => actions[item] && (actions[item].onClick || actions[item].component));

  updatedOrderActions.forEach((key, i) => {
    const action = actions[key];
    const id = `action-${key}-${dashletId}-${i}`;

    if (action && (action.component || action.onClick)) {
      orderedActions.push({ ...action, id });
    }
  });

  const renderIconActions = () => {
    const count = orderedActions.length > countShow ? countShow - 1 : countShow;

    return orderedActions.slice(0, count).map(action => <BtnAction key={action.id} {...action} />);
  };

  const renderDropActions = () => {
    if (orderedActions.length <= countShow) {
      return null;
    }

    const dropActions = orderedActions.slice(countShow - 1);

    if (!(dropActions && dropActions.length)) {
      return null;
    }

    return <DropdownActions list={dropActions} dashletId={dashletId} />;
  };

  return (
    <>
      {renderIconActions()}
      {renderDropActions()}
    </>
  );
};

export default BtnActions;
