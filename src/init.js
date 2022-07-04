/* eslint-disable no-param-reassign */
import 'bootstrap';
import axios from 'axios';
import { uniqueId } from 'lodash';
import i18next from 'i18next';
import onChange from 'on-change';
import { object, string } from 'yup';
import render from './render.js';
import parse from './parser.js';
import ru from './resources.js';

const DELAY = 5000;

const addProxy = (url) => {
  const proxy = 'https://allorigins.hexlet.app/';
  const urlWithProxy = new URL(proxy);
  urlWithProxy.pathname = 'get';
  urlWithProxy.search = `disableCache=true&url=${encodeURIComponent(url)}`;
  return urlWithProxy;
};

const validateForm = (state, url) => {
  const previousURLs = state.feeds.map((feed) => feed.url);
  const schema = object({
    url: string().url().required().notOneOf(previousURLs),
  });
  return schema.validate({ url });
};

const loadPosts = (userUrl, state) => {
  state.dataLoading.state = 'processing';
  const url = addProxy(userUrl);
  axios.get(url)
    .then((response) => {
      const XML = response.data.contents;
      const feed = parse(XML, 'application/xml');
      state.feeds.push({ ...feed, url: userUrl });
      const posts = feed.items.map((post) => ({ ...post, postId: uniqueId() }));
      state.posts.push(...posts);
      state.dataLoading.state = 'successful';
      state.dataLoading.error = '';
    })
    .catch((error) => {
      state.dataLoading.error = error.message;
      state.dataLoading.state = 'failed';
      console.error(error);
      state.dataLoading.state = 'waiting';
    });
};

const updateFeed = (state) => {
  const feeds = state.feeds.map((feed) => {
    const url = addProxy(feed.url);
    return axios.get(url)
      .then((response) => {
        const XML = response.data.contents;
        const updatedFeed = parse(XML, 'application/xml');
        const newPosts = updatedFeed.items
          .filter((post) => !state.posts.map((item) => item.link).includes(post.link));
        if (newPosts.length > 0) {
          state.posts.push(...newPosts.map((post) => ({ ...post, postId: uniqueId() })));
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
  Promise.all(feeds).finally(setTimeout(updateFeed, DELAY, state));
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
        console.error(error);
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
        uiState: {
          seenPosts: new Set(),
        },
        feeds: [],
        posts: [],
      };

      const elements = {
        urlForm: document.querySelector('form'),
        feedsArea: document.querySelector('.feeds'),
        feedsList: document.querySelector('.feed-list'),
        postsArea: document.querySelector('.posts'),
        postsList: document.querySelector('.post-list'),
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
    .catch((error) => console.error(error));
};
