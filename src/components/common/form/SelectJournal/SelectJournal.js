import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'reactstrap';
import Button from '../../buttons/Button/Button';
import Input from '../../form/Input';
import Grid from '../../../common/grid/Grid/Grid';
import Pagination from '../../../common/Pagination/Pagination';
import Loader from '../../../common/Loader/Loader';
import EcosForm from '../../../EcosForm';
import SimpleModal from '../../SimpleModal';
import Filters from './Filters';
import FiltersProvider from './Filters/FiltersProvider';
import { JournalsApi } from '../../../../api/journalsApi';
// import { t } from "../../../../helpers/util";
import './SelectJournal.scss';

const paginationInitState = {
  skipCount: 0,
  maxItems: 10,
  page: 1
};

export default class SelectJournal extends Component {
  state = {
    isCollapsePanelOpen: false,
    isSelectModalOpen: false,
    isCreateModalOpen: false,
    isEditModalOpen: false,
    editRecordId: null,
    isJournalConfigFetched: false,
    journalConfig: {},
    isGridDataReady: false,
    gridData: {
      total: 0,
      data: [],
      columns: [],
      selected: []
    },
    requestParams: {
      pagination: paginationInitState
    },
    value: [],
    error: null
  };

  constructor() {
    super();
    this.api = new JournalsApi();
  }

  componentDidMount() {
    const { value, multiple, journalId, onError } = this.props;

    if (!journalId) {
      const err = new Error('The "journalId" config is required!');
      typeof onError === 'function' && onError(err);
      this.setState({ error: err });
    }

    let initValue = value;
    if (!multiple && value.length > 1) {
      initValue = [];
    }

    if (initValue.length > 0) {
      this.fetchDisplayNames(initValue).then(value => {
        this.setValue(value);
      });
    }
  }

  getJournalConfig = () => {
    const { journalId } = this.props;

    return new Promise((resolve, reject) => {
      if (!journalId) {
        reject();
      }

      this.api.getJournalConfig(journalId).then(journalConfig => {
        // console.log('journalConfig', journalConfig);

        const columns = journalConfig.columns;
        const criteria = journalConfig.meta.criteria;
        this.setState(prevState => {
          return {
            requestParams: {
              ...prevState.requestParams,
              columns,
              criteria
            },
            journalConfig,
            isJournalConfigFetched: true
          };
        }, resolve);
      });
    });
  };

  refreshGridData = () => {
    return new Promise(resolve => {
      this.setState(
        {
          isGridDataReady: false
        },
        () => {
          return this.api.getGridData(this.state.requestParams).then(gridData => {
            // console.log('gridData', gridData);

            // setTimeout(() => {
            this.setState(prevState => {
              return {
                gridData: {
                  ...prevState.gridData,
                  ...gridData
                },
                isGridDataReady: true
              };
            });
            // }, 3000);

            resolve(gridData);
          });
        }
      );
    });
  };

  toggleSelectModal = () => {
    this.setState({
      isSelectModalOpen: !this.state.isSelectModalOpen
    });
  };

  toggleCreateModal = () => {
    this.setState({
      isCreateModalOpen: !this.state.isCreateModalOpen
    });
  };

  toggleEditModal = () => {
    this.setState({
      isEditModalOpen: !this.state.isEditModalOpen
    });
  };

  toggleCollapsePanel = () => {
    this.setState({
      isCollapsePanelOpen: !this.state.isCollapsePanelOpen
    });
  };

  onSelect = () => {
    const selectedRows = this.state.gridData.selected;
    this.fetchDisplayNames(selectedRows).then(value => {
      this.setValue(value).then(() => {
        this.setState({
          isSelectModalOpen: false
        });
      });
    });
  };

  fetchDisplayNames = selectedRows => {
    return this.api.getRecordsDisplayName(selectedRows).then(result =>
      result.records.map(item => {
        return {
          id: item.id,
          disp: item.attributes.name
        };
      })
    );
  };

  setValue = value => {
    const { onChange } = this.props;

    return new Promise(resolve => {
      this.setState(
        prevState => {
          return {
            gridData: {
              ...prevState.gridData,
              selected: value.map(item => item.id)
            },
            value
          };
        },
        () => {
          typeof onChange === 'function' && onChange(this.state.value.map(item => item.id));
          resolve();
        }
      );
    });
  };

  onCancelSelect = () => {
    this.setState(prevState => {
      return {
        gridData: {
          ...prevState.gridData,
          selected: prevState.value
        },
        isSelectModalOpen: false
      };
    });
  };

  onSelectGridItem = value => {
    this.setState(prevState => {
      return {
        gridData: {
          ...prevState.gridData,
          selected: value.selected
        }
      };
    });
  };

  openSelectModal = () => {
    const { isJournalConfigFetched, isGridDataReady } = this.state;

    this.setState({
      isSelectModalOpen: true
    });

    if (!isJournalConfigFetched) {
      this.getJournalConfig().then(this.refreshGridData);
    } else if (!isGridDataReady) {
      this.refreshGridData();
    }
  };

  onCreateFormSubmit = form => {
    this.setState({
      isCreateModalOpen: false
    });

    this.refreshGridData();
  };

  onEditFormSubmit = form => {
    this.setState({
      isEditModalOpen: false
    });

    this.refreshGridData();
  };

