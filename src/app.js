/* eslint-disable no-param-reassign */
import axios from 'axios';

const delay = 5000;

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
  watchedObject.mode = 'processing';
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
      console.log(error);
      if (error.message === 'Network Error') {
        watchedObject.status = 'invalid';
        watchedObject.feedback = i18n.t('networkError');
      } else {
        watchedObject.status = 'invalid';
        watchedObject.feedback = i18n.t('invalidRSS');
      }
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
        watchedObject.mode = 'filling';
        watchedObject.status = 'invalid';
        watchedObject.feedback = i18n.t('invalidRSS');
        console.log(error);
      });
  });
  setTimeout(updateFeed, delay, watchedObject, i18n);
};

const app = (_state, schema, i18nInstance, watchedObject) => {
  watchedObject.mode = 'filling';
  const urlForm = document.querySelector('form');
  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(urlForm);
    const url = data.get('url');
    schema.isValid({ url })
      .then((result) => {
        if (result) {
          if (watchedObject.urls.includes(url)) {
            watchedObject.status = 'invalid';
            watchedObject.feedback = i18nInstance.t('existsError');
          } else {
            loadPosts(url, watchedObject, i18nInstance);
          }
        }
        if (!result) {
          watchedObject.status = 'invalid';
          watchedObject.feedback = i18nInstance.t('validError');
        }
      })
      .catch((err) => {
        watchedObject.feedback = err;
        watchedObject.status = 'invalid';
        console.log(err);
      });
    updateFeed(watchedObject, i18nInstance);
  });
};

export default app;
