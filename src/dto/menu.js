import { MENU_TYPE, QueryKeys } from '../constants';

const getDefaultMenuConfig = {
  type: MENU_TYPE.LEFT,
  links: []
};

export default class MenuConverter {
  static parseGetResult(result) {
    if (!result || (result && !Object.keys(result).length)) {
      return getDefaultMenuConfig;
    }

    let resultConfig = result[QueryKeys.VALUE_JSON];
    if (!resultConfig || !resultConfig.type) {
      resultConfig = getDefaultMenuConfig;
    }
    return resultConfig;
  }

  static getAvailableMenuItemsForWeb(items = []) {
    return items.map(item => {
      return {
        label: item.label,
        link: item.link || '',
        id: item.id
      };
    });
  }

  static getMenuItemsForServer(items = []) {
    return items.map((item, index) => {
      return {
        label: item.label,
        position: index,
        link: item.link || '',
        id: item.id
      };
    });
  }
}
