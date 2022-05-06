import 'bootstrap';
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
    posts: [],
    newPosts: [],
    feedback: null,
    status: null,
    mode: null,
    postIdCounter: 0,
    update: {
      delay: 5000,
    },
  };

  const i18nInstance = i18next.createInstance();

  const i18n = i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  })
    .then((result) => result)
    .catch((err) => console.log(err));

  const watchedState = onChange(state, () => {
    render(state, i18nInstance);
  });

  const schema = object({
    url: string().url(i18nInstance.t('validError')).required(i18nInstance.t('emptyError')).notOneOf([watchedState.urls], i18nInstance.t('existsError')),
  });

  runApp(schema, i18nInstance, watchedState);
  return i18n;
};
