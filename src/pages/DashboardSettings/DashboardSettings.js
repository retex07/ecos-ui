import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { cloneDeep } from 'lodash';
import { MENU_POSITION } from '../../constants/dashboard';
import { t } from '../../helpers/util';
import { ColumnsLayoutItem, MenuLayoutItem } from '../../components/Layout';
import { DragDropContext, DragItem, Droppable } from '../../components/Drag-n-Drop';

import './style.scss';

function getTestWidgets(props, prefix, size) {
  const arr = new Array(size);

  for (let i = 0; i < arr.length; i++) {
    let key = `item-${i}-${prefix}`;
    arr[i] = {
      title: i + 'this is really a very very very long string',
      id: key,
      ...props
    };
  }

  return arr;
}

const DROPPABLE_ZONE = {
  MENU_FROM: 'menuItems',
  MENU_TO: 'menuSelected'
};

export default class DashboardSettings extends React.Component {
  constructor(props) {
    super(props);

    //fixme tes data
    const widgets = getTestWidgets({}, 'all', 20);

    this.state = {
      widgets,
      columns: [
        {
          position: 0,
          isActive: true,
          columns: [{ widgets: [] }, { width: '25%', widgets: [] }]
        },
        {
          position: 1,
          isActive: false,
          columns: [{ width: '25%', widgets: [] }, { widgets: [] }]
        },
        {
          position: 2,
          isActive: false,
          columns: [{ width: '25%' }, {}, { width: '25%' }]
        },
        {
          position: 3,
          isActive: false,
          columns: [{ widgets: [] }, { widgets: [] }, { widgets: [] }, { widgets: [] }]
        },
        {
          position: 4,
          isActive: false,
          columns: [{ widgets: [] }]
        }
      ],
      menus: [
        {
          position: 0,
          isActive: true,
          type: MENU_POSITION.LEFT,
          description: 'Меню слева'
        },
        {
          position: 1,
          isActive: false,
          type: MENU_POSITION.TOP,
          description: 'Меню в виде кнопок перед виджетами'
        }
      ],
      isShowMenuConstructor: false,
      menuItems: [
        { id: 1, name: 'Главная' },
        { id: 2, name: 'Домашняя' },
        { id: 22, name: 'Дашборд' },
        { id: 23, name: 'Настройки' },
        { id: 24, name: 'Заказы' },
        { id: 25, name: 'Клиенты' },
        { id: 26, name: 'Отчеты' },
        { id: 27, name: 'Банкеты' },
        { id: 28, name: 'Парковки' },
        { id: 29, name: 'ГСМ' },
        { id: 21, name: 'Договоры' },
        { id: 222, name: 'Встречи' },
        { id: 221, name: 'Календарь событий' },
        { id: 223, name: 'График отпусков' },
        { id: 224, name: 'Основные ссылки' },
        { id: 225, name: 'Социальные сети' },
        { id: 226, name: 'Открытие источники' }
      ],
      menuSelected: []
    };
  }

  handleClickColumn(column) {
    let columns = cloneDeep(this.state.columns);

    if (column.isActive) {
      return;
    }

    columns = columns.map(item => {
      if (item.isActive) {
        item.isActive = false;
      }

      if (item.position === column.position) {
        item.isActive = true;
      }

      return item;
    });

    this.setState({ columns });
  }

  handleClickMenu(menu) {
    let menus = cloneDeep(this.state.menus);
    let isShowMenuConstructor = false;

    if (menu.isActive) {
      return;
    }

    menus = menus.map(item => {
      if (item.isActive) {
        item.isActive = false;
      }

      if (item.position === menu.position) {
        item.isActive = true;

        isShowMenuConstructor = item.type === MENU_POSITION.TOP;
      }

      return item;
    });

    this.setState({ menus, isShowMenuConstructor });
  }

  renderDragItems(items) {
    if (!items || (items && !items.length)) {
      return null;
    }

    return items.map((item, index) => {
      return <DragItem key={item.id} {...item} index={index} getPositionAdjusment={this.draggablePositionAdjusment} />;
    });
  }

  renderColumnLayouts() {
    const { columns } = this.state;

    return columns.map(layout => (
      <ColumnsLayoutItem
        key={layout.position}
        onClick={this.handleClickColumn.bind(this, layout)}
        active={layout.isActive}
        config={{ columns: layout.columns }}
        className="ecos-ds__container-group-item"
      />
    ));
  }

  renderMenuLayouts() {
    const { menus } = this.state;

    return menus.map(menu => (
      <MenuLayoutItem
        key={menu.position}
        onClick={this.handleClickMenu.bind(this, menu)}
        active={menu.isActive}
        config={{ menu }}
        description={menu.description}
        className="ecos-ds__container-group-item"
      />
    ));
  }

  renderColumnsBlock() {
    return (
      <React.Fragment>
        <h5 className="ecos-ds__container-title">Колонки</h5>
        <h6 className="ecos-ds__container-subtitle">Выберите расположение и количество колонок.</h6>
        <div className="ecos-ds__container-group">{this.renderColumnLayouts()}</div>
      </React.Fragment>
    );
  }

  handleDropEndMenu = result => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const menuItems = this.reorder(this.state[source.droppableId], source.index, destination.index);

      let state = { menuItems };

      if (source.droppableId === DROPPABLE_ZONE.MENU_TO) {
        state = { menuSelected: menuItems };
      }

