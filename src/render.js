/* eslint-disable no-param-reassign */
import _ from 'lodash';

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

const markLinkVisited = (state) => {
  const button = document.querySelector('.posts').querySelector(`[data-bs-postId="${state.uiState.data.relatedPostId}"]`);
  const neighbourLink = button.parentNode.children[0];
  neighbourLink.classList.replace('fw-bold', 'fw-normal');
  neighbourLink.classList.add('link-secondary');
};

const renderPosts = (postList, posts, i18n) => {
  posts.forEach((post) => {
    const { postTitle, postId } = post;
    const link = post.linkTrimmed;
    const postCard = document.createElement('div');
    postCard.innerHTML = `<li class="list-group-item d-flex justify-content-between align-items-start post-card border-0 border-end-0"'>
    <a class="fw-bold" href="${link}" target="_blank">${postTitle}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-bs-postId="${postId}"
    data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('buttonTextShow')}</button></li>`;
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

  const sortedPosts = _.sortBy(state.dataLoading.data.newPosts, ['post', 'postDate']);
  renderPosts(postList, sortedPosts, i18n);
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
  pastePosts(state, feedList, postList, i18n);
};

const updateFeed = (button, input, state, i18n) => {
  button.disabled = false;
  input.readOnly = false;
  const postList = document.querySelector('.post-list');
  const updatedPosts = _.sortBy(state.dataLoading.data.newPosts, ['post', 'postDate']);
  renderPosts(postList, updatedPosts, i18n);
};

const clearFeedback = () => {
  const lastMessage = document.querySelector('.feedback');
  if (lastMessage !== null) {
    lastMessage.remove();
  }
};

const showErrorMessage = (state, input, feedback, column) => {
  clearFeedback();
  input.classList.add('is-invalid');
  feedback.innerHTML = state.uiState.data.uiText;
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

const render = (currentState, stateObject, i18n) => {
  console.log(stateObject);
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

  switch (currentState) {
    case 'showingError':
      showErrorMessage(stateObject, input, feedback, column);
      break;
    case 'showingSuccessMessage':
      showSuccessMessage(stateObject, input, feedback, column);
      break;
    case 'showingFeed':
      unblockUI(button, input);
      if (stateObject.feeds.length > 1) {
        renderNewFeeds(stateObject, i18n);
      } else {
        renderInitialFeeds(stateObject, i18n);
      }
      break;
    case 'filling':
    case 'idle':
    case 'waiting':
      unblockUI(button, input);
      break;
    case 'processing':
      blockUI(stateObject, input, feedback, button);
      break;
    case 'showingModal':
      markLinkVisited(stateObject);
      break;
    case 'updatingFeed':
      updateFeed(button, input, stateObject, i18n);
      break;
    default:
      throw new Error(`Unexpected state mode: ${currentState}`);
  }
};

export default render;
