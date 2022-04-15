/* eslint-disable no-param-reassign */
import { object, string } from 'yup';
import axios from 'axios';
import { watcher } from './render.js';

const state = {
  urls: [],
  feeds: [],
  feedback: null,
  status: 'invalid',
  mode: null,
  newPosts: [],
};

const delay = 5000;

const schema = object({
  url: string().url().required().notOneOf(state.urls, 'RSS уже добавлен'),
});

const parseXML = (data) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, 'text/html');
};

const parseFeed = (feed) => {
  const feedObject = {};
  feedObject.channelTitle = feed.querySelector('channel > title').innerHTML;
  feedObject.channelDescription = feed.querySelector('channel > description').innerHTML;
  const postItems = feed.querySelectorAll('item');
  const postItemsArray = Array.from(postItems);
  const posts = postItemsArray.map((item) => {
    const postTitle = item.querySelector('title').innerHTML;
    const description = item.querySelector('description').innerHTML;
    const link = item.querySelector('link').nextSibling.textContent;
    const linkTrimmed = link.trim().slice(0, -2);
    const postDate = item.querySelector('pubdate').innerHTML;
    const postId = item.querySelector('guid').textContent;
    return {
      postTitle, description, linkTrimmed, postDate, postId,
    };
  });
  feedObject.posts = posts;
  return feedObject;
};

const loadPosts = (userUrl, watchedObject, i18n) => {
  const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(userUrl)}`;
  const url = new URL(allOriginsProxy);
  axios.get(url)
    .then((response) => {
      const XML = response.request.response;
      const feed = parseXML(XML);
      const parsedFeed = parseFeed(feed);
      watchedObject.urls.push(userUrl);
      watchedObject.status = 'valid';
      watchedObject.feeds.push(parsedFeed);
      watchedObject.feedback = i18n.t('successMessage');
      watchedObject.mode = 'showFeed';
    })
    .catch((error) => {
      watchedObject.status = 'invalid';
      watchedObject.feedback = i18n.t('invalidRSS');
      console.log(error);
    });
};

const getPostIds = (watchedObject) => {
  const allPosts = watchedObject.feeds.reduce((all, curr) => {
    Object.assign(all, curr.posts);
    return all;
  }, []);
  const allPostIds = allPosts.reduce((all, curr) => {
    all.push(curr.postId);
    return all;
  }, []);
  return allPostIds;
};

const updateFeed = (watchedObject, i18n) => {
  watchedObject.mode = 'waiting';
  watchedObject.urls.forEach((url) => {
    const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
    const newUrl = new URL(allOriginsProxy);
    axios.get(newUrl)
      .then((response) => {
        const XML = response.request.response;
        const feed = parseXML(XML);
        const parsedFeed = parseFeed(feed);
        watchedObject.feeds.forEach((stateFeed) => {
          parsedFeed.posts.forEach((post) => {
            if (!getPostIds(watchedObject).includes(post.postId)) {
              if (stateFeed.channelTitle === parsedFeed.channelTitle) {
                stateFeed.posts.push(post);
                watchedObject.mode = 'updateFeed';
              }
            }
          });
        });
      })
      .catch((error) => {
        watchedObject.mode = 'waiting';
        watchedObject.status = 'invalid';
        watchedObject.feedback = i18n.t('invalidRSS');
        console.log(error);
      });
  });
  setTimeout(updateFeed, delay, watchedObject, i18n);
};

const app = (i18nInstance) => {
  const watchedObject = watcher(state);
  const urlForm = document.querySelector('form');
  console.log(urlForm);
  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(urlForm);
    const url = data.get('url');
    schema.isValid({ url })
      .then((result) => {
        console.log(state.urls);
        if (result) {
          loadPosts(url, watchedObject, i18nInstance);
        } else {
          watchedObject.mode = 'waiting';
          watchedObject.status = 'invalid';
          watchedObject.feedback = i18nInstance.t('validError');
        }
      })
      .catch((err) => {
        watchedObject.feedback = err;
        watchedObject.status = 'invalid';
      });
    updateFeed(watchedObject, i18nInstance);
  });
};

export default app;
