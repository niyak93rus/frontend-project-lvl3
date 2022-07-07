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
    buttonTextShow: 'Просмотр',
    close: 'Закрыть',
    defaultError: 'Что-то пошло не так',
    emptyError: 'Не должно быть пустым',
    existsError: 'RSS уже существует',
    feeds: 'Фиды',
    invalidRSS: 'Ресурс не содержит валидный RSS',
    loading: 'Идет загрузка',
    networkError: 'Ошибка сети',
    openFull: 'Читать полностью',
    posts: 'Посты',
    successMessage: 'RSS успешно загружен',
    validError: 'Ссылка должна быть валидным URL',
  },
};

export default resources;
