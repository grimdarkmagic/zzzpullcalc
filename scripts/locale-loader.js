(() => {
  'use strict';

  window.ZZZ_PLANNER_LOCALES ??= {};
  const manifest = window.ZZZ_PLANNER_LOCALE_MANIFEST;
  if (!manifest?.entries?.[manifest.defaultLanguage]) {
    throw new Error('The locale manifest is missing or invalid.');
  }

  const entries = manifest.entries;
  const supportedLanguages = Object.keys(entries);
  const pendingLoads = new Map();
  const loaderUrl = document.currentScript?.src || new URL('scripts/locale-loader.js', document.baseURI).href;
  const localeBaseUrl = new URL('../locales/', loaderUrl);
  const resolveLanguage = language => {
    const candidate = String(language || '').toLowerCase();
    return supportedLanguages.find(code => code.toLowerCase() === candidate) || null;
  };
  const normalize = language => resolveLanguage(language) || manifest.defaultLanguage;
  const isSupported = language => resolveLanguage(language) !== null;
  const preferred = () => {
    const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const browserLanguage of browserLanguages) {
      const candidate = String(browserLanguage || '').toLowerCase();
      const exact = supportedLanguages.find(code => code.toLowerCase() === candidate || entries[code].intlLocale.toLowerCase() === candidate);
      if (exact) return exact;
      const base = candidate.split('-')[0];
      const baseMatch = supportedLanguages.find(code => code.toLowerCase().split('-')[0] === base || entries[code].intlLocale.toLowerCase().split('-')[0] === base);
      if (baseMatch) return baseMatch;
    }
    return manifest.defaultLanguage;
  };
  const available = () => supportedLanguages.map(code => ({ code, ...entries[code] }));
  const intlLocale = language => entries[normalize(language)].intlLocale;

  function load(language) {
    const normalized = normalize(language);
    if (window.ZZZ_PLANNER_LOCALES[normalized]) return Promise.resolve(normalized);
    if (pendingLoads.has(normalized)) return pendingLoads.get(normalized);

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL(`${normalized}.js`, localeBaseUrl).href;
      script.dataset.plannerLocale = normalized;
      script.onload = () => {
        pendingLoads.delete(normalized);
        if (window.ZZZ_PLANNER_LOCALES[normalized]) resolve(normalized);
        else reject(new Error(`Locale file did not register "${normalized}".`));
      };
      script.onerror = () => {
        pendingLoads.delete(normalized);
        script.remove();
        reject(new Error(`Unable to load locale "${normalized}".`));
      };
      document.head.appendChild(script);
    });

    pendingLoads.set(normalized, promise);
    return promise;
  }

  window.ZZZLocaleLoader = Object.freeze({ load, normalize, isSupported, preferred, available, intlLocale });
})();
