/* eslint-disable no-param-reassign */
const parseXML = (data, format) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, format);
};

const normalizeXML = (str) => str
  .replace('&lt;![CDATA[', '')
  .replace(']]&gt;', '')
  .replace('<!--[CDATA[', '')
  .replace(']]-->', '');

const getPostID = (str) => str.replace(/\D+/g, '');

const getPostIds = (watchedState) => {
  const allPostIds = watchedState.posts.reduce((all, curr) => {
    all.push(curr.postId);
    return all;
  }, []);
  return allPostIds;
};

const mapPosts = (posts) => posts.map((item) => {
  const postTitle = normalizeXML(item.querySelector('title').innerHTML);
  const description = normalizeXML(item.querySelector('description').innerHTML);
  const link = item.querySelector('link').nextSibling.textContent;
  const linkTrimmed = link.trim();
  const postDate = new Date(item.querySelector('pubdate').innerHTML).getTime();
  const postId = getPostID(item.querySelector('guid').innerHTML);
  return {
    postTitle, description, linkTrimmed, postDate, postId,
  };
});

const initialParse = (watchedState, feed) => {
  const feedObject = {};
  const channelTitle = normalizeXML(feed.querySelector('channel > title').innerHTML);
  feedObject.channelTitle = channelTitle;
  const channelDescription = normalizeXML(feed.querySelector('channel > description').innerHTML);
  feedObject.channelDescription = channelDescription;
  const postItems = feed.querySelectorAll('item');
  const postItemsArray = Array.from(postItems);
  const posts = mapPosts(postItemsArray, watchedState);
  watchedState.posts.push(...posts);
  return feedObject;
};

const updateParse = (watchedState, feed) => {
  const postItems = feed.querySelectorAll('item');
  const postItemsArray = Array.from(postItems);
  const posts = mapPosts(postItemsArray, watchedState)
    .filter((item) => (!getPostIds(watchedState).includes(item.postId)));
  return posts;
};

export { initialParse, updateParse, parseXML };
