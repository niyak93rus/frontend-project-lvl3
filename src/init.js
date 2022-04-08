import i18next from 'i18next';
import runApp from './app.js';
import ru from './resources.js';

export const i18nInstance = i18next.createInstance();
export default async () => {
  await i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });

  runApp(i18nInstance);
};
