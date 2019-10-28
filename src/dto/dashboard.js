import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { TITLE } from '../constants/pageTabs';
import { DASHBOARD_DEFAULT_KEY } from '../constants';
import DashboardService from '../services/dashboard';

export default class DashboardConverter {
  static getKeyInfoDashboardForWeb(source) {
    const target = {};

    if (!isEmpty(source)) {
      const { key, id = '', type, user } = source;

      target.identification = {
        key: key || DASHBOARD_DEFAULT_KEY,
        type,
        user,
        id: DashboardService.formShortId(id)
      };
    }

    return target;
  }

  static getDashboardLayoutForWeb(source) {
    const target = {};

    if (!isEmpty(source)) {
      target.id = source.id;
      target.tab = source.tab || {};
      target.type = source.type || '';
      target.columns = source.columns || [];
    }

    return target;
  }

  static getDashboardForWeb(source) {
    const target = [];

    if (!isEmpty(source)) {
      const { config } = source;
      const layouts = get(config, ['layouts'], []);

      DashboardService.movedToListLayout(config, layouts);

      layouts.forEach(item => {
        target.push(DashboardConverter.getDashboardLayoutForWeb(item));
      });
    }

    return target;
  }

  static getMobileDashboardForWeb(source) {
    const target = [];

    if (!isEmpty(source)) {
      const { config } = source;
      const layouts = get(config, ['layouts'], []);

      DashboardService.movedToListLayout(config, layouts);

      const mobile = get(config, ['mobile'], DashboardService.generateMobileConfig(layouts));

      mobile.forEach(item => {
        target.push(DashboardConverter.getDashboardLayoutForWeb(item));
      });
    }

    return target;
  }

  static getTitleInfo(source = {}) {
    const target = {};

    if (!isEmpty(source)) {
      const { displayName = '', version = '' } = source;

      target.version = version;
      target.name = displayName || TITLE.NO_NAME;
    }

    return target;
  }
}
