import journalsApi from './journalsServiceApi';
import computedResolversRegistry from './computed';
import journalColumnsResolver from './journalColumnsResolver';
import journalDataLoader from './journalsDataLoader';
import lodash from 'lodash';
import { ActionModes } from '../../../constants';
import cloneDeep from 'lodash/cloneDeep';
import recordActions from '../../Records/actions/recordActions';

/**
 * @typedef SortBy
 * @field {String} attribute
 * @field {Boolean} ascending
 *
 * @typedef Page
 * @field {Number} maxItems
 * @field {Number} skipCount
 *
 * @typedef Predicate
 * @field {String} t - predicate type (and, or, contains, eq, not-eq, etc)
 * @field {String} att - attribute
 * @field {String|Number|Boolean|Predicate|Array<Predicate>|null} val
 *
 * @typedef JournalSettings
 * @field {Predicate} predicate
 * @field {Object} queryData - additional data to send in search query
 * @field {Object<String, String>} attributes - additional attributes to load
 * @field {Array<SortBy>>} sortBy - search query sorting
 * @field {Page} page -
 * @field {Boolean} onlyLinked
 * @field {String} recordRef
 *
 * @typedef RecordsError
 * @field {String} type
 * @field {String} msg
 * @field {Array<String>} stackTrace
 *
 * @typedef JournalData
 * @field {List<Object>} records
 * @field {List<RecordsError>} errors
 * @field {Number} totalCount
 * @field {Boolean} hasMore
 * @field {Object<String, String>} attributes - requested attributes
 */

/**
 * Service to work with journals.
 */
class JournalsService {
  async getJournalConfig(journalId) {
    let sourceDelimIdx = journalId.indexOf('@');
    let journalRecordId = sourceDelimIdx === -1 ? journalId : journalId.substring(sourceDelimIdx + 1);

    let journalConfig = lodash.cloneDeep(await journalsApi.getJournalConfig(journalRecordId));
    if (!journalConfig.columns || !journalConfig.columns.length) {
      console.warn('Journal config without columns: ' + journalRecordId, journalConfig);
      return journalConfig;
    }
    journalConfig.columns = await this.resolveColumns(journalConfig.columns);
    journalConfig.computed = await this.resolveComputedParams(journalConfig.computed);
    journalConfig.modelVersion = 1;

    if (!journalConfig.predicate) {
      journalConfig.predicate = lodash.get(journalConfig, 'meta.predicate', {});
    }

    return journalConfig;
  }

  async resolveComputedParams(computedParams) {
    if (!computedParams || !computedParams.length) {
      return {};
    }

    const computedResult = await Promise.all(
      computedParams.map(it => {
        if (!it.name) {
          console.error('Computed without name', it);
          return null;
        }
        let resolver = computedResolversRegistry.getResolver(it.type);
        return resolver
          .resolve(it.config || {})
          .catch(e => {
            console.error('Computed parameter error', e, it);
            return null;
          })
          .then(value => ({
            name: it.name,
            value
          }));
      })
    );

    const computedResMap = {};
    for (let computed of computedResult) {
      computedResMap[computed.name] = computed.value;
    }

    return computedResMap;
  }

  async resolveColumns(columns) {
    return journalColumnsResolver.resolve(columns);
  }

  /**
   * @param journalConfig
   * @param {JournalSettings} settings
   * @return {Promise<JournalData>}
   */
  async getJournalData(journalConfig, settings) {
    return journalDataLoader.load(journalConfig, settings);
  }

  /**
   * @param {Object} journalConfig
   * @param {Array<String>} recordRefs
   * @return {Promise<RecordsActionsRes>}
   */
  async getRecordActions(journalConfig, recordRefs) {
    let groupActions = journalConfig.groupActions;
    if (!groupActions) {
      groupActions = lodash.get(journalConfig, 'meta.groupActions', []);
    }
    let journalActions = journalConfig.actions;
    if (!journalActions) {
      journalActions = lodash.get(journalConfig, 'meta.actions', []);
    }

    const actionsContext = {
      mode: ActionModes.JOURNAL,
      scope: journalConfig.id
    };
    const convertedGroupActions = groupActions.map(a => {
      const actionClone = cloneDeep(a);
      if (!actionClone.params) {
        actionClone.params = {};
      }
      if (!actionClone.params.actionId) {
        actionClone.params.actionId = actionClone.id;
      }
      return {
        name: a.title,
        pluralName: a.title,
        type: 'server-group-action',
        config: actionClone
      };
    });

    return recordActions.getActionsForRecords(recordRefs, journalActions, actionsContext).then(actionsForRecords => {
      const forRecords = {
        ...actionsForRecords.forRecords,
        actions: [...actionsForRecords.forRecords.actions, ...convertedGroupActions.filter(a => a.config.type === 'selected')]
      };
      const forQuery = {
        ...actionsForRecords.forQuery,
        actions: [...actionsForRecords.forQuery.actions, ...convertedGroupActions.filter(a => a.config.type === 'filtered')]
      };
      return {
        ...actionsForRecords,
        forQuery,
        forRecords
      };
    });
  }
}

window.Citeck = window.Citeck || {};
window.Citeck.Journals = window.Citeck.Journals || new JournalsService();

export default window.Citeck.Journals;
