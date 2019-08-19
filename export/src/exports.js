
import reactDefault, * as react from 'react';
import reactDomDefault, * as reactDom from 'react-dom';
import reduxThunk from 'redux-thunk';
import * as redux from 'redux';
import * as reactRedux from 'react-redux';
import Records from '../../src/components/Records';
import { MenuApi } from '../../src/api/menu';
import lodash from 'lodash';
import '../../src/build-info';

export default {
  'react': { default: reactDefault, ...react },
  'react-dom': { default: reactDomDefault, ...reactDom },
  'redux-thunk': { default: reduxThunk, __esModule: true },
  'redux': () => redux,
  'react-redux': () => reactRedux,
  'moment': () => import('moment'),
  'reactstrap': () => import('reactstrap'),
  'react-custom-scrollbars': () => import('react-custom-scrollbars'),
  'ecos-modal': () => import('../../src/components/common/EcosModal/CiteckEcosModal'),
  'ecos-records': () => Records,
  'journals-dashlet': () => import('../../src/components/Journals/JournalsDashlet/export'),
  'ecos-form': () => import('../../src/components/EcosForm/export'),
  'ecos-form-utils': () => import('../../src/components/EcosForm/EcosFormUtils'),
  'idle-timer': () => import('../../src/components/IdleTimer'),
  'eform-locale-editor': () => import('../../src/components/EcosForm/locale/FormLocaleEditorModal'),
  'eform-builder': () => import('../../src/components/EcosForm/builder/EcosFormBuilderModal'),
  'menu-api': () => MenuApi,
  'lodash': () => lodash,
  'cardlet-node-view': () => import('../../src/legacy/cardlets/node-view/node-view'),
};
