import 'bootstrap';
import i18next from 'i18next';
import onChange from 'on-change';
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
          state: 'empty', // valid / invalid
          error: null,
        },
        dataLoading: {
          state: 'processing', // successful / failed
          error: null,
        },
        uiState: {
          data: {
            clickedPosts: new Set(),
            uiText: null,
          },
        },
        feeds: [],
        posts: [],
      };

      const watchedState = onChange(state, (path) => {
        render(state, path, i18nInstance);
      });

      runApp(i18nInstance, watchedState);
    })
    .catch((err) => console.log(err));
};
