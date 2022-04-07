import { state } from './app.js'
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

  const section = document.querySelector('section');
  if (state.status === 'invalid') {
    console.log(state);
    input.classList.add('is-invalid');
    feedback.textContent = state.error;
    feedback.classList.add('text-danger');
    section.append(feedback);
  } else {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    feedback.textContent = 'RSS успешно загружен';
    feedback.classList.add('text-success');
    section.append(feedback);
    form.reset();
    input.focus();
  }
};

const watcher = (state) => {
  const watchedState = onChange(state, (value, previousValue) => {
    console.log(`${previousValue} changed to ${value}`);
  });
};

export { render, watcher };
