import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { NotificationManager } from 'react-notifications';
import { Collapse, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

import { ViewTypes } from '../../../constants/commonDesigner';
import { getMLValue, t } from '../../../helpers/util';
import { Input, MLText } from '../../common/form';
import actionsService from '../../Records/actions/recordActions';

import styles from './Category.module.scss';
import './Category.scss';

const EDIT_PERMISSIONS_ACTION_REF = 'uiserv/action@edit-permissions';

class DesignerCategory extends React.Component {
  static propTypes = {
    viewType: PropTypes.oneOf([ViewTypes.CARDS, ViewTypes.LIST, ViewTypes.TABLE]),
    searchText: PropTypes.string,
    label: PropTypes.object,
    sectionCode: PropTypes.string,
    level: PropTypes.number,
    isEditable: PropTypes.bool,
    canWrite: PropTypes.bool,
    isOpen: PropTypes.bool,
    isUserAdmin: PropTypes.bool,

    setIsEditable: PropTypes.func,
    toggleCollapse: PropTypes.func,
    setCollapse: PropTypes.func,
    showDeleteCategoryModal: PropTypes.func,
    createCategory: PropTypes.func,
    createModel: PropTypes.func,
    saveEditableCategory: PropTypes.func,
    cancelEditCategory: PropTypes.func
  };

  state = {
    dropdownOpen: false
  };

  static getDerivedStateFromProps(props, state) {
    if (props.searchText && !props.isOpen) {
      props.setCollapse(true);
    }

    return null;
  }

  constructor() {
    super();

    this.labelRef = React.createRef();
  }

  toggleDropdown = e => {
    e.stopPropagation();

    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  };

  doAddSubcategoryAction = () => {
    this.setState(
      {
        dropdownOpen: false
      },
      () => {
        this.props.setCollapse(true);
        this.props.createCategory();
      }
    );
  };

  doEditPermissionsAction = async () => {
    const recordId = this._getCategoryRef();
    const action = (await actionsService.getActionsForRecord(recordId, [EDIT_PERMISSIONS_ACTION_REF]))[0];
    if (!action) {
      NotificationManager.error('action is not available', t('error'));
      return;
    }
    await actionsService.execForRecord(recordId, action);
  };

  doAddModelAction = () => {
    this.setState(
      {
        dropdownOpen: false
      },
      () => {
        this.props.setCollapse(true);
        this.props.createModel();
      }
    );
  };

  editCategoryAction = () => {
    this.setState(
      {
        dropdownOpen: false
      },
      () => {
        this.props.setCollapse(false);
        this.props.setIsEditable();
      }
    );
  };

  doDeleteCategoryAction = () => {
    this.setState(
      {
        dropdownOpen: false
      },
      () => {
        this.props.showDeleteCategoryModal();
      }
    );
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.isEditable && this.props.isEditable) {
      this.labelRef.current._inputRef.focus();
    }
  }

  _getCategoryRef() {
    return this.props.categoryId || this.props.itemId || '';
  }

  render() {
    let {
      label,
      sectionCode,
      level,
      isEditable,
      viewType,
      saveEditableCategory,
      cancelEditCategory,
      searchText,
      canWrite,
      isOpen,
      toggleCollapse,
      isUserAdmin
    } = this.props;

    const categoryId = this._getCategoryRef() || '';
    const isRootSection = categoryId.endsWith('@ROOT');

    if (isRootSection) {
      viewType = 'NONE';
      isOpen = false;
      isEditable = false;
    }

    // classes
    const dropdownActionsIconClasses = cn(styles.categoryActionIcon, styles.categoryActionIcon2, {
      [styles.categoryActionIconPressed]: this.state.dropdownOpen,
      'icon-custom-more-big-normal': level === 0 && !this.state.dropdownOpen,
      'icon-custom-more-big-pressed': level === 0 && this.state.dropdownOpen,
      'icon-custom-more-small-normal': level !== 0 && !this.state.dropdownOpen,
      'icon-custom-more-small-pressed': level !== 0 && this.state.dropdownOpen
    });

    const dragNDropIconClasses = cn('icon-custom-drag-big', styles.categoryActionIcon, styles.hiddenIcon);
    const saveIconClasses = cn('icon-small-check', styles.categoryActionIcon);
    const cancelIconClasses = cn('icon-small-close', styles.categoryActionIcon);

    const mainContainerClasses = cn(`category`, `category_level${level}`, {
      [styles.categoryLevel1]: level === 1,
      [styles.categoryLevel2]: level === 2,
      categoryLevelOpen: isOpen,
      categoryListViewType: viewType === ViewTypes.LIST && level !== 0
    });

    const whiteContainerClasses = cn(styles.category, {
      [styles.categoryLevel1]: level === 1,
      [styles.categoryLevel2]: level === 2
    });

    const labelClasses = cn(styles.label, {
      [styles.labelForCollapsed]: isOpen
    });

    // action buttons
    let onClickLabel = toggleCollapse;

    const actions = [];
    if (!isRootSection) {
      actions.push({
        label: t('designer.category-action.create-model'),
        onClick: this.doAddModelAction
      });
      if (canWrite) {
        actions.unshift({
          label: t('designer.category-action.edit'),
          onClick: this.editCategoryAction
        });
        actions.push({
          label: t('designer.category-action.delete'),
          onClick: this.doDeleteCategoryAction
        });
      }
      if (level < 2) {
        actions.unshift({
          label: t('designer.category-action.add-subcategory'),
          onClick: this.doAddSubcategoryAction
        });
      }
    }
    if (isUserAdmin) {
      actions.push({
        label: t('designer.category-action.edit-permissions'),
        onClick: this.doEditPermissionsAction
      });
    }

    let actionButtons = (
      <Fragment>
        <Dropdown className={styles.dropdown} isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
          <DropdownToggle tag="div">
            <span className={dropdownActionsIconClasses} />
          </DropdownToggle>
          <DropdownMenu className={styles.dropdownMenu} container="body" right>
            {actions.map(action => {
              return (
                <DropdownItem key={action.label} onClick={action.onClick}>
                  {action.label}
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </Dropdown>

        <span
          className={dragNDropIconClasses}
          onClick={e => {
            e.stopPropagation();
          }}
        />
      </Fragment>
    );

    if (isEditable) {
      onClickLabel = () => {
        this.labelRef.current._inputRef.focus();
      };

      actionButtons = (
        <Fragment>
          <span
            className={cancelIconClasses}
            onClick={e => {
              e.stopPropagation();
              cancelEditCategory();
            }}
          />
          <span
            className={saveIconClasses}
            onClick={e => {
              e.stopPropagation();
              saveEditableCategory(this.labelRef.current.innerText);
            }}
          />
        </Fragment>
      );
    }

    if (searchText) {
      actionButtons = null;
    }

    return (
      <div className={mainContainerClasses}>
        <div className={whiteContainerClasses}>
          <div className={styles.categoryHeader}>
            <h3 className={labelClasses} onClick={onClickLabel}>
              {isEditable ? (
                <div className={styles.labelEditable}>
                  <Input placeholder="Code" value={sectionCode} />
                  <MLText className={styles.labelEditableName} placeholder="Название" ref={this.labelRef} value={label} />
                </div>
              ) : (
                <span className={styles.labelText}>{getMLValue(label)}</span>
              )}
            </h3>

            <div className={styles.categoryActions}>{actionButtons}</div>
          </div>
          {viewType === ViewTypes.CARDS ? (
            <Collapse isOpen={isOpen}>
              <div className={styles.content}>{this.props.children}</div>
            </Collapse>
          ) : null}
        </div>

        {viewType === ViewTypes.LIST ? (
          <Collapse isOpen={isOpen}>
            <div className={styles.contentNested}>{this.props.children}</div>
          </Collapse>
        ) : null}
      </div>
    );
  }
}

export default DesignerCategory;
