import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import queryString from 'query-string';
import FormIOFileComponent from 'formiojs/components/file/File';
import { FILE_CLICK_ACTION_DOWNLOAD, FILE_CLICK_ACTION_OPEN_DASHBOARD, FILE_CLICK_ACTION_NOOP } from './editForm/File.edit.file';
import RecordActionExecutorsRegistry from '../../../../components/Records/actions/RecordActionExecutorsRegistry';
import Records from '../../../../components/Records';
import { isNewVersionPage } from '../../../../helpers/urls';
import { t } from '../../../../helpers/util';
import { IGNORE_TABS_HANDLER_ATTR_NAME } from '../../../../constants/pageTabs';
import { URL } from '../../../../constants';

export default class FileComponent extends FormIOFileComponent {
  static schema(...extend) {
    return FormIOFileComponent.schema(
      {
        onFileClick: FILE_CLICK_ACTION_OPEN_DASHBOARD
      },
      ...extend
    );
  }

  get defaultSchema() {
    return FileComponent.schema();
  }

  static extractFileRecordRef(file) {
    let recordRef = null;
    if (file.data && file.data.recordRef) {
      recordRef = file.data.recordRef;
    } else if (file.data && file.data.nodeRef) {
      recordRef = file.data.nodeRef;
    } else {
      const documentUrl = file.url;
      const documentUrlParts = documentUrl.split('?');
      if (documentUrlParts.length !== 2) {
        throw new Error("Cant't extract recordRef");
      }

      const queryPart = documentUrlParts[1];
      const urlParams = queryString.parse(queryPart);
      if (!urlParams.recordRef && !urlParams.nodeRef) {
        throw new Error("Cant't extract recordRef");
      }

      recordRef = urlParams.recordRef || urlParams.nodeRef;
    }

    return recordRef;
  }

  static getDownloadExecutor() {
    const downloadExecutor = RecordActionExecutorsRegistry.get('download');
    if (!downloadExecutor) {
      throw new Error("Cant't extract downloadExecutor");
    }

    return downloadExecutor;
  }

  static downloadFile(recordRef, fileName) {
    try {
      const downloadExecutor = FileComponent.getDownloadExecutor();
      downloadExecutor.execute({
        record: Records.get(recordRef),
        action: {
          config: {
            filename: fileName
          }
        }
      });
    } catch (e) {
      console.error(`EcosForm File: Failure to download file. Cause: ${e.message}`);
    }
  }

  static buildDocumentUrl(recordRef) {
    if (isNewVersionPage()) {
      return `${URL.DASHBOARD}?recordRef=${recordRef}`;
    }

    return `/share/page/card-details?nodeRef=${recordRef}`;
  }

  createFileLink(f) {
    const file = cloneDeep(f);
    const fileName = file.originalName || file.name;
    let onFileClickAction = this.component.onFileClick;

    if (!onFileClickAction && this.viewOnly) {
      onFileClickAction = FILE_CLICK_ACTION_OPEN_DASHBOARD;
    }

    if (!onFileClickAction || onFileClickAction === FILE_CLICK_ACTION_NOOP) {
      return fileName;
    }

    let documentUrl = file.url;
    let recordRef;
    try {
      recordRef = FileComponent.extractFileRecordRef(file);
      documentUrl = FileComponent.buildDocumentUrl(recordRef);
    } catch (e) {
      console.warn(`EcosForm File: ${e.message}`);
      return fileName;
    }

    const linkAttributes = {
      href: documentUrl,
      target: '_blank'
    };

    if (!isNewVersionPage(documentUrl)) {
      linkAttributes[IGNORE_TABS_HANDLER_ATTR_NAME] = true;
    }

    if (onFileClickAction === FILE_CLICK_ACTION_DOWNLOAD) {
      linkAttributes.onClick = e => {
        e.stopPropagation();
        e.preventDefault();
        FileComponent.downloadFile(recordRef, fileName);
      };
    } else if (onFileClickAction === FILE_CLICK_ACTION_OPEN_DASHBOARD && !this.viewOnly) {
      linkAttributes.onClick = e => {
        const confirmation = window.confirm(t('eform.file.on-click-confirmation'));
        if (!confirmation) {
          e.stopPropagation();
          e.preventDefault();
        }
      };
    }

    return this.ce('a', linkAttributes, fileName);
  }

  focus() {
    if (!this.browseLink) {
      return;
    }

    this.browseLink.focus();
  }

  buildUpload() {
    const render = super.buildUpload();
    const allLinks = render.querySelectorAll('a');

    for (let i = 0; i < allLinks.length; i++) {
      allLinks[i].setAttribute(IGNORE_TABS_HANDLER_ATTR_NAME, true);
    }

    return render;
  }

  build() {
    if (this.viewOnly) {
      return this.viewOnlyBuild();
    }

    this.disabled = this.shouldDisable;

    super.build();

    this.createInlineEditSaveAndCancelButtons();
  }

  setupValueElement(element) {
    const value = this.getValue();
    const valueView = this.getView(value);

    if (valueView instanceof Element) {
      element.innerHTML = '';
      element.appendChild(valueView);
    } else {
      element.innerHTML = valueView;
    }
  }

  getView(value) {
    if (this.isEmpty(value)) {
      return this.defaultViewOnlyValue;
    }

    const classList = ['file-list-view-mode'];

    if (this.component && this.component.hideLabel) {
      classList.push('file-list-view-mode_hide-label');
    }

    return this.ce(
      'ul',
      { class: classList.join(' ') },
      Array.isArray(value) ? value.map(fileInfo => this.createFileListItemViewMode(fileInfo)) : this.createFileListItemViewMode(value)
    );
  }

  createFileListItemViewMode(fileInfo) {
    return this.ce('li', { class: 'file-item_view-mode' }, this.createFileLink(fileInfo));
  }

  // Cause: https://citeck.atlassian.net/browse/ECOSCOM-2667
  setValue(value) {
    if (!isEmpty(value) && !Array.isArray(value)) {
      value = [value];
    }
    super.setValue(value);
  }
}
