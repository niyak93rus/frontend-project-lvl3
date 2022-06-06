/* eslint-disable no-param-reassign */
import _ from 'lodash';
import { normalizeXML } from './renderFeed.js';

const renderModal = (post) => {
  const postModal = document.getElementById('modal');
  const modalTitle = postModal.querySelector('.modal-title');
  const modalBody = postModal.querySelector('.modal-body');
  const modalFooter = postModal.querySelector('.modal-footer');
  modalTitle.innerHTML = post.postTitle;
  modalBody.innerHTML = post.description;
  modalFooter.innerHTML = `<a href="${post.linkTrimmed}"
  role="button" class="btn btn-primary full-article" target="_blank">Читать полностью</a>
  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>`;
};

const markLinkVisited = (postId) => {
  const button = document.querySelector('.posts').querySelector(`[data-bs-postId="${postId}"]`);
  const neighbourLink = button.parentNode.children[0];
  neighbourLink.classList.replace('fw-bold', 'fw-normal');
  neighbourLink.classList.add('link-secondary');
};

const renderPosts = (state, postList, posts, i18n) => {
  posts.forEach((post) => {
    const { postTitle, postId } = post;
    console.log(post);
    const link = post.linkTrimmed;
    const postCard = document.createElement('div');
    postCard.innerHTML = `<li class="list-group-item d-flex justify-content-between align-items-start post-card border-0 border-end-0"'>
    <a class="fw-bold" href="${link}" target="_blank">${normalizeXML(postTitle)}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-bs-postId="${postId}"
    data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('buttonTextShow')}</button></li>`;
    if (state.uiState.data.clickedPosts.includes(postId)) {
      postCard.querySelector('a').classList.replace('fw-bold', 'fw-normal');
      postCard.querySelector('a').classList.add('link-secondary');
    }
    postCard.querySelector('button').addEventListener('click', () => {
      renderModal(post);
    });
    postList.prepend(postCard);
  });
};

const createHtmlStructure = () => {
  document.querySelector('.feeds').innerHTML = '<h2 class="card-title h4">Фиды</h2>';
  document.querySelector('.posts').innerHTML = '<h2 class="card-title h4">Посты</h2>';
  const feedList = document.createElement('ul');
  feedList.classList.add('feed-list', 'list-group', 'card', 'border-0');
  document.querySelector('.feeds').append(feedList);
  const postList = document.createElement('ul');
  postList.classList.add('post-list', 'list-group', 'card-body', 'border-0');
  document.querySelector('.posts').append(postList);
};

const pastePosts = (state, feedList, postList, i18n) => {
  state.feeds.forEach((feed) => {
    const { channelTitle } = feed;
    const { channelDescription } = feed;

    const feedCard = document.createElement('div');
    feedCard.innerHTML = `<li class="list-group-item feed-card border-0"><h3>${channelTitle}</h3><p>${channelDescription}</p></li>`;
    feedList.prepend(feedCard);
  });

  const sortedPosts = _.sortBy(state.posts, ['post', 'postDate']);
  renderPosts(state, postList, sortedPosts, i18n);
};

const renderInitialFeeds = (state, i18n) => {
  createHtmlStructure();
  const feedList = document.querySelector('.feed-list');
  const postList = document.querySelector('.post-list');
  pastePosts(state, feedList, postList, i18n);
};

const renderNewFeeds = (state, i18n) => {
  const feedList = document.querySelector('.feed-list');
  feedList.innerHTML = '';
  const postList = document.querySelector('.post-list');
  postList.innerHTML = '';
  pastePosts(state, feedList, postList, i18n);
};

const renderUpdatedFeed = (button, input, state, i18n) => {
  button.disabled = false;
  input.readOnly = false;
  const postList = document.querySelector('.post-list');
  postList.innerHTML = '';
  const updatedPosts = _.sortBy(state.posts, ['post', 'postDate']);
  renderPosts(state, postList, updatedPosts, i18n);
};

const clearFeedback = () => {
  const lastMessage = document.querySelector('.feedback');
  if (lastMessage !== null) {
    lastMessage.remove();
  }
};

const showErrorMessage = (state, input, feedback, column, process) => {
  clearFeedback();
  if (process === 'validation') {
    feedback.innerHTML = state.formValidation.error;
  }
  if (process === 'loading') {
    feedback.innerHTML = state.dataLoading.error;
  }
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  column.append(feedback);
};

const showSuccessMessage = (state, input, feedback, column) => {
  clearFeedback();
  input.value = '';
  input.focus();
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  feedback.innerHTML = state.uiState.data.uiText;
  feedback.classList.add('text-success');
  column.append(feedback);
};

const blockUI = (state, input, feedback, button) => {
  button.setAttribute('disabled', 'disabled');
  input.readOnly = true;
  feedback.innerHTML = state.uiState.data.uiText;
  feedback.classList.add('text-danger');
};

const unblockUI = (button, input) => {
  button.disabled = false;
  input.readOnly = false;
};

const render = (state, path, i18n) => {
  const input = document.querySelector('input');
  const button = document.querySelector('[aria-label="add"]');
  const column = document.querySelector('.col-md-10');
  const feedback = document.createElement('p');
  feedback.classList.add('m-0', 'small', 'feedback');

  const links = document.querySelectorAll('a');
  links.forEach((link) => {
    link.addEventListener(('click'), () => {
      link.classList.replace('fw-bold', 'fw-normal');
      link.classList.add('link-secondary');
    });
  });

  let currentState;
  if (path === 'formValidation.state') {
    currentState = state.formValidation.state;
    switch (currentState) {
      case 'valid':
        clearFeedback();
        break;
      case 'invalid':
        showErrorMessage(state, input, feedback, column, 'validation');
        break;
      case 'empty':
        unblockUI(button, input);
        break;
      default:
        throw new Error(`Unexpected state mode: ${currentState}`);
    }
  }
  if (path === 'dataLoading.state') {
    currentState = state.dataLoading.state;
    switch (currentState) {
      case 'failed':
        showErrorMessage(state, input, feedback, column, 'loading');
        break;
      case 'successful':
        showSuccessMessage(state, input, feedback, column);
        unblockUI(button, input);
        if (state.feeds.length > 1) {
          renderNewFeeds(state, i18n);
        } else {
          renderInitialFeeds(state, i18n);
        }
        break;
      case 'waiting':
        unblockUI(button, input);
        break;
      case 'processing':
        blockUI(state, input, feedback, button);
        break;
      case 'updatingFeed':
        renderUpdatedFeed(button, input, state, i18n);
        break;
      default:
        throw new Error(`Unexpected state mode: ${currentState}`);
    }
  }
  if (path === 'uiState.data.clickedPosts') {
    markLinkVisited(_.last(state.uiState.data.clickedPosts));
  }
};

export default render;
