import onChange from 'on-change';
import _ from 'lodash';

const renderFeeds = (state) => {
  const row = document.querySelector('.container-xxl > .row');
  row.innerHTML = '';

  const feedList = document.createElement('ul');
  row.prepend(feedList);

  state.feeds.forEach((feed) => {
    const { channelTitle } = feed;
    const { channelDescription } = feed;
    const feedCard = document.createElement('div');
    feedCard.classList.add('feed-card');
    feedCard.innerHTML = `<li><h3>${channelTitle}</h3><p>${channelDescription}</p></li>`;
    feedList.prepend(feedCard);
    const postList = document.createElement('ul');
    postList.classList.add('post-list');
    row.append(postList);
    const sortedByDate = _.sortBy(feed.posts, 'postDate');
    sortedByDate.forEach((post) => {
      const { postTitle } = post;
      const link = post.linkTrimmed;
      const postCard = document.createElement('div');
      postCard.innerHTML = `<li><a href="${link}" target="_blank">${postTitle}</a></li>`;
      postList.prepend(postCard);
    });
  });
};

const render = (state) => {
  const input = document.querySelector('input');
  const form = document.querySelector('form');

  const lastMessage = document.querySelector('.feedback');
  if (lastMessage !== null) {
    lastMessage.remove();
  }

  const feedback = document.createElement('p');
  feedback.classList.add('m-0', 'position-absolute', 'small', 'feedback');

  const column = document.querySelector('.col-md-10');
  if (state.status === 'invalid') {
    input.classList.add('is-invalid');
    feedback.textContent = state.feedback;
    feedback.classList.add('text-danger');
    column.append(feedback);
  } else {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    feedback.textContent = state.feedback;
    feedback.classList.add('text-success');
    column.append(feedback);
    form.reset();
    input.focus();
  }

  if (state.mode === 'showFeed') {
    renderFeeds(state);
  }

  if (state.mode === 'updateFeed') {
    const postList = document.querySelector('.post-list');
    const sortedByDate = _.sortBy(state.feeds.newPosts, 'postDate');
    sortedByDate.forEach((post) => {
      const { postTitle } = post;
      const link = post.linkTrimmed;
      const postCard = document.createElement('div');
      postCard.innerHTML = `<li><a href="${link}" target="_blank">${postTitle}</a></li>`;
      postList.prepend(postCard);
    });
  }
};

const watcher = (state) => {
  const watchedObject = onChange(state, () => {
    render(state);
  });
  return watchedObject;
};

export { render, watcher };
