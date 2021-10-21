import Records from '../../Records/Records';
import { SourcesId } from '../../../constants';

class PresetsServiceApi {
  async getJournalPresets({ journalId }) {
    return Records.query(
      {
        sourceId: SourcesId.PRESETS,
        query: { journalId }
      },
      {
        authority: 'authority',
        journalId: 'journalId',
        title: '?disp',
        settings: 'settings?json',
        editable: 'permissions._has.Write?bool!false'
      }
    ).then(result => result.records);
  }

  async getPreset({ id }) {
    return Records.get(`${SourcesId.PRESETS}@${id}`).load({
      authority: 'authority',
      journalId: 'journalId',
      title: '?disp',
      settings: 'settings?json',
      editable: 'permissions._has.Write?bool!false'
    });
  }

  async savePreset({ id, name, authority, journalId, settings }) {
    const record = Records.get(id);

    record.att('name?json', name);
    record.att('authority', authority);
    record.att('journalId', journalId);
    record.att('settings?json', settings);

    return record.save();
  }

  async deletePreset({ id }) {
    return Records.remove([id]);
  }
}

const INSTANCE = new PresetsServiceApi();
export default INSTANCE;
