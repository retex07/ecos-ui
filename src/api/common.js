import { setIsAuthenticated } from '../actions/user';

const getOptions = {
  credentials: 'include',
  method: 'get'
};

const postOptions = {
  ...getOptions,
  method: 'post',
  headers: {
    'Content-Type': 'application/json'
  }
};

const putOptions = {
  ...getOptions,
  method: 'put',
  headers: {
    'Content-Type': 'application/json'
  }
};

// const postUrlEncodedFormOptions = {
//   ...getOptions,
//   method: 'post',
//   headers: {
//     'Content-Type': 'application/x-www-form-urlencoded'
//   }
// };

// const prepareUrlEncodedFormData = (params) => {
//   return Object.keys(params).map((key) => {
//     return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
//   }).join('&');
// };

export class CommonApi {
  constructor(store) {
    if (store) {
      this.store = store;
    }
  }

  checkStatus = response => {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }

    if (response.status === 401) {
      if (this.store && typeof this.store.dispatch === 'function') {
        this.store.dispatch(setIsAuthenticated(false));
      }
    }

    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  };

  getJson = url => {
    return fetch(url, getOptions)
      .then(this.checkStatus)
      .then(parseJSON);
  };

  getHtml = url => {
    return fetch(url, getOptions)
      .then(this.checkStatus)
      .then(parseHtml);
  };

  putJson = (url, data) => {
    return fetch(url, {
      ...putOptions,
      body: JSON.stringify(data)
    }).then(this.checkStatus);
  };

  postJson = (url, data) => {
    return fetch(url, {
      ...postOptions,
      body: JSON.stringify(data)
    })
      .then(this.checkStatus)
      .then(parseJSON);
  };

  // postUrlEncodedForm = (url, data) => {
  //   return fetch(url, {
  //     ...postUrlEncodedFormOptions,
  //     body: prepareUrlEncodedFormData(data)
  //   });
  // };
}

export function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

export function parseJSON(response) {
  return response.json();
}

function parseHtml(response) {
  return response.text();
}
