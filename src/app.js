/* eslint-disable no-param-reassign */
import axios from 'axios';
import { initialParse, updateParse, parseXML } from './parser.js';

const loadPosts = (userUrl, watchedState, i18n) => {
  const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(userUrl)}`;
  const url = new URL(allOriginsProxy);
  watchedState.mode = 'processing';
  axios.get(url)
    .then((response) => {
      const XML = response.data.contents;
      const feed = parseXML(XML, 'text/html');
      const parsedFeed = initialParse(watchedState, feed);
      watchedState.status = 'valid';
      watchedState.feeds.push(parsedFeed);
      watchedState.feedback = i18n.t('successMessage');
      watchedState.mode = 'showFeed';
      watchedState.mode = 'filling';
    })
    .catch((error) => {
      console.log(error);
      if (error.message === 'Network Error') {
        watchedState.status = 'invalid';
        watchedState.feedback = i18n.t('networkError');
        watchedState.mode = 'filling';
      } else {
        watchedState.status = 'invalid';
        watchedState.feedback = i18n.t('invalidRSS');
        watchedState.mode = 'filling';
      }
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
        watchedState.mode = 'filling';
        watchedState.status = 'invalid';
        watchedState.feedback = i18n.t('invalidRSS');
        console.log(error);
      });
  });
  setTimeout(updateFeed, watchedState.update.delay, watchedState);
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
        watchedState.urls.push(url);
        loadPosts(url, watchedState, i18nInstance);
      })
      .catch((err) => {
        watchedState.status = 'invalid';
        watchedState.feedback = err.message;
        console.log(err);
        watchedState.mode = 'filling';
      });
    updateFeed(watchedState, i18nInstance);
  });
  const postsArea = document.querySelector('.posts');
  postsArea.addEventListener('click', (event) => {
    const targetButton = event.target;
    const relatedPostId = targetButton.getAttribute('data-bs-postId');
    watchedState.posts
      .forEach((post) => {
        if (post.postId === Number(relatedPostId)) {
          post.visited = true;
          watchedState.relatedPost = post;
        }
      });
  });
};

export default app;
