import uuidv4 from 'uuid/v4';

import { decodeLink } from '../../helpers/urls';
import PageService from '../PageService';
import { t } from '../../helpers/export/util';
import { TITLE } from '../../constants/pageTabs';

/**
 * @define Describe One Application Tab
 * @param id {string} id view
 * @param link  {string} url
 * @param type {string} relation to the page
 * @param isActive {boolean} true = chosen tab
 * @param isLoading {boolean} true = getting data for tab
 *
 * @readonly
 * @private
 * @param key {string} key data from link
 *
 * @readonly
 * @uniqueKey {string} type + key
 * @storage {object} prepared data for local storage
 * @store {object} prepared data for local app store
 */
export default class PageTab {
  constructor(data) {
    let { link, title, id, isLoading = false, isActive = false } = data || {};

    this.id = id || `page-tab-${uuidv4()}`;
    this.link = decodeLink(link);
    this.title = title;
    this.isLoading = isLoading;
    this.isActive = isActive;

    if (isLoading) {
      this.title = t(TITLE.LOADING);
    }
  }

  get uniqueKey() {
    return PageService.keyId({ link: this.link });
  }

  get storage() {
    const { id, link } = this;

    return { id, link };
  }

  get store() {
    const { id, link, title, isActive, isLoading } = this;

    return { id, link, title, isActive, isLoading };
  }

  change(data) {
    for (const key in data) {
      if (data.hasOwnProperty(key) && this.hasOwnProperty(key)) {
        this[key] = data[key];
      }
    }
  }
}
