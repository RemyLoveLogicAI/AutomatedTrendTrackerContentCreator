const i18next = require('i18next');
const middleware = require('i18next-http-middleware');
const path = require('path');

/**
 * Initialize i18next for multi-language support
 */
const initI18n = () => {
  i18next
    .use(middleware.LanguageDetector)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
      preload: ['en', 'es', 'fr'],
      
      resources: {
        en: {
          translation: {
            "welcome": "Welcome to Trend Tracker",
            "trends": "Trends",
            "content": "Content",
            "generate": "Generate",
            "error": "An error occurred",
            "success": "Success"
          }
        },
        es: {
          translation: {
            "welcome": "Bienvenido a Trend Tracker",
            "trends": "Tendencias",
            "content": "Contenido",
            "generate": "Generar",
            "error": "Ocurrió un error",
            "success": "Éxito"
          }
        },
        fr: {
          translation: {
            "welcome": "Bienvenue sur Trend Tracker",
            "trends": "Tendances",
            "content": "Contenu",
            "generate": "Générer",
            "error": "Une erreur s'est produite",
            "success": "Succès"
          }
        },
        de: {
          translation: {
            "welcome": "Willkommen bei Trend Tracker",
            "trends": "Trends",
            "content": "Inhalt",
            "generate": "Generieren",
            "error": "Ein Fehler ist aufgetreten",
            "success": "Erfolg"
          }
        },
        ja: {
          translation: {
            "welcome": "Trend Trackerへようこそ",
            "trends": "トレンド",
            "content": "コンテンツ",
            "generate": "生成",
            "error": "エラーが発生しました",
            "success": "成功"
          }
        },
        zh: {
          translation: {
            "welcome": "欢迎来到Trend Tracker",
            "trends": "趋势",
            "content": "内容",
            "generate": "生成",
            "error": "发生错误",
            "success": "成功"
          }
        }
      },

      detection: {
        order: ['querystring', 'cookie', 'header'],
        caches: ['cookie']
      }
    });

  return i18next;
};

module.exports = {
  initI18n,
  middleware
};
