export default (data, format) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, format);
};
