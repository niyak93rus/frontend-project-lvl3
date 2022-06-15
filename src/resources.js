import { setLocale } from 'yup';

setLocale({
  string: {
    url: 'validError',
    required: 'emptyError',
    notOneOf: 'existsError',
  },
  mixed: {
    notOneOf: 'existsError',
  },
});

const resources = {
  translation: {
    emptyError: 'Не должно быть пустым',
    validError: 'Ссылка должна быть валидным URL',
    successMessage: 'RSS успешно загружен',
    existsError: 'RSS уже существует',
    invalidRSS: 'Ресурс не содержит валидный RSS',
    networkError: 'Ошибка сети',
    buttonTextShow: 'Просмотр',
  },
};

export default resources;
