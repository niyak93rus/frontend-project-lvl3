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
  const postTitle = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;
  const linkTrimmed = link.trim();
  const postDate = item.querySelector('pubDate').textContent;
  const postId = getPostID(item.querySelector('guid').textContent);
  return {
    postTitle, description, linkTrimmed, postDate, postId,
  };
});

const parseFeed = (watchedState, feed) => {
  const channelTitle = feed.title.textContent;
  const channelDescription = feed.description.textContent;
  const postItemsArray = Array.from(feed.items);
  const posts = mapPosts(postItemsArray, watchedState);
  watchedState.posts.push(...posts);
  return { channelTitle, channelDescription };
};

const updateParse = (watchedState, feed) => {
  const postItemsArray = Array.from(feed.items);
  const posts = mapPosts(postItemsArray, watchedState)
    .filter((item) => (!getPostIds(watchedState).includes(item.postId)));
  return posts;
};

export { parseFeed, updateParse, normalizeXML };
