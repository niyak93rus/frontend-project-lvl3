/* eslint-disable no-param-reassign */
import 'bootstrap';
import i18next from 'i18next';
import onChange from 'on-change';
import ru from './resources.js';
import { validateForm, loadPosts, updateFeed } from './app.js';
import render from './render.js';

const runApp = (i18nInstance, state, elements) => {
  const { urlForm, postsArea } = elements;
  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(urlForm);
    const url = data.get('url');
    validateForm(url, i18nInstance)
      .then(() => {
        state.formValidation.state = 'valid';
        loadPosts(url, state, i18nInstance);
      })
      .catch((err) => {
        state.formValidation.error = err.message;
        state.formValidation.state = 'invalid';
        console.log(err);
        state.formValidation.state = 'waiting';
      });
    updateFeed(state, i18nInstance);
  });

  postsArea.addEventListener('click', (event) => {
    const postButton = event.target.closest('li').querySelector('button');
    const postId = postButton.dataset.bsPostid;
    if (!postId) return;
    state.uiState.seenPosts.add(postId);
  });
};

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
          state: 'waiting', // valid / invalid
          error: null,
        },
        dataLoading: {
          state: 'processing', // successful / failed
          error: null,
        },
        uiState: {
          seenPosts: new Set(),
        },
        feeds: [],
        posts: [],
      };

      const elements = {
        urlForm: document.querySelector('form'),
        postsArea: document.querySelector('.posts'),
        button: document.querySelector('[aria-label="add"]'),
        input: document.querySelector('input'),
        column: document.querySelector('.col-md-10'),
        feedback: document.createElement('p'),
      };

      const watchedState = onChange(state, (path) => {
        render(state, path, i18nInstance, elements);
      });

      runApp(i18nInstance, watchedState, elements);
    })
    .catch((err) => console.log(err));
};
