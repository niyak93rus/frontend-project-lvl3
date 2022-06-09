export default (data, format) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, format);

  const channel = document.querySelector('channel');
  const title = channel.querySelector('title');
  const description = channel.querySelector('description');
  const link = channel.querySelector('link');
  const items = channel.querySelectorAll('item');

  return {
    title, description, link, items,
  };
};
