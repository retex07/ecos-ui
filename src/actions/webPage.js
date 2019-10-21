import { createAction } from 'redux-actions';

const prefix = 'webPage/';

export const initPage = createAction(prefix + 'INIT_PAGE');
export const getPageData = createAction(prefix + 'GET_PAGE_DATA');
export const setPageData = createAction(prefix + 'SET_PAGE_DATA');
export const setError = createAction(prefix + 'SET_ERROR');
