import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';

import { getCurrentLocale } from './export/util';

const acceptLanguage = getCurrentLocale();

export default function(url, options = {}) {
  const { method, headers = {}, body, noHeaders = false, mode } = options;

  const params = {};

  if (method) {
    params.method = method;
  }

  if (!noHeaders) {
    params.headers = {
      ...headers,
      'Accept-Language': acceptLanguage
    };
  }

  if (url && !url.includes('http')) {
    params.credentials = 'include';
  }

  if (isString(body) || body instanceof FormData) {
    params.body = body;
  } else if (!isEmpty(body)) {
    params.body = JSON.stringify(body);
  }

  if (mode) {
    params.mode = mode;
  }

  return fetch(url, params);
}
