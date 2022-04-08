import { object, string } from 'yup';
import { watcher } from './render.js';

const state = {
  feeds: [],
  error: null,
  status: 'invalid',
};

const schema = object({
  url: string().url().required().notOneOf(state.feeds),
});

const init = () => {
  const watchedObject = watcher(state);

  const urlForm = document.querySelector('form');
  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(urlForm);

    const url = data.get('url');
    schema.isValid({ url })
      .then((result) => {
        if (result) {
          if (state.feeds.includes(url)) {
            watchedObject.status = 'invalid';
            watchedObject.error = ('RSS уже существует');
          } else {
            watchedObject.feeds.push(url);
            watchedObject.status = 'valid';
          }
        } else {
          watchedObject.status = 'invalid';
          watchedObject.error = 'Ссылка должна быть валидным URL';
        }
      })
      .catch((err) => {
        watchedObject.error = err;
        watchedObject.status = 'invalid';
      });
  });
};

export default init;
