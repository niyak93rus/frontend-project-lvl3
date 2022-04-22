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

const parseFeed = (watchedState, feed) => {
  const feedObject = {};
  const channelTitle = normalizeXML(feed.querySelector('channel > title').innerHTML);
  feedObject.channelTitle = channelTitle;
  const channelDescription = normalizeXML(feed.querySelector('channel > description').innerHTML);
  feedObject.channelDescription = channelDescription;
  const postItems = feed.querySelectorAll('item');
  const postItemsArray = Array.from(postItems);
  const posts = postItemsArray.map((item) => {
    const postTitle = normalizeXML(item.querySelector('title').innerHTML);
    const description = normalizeXML(item.querySelector('description').innerHTML);
    const link = item.querySelector('link').nextSibling.textContent;
    const linkTrimmed = link.trim().slice(0, -2);
    const postDate = item.querySelector('pubdate').innerHTML;
    const postId = watchedState.postIdCounter;
    watchedState.postIdCounter += 1;
    return {
      postTitle, description, linkTrimmed, postDate, postId,
    };
  });
  watchedState.posts.push(...posts);
  return feedObject;
};

export { parseFeed, parseXML };
