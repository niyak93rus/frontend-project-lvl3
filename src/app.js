/* eslint-disable no-param-reassign */
import axios from 'axios';
import { parseFeed, parseXML } from './parser.js';

const loadPosts = (userUrl, watchedState, i18n) => {
  const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(userUrl)}`;
  const url = new URL(allOriginsProxy);
  watchedState.mode = 'processing';
  axios.get(url)
    .then((response) => {
      const XML = response.data.contents;
      const feed = parseXML(XML, 'text/html');
      const parsedFeed = parseFeed(watchedState, feed);
      watchedState.status = 'valid';
      watchedState.feeds.push(parsedFeed);
      watchedState.feedback = i18n.t('successMessage');
      watchedState.mode = 'showFeed';
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

// const getPostIds = (watchedState) => {
//   const allPostIds = getAllPosts(watchedState).reduce((all, curr) => {
//     all.push(curr.postId);
//     return all;
//   }, []);
//   return allPostIds;
// };

// const updateFeed = (watchedState, i18n) => {
//   watchedState.urls.forEach((url) => {
//     const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
//     const newUrl = new URL(allOriginsProxy);
//     axios.get(newUrl)
//       .then((response) => {
//         const XML = response.request.response;
//         const feed = parseXML(XML, 'text/html');
//         const parsedFeed = parseFeed(watchedState, feed);
//         watchedState.feeds.forEach((stateFeed) => {
//           parsedFeed.posts.forEach((post) => {
//             if (!getPostIds(watchedState).includes(post.postId)) {
//               if (stateFeed.channelTitle === parsedFeed.channelTitle) {
//                 stateFeed.posts.push(post);
//                 watchedState.mode = 'updateFeed';
//               }
//             }
//           });
//         });
//       })
//       .catch((error) => {
//         watchedState.mode = 'filling';
//         watchedState.status = 'invalid';
//         watchedState.feedback = i18n.t('invalidRSS');
//         console.log(error);
//       });
//   });
//   setTimeout(updateFeed, watchedState.update.delay, watchedState, i18n);
// };

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
        console.log(`ОШИБКА: ${err.message}`, `---URL: ${url}`);
        watchedState.mode = 'filling';
      });
    // updateFeed(watchedState, i18nInstance);
  });

  const postModal = document.getElementById('modal');
  postModal.addEventListener('shown.bs.modal', (event) => {
    const targetButton = event.relatedTarget;
    const relatedPostId = targetButton.getAttribute('data-bs-postId');
    watchedState.posts
      .forEach((post) => {
        if (post.postId === Number(relatedPostId)) {
          console.log(post);
          post.visited = true;
          watchedState.relatedPost = post;
          watchedState.mode = 'showModal';
        }
      });
  });
};

export default app;
