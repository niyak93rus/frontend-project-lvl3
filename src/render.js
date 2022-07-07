import onChange from 'on-change';
import _ from 'lodash';

const renderModal = (post, i18n) => {
  const postModal = document.getElementById('modal');
  const modalTitle = postModal.querySelector('.modal-title');
  const modalBody = postModal.querySelector('.modal-body');
  const modalFooter = postModal.querySelector('.modal-footer');

  modalTitle.textContent = post.title;
  modalBody.textContent = post.description;
  modalFooter.innerHTML = '';

  const footerLink = document.createElement('a');
  footerLink.ariaRoleDescription = 'button';
  footerLink.classList.add('btn', 'btn-primary', 'full-article');
  footerLink.href = post.link;
  footerLink.target = '_blank';
  footerLink.textContent = i18n.t('openFull');

  const footerButton = document.createElement('button');
  footerButton.classList.add('btn', 'btn-secondary');
  footerButton.dataset.bsDismiss = 'modal';
  footerButton.textContent = i18n.t('close');
  footerButton.type = 'button';

  modalFooter.append(footerLink, footerButton);
};

const markLinkVisited = (postId) => {
  const button = document.querySelector('.posts').querySelector(`[data-bs-postId="${postId}"]`);
  const neighbourLink = button.parentNode.children[0];
  neighbourLink.classList.replace('fw-bold', 'fw-normal');
  neighbourLink.classList.add('link-secondary');
};

const renderPosts = (state, postsArea, posts, i18n) => {
  _.sortBy(posts, 'title').forEach((post) => {
    const { title, postId, link } = post;

    const postCard = document.createElement('div');
    postCard.innerHTML = '';

    const postsListItem = document.createElement('li');
    postsListItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'post-card', 'border-0', 'border-end-0');

    const postLink = document.createElement('a');
    postLink.classList.add('fw-bold');
    postLink.dataset.bsPostid = postId;
    postLink.href = link;
    postLink.target = '_blank';
    postLink.textContent = title;

    const postButton = document.createElement('button');
    postButton.type = 'button';
    postButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    postButton.dataset.bsPostid = postId;
    postButton.dataset.bsToggle = 'modal';
    postButton.dataset.bsTarget = '#modal';
    postButton.textContent = `${i18n.t('buttonTextShow')}`;

    postsListItem.append(postLink, postButton);
    postCard.append(postsListItem);

    if (state.uiState.seenPosts.has(postId)) {
      postCard.querySelector('a').classList.replace('fw-bold', 'fw-normal');
      postCard.querySelector('a').classList.add('link-secondary');
    }

    postCard.querySelector('button').addEventListener('click', () => {
      renderModal(post, i18n);
    });

    postsArea.prepend(postCard);
  });
};

const createHtmlStructure = (i18n) => {
  const feedsArea = document.querySelector('.feeds');
  const postsArea = document.querySelector('.posts');
  const feedsAreaHeader = document.createElement('h2');
  feedsAreaHeader.classList.add('card-title', 'h4');
  feedsAreaHeader.textContent = i18n.t('feeds');

  const postsAreaHeader = document.createElement('h2');
  postsAreaHeader.classList.add('card-title', 'h4');
  postsAreaHeader.textContent = i18n.t('posts');

  const feedsList = document.createElement('ul');
  feedsList.classList.add('feed-list', 'list-group', 'card', 'border-0');

  const postList = document.createElement('ul');
  postList.classList.add('post-list', 'list-group', 'card-body', 'border-0');

  feedsArea.append(feedsAreaHeader);
  feedsArea.append(feedsList);

  postsArea.append(postsAreaHeader);
  postsArea.append(postList);
};

const pastePosts = (state, i18n) => {
  const postsList = document.querySelector('.post-list');
  state.feeds.forEach((feed) => {
    const { title, description } = feed;
    const feedCard = document.createElement('div');

    const feedsListItem = document.createElement('li');
    feedsListItem.classList.add('list-group-item', 'feed-card', 'border-0');

    const feedTitle = document.createElement('h3');
    feedTitle.textContent = title;

    const feedDescription = document.createElement('p');
    feedDescription.textContent = description;

    feedsListItem.append(feedTitle, feedDescription);
    feedCard.append(feedsListItem);
    document.querySelector('.feed-list').prepend(feedCard);
  });

  renderPosts(state, postsList, state.posts, i18n);
};

const renderFeeds = (state, i18n) => {
  const feedList = document.querySelector('.feeds');
  const postList = document.querySelector('.posts');
  feedList.innerHTML = '';
  postList.innerHTML = '';
  if (state.feeds > 1) {
    pastePosts(state, i18n);
  } else {
    createHtmlStructure(i18n);
    pastePosts(state, i18n);
  }
};

const renderUpdatedFeed = (elements, state, i18n) => {
  const { button, input } = elements;
  button.disabled = false;
  input.readOnly = false;
  const postList = document.querySelector('.post-list');
  postList.innerHTML = '';
  renderPosts(state, postList, state.posts, i18n);
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
    feedback.innerHTML = i18n.t(`${state.formValidation.error}`);
  }
  if (process === 'loading') {
    feedback.innerHTML = i18n.t(`${state.dataLoading.error}`);
  }
  input.classList.remove('is-valid');
  input.classList.add('is-invalid');
  feedback.classList.remove('text-success', 'text-warning');
  feedback.classList.add('text-danger', 'm-0', 'small', 'feedback');
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
  feedback.classList.remove('text-danger', 'text-warning');
  feedback.classList.add('text-success', 'm-0', 'small', 'feedback');
  column.append(feedback);
};

const blockUI = (elements) => {
  const { input, button } = elements;
  button.setAttribute('disabled', 'disabled');
  input.readOnly = true;
};

const unblockUI = (elements) => {
  const { button, input } = elements;
  button.disabled = false;
  input.readOnly = false;
};

const renderFormValidation = (state, elements, i18n) => {
  const currentState = state.formValidation.state;
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

const renderDataLoading = (state, elements, i18n) => {
  const currentState = state.dataLoading.state;
  const { column, feedback } = elements;
  switch (currentState) {
    case 'processing':
      feedback.classList.remove('text-success', 'text-danger');
      feedback.classList.add('text-warning', 'm-0', 'small', 'feedback');
      feedback.textContent = i18n.t('loading');
      column.append(feedback);
      blockUI(elements);
      break;
    case 'failed':
      showErrorMessage(state, elements, 'loading', i18n);
      break;
    case 'successful':
      showSuccessMessage(elements, i18n);
      unblockUI(elements);
      renderFeeds(state, i18n);
      break;
    case 'waiting':
      unblockUI(elements);
      break;
    default:
      throw new Error(`Unexpected state mode: ${currentState}`);
  }
};

const render = (state, path, i18n, elements) => {
  switch (path) {
    case 'formValidation.state':
    case 'formValidation.error':
      renderFormValidation(state, elements, i18n);
      break;
    case 'dataLoading.state':
    case 'dataLoading.error':
    case 'feeds':
    case 'posts':
      renderDataLoading(state, elements, i18n);
      break;
    case 'uiState.state':
      renderUpdatedFeed(elements, state, i18n);
      break;
    case 'uiState.seenPosts':
      markLinkVisited(_.last(Array.from(state.uiState.seenPosts)));
      break;
    default:
      throw new Error(`Unexpected path: ${path}`);
  }
};

const watch = (state, i18n, elements) => onChange(state, (path) => {
  render(state, path, i18n, elements);
});

export default watch;
