/* eslint-disable no-param-reassign */
import axios from 'axios';
import { initialParse, updateParse, parseXML } from './parser.js';

const loadPosts = (userUrl, watchedState, i18n) => {
  const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(userUrl)}`;
  const url = new URL(allOriginsProxy);
  watchedState.mode = 'processing';
  axios.get(url)
    .then((response) => {
      watchedState.newPosts = [];
      const XML = response.data.contents;
      const feed = parseXML(XML, 'text/html');
      const parsedFeed = initialParse(watchedState, feed);
      watchedState.urls.push(userUrl);
      watchedState.feeds.push(parsedFeed);
      watchedState.posts.push(...watchedState.newPosts);
      watchedState.feedback = i18n.t('successMessage');
      watchedState.mode = 'showingSuccessMessage';
      watchedState.mode = 'showingFeed';
      watchedState.mode = 'filling';
    })
    .catch((error) => {
      console.log(error);
      watchedState.feedback = (error.message === 'Network Error') ? i18n.t('networkError') : i18n.t('invalidRSS');
      watchedState.mode = 'showingError';
      watchedState.mode = 'filling';
    });
};

const updateFeed = (watchedState, i18n) => {
  watchedState.urls.forEach((url) => {
    const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
    const newUrl = new URL(allOriginsProxy);
    axios.get(newUrl)
      .then((response) => {
        watchedState.newPosts = [];
        const XML = response.request.response;
        const feed = parseXML(XML, 'text/html');
        const newPosts = updateParse(watchedState, feed);
        watchedState.newPosts.push(...newPosts);
        watchedState.posts.push(...newPosts);
        if (newPosts.length > 0) {
          watchedState.mode = 'updatingFeed';
        }
        watchedState.mode = 'filling';
      })
      .catch((error) => {
        watchedState.feedback = i18n.t('invalidRSS');
        watchedState.mode = 'showingError';
        console.log(error);
      });
  });
  setTimeout(updateFeed, watchedState.update.delay, watchedState, i18n);
};

const connectModalToPost = (watchedState) => {
  const postsArea = document.querySelector('.posts');
  postsArea.addEventListener('click', (event) => {
    const targetButton = event.target;
    const relatedPostId = targetButton.getAttribute('data-bs-postId');
    watchedState.posts.forEach((post) => {
      if (Number(post.postId) === Number(relatedPostId)) {
        watchedState.relatedPostId = post.postId;
        watchedState.mode = 'showingModal';
      }
    });
  });
};

const app = (schema, i18nInstance, watchedState) => {
  watchedState.mode = 'filling';
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
        watchedState.feedback = err.message;
        watchedState.mode = 'showingError';
        console.log(err);
        watchedState.mode = 'filling';
      });
    updateFeed(watchedState, i18nInstance);
  });
  connectModalToPost(watchedState);
};

export default app;
