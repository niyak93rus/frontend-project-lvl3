import axios from 'axios';
import { object, setLocale, string } from 'yup';
import { has } from 'lodash';
import parse from './parser.js';
import { parseFeed, updateParse } from './renderFeed.js';

const DELAY = 5000;

const collectUrls = (watchedState) => {
  const urls = [];
  watchedState.feeds.forEach((feed) => {
    if (has(feed, 'userUrl')) {
      urls.push(feed.userUrl);
    }
  });
  return urls;
};

const addProxy = (url) => {
  const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
  return allOriginsProxy;
};

const validateForm = (watchedState, url, i18n) => {
  setLocale({
    string: {
      url: `${i18n.t('validError')}`,
      required: `${i18n.t('emptyError')}`,
      notOneOf: `${i18n.t('existsError')}`,
    },
    mixed: {
      notOneOf: `${i18n.t('existsError')}`,
    },
  });

  const schema = object({
    url: string().url().required().notOneOf([collectUrls(watchedState)]),
  });
  return schema.validate({ url });
};

const loadPosts = (userUrl, watchedState, i18n) => {
  const state = watchedState;
  state.dataLoading.state = 'processing';
  const url = new URL(addProxy(userUrl));
  axios.get(url)
    .then((response) => {
      const XML = response.data.contents;
      const data = parse(XML, 'application/xml');
      const feed = parseFeed(watchedState, data);
      const feedWithUrl = { ...feed, userUrl };
      state.feeds.push(feedWithUrl);
      state.uiState.data.uiText = i18n.t('successMessage');
      state.dataLoading.state = 'successful';
    })
    .catch((error) => {
      state.dataLoading.error = error.name === 'NetworkError' ? i18n.t('networkError') : i18n.t('invalidRSS');
      state.dataLoading.state = 'failed';
      console.log(error);
      state.dataLoading.state = 'waiting';
    });
};

const updateFeed = (watchedState, i18n) => {
  const state = watchedState;
  const urls = collectUrls(watchedState);
  urls.forEach((url) => {
    const newUrl = new URL(addProxy(url));
    axios.get(newUrl)
      .then((response) => {
        const XML = response.data.contents;
        const data = parse(XML, 'application/xml');
        const newPosts = updateParse(state, data);
        if (newPosts.length > 0) {
          state.posts.push(...newPosts);
          state.dataLoading.state = 'updatingFeed';
          state.dataLoading.state = 'waiting';
        }
      })
      .catch((error) => {
        state.dataLoading.error = i18n.t('invalidRSS');
        state.dataLoading.state = 'failed';
        console.log(error);
      });
  });
  setTimeout(updateFeed, DELAY, state, i18n);
};

const runApp = (i18nInstance, watchedState) => {
  const state = watchedState;
  const urlForm = document.querySelector('form');
  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(urlForm);
    const url = data.get('url');
    validateForm(watchedState, url, i18nInstance)
      .then(() => {
        state.formValidation.state = 'valid';
        loadPosts(url, state, i18nInstance);
      })
      .catch((err) => {
        state.formValidation.error = err.message;
        state.formValidation.state = 'invalid';
        console.log(err);
      });
    updateFeed(state, i18nInstance);
  });
  const postsArea = document.querySelector('.posts');
  postsArea.addEventListener('click', (event) => {
    const postButton = event.target.closest('li').querySelector('button');
    const postId = postButton.dataset.bsPostid;
    if (!postId) return;
    state.uiState.data.clickedPosts.add(postId);
  });
};

export default runApp;
