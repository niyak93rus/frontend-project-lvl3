/* eslint-disable no-param-reassign */
import axios from 'axios';

// const delay = 5000;

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

const loadPosts = (userUrl, watchedState, i18n) => {
  const allOriginsProxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(userUrl)}`;
  const url = new URL(allOriginsProxy);
  axios.get(url)
    .then((response) => {
      const XML = response.request.response;
      const feed = parseXML(XML);
      const parsedFeed = parseFeed(feed);
      watchedState.urls.push(userUrl);
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
//   const allPosts = watchedState.feeds.reduce((all, curr) => {
//     Object.assign(all, curr.posts);
//     return all;
//   }, []);
//   const allPostIds = allPosts.reduce((all, curr) => {
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
//         const feed = parseXML(XML);
//         const parsedFeed = parseFeed(feed);
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
//   setTimeout(updateFeed, delay, watchedState, i18n);
// };

const app = (schema, i18nInstance, watchedState) => {
  watchedState.mode = 'filling';
  const urlForm = document.querySelector('form');
  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(urlForm);
    const url = data.get('url');
    schema.isValid({ url })
      .then((result) => {
        watchedState.mode = 'processing';
        if (result) {
          if (watchedState.urls.includes(url)) {
            watchedState.status = 'invalid';
            watchedState.feedback = i18nInstance.t('existsError');
            watchedState.mode = 'filling';
          } else {
            loadPosts(url, watchedState, i18nInstance);
          }
        }
        if (!result) {
          watchedState.status = 'invalid';
          watchedState.feedback = i18nInstance.t('validError');
          watchedState.mode = 'filling';
        }
      })
      .catch((err) => {
        watchedState.status = 'invalid';
        watchedState.feedback = err;
        console.log(err);
      });
    // updateFeed(watchedState, i18nInstance);
  });
};

export default app;
