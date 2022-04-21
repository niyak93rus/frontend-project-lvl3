/* eslint-disable no-param-reassign */
import _ from 'lodash';

const renderModal = (postCard, post) => {
  const postModal = document.getElementById('modal');
  postCard.querySelector('button').addEventListener('click', () => {
    const modalTitle = postModal.querySelector('.modal-title');
    const modalBody = postModal.querySelector('.modal-body');
    const modalFooter = postModal.querySelector('.modal-footer');
    modalTitle.innerHTML = post.postTitle;
    modalBody.innerHTML = post.description;
    modalFooter.innerHTML = `<a href="${post.linkTrimmed}"
   role="button" class="btn btn-primary full-article" data-bs-postId=${post.postId} target="_blank">Читать полностью</a>
    <button type="button" class="btn btn-secondary" data-bs-postId=${post.postId} data-bs-dismiss="modal">Закрыть</button>`;
  });
};

const renderFeeds = (state, i18n) => {
  document.querySelector('.feeds').innerHTML = '<h2 class="card-title h4">Фиды</h2>';
  document.querySelector('.posts').innerHTML = '<h2 class="card-title h4">Посты</h2>';
  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'card', 'border-0');
  document.querySelector('.feeds').append(feedList);
  const postList = document.createElement('ul');
  postList.classList.add('post-list', 'list-group', 'card-body', 'border-0');
  document.querySelector('.posts').append(postList);

  state.feeds.forEach((feed) => {
    const { channelTitle } = feed;
    const { channelDescription } = feed;

    const feedCard = document.createElement('div');
    feedCard.innerHTML = `<li class="list-group-item feed-card border-0"><h3>${channelTitle}</h3><p>${channelDescription}</p></li>`;
    feedList.prepend(feedCard);
  });

  const sortedPosts = _.sortBy(state.posts, ['post', 'postDate']);
  sortedPosts.forEach((post) => {
    const { postTitle, postId } = post;
    const link = post.linkTrimmed;
    const postCard = document.createElement('div');
    postCard.innerHTML = `<li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0"'>
    <a class="fw-bold" href="${link}" target="_blank">${postTitle}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-bs-postId="${postId}"
    data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('buttonTextShow')}</button></li>`;
    renderModal(postCard, post);
    if (post.visited) {
      postCard.querySelector('a').classList.replace('fw-bold', 'fw-normal');
    }
    postList.prepend(postCard);
  });
};

const updateFeed = (button, input, state, i18n) => {
  button.disabled = false;
  input.readOnly = false;
  const postList = document.querySelector('.post-list');
  postList.innerHTML = '';
  const sortedPosts = _.sortBy(state.posts, ['post', 'postDate']);
  sortedPosts.forEach((post) => {
    const { postTitle, postId } = post;
    const link = post.linkTrimmed;
    const postCard = document.createElement('div');
    postCard.innerHTML = `<li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0"'>
    <a class="fw-bold" href="${link}" target="_blank">${postTitle}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-bs-postId="${postId}"
    data-toggle="modal" data-target="#modal">${i18n.t('buttonTextShow')}</button></li>`;
    renderModal(postCard, post);
    if (post.visited) {
      postCard.querySelector('a').classList.replace('fw-bold', 'fw-normal');
    }
    postList.prepend(postCard);
  });
};

const render = (state, i18n) => {
  console.log(state.mode);
  const input = document.querySelector('input');
  const button = document.querySelector('[aria-label="add"]');

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
  }
  if (state.status === 'valid') {
    input.value = '';
    input.focus();
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    feedback.textContent = state.feedback;
    feedback.classList.add('text-success');
    column.append(feedback);
  }

  if (state.mode === 'showFeed') {
    button.disabled = false;
    input.readOnly = false;
    renderFeeds(state, i18n);
  }

  if (state.mode === 'updateFeed') {
    updateFeed(button, input, state, i18n);
  }

  if (state.mode === 'filling') {
    button.disabled = false;
    input.readOnly = false;
  }

  if (state.mode === 'processing') {
    button.setAttribute('disabled', 'disabled');
    input.readOnly = true;
    feedback.textContent = state.feedback;
    feedback.classList.add('text-danger');
  }

  if (state.mode === 'showModal') {
    updateFeed(button, input, state, i18n);
  }
};

export default render;
