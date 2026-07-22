import {sync} from '@/helpers/chrome-storage';
// @ts-ignore
import {shikimoriHosts as defaultShikimoriHosts} from '@/manifest.js';

const STORAGE_KEY = 'additionalShikimoriHosts';

export {defaultShikimoriHosts};

export async function getAdditionalShikimoriHosts(): Promise<string[]> {
    const {[STORAGE_KEY]: hosts} = await sync.get<{ [k: string]: string[] }>({[STORAGE_KEY]: []});
    return hosts || [];
}

export async function getAllShikimoriHosts(): Promise<string[]> {
    return [...defaultShikimoriHosts, ...(await getAdditionalShikimoriHosts())];
}

export function normalizeHost(input: string): string | null {
    const value = (input || '').trim();
    if (!value) {
        return null;
    }

    try {
        const hostname = value.includes('://')
            ? new URL(value).hostname
            : new URL(`https://${value}`).hostname;

        return hostname || null;
    } catch {
        return null;
    }
}

/**
 * Добавляет пользовательский домен Шикимори. Разрешение на домен запрашивается
 * первым же вызовом, чтобы попасть в окно "жеста пользователя" (обязательно для Firefox).
 */
export async function addShikimoriHost(input: string): Promise<{ success: boolean; error?: string }> {
    const host = normalizeHost(input);
    if (!host) {
        return {success: false, error: 'Некорректный домен'};
    }

    if (defaultShikimoriHosts.includes(host)) {
        return {success: false, error: 'Этот домен уже поддерживается по умолчанию'};
    }

    const granted = await new Promise<boolean>((resolve) => {
        chrome.permissions.request({origins: [`https://${host}/*`]}, resolve);
    });

    if (!granted) {
        return {success: false, error: 'Разрешение на домен не предоставлено'};
    }

    const existing = await getAdditionalShikimoriHosts();
    if (!existing.includes(host)) {
        await sync.set({[STORAGE_KEY]: [...existing, host]});
    }

    return {success: true};
}

export async function removeShikimoriHost(host: string): Promise<void> {
    const existing = await getAdditionalShikimoriHosts();
    await sync.set({[STORAGE_KEY]: existing.filter((h) => h !== host)});
    chrome.permissions.remove({origins: [`https://${host}/*`]}, () => undefined);
}
