/* eslint-disable no-param-reassign */
import axios from 'axios';
import { uniqueId } from 'lodash';
import parse from './parser.js';

const DELAY = 5000;

const addProxy = (url) => new URL(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);

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
      console.log(error);
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
          state.updatingFeed.state = 'updating';
        }
        state.updatingFeed.state = 'waiting';
      })
      .catch((error) => {
        console.log(error);
      });
  });
  Promise.all(feeds).finally(setTimeout(updateFeed, DELAY, state));
};

export { loadPosts, updateFeed };
