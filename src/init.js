/* eslint-disable no-param-reassign */
import 'bootstrap';
import i18next from 'i18next';
import onChange from 'on-change';
import { object, string } from 'yup';
import ru from './resources.js';
import { loadPosts, updateFeed } from './app.js';
import render from './render.js';

const validateForm = (state, url) => {
  const previousURLs = state.feeds.map((feed) => feed.url);
  const schema = object({
    url: string().url().required().notOneOf(previousURLs),
  });
  return schema.validate({ url });
};

const runApp = (state, elements) => {
  const { urlForm, postsArea } = elements;
  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(urlForm);
    const url = data.get('url');
    validateForm(state, url)
      .then(() => {
        state.formValidation.state = 'valid';
        loadPosts(url, state);
      })
      .catch((error) => {
        state.formValidation.error = error.message;
        state.formValidation.state = 'invalid';
        console.log(error);
        state.formValidation.state = 'waiting';
      });
    updateFeed(state);
  });

  postsArea.addEventListener('click', (event) => {
    const postButton = event.target;
    const postId = postButton.dataset.bsPostid;
    if (!postId) return;
    state.uiState.seenPosts.add(postId);
  });
};

export default () => {
  const i18n = i18next.createInstance();
  return i18n.init({
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
        updatingFeed: {
          state: 'waiting', // updating
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
        render(state, path, i18n, elements);
      });

      runApp(watchedState, elements);
    })
    .catch((error) => console.log(error));
};
