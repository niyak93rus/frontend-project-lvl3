import onChange from 'on-change';

const render = (state) => {
  const input = document.querySelector('input');
  const form = document.querySelector('form');

  const lastMessage = document.querySelector('.feedback');
  if (lastMessage !== null) {
    console.log(lastMessage);
    lastMessage.remove();
  }

  const feedback = document.createElement('p');
  feedback.classList.add('m-0', 'position-absolute', 'small', 'feedback');

  const column = document.querySelector('.col-md-10');
  if (state.status === 'invalid') {
    input.classList.add('is-invalid');
    feedback.textContent = state.error;
    feedback.classList.add('text-danger');
    column.append(feedback);
  } else {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    feedback.textContent = 'RSS успешно загружен';
    feedback.classList.add('text-success');
    column.append(feedback);
    form.reset();
    input.focus();
  }
};

const watcher = (state) => {
  const watchedObject = onChange(state, () => {
    render(state);
  });
  return watchedObject;
};

export { render, watcher };
