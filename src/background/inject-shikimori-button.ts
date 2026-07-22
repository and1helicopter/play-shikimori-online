/**
 * Домены Шикимори из manifest.js получают кнопку "Смотреть онлайн" декларативно
 * (см. content_scripts). Домены, добавленные пользователем в настройках, не описаны
 * в манифесте заранее, поэтому скрипт кнопки внедряется сюда вручную при загрузке страницы.
 */
import {getAdditionalShikimoriHosts} from '@/helpers/shikimori-hosts';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete' || !tab.url) {
        return;
    }

    injectIfAdditionalHost(tabId, tab.url);
});

async function injectIfAdditionalHost(tabId: number, url: string) {
    let hostname: string;
    try {
        hostname = new URL(url).hostname;
    } catch {
        return;
    }

    const additionalHosts = await getAdditionalShikimoriHosts();
    if (!additionalHosts.includes(hostname)) {
        return;
    }

    chrome.tabs.executeScript(tabId, {file: 'shikimori-watch-button.js', runAt: 'document_idle'}, () => {
        if (chrome.runtime.lastError) {
            console.warn('Не удалось внедрить кнопку просмотра', chrome.runtime.lastError.message);
        }
    });
}
