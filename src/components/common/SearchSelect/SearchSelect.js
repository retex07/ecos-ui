import * as React from 'react';
import { debounce, isEmpty } from 'lodash';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';
import SearchService from '../../../services/search';
import { isLastItem, t } from '../../../helpers/util';
import ClickOutside from '../../ClickOutside';
import { Btn } from '../btns';
import { Input } from '../form';
import { Icon } from '../';
import SearchItem from './SearchItem';

import './style.scss';

const Themes = {
  DARK: 'dark',
  LIGHT: 'light'
};

export default class SearchSelect extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    searchResult: PropTypes.array,
    theme: PropTypes.oneOf([Themes.DARK, Themes.LIGHT]),
    autocomplete: PropTypes.bool,
    noResults: PropTypes.bool,
    isSmallMode: PropTypes.bool,
    isMobile: PropTypes.bool,
    onSearch: PropTypes.func,
    onKeyDown: PropTypes.func,
    openFullSearch: PropTypes.func,
    goToResult: PropTypes.func
  };

  static defaultProps = {
    className: '',
    searchResult: [],
    autocomplete: false,
    isSmallMode: false,
    isMobile: false,
    onSearch: () => {},
    openFullSearch: () => {},
    goToResult: () => {},
    onKeyDown: () => {}
  };

  className = 'ecos-input-search';

  state = {
    searchText: ''
  };

  runSearch = debounce(() => {
    this.props.onSearch(this.state.searchText);
  }, 500);

  getIsLastInGroup(arr, i) {
    return isLastItem(arr, i) || 'groupName' in arr[i + 1];
  }

  onChange = e => {
    this.setState({ searchText: e.target.value }, this.runSearch);
  };

  onKeyDown = e => {
    switch (e.key) {
      case 'Enter':
        this.openFullSearch();
        break;
      case 'Escape':
        this.resetSearch();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const searchTextUp = SearchService.getSearchTextFromHistory(true);
        this.setState({ searchText: searchTextUp }, this.runSearch);
        break;
      case 'ArrowDown':
        e.preventDefault();
        const searchTextDown = SearchService.getSearchTextFromHistory(false);
        this.setState({ searchText: searchTextDown }, this.runSearch);
        break;
      default:
        break;
    }
  };

  openFullSearch = () => {
    const searchText = this.state.searchText;
    SearchService.setSearchTextToHistory(searchText);
    this.props.openFullSearch(searchText);
    this.resetSearch();
  };

  resetSearch = data => {
    this.setState({ searchText: '' });
    this.props.onSearch('');
  };

  renderResults() {
    const { noResults, searchResult, goToResult } = this.props;

    return !noResults && !isEmpty(searchResult)
      ? searchResult.map((item, i, arr) => <SearchItem data={item} onClick={goToResult} isLast={this.getIsLastInGroup(arr, i)} />)
      : null;
  }

  renderNoResults() {
    const { noResults } = this.props;

    return noResults ? <li className={`${this.className}__no-results`}>{t('Ничего не найдено')}</li> : null;
  }

  renderBtnShowAll() {
    const { searchResult } = this.props;

    return !isEmpty(searchResult) ? (
      <li className={`${this.className}__show-all`}>
        <Btn className={`${this.className}__show-all-btn ecos-btn_narrow-t_standart`} onClick={this.openFullSearch}>
          {t('Показать все результаты')}
        </Btn>
      </li>
    ) : null;
  }

  render() {
    const { searchText } = this.state;
    const { className, theme, autocomplete, searchResult, noResults } = this.props;
    const classNameContainer = classNames(this.className, className, `${this.className}_${theme}`);

    return (
      <ClickOutside handleClickOutside={this.resetSearch} className={`${this.className}__click_outside`}>
        <Dropdown
          className={`${this.className} ecos-header-dropdown`}
          isOpen={(!isEmpty(searchResult) || noResults) && autocomplete}
          toggle={() => {}}
        >
          <DropdownToggle tag="div">
            <div className={classNameContainer}>
              <Icon className={classNames(`${this.className}__icon`, 'icon-search')} />
              <Input
                className={classNames(`${this.className}__input`)}
                placeholder={t('Найти файл, человека или сайт')}
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
                value={searchText || ''}
              />
            </div>
          </DropdownToggle>
          <DropdownMenu className={`${this.className}__results ecos-dropdown__menu`}>
            {this.renderResults()}
            {this.renderNoResults()}
            {this.renderBtnShowAll()}
          </DropdownMenu>
        </Dropdown>
      </ClickOutside>
    );
  }
}
