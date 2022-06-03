import 'bootstrap';
import i18next from 'i18next';
import onChange from 'on-change';
import { object, string } from 'yup';
import runApp from './app.js';
import ru from './resources.js';
import render from './render.js';

export default () => {
  const i18nInstance = i18next.createInstance();
  return i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  })
    .then(() => {
      const state = {
        formValidation: {
          state: 'filling',
          data: {
            urls: [],
          },
        },
        dataLoading: {
          state: 'waiting',
          data: {
            newPosts: [],
          },
        },
        uiState: {
          state: 'idle',
          data: {
            relatedPost: null,
            uiText: null,
          },
        },
        feeds: [],
        posts: [],
      };

      const watchedState = onChange(state, (path) => {
        if (path === 'dataLoading.state') {
          render(state.dataLoading.state, state, i18nInstance);
        }
        if (path === 'uiState.state') {
          render(state.uiState.state, state, i18nInstance);
        }
        if (path === 'formValidation.state') {
          render(state.formValidation.state, state, i18nInstance);
        }
      });

      const schema = object({
        url: string().url(i18nInstance.t('validError')).required(i18nInstance.t('emptyError')).notOneOf([watchedState.formValidation.data.urls], i18nInstance.t('existsError')),
      });

      runApp(schema, i18nInstance, watchedState);
    })
    .catch((err) => console.log(err));
};
