import { object, string } from 'yup';
import { render, watcher } from './render.js';

const state = {
  feeds: [],
  error: null,
  status: 'invalid',
};

const schema = object({
  url: string().url().required(),
});

const init = () => {
  watcher(state);
  const urlForm = document.querySelector('form');

  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(urlForm);

    const url = data.get('url');
    console.log(url);
    schema.isValid(url)
      .then(() => {
        if (state.feeds.includes(url)) {
          state.status = 'invalid';
          state.error = ('RSS уже существует');
          render(state);
        } else {
          state.feeds.push(url);
          state.status = 'valid';
          render(state);
          console.log(`Feeds: ${state.feeds}`);
        }
      })
      .catch((err) => {
        state.error = err;
        state.status = 'invalid';
        render(state);
      });
  });
};

export { state, init };
