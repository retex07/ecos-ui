import React from 'react';
import PropTypes from 'prop-types';
import { deepClone } from '../../../helpers/util';
import DropdownMenuCascade from './DropdownMenuCascade';
import DropdownMenuGroup from './DropdownMenuGroup';
import { DropdownMenuItem } from './index';

import './style.scss';
import '../form/Dropdown/Dropdown.scss';

const MenuModes = {
  GROUP: 'group',
  CASCADE: 'cascade',
  LIST: 'list'
};

export default class DropdownMenu extends React.Component {
  static propTypes = {
    items: PropTypes.array,
    mode: PropTypes.oneOf([MenuModes.CASCADE, MenuModes.GROUP, MenuModes.LIST]),
    setGroup: PropTypes.shape({
      showGroupName: PropTypes.bool,
      showSeparator: PropTypes.bool
    }),
    setCascade: PropTypes.shape({
      collapseOneItem: PropTypes.bool
    })
  };

  static defaultProps = {
    items: [],
    mode: MenuModes.LIST,
    setGroup: {
      showGroupName: false,
      showSeparator: false
    },
    setCascade: {
      collapseOneItem: false
    }
  };

  renderMode() {
    const { mode, items, setGroup, setCascade, ...someProps } = this.props;

    let menu = deepClone(items, []);

    if (mode === MenuModes.CASCADE && setCascade.collapseOneItem) {
      menu = menu.map(item => {
        if (item.items && item.items.length === 1) {
          return item.items[0];
        }

        return item;
      });
    }

    switch (mode) {
      case MenuModes.CASCADE:
        return <DropdownMenuCascade groups={menu} />;
      case MenuModes.GROUP: {
        const { showGroupName, showSeparator } = setGroup;

        return <DropdownMenuGroup groups={menu} showGroupName={showGroupName} showSeparator={showSeparator} />;
      }
      case MenuModes.LIST:
      default:
        return menu.map((item, key) => <DropdownMenuItem key={key} data={item} {...someProps} />);
    }
  }

  render() {
    return <div className={'ecos-dropdown-menu'}>{this.renderMode()}</div>;
  }
}
