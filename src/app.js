import { object, string } from 'yup';
import axios from 'axios';
import _ from 'lodash';
import { watcher } from './render.js';

const state = {
  urls: [],
  feeds: [],
  feedback: null,
  status: 'invalid',
  mode: null,
};

const schema = object({
  url: string().url().required().notOneOf(state.urls),
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
    return {
      postTitle, description, linkTrimmed, postDate,
    };
  });
  feedObject.posts = posts;
  return feedObject;
};

const checkNewPosts = (obj, newPosts) => {
  const oldPosts = obj.feeds.reduce((all, curr) => {
    Object.assign(all, curr.posts);
    return all;
  }, []);
  const origPostDates = oldPosts.reduce((all, curr) => {
    all.push(curr.postDate);
    return all;
  }, []);
  const newPostDates = newPosts.reduce((all, curr) => {
    all.push(curr.postDate);
    return all;
  }, []);
  if (_.isEqual(origPostDates, newPostDates)) {
    return false;
  }
  return true;
};

const app = (i18nInstance) => {
  const watchedObject = watcher(state);

  const urlForm = document.querySelector('form');
  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(urlForm);

    const url = data.get('url');
    schema.isValid({ url })
      .then((result) => {
        if (result) {
          if (state.urls.includes(url)) {
            watchedObject.status = 'invalid';
            watchedObject.feedback = i18nInstance.t('existsError');
          } else { // http://lorem-rss.herokuapp.com/feed?unit=second&interval=5 (5 second interval updating RSS)
            const makeRequest = (page) => {
              axios.get((`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(page)}`))
                .then((response) => {
                  const XML = response.request.response;
                  const feed = parseXML(XML);
                  const parsedFeed = parseFeed(feed);
                  if (state.urls.includes(url)) {
                    if (checkNewPosts(state, parsedFeed.posts)) {
                      watchedObject.mode = 'waiting';
                      const allPosts = state.feeds.reduce((all, curr) => {
                        Object.assign(all, curr.posts);
                        return all;
                      }, []);
                      const allPostDates = allPosts.reduce((all, curr) => {
                        all.push(curr.postDate);
                        return all;
                      }, []);
                      const newPosts = parsedFeed.posts
                        .filter((post) => !allPostDates.includes(post.postDate));
                      watchedObject.feeds.push(...newPosts);
                      watchedObject.mode = 'updateFeed';
                    } else {
                      console.log('no new posts');
                    }
                  } else {
                    console.log('new Url');
                    watchedObject.urls.push(url);
                    watchedObject.status = 'valid';
                    watchedObject.feeds.push(parsedFeed);
                    watchedObject.feedback = i18nInstance.t('successMessage');
                    watchedObject.mode = 'showFeed';
                  }
                })
                .catch((error) => {
                  watchedObject.status = 'invalid';
                  watchedObject.feedback = i18nInstance.t('invalidRSS');
                  console.log(error);
                });
              setTimeout(makeRequest, 5000, url);
            };
            makeRequest(url);
          }
        } else {
          watchedObject.status = 'invalid';
          console.log(i18nInstance.t('validError'));
          watchedObject.feedback = i18nInstance.t('validError');
        }
      })
      .catch((err) => {
        watchedObject.feedback = err;
        watchedObject.status = 'invalid';
      });
  });
};

export default app;
