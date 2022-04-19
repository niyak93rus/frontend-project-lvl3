import i18next from 'i18next';
import onChange from 'on-change';
import { object, string } from 'yup';
import runApp from './app.js';
import ru from './resources.js';
import render from './render.js';

export const i18nInstance = i18next.createInstance();
export default () => {
  const state = {
    urls: [],
    feeds: [],
    feedback: null,
    status: null,
    mode: null,
    newPosts: [],
  };

  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  })
    .then();

  const watchedState = onChange(state, () => {
    render(state, i18nInstance);
  });

  const schema = object({
    url: string().url().required(i18nInstance.t('emptyError')).notOneOf(state.urls, i18nInstance.t('existsError')),
  });

  runApp(schema, i18nInstance, watchedState);
};
