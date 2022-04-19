import i18next from 'i18next';
import onChange from 'on-change';
import { object, string } from 'yup';
import runApp from './app.js';
import ru from './resources.js';
import render from './render.js';

export default () => {
  const state = {
    urls: [],
    feeds: [],
    feedback: null,
    status: null,
    mode: null,
  };

  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  })
    .then()
    .catch((err) => console.log(err));

  const watchedState = onChange(state, (path) => {
    if (path === 'mode' || path === 'status' || path === 'feedback') {
      render(state, i18nInstance);
    }
  });

  const schema = object({
    url: string().url(i18nInstance.t('validError')).required(i18nInstance.t('emptyError')).notOneOf([watchedState.urls], i18nInstance.t('existsError')),
  });

  runApp(schema, i18nInstance, watchedState);
};