      this.setState(state);
    } else {
      const result = this.move(this.state[source.droppableId], this.state[destination.droppableId], source, destination);

      this.setState({
        menuItems: result[DROPPABLE_ZONE.MENU_FROM],
        menuSelected: result[DROPPABLE_ZONE.MENU_TO]
      });
    }
  };

  handleDropEndWidget = result => {
    //console.log(result);
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId !== destination.droppableId) {
      //const result = this.move(this.state[source.droppableId], this.state[destination.droppableId], source, destination);
      /*this.setState({
        menuItems: result[DROPPABLE_ZONE.MENU_FROM],
        menuSelected: result[DROPPABLE_ZONE.MENU_TO]
      });*/
    }
  };

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);

    result.splice(endIndex, 0, removed);

    return result;
  };

  move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);
    const result = {};

    destClone.splice(droppableDestination.index, 0, removed);
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  };

  get menuWidth() {
    const menu = document.querySelector('.slide-menu');

    if (!menu) {
      return 0;
    }

    return -menu.clientWidth;
  }

  get bodyScrollTop() {
    const body = document.querySelector('body');

    if (!body) {
      return 0;
    }

    return body.scrollTop;
  }

  draggablePositionAdjusment = () => ({
    top: this.bodyScrollTop,
    left: this.menuWidth
  });

  renderMenuConstructor() {
    const { menuItems, menuSelected, isShowMenuConstructor } = this.state;

    if (!isShowMenuConstructor) {
      return null;
    }

    return (
      <React.Fragment>
        <h6 className="ecos-ds__container-subtitle">{t('Какие пункты меню следует отображать')}</h6>
        <div className="ecos-ds__drag">
          <DragDropContext onDragEnd={this.handleDropEndMenu}>
            <Droppable
              id={DROPPABLE_ZONE.MENU_FROM}
              className="ecos-ds__drag-container"
              placeholder={t('Нет доступных пунктов меню')}
              style={{ marginRight: '10px' }}
              direction="horizontal"
            >
              {menuItems.length &&
                menuItems.map((item, index) => (
                  <DragItem
                    title={item.name}
                    key={item.id}
                    index={index}
                    getPositionAdjusment={this.draggablePositionAdjusment}
                    {...item}
                  />
                ))}
            </Droppable>
            <Droppable
              id={DROPPABLE_ZONE.MENU_TO}
              className="ecos-ds__drag-container ecos-ds__drag-container_menu-to"
              placeholder={t('Перетащите пункты меню сюда')}
              direction="horizontal"
            >
              {menuSelected.length &&
                menuSelected.map((item, index) => {
                  const val = { ...item, selected: true, canRemove: true };

                  return (
                    <DragItem
                      title={item.name}
                      key={item.id}
                      index={index}
                      getPositionAdjusment={this.draggablePositionAdjusment}
                      {...val}
                    />
                  );
                })}
            </Droppable>
          </DragDropContext>
        </div>
      </React.Fragment>
    );
  }

  renderMenuBlock() {
    return (
      <React.Fragment>
        <h5 className="ecos-ds__container-title">{t('Меню')}</h5>
        <h6 className="ecos-ds__container-subtitle">{t('Выберите расположения меню.')}</h6>
        <div className="ecos-ds__container-group ecos-ds__container-group_row">{this.renderMenuLayouts()}</div>

        {this.renderMenuConstructor()}
      </React.Fragment>
    );
  }

  renderWidgetColumns() {
    const { columns } = this.state;
    const choice = columns.filter(item => item.isActive)[0];

    return (
      <div className={'ecos-ds__drag-container_widget-to'}>
        {choice.columns.map((item, index) => {
          const key_id = `column-widgets-${index}`;

          return (
            <div className={'ecos-ds__column-widgets'} key={key_id}>
              <div className={'ecos-ds__column-widgets__title'}>{`${t('Колонка')} ${index + 1}`}</div>
              <Droppable
                id={key_id}
                className="ecos-ds__drag-container ecos-ds__column-widgets__items"
                placeholder={t('Перетащите сюда виджеты')}
              >
                {this.renderDragItems(item.widgets)}
              </Droppable>
            </div>
          );
        })}
      </div>
    );
  }

  renderWidgetsBlock() {
    const { widgets } = this.state;

    return (
      <React.Fragment>
        <h5 className="ecos-ds__container-title">{t('Виджеты')}</h5>
        <h6 className="ecos-ds__container-subtitle">{t('Выберите где и какие виджеты отображать.')}</h6>
        <div className="ecos-ds__container-group">
          <DragDropContext onDragEnd={this.handleDropEndWidget}>
            <Droppable
              id="widgets-store"
              className="ecos-ds__drag-container ecos-ds__drag-container_col"
              placeholder={t('Нет доступных виджетов')}
            >
              {this.renderDragItems(widgets)}
            </Droppable>
            {this.renderWidgetColumns()}
          </DragDropContext>
        </div>
      </React.Fragment>
    );
  }

  render() {
    return (
      <Container>
        <Row>
          <Col md={12}>
            <h1 className="ecos-ds__header">{t('Настройки домашней страницы')}</h1>
          </Col>
        </Row>

        <div className="ecos-ds__container">
          {this.renderColumnsBlock()}
          {this.renderWidgetsBlock()}
          {this.renderMenuBlock()}
        </div>
      </Container>
    );
  }
}
