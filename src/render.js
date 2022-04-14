import onChange from 'on-change';

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
    const row = document.querySelector('.container-xxl > .row');
    row.innerHTML = '';

    const feedList = document.createElement('ul');
    row.append(feedList);

    state.feeds.forEach((feed) => {
      const { channelTitle } = feed;
      const { channelDescription } = feed;
      const feedCard = document.createElement('div');
      feedCard.innerHTML = `<li><h3>${channelTitle}</h3><p>${channelDescription}</p></li>`;
      feedList.prepend(feedCard);
      const postList = document.createElement('ul');
      postList.classList.add('post-list');
      feedCard.append(postList);
      feed.posts.forEach((post) => {
        const { postTitle } = post;
        const link = post.linkTrimmed;
        const postCard = document.createElement('div');
        postCard.innerHTML = `<li><a href="${link}" target="_blank">${postTitle}</a></li>`;
        postList.prepend(postCard);
      });
    });
  }
  if (state.mode === 'updateFeed') {
    console.log('update');
    state.feeds.forEach((feed) => {
      const lastPost = feed.posts.sort((a, b) => {
        if (a.postDate > b.postDate) {
          return 1;
        }
        if (a.postDate < b.postDate) {
          return -1;
        }
        return 0;
      })[feed.posts.length - 1];
      console.log(lastPost);
      feed.posts.forEach((post) => {
        console.log(post);
        if (post.postDate > lastPost.postDate) {
          const { postTitle } = post;
          const link = post.linkTrimmed;
          const postCard = document.createElement('div');
          postCard.innerHTML = `<li><a href="${link}" target="_blank">${postTitle}</a></li>`;
          document.querySelector('.post-list').prepend(postCard);
        }
      });
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
