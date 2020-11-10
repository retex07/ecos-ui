import React from 'react';
import PropTypes from 'prop-types';

import SelectOrgstructRoot from './components/SelectOrgstructRoot';
import { SelectOrgstructProvider } from './SelectOrgstructContext';
import { OrgStructApi } from '../../../../api/orgStruct';
import {
  AUTHORITY_TYPE_GROUP,
  AUTHORITY_TYPE_USER,
  GroupTypes,
  TAB_ALL_USERS,
  TAB_BY_LEVELS,
  TAB_ONLY_SELECTED,
  ViewModes
} from './constants';

import './SelectOrgstruct.scss';

const orgStructApi = new OrgStructApi();

const SelectOrgstruct = props => {
  return (
    <SelectOrgstructProvider controlProps={props} orgStructApi={orgStructApi}>
      <SelectOrgstructRoot />
    </SelectOrgstructProvider>
  );
};

SelectOrgstruct.defaultProps = {
  allowedAuthorityTypes: [AUTHORITY_TYPE_GROUP, AUTHORITY_TYPE_USER],
  allowedGroupTypes: [GroupTypes.BRANCH, GroupTypes.ROLE],
  allowedGroupSubTypes: [],
  defaultTab: TAB_BY_LEVELS,
  userSearchExtraFields: [],
  viewModeType: ViewModes.DEFAULT
};

SelectOrgstruct.propTypes = {
  defaultValue: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
  defaultTab: PropTypes.oneOf([TAB_BY_LEVELS, TAB_ALL_USERS, TAB_ONLY_SELECTED]),
  onChange: PropTypes.func,
  onCancelSelect: PropTypes.func,
  onError: PropTypes.func,
  renderView: PropTypes.func,
  renderListItem: PropTypes.func,
  multiple: PropTypes.bool,
  isCompact: PropTypes.bool,
  viewModeType: PropTypes.oneOf(Object.values(ViewModes)),
  hideTabSwitcher: PropTypes.bool,
  hideInputView: PropTypes.bool,
  getFullData: PropTypes.bool, // return full data about selected user, not only nodeRef
  viewOnly: PropTypes.bool,
  isSelectedValueAsText: PropTypes.bool,
  openByDefault: PropTypes.bool,
  modalTitle: PropTypes.string,
  allowedAuthorityTypes: PropTypes.array,
  allowedGroupTypes: PropTypes.arrayOf(PropTypes.oneOf(Object.values(GroupTypes))),
  allowedGroupSubTypes: PropTypes.array,
  excludeAuthoritiesByName: PropTypes.string,
  excludeAuthoritiesByType: PropTypes.array,
  liveSearch: PropTypes.bool, // search by key down
  userSearchExtraFields: PropTypes.array,
  isIncludedAdminGroup: PropTypes.bool
};

export default SelectOrgstruct;
