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

const markLinkVisited = (postId) => {
  const button = document.querySelector('.posts').querySelector(`[data-bs-postId="${postId}"]`);
  const neighbourLink = button.parentNode.children[0];
  neighbourLink.classList.replace('fw-bold', 'fw-normal');
  neighbourLink.classList.add('link-secondary');
};

const renderPosts = (state, postList, posts, i18n) => {
  posts.forEach((post) => {
    const { postTitle, postId } = post;
    const link = post.linkTrimmed;
    const postCard = document.createElement('div');
    postCard.innerHTML = `<li class="list-group-item d-flex justify-content-between align-items-start post-card border-0 border-end-0"'>
    <a class="fw-bold" href="${link}" target="_blank">${postTitle}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-bs-postId="${postId}"
    data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('buttonTextShow')}</button></li>`;
    if (state.uiState.seenPosts.has(postId)) {
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
    const { title } = feed;
    const { description } = feed;

    const feedCard = document.createElement('div');
    feedCard.innerHTML = `<li class="list-group-item feed-card border-0"><h3>${title}</h3><p>${description}</p></li>`;
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

const renderUpdatedFeed = (elements, state, i18n) => {
  const { button, input } = elements;
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

const showErrorMessage = (state, elements, process, i18n) => {
  clearFeedback();
  const { column, input, feedback } = elements;
  if (process === 'validation') {
    feedback.innerHTML = i18n.t(state.formValidation.error);
  }
  if (process === 'loading') {
    feedback.innerHTML = (state.dataLoading.error === 'Network Error') ? i18n.t('networkError') : i18n.t('invalidRSS');
  }
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  column.append(feedback);
};

const showSuccessMessage = (elements, i18n) => {
  const { column, feedback, input } = elements;
  clearFeedback();
  input.value = '';
  input.focus();
  input.classList.remove('is-invalid');
  input.classList.add('is-valid');
  feedback.innerHTML = i18n.t('successMessage');
  feedback.classList.add('text-success');
  column.append(feedback);
};

const blockUI = (elements) => {
  const { input, feedback, button } = elements;
  button.setAttribute('disabled', 'disabled');
  input.readOnly = true;
  feedback.classList.add('text-danger');
};

const unblockUI = (elements) => {
  const { button, input } = elements;
  button.disabled = false;
  input.readOnly = false;
};

const renderFormValidation = (state, currentState, elements, i18n) => {
  switch (currentState) {
    case 'valid':
      clearFeedback();
      break;
    case 'invalid':
      clearFeedback();
      showErrorMessage(state, elements, 'validation', i18n);
      break;
    case 'waiting':
      unblockUI(elements);
      break;
    default:
      throw new Error(`Unexpected state: ${currentState}`);
  }
};

const renderDataLoading = (state, currentState, elements, i18n) => {
  switch (currentState) {
    case 'failed':
      showErrorMessage(state, elements, 'loading', i18n);
      break;
    case 'successful':
      showSuccessMessage(elements, i18n);
      unblockUI(elements);
      if (state.feeds.length > 1) {
        renderNewFeeds(state, i18n);
      } else {
        renderInitialFeeds(state, i18n);
      }
      break;
    case 'waiting':
      unblockUI(elements);
      break;
    case 'processing':
      blockUI(elements);
      break;
    case 'updatingFeed':
      renderUpdatedFeed(elements, state, i18n);
      break;
    default:
      throw new Error(`Unexpected state mode: ${currentState}`);
  }
};

const render = (state, path, i18n, elements) => {
  elements.feedback.classList.add('m-0', 'small', 'feedback');

  let currentState;
  if (path === 'formValidation.state') {
    currentState = state.formValidation.state;
    renderFormValidation(state, currentState, elements, i18n);
  }
  if (path === 'dataLoading.state') {
    currentState = state.dataLoading.state;
    renderDataLoading(state, currentState, elements, i18n);
  }
  if (path === 'uiState.seenPosts') {
    const seenPosts = Array.from(state.uiState.seenPosts);
    markLinkVisited(_.last(seenPosts));
  }
};

export default render;
