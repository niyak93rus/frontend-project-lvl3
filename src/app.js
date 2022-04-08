import { object, string } from 'yup';
import axios from 'axios';
import { watcher } from './render.js';

const state = {
  feeds: [],
  feedback: null,
  status: 'invalid',
};

const schema = object({
  url: string().url().required().notOneOf(state.feeds),
});

const app = (i18nInstance) => {
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
            watchedObject.feedback = i18nInstance.t('existsError');
          } else {
            watchedObject.feeds.push(url);
            watchedObject.status = 'valid';
            watchedObject.feedback = i18nInstance.t('successMessage');
            axios.get(url)
              .then((response) => {
                console.log(response);
              })
              .catch((error) => {
                console.log(error);
              });
          }
        } else {
          watchedObject.status = 'invalid';
          console.log(i18nInstance.t('validError'));
          watchedObject.feedback = i18nInstance.t('validError');
        }
      })
      .catch((err) => {
        watchedObject.feedback = err;
        watchedObject.status = 'invalid';
      });
  });
};

export default app;
