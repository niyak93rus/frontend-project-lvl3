const mapPosts = (posts) => posts.map((item) => {
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent.trim();
  return { title, link, description };
});

export default (data, formatName) => {
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
  const items = mapPosts(Array.from(postItems));

  return { title, description, items };
};