  onValueEdit = e => {
    this.setState({
      isEditModalOpen: true,
      editRecordId: e.target.dataset.id
    });
  };

  onValueDelete = e => {
    const newValue = this.state.value.filter(item => item.id !== e.target.dataset.id);

    this.setValue(newValue);
  };

  onChangePage = pagination => {
    this.setState(prevState => {
      return {
        requestParams: {
          ...prevState.requestParams,
          pagination
        }
      };
    }, this.refreshGridData);
  };

  render() {
    // TODO translation !!!!!!!!
    // todo вынести переводы, настройки и т.д. наружу

    const { createFormRecord, multiple, placeholder, disabled } = this.props;
    const {
      isGridDataReady,
      value,
      isSelectModalOpen,
      isEditModalOpen,
      isCreateModalOpen,
      isCollapsePanelOpen,
      gridData,
      editRecordId,
      requestParams,
      journalConfig,
      error
    } = this.state;

    // console.log('requestParams', requestParams);
    // console.log('journalConfig', journalConfig);

    const createButton = createFormRecord ? (
      <Button className={'button_blue'} onClick={this.toggleCreateModal}>
        Создать
      </Button>
    ) : null;

    return (
      <div className="select-journal">
        <div>
          {value.length > 0 ? (
            <ul className={'select-journal__values-list'}>
              {value.map(item => (
                <li key={item.id}>
                  <span className="select-journal__values-list-disp">{item.disp}</span>
                  <div className="select-journal__values-list-actions">
                    <span data-id={item.id} className={'icon icon-edit'} onClick={this.onValueEdit} />
                    <span data-id={item.id} className={'icon icon-delete'} onClick={this.onValueDelete} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={'select-journal__value-not-selected'}>{placeholder ? placeholder : 'Нет'}</p>
          )}
        </div>

        {error ? (
          <p className={'select-journal__error'}>{error.message}</p>
        ) : (
          <Button className={'button_blue'} onClick={this.openSelectModal} disabled={disabled}>
            {value.length > 0 ? (multiple ? 'Добавить' : 'Изменить') : 'Выбрать'}
          </Button>
        )}

        <FiltersProvider columns={journalConfig.columns}>
          <SimpleModal
            title={'Выбрать юридическое лицо'}
            isOpen={isSelectModalOpen}
            hideModal={this.toggleSelectModal}
            zIndex={10002}
            className={'select-journal-select-modal simple-modal_level-1'}
          >
            <div className={'select-journal-collapse-panel'}>
              <div className={'select-journal-collapse-panel__controls'}>
                <div className={'select-journal-collapse-panel__controls-left'}>
                  <Button className={'button_blue'} onClick={this.toggleCollapsePanel}>
                    Фильтр
                  </Button>
                  {createButton}
                </div>
                <div className={'select-journal-collapse-panel__controls-right'}>
                  <Input />
                </div>
              </div>

              <Collapse isOpen={isCollapsePanelOpen}>{journalConfig.columns ? <Filters columns={journalConfig.columns} /> : null}</Collapse>
            </div>

            <div className={'select-journal__grid'}>
              {!isGridDataReady ? <Loader /> : null}
              <Grid
                {...gridData}
                singleSelectable={!multiple}
                multiSelectable={multiple}
                onSelect={this.onSelectGridItem}
                selectAllRecords={null}
                selectAllRecordsVisible={null}
                onFilter={() => console.log('onFilter')}
                onSelectAll={() => console.log('onSelectAll')}
                onDelete={() => console.log('onDelete')}
                onEdit={() => console.log('onEdit')}
                className={!isGridDataReady ? 'grid_transparent' : ''}
                onEmptyHeight={() => console.log('onEmptyHeight')}
                emptyRowsCount={5}
                minHeight={200}
              />

              <Pagination
                className={'select-journal__pagination'}
                total={gridData.total}
                {...requestParams.pagination}
                onChange={this.onChangePage}
              />
            </div>

            <div className="select-journal-select-modal__buttons">
              <Button onClick={this.onCancelSelect}>Отмена</Button>
              <Button className={'button_blue'} onClick={this.onSelect}>
                ОK
              </Button>
            </div>
          </SimpleModal>
        </FiltersProvider>

        <SimpleModal
          title={'Создать юридическое лицо'}
          isOpen={isCreateModalOpen}
          hideModal={this.toggleCreateModal}
          zIndex={10003}
          className={'simple-modal_level-2'}
        >
          <EcosForm record={createFormRecord} onSubmit={this.onCreateFormSubmit} onFormCancel={this.toggleCreateModal} />
        </SimpleModal>

        <SimpleModal
          title={'Изменить свойства'}
          isOpen={isEditModalOpen}
          hideModal={this.toggleEditModal}
          zIndex={10002}
          className={'simple-modal_level-1'}
        >
          <EcosForm record={editRecordId} onSubmit={this.onEditFormSubmit} onFormCancel={this.toggleEditModal} />
        </SimpleModal>
      </div>
    );
  }
}

SelectJournal.propTypes = {
  journalId: PropTypes.string.isRequired,
  createFormRecord: PropTypes.string,
  onChange: PropTypes.func,
  onError: PropTypes.func,
  multiple: PropTypes.bool
};
