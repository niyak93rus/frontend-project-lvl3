import { object, string } from 'yup';
import axios from 'axios';
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
  feedObject.channelTitle = feed.querySelector('channel > title').textContent;
  feedObject.channelDescription = feed.querySelector('channel > description').textContent;
  const postItems = feed.querySelectorAll('item');
  const postItemsArray = Array.from(postItems);
  const posts = postItemsArray.map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').nextSibling.textContent;
    const linkTrimmed = link.trim().slice(0, -2);
    return { title, description, linkTrimmed };
  });
  feedObject.posts = posts;
  return feedObject;
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
          } else {
            axios.get((`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`))
              .then((response) => {
                const XML = response.request.response;
                const feed = parseXML(XML);
                const parsedFeed = parseFeed(feed);
                watchedObject.urls.push(url);
                watchedObject.feeds.push(parsedFeed);
                watchedObject.status = 'valid';
                watchedObject.feedback = i18nInstance.t('successMessage');
                watchedObject.mode = 'showFeed';
              })
              .catch((error) => {
                watchedObject.status = 'invalid';
                watchedObject.feedback = error;
              });
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
