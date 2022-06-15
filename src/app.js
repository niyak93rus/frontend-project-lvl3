import axios from 'axios';
import { object, string } from 'yup';
import parse, { updateParse } from './parser.js';

const DELAY = 5000;

const collectUrls = (state) => state.feeds.map((feed) => feed.url);

const addProxy = (url) => {
  const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
  return allOriginsProxy;
};

const validateForm = (state, url) => {
  const previousURLs = collectUrls(state);
  const schema = object({
    url: string().url().required().notOneOf(previousURLs),
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
      const feed = parse(state, XML, 'application/xml');
      state.feeds.push({ ...feed, url: userUrl });
      state.uiState.data.uiText = i18n.t('successMessage');
      state.dataLoading.state = 'successful';
      console.log(state.posts);
    })
    .catch((error) => {
      state.dataLoading.error = (error.message === 'Network Error') ? i18n.t('networkError') : i18n.t('invalidRSS');
      state.dataLoading.state = 'failed';
      console.log(error);
      state.dataLoading.state = 'waiting';
    });
};

const updateFeed = (watchedState, i18n) => {
  const state = watchedState;
  const urls = collectUrls(state);
  urls.forEach((url) => {
    const newUrl = new URL(addProxy(url));
    axios.get(newUrl)
      .then((response) => {
        const XML = response.data.contents;
        parse(state, XML, 'application/xml');
        const newPosts = updateParse(state);
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
        state.formValidation.error = `${i18nInstance.t(err.message)}`;
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
