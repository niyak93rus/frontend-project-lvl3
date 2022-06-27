import axios from 'axios';
import { object, string } from 'yup';
import parse, { updateParse } from './parser.js';

const DELAY = 5000;

const collectUrls = (state) => state.feeds.map((feed) => feed.url);

const addProxy = (url) => new URL(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);

const validateForm = (state, url) => {
  const previousURLs = collectUrls(state);
  const schema = object({
    url: string().url().required().notOneOf(previousURLs),
  });
  return schema.validate({ url });
};

const loadPosts = (userUrl, watchedState) => {
  const state = watchedState;
  state.dataLoading.state = 'processing';
  const url = addProxy(userUrl);
  axios.get(url)
    .then((response) => {
      const XML = response.data.contents;
      const feed = parse(state, XML, 'application/xml');
      state.feeds.push({ ...feed, url: userUrl });
      state.posts.push(...feed.posts);
      state.dataLoading.state = 'successful';
      state.dataLoading.error = '';
    })
    .catch((error) => {
      state.dataLoading.error = error.message;
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
        const updatedFeed = parse(state, XML, 'application/xml');
        const newPosts = updateParse(state, updatedFeed);
        if (newPosts.length > 0) {
          state.posts.push(...newPosts);
          state.dataLoading.state = 'updatingFeed';
          state.dataLoading.state = 'waiting';
        }
      })
      .catch((error) => {
        state.dataLoading.error = error.message;
        state.dataLoading.state = 'failed';
        console.log(error);
      });
  });
  setTimeout(updateFeed, DELAY, state, i18n);
};

export { validateForm, loadPosts, updateFeed };
