/* eslint-disable no-param-reassign */
import axios from 'axios';
import { initialParse, updateParse, parseXML } from './parser.js';

const loadPosts = (userUrl, watchedState, i18n) => {
  const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(userUrl)}`;
  const url = new URL(allOriginsProxy);
  watchedState.dataLoading.state = 'processing';
  axios.get(url)
    .then((response) => {
      watchedState.dataLoading.state = 'waiting';
      watchedState.uiState.data.uiText = i18n.t('successMessage');
      watchedState.uiState.state = 'showingSuccessMessage';
      watchedState.dataLoading.data.newPosts = [];
      const XML = response.data.contents;
      const feed = parseXML(XML, 'text/html');
      const parsedFeed = initialParse(watchedState, feed);
      watchedState.formValidation.data.urls.push(userUrl);
      watchedState.feeds.push(parsedFeed);
      watchedState.posts.push(...watchedState.dataLoading.data.newPosts);
      watchedState.uiState.state = 'showingFeed';
      watchedState.formValidation.state = 'filling';
    })
    .catch((error) => {
      console.log(error);
      watchedState.dataLoading.state = 'waiting';
      watchedState.uiState.data.uiText = (error.message === 'Network Error') ? i18n.t('networkError') : i18n.t('invalidRSS');
      watchedState.uiState.state = 'showingError';
      watchedState.formValidation.state = 'filling';
    });
};

const updateFeed = (watchedState, i18n) => {
  const DELAY = 5000;
  watchedState.formValidation.data.urls.forEach((url) => {
    const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
    const newUrl = new URL(allOriginsProxy);
    axios.get(newUrl)
      .then((response) => {
        watchedState.dataLoading.data.newPosts = [];
        const XML = response.request.response;
        const feed = parseXML(XML, 'text/html');
        const newPosts = updateParse(watchedState, feed);
        if (newPosts.length > 0) {
          watchedState.dataLoading.data.newPosts.push(...newPosts);
          watchedState.posts.push(...newPosts);
          watchedState.dataLoading.state = 'updatingFeed';
          watchedState.dataLoading.state = 'waiting';
        }
      })
      .catch((error) => {
        watchedState.uiState.data.uiText = i18n.t('invalidRSS');
        watchedState.uiState.state = 'showingError';
        watchedState.uiState.state = 'idle';
        console.log(error);
      });
  });
  setTimeout(updateFeed, DELAY, watchedState, i18n);
};

const connectModalToPost = (watchedState) => {
  const postsArea = document.querySelector('.posts');
  postsArea.addEventListener('click', (event) => {
    const targetButton = event.target;
    const relatedPostId = targetButton.getAttribute('data-bs-postId');
    watchedState.uiState.data.relatedPostId = relatedPostId;
    watchedState.uiState.state = 'showingModal';
    watchedState.uiState.state = 'idle';
  });
};

const app = (schema, i18nInstance, watchedState) => {
  watchedState.formValidation.state = 'filling';
  const urlForm = document.querySelector('form');
  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(urlForm);
    const url = data.get('url');
    schema.validate({ url })
      .then(() => {
        loadPosts(url, watchedState, i18nInstance);
      })
      .catch((err) => {
        watchedState.uiState.data.uiText = err.message;
        watchedState.uiState.state = 'showingError';
        console.log(err);
        watchedState.formValidation.state = 'filling';
      });
    updateFeed(watchedState, i18nInstance);
  });
  connectModalToPost(watchedState);
};

export default app;
