const getPostID = (str) => str.replace(/\D+/g, '');

const getAllIds = (state) => state.posts.map((post) => post.postId);

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

const updateParse = (state, updatedFeed) => updatedFeed.posts
  .filter((post) => !getAllIds(state).includes(post.postId));

export default (state, data, formatName) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, formatName);
  const errorNode = document.querySelector('parsererror');
  if (errorNode) {
    throw new Error(`${errorNode.querySelector('div').textContent}`);
  }

  const channel = document.querySelector('channel');
  const title = channel.querySelector('title').textContent;
  const description = channel.querySelector('description').textContent;
  const postItems = channel.querySelectorAll('item');
  const postItemsArray = Array.from(postItems);
  const posts = mapPosts(postItemsArray, state);

  return { title, description, posts };
};

export { updateParse };
