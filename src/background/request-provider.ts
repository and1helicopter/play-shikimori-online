/**
 * Исполнение сетевых запросов
 */
import {RequestProvider} from '@/helpers/API/RequestProvider';
// @ts-ignore
import {shikimoriHosts} from '@/manifest.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.contentScriptQuery === 'fetchUrl') {
        RequestProvider.fetch(request.url, request.options)
            .then((response) => sendResponse({response}))
            .catch((error) => sendResponse({error: error.toJSON ? error.toJSON() : error}));

        return true; // Will respond asynchronously.
    }
});


chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        const requestHeaders = details.requestHeaders;
        if (!requestHeaders || details.initiator !== `chrome-extension://${chrome.runtime.id}`) {
            return {requestHeaders};
        }

        for (const header of requestHeaders) {
            if (header.name === 'User-Agent') {
                const manifest = chrome.runtime.getManifest();
                header.value = `${manifest.name}; Browser extension; ${manifest.homepage_url}`;
                break;
            }
        }
        return {requestHeaders};
    },
    {
        urls: [
            ...shikimoriHosts.flatMap((host: string) => [
                `https://${host}/api/*`,
                `https://${host}/oauth/*`,
            ]),
            'https://smotret-anime-365.ru/api/*',
            'https://smotret-anime.online/api/*',
        ],
    },
    ['requestHeaders', 'blocking'],
);
