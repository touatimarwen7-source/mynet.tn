import axios from 'axios';
import { camelCase, snakeCase } from 'lodash';

// Fonction pour convertir récursivement les clés d'un objet
const convertKeys = (data, converter) => {
  if (Array.isArray(data)) {
    return data.map(v => convertKeys(v, converter));
  }
  if (data !== null && data.constructor === Object) {
    return Object.keys(data).reduce(
      (result, key) => ({
        ...result,
        [converter(key)]: convertKeys(data[key], converter),
      }),
      {},
    );
  }
  return data;
};

// 1. Intercepteur de réponse : convertit snake_case en camelCase
axios.interceptors.response.use(response => {
  if (response.data) {
    response.data = convertKeys(response.data, camelCase);
  }
  return response;
});

// 2. Intercepteur de requête : convertit camelCase en snake_case
axios.interceptors.request.use(config => {
  if (config.data) {
    config.data = convertKeys(config.data, snakeCase);
  }
  return config;
});

export default axios;