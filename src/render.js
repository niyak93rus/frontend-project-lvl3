/* eslint-disable no-param-reassign */
const renderFeeds = (state, i18n) => {
  document.querySelector('.feeds').innerHTML = '';
  document.querySelector('.posts').innerHTML = '';
  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'card', 'border-0');
  document.querySelector('.feeds').prepend(feedList);
  const postList = document.createElement('ul');
  postList.classList.add('post-list', 'list-group', 'card-body', 'border-0');
  document.querySelector('.posts').append(postList);

  state.feeds.forEach((feed) => {
    const { channelTitle } = feed;
    const { channelDescription } = feed;

    const feedCard = document.createElement('div');
    feedCard.innerHTML = `<li class="list-group-item feed-card border-0"><h3>${channelTitle}</h3><p>${channelDescription}</p></li>`;
    feedList.prepend(feedCard);

    feed.posts.forEach((post) => {
      const { postTitle, postId } = post;
      const link = post.linkTrimmed;
      const postCard = document.createElement('div');
      postCard.innerHTML = `<li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0"'>
      <a class="fw-bold" href="${link}" target="_blank">${postTitle}</a>
      <button class='btn btn-outline-primary btn-sm' data-bs-postId="${postId}"
      data-bs-toggle="modal" data-bs-target="#postModal">${i18n.t('buttonTextShow')}</button></li>`;
      postList.prepend(postCard);
    });
  });
};

const blockButton = (button, i18n) => {
  button.addEventListener('click', () => {
    throw new Error(i18n.t('networkError'));
  });
};

const render = (state, i18n) => {
  console.log(state.mode);

  const allPosts = state.feeds.reduce((all, curr) => {
    Object.assign(all, curr.posts);
    return all;
  }, []);
  const input = document.querySelector('input');

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
    renderFeeds(state, i18n);
  }

  if (state.mode === 'updateFeed') {
    const postList = document.querySelector('.post-list');
    postList.innerHTML = '';
    allPosts.forEach((post) => {
      const { postTitle, postId } = post;
      const link = post.linkTrimmed;
      const postCard = document.createElement('div');
      postCard.innerHTML = `<li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0"'>
      <a class="fw-bold" href="${link}" target="_blank">${postTitle}</a>
      <button class='btn btn-outline-primary btn-sm' data-bs-postId="${postId}"
      data-bs-toggle="modal" data-bs-target="#postModal">${i18n.t('buttonTextShow')}</button></li>`;
      postList.prepend(postCard);
    });
  }

  if (state.mode === 'processing') {
    console.log('processing');
    const buttons = document.getElementsByName('button');
    const inputs = document.getElementsByName('url');
    inputs.forEach((item) => {
      item.setAttribute('readonly', true);
    });
    buttons.forEach((button) => {
      button.disabled = true;
      blockButton(button, i18n);
    });
    feedback.textContent = state.feedback;
    feedback.classList.add('text-danger');
    console.log(document.querySelector('#input-url').getAttribute('readonly'));
  }

  if (state.mode === 'filling' || state.mode === 'showFeed' || state.mode === 'updateFeed' || state.mode === 'waiting') {
    const buttons = document.getElementsByName('button');
    const inputs = document.getElementsByName('url');
    inputs.forEach((item) => {
      item.removeAttribute('readonly');
    });
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }

  const postModal = document.getElementById('postModal');
  postModal.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    button.parentElement.children[0].classList.remove('fw-bold');
    button.parentElement.children[0].classList.add('fw-normal', 'link-secondary');
    const modalTitle = postModal.querySelector('.modal-title');
    const modalBody = postModal.querySelector('.modal-body');
    const modalFooter = postModal.querySelector('.modal-footer');
    const relatedPostId = button.getAttribute('data-bs-postId');
    const relatedPost = allPosts.filter((post) => post.postId === relatedPostId);
    modalTitle.textContent = relatedPost[0].postTitle;
    modalBody.textContent = relatedPost[0].description;
    modalFooter.innerHTML = `<a href="${relatedPost[0].linkTrimmed}" role="button" class="btn btn-primary full-article" target="_blank">Читать полностью</a>
    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>`;
  });
};

export default render;
