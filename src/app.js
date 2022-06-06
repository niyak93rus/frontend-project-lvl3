/* eslint-disable no-param-reassign */
import axios from 'axios';
import { object, setLocale, string } from 'yup';
import { has } from 'lodash';
import { initialParse, updateParse, parseXML } from './parser.js';

const collectUrls = (watchedState) => {
  const urls = [];
  watchedState.feeds.forEach((feed) => {
    if (has(feed, 'userUrl')) {
      urls.push(feed.userUrl);
    }
  });
  return urls;
};

const validateForm = (watchedState, url, i18n) => {
  setLocale({
    string: {
      url: `${i18n.t('validError')}`,
      required: `${i18n.t('emptyError')}`,
      notOneOf: `${i18n.t('existsError')}`,
    },
  });

  const schema = object({
    url: string().url().required().notOneOf([collectUrls(watchedState)]),
  });
  return schema.validate({ url });
};

const loadPosts = (userUrl, watchedState, i18n) => {
  const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(userUrl)}`;
  const url = new URL(allOriginsProxy);
  axios.get(url)
    .then((response) => {
      const XML = response.data.contents;
      const feed = parseXML(XML, 'text/html');
      console.log(feed);
      const parsedFeed = initialParse(watchedState, feed);
      console.log(parsedFeed);
      const feedWithUrl = { ...parsedFeed, userUrl };
      watchedState.feeds.push(feedWithUrl);
      watchedState.uiState.data.uiText = i18n.t('successMessage');
      watchedState.dataLoading.state = 'successful';
    })
    .catch((error) => {
      watchedState.dataLoading.error = (error.message === 'Network Error') ? i18n.t('networkError') : i18n.t('invalidRSS');
      watchedState.dataLoading.state = 'failed';
      console.log(error);
    });
};

const updateFeed = (watchedState, i18n) => {
  const DELAY = 5000;
  const allUrls = collectUrls(watchedState);
  allUrls.forEach((url) => {
    const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
    const newUrl = new URL(allOriginsProxy);
    axios.get(newUrl)
      .then((response) => {
        const XML = response.request.response;
        const feed = parseXML(XML, 'text/html');
        const newPosts = updateParse(watchedState, feed);
        if (newPosts.length > 0) {
          watchedState.posts.push(...newPosts);
          watchedState.dataLoading.state = 'updatingFeed';
          watchedState.dataLoading.state = 'waiting';
        }
      })
      .catch((error) => {
        watchedState.dataLoading.error = i18n.t('invalidRSS');
        watchedState.dataLoading.state = 'failed';
        console.log(error);
      });
  });
  setTimeout(updateFeed, DELAY, watchedState, i18n);
};

const collectClickedPostsIds = (watchedState) => {
  const postsArea = document.querySelector('.posts');
  postsArea.addEventListener('click', (event) => {
    const targetButton = event.target;
    if (targetButton.nodeName === 'BUTTON') {
      const relatedPostId = targetButton.getAttribute('data-bs-postId');
      watchedState.uiState.data.clickedPosts.push(relatedPostId);
    }
  });
};

const app = (i18nInstance, watchedState) => {
  const urlForm = document.querySelector('form');
  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(urlForm);
    const url = data.get('url');
    validateForm(watchedState, url, i18nInstance)
      .then(() => {
        watchedState.formValidation.state = 'valid';
        watchedState.dataLoading.state = 'processing';
        loadPosts(url, watchedState, i18nInstance);
      })
      .catch((err) => {
        watchedState.formValidation.error = err.message;
        watchedState.formValidation.state = 'invalid';
        console.log(err);
      });
    updateFeed(watchedState, i18nInstance);
  });
  collectClickedPostsIds(watchedState);
};

export default app;
