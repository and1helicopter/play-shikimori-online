const permissions = [
    'webRequest',
    'webRequestBlocking',
    'storage',
    'tabs',
]

// Домены Шикимори, поддерживаемые "из коробки". shikimori.io — актуальный домен,
// shikimori.one/shikimori.org оставлены для старых ссылок и на случай отката домена.
const shikimoriHosts = [
    'shikimori.io',
    'shikimori.one',
    'shikimori.org',
]

const origins = [
    ...shikimoriHosts.map((host) => `https://${host}/*`),
    'https://smotret-anime-365.ru/*',
    'https://smotret-anime.online/*',
    'https://api.jikan.moe/*',
]

// Разрешение, которое запрашивается у пользователя только когда он сам
// добавляет дополнительный домен Шикимори в настройках (на случай переезда сайта)
const optionalOrigins = [
    'https://*/*',
]

const manifest = {
    manifest_version: 2,

    name: '__MSG_extName__',

    default_locale: 'ru',

    homepage_url: 'https://t.me/playshikionline',

    icons: {
        '192': 'play.png',
        '128': 'play-128.png',
    },

    minimum_chrome_version: '73',

    incognito: 'split',

    browser_action: {
        default_title: 'Открыть историю просмотров',
    },

    background: {
        page: 'background.html',
        persistent: true,
    },

    'options_ui': {
        'page': 'player.html#/options',
        'open_in_tab': false,
    },

    web_accessible_resources: [
        '*',
        'anime365-player-events.js',
    ],

    permissions: [
        ...permissions,
        ...origins,
    ],

    optional_permissions: [
        ...optionalOrigins,
    ],

    content_scripts: [
        {
            matches: shikimoriHosts.map((host) => `https://${host}/*`),
            js: [
                'shikimori-watch-button.js',
            ],
            run_at: 'document_idle',
        },
        {
            matches: [
                'https://smotret-anime.online/translations/embed/*',
                'https://smotret-anime-365.ru/translations/embed/*',
                'https://hentai365.ru/translations/embed/*',
            ],
            js: [
                'anime-365-inject.js',
            ],
            css: [
                'css/anime-365-player.css',
            ],
            run_at: 'document_start',
            all_frames: true,
        },
        // 	{
        // 		matches: [
        // 			'https://myanimelist.net/anime/*',
        // 		],
        // 		js: [
        // 			'watch-button-myanime-list.js',
        // 		],
        // 		run_at: 'document_end',
        // 	},
    ],
}

if (process.env.BROWSER === 'firefox') {

    manifest.browser_specific_settings = {
        gecko: {
            strict_min_version: '67.0',
        },
    }

    // Для самой первой отправки в addons.mozilla.org id лучше не указывать вовсе —
    // Mozilla присвоит его сама. FIREFOX_EXTENSION_ID может быть не задан в CI (пустая
    // строка), поэтому проверяем через truthy, а не через простое присвоение.
    if (process.env.FIREFOX_EXTENSION_ID) {
        manifest.browser_specific_settings.gecko.id = process.env.FIREFOX_EXTENSION_ID
    }

    manifest.incognito = 'spanning'

}

module.exports = {
    default: manifest,
    permissions,
    origins,
    optionalOrigins,
    shikimoriHosts,
}
