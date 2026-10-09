import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Script } from 'node:vm';

test('classic ZIP helper parses and saves an archive through desktop IPC', async () => {
    const calls = [];
    const context = { Blob, TextEncoder, Uint8Array, DataView, Date, alert: () => {}, window: {
        __TAURI__: { core: { invoke: async (command, payload) => { calls.push({command, payload}); return '/downloads/model.zip'; } } },
    } };
    const helper = new Script(`${readFileSync('Zip.js', 'utf8')}; (async () => { const zip = new Zip('model'); const data = [1, 2, 3]; data.fileUrl = 'model/a.bin'; zip.zip.a = data; await zip.makeZip(); })()`);
    await helper.runInNewContext(context);
    assert.equal(calls[0].command, 'save_archive');
    assert.equal(calls[0].payload.filename, 'model.zip');
    assert.deepEqual(Array.from(calls[0].payload.bytes.slice(0, 4)), [80, 75, 3, 4]);
});

test('cancelling the save panel does not report success or retry the download', async () => {
    let saves = 0;
    const notices = [];
    const context = { Blob, TextEncoder, Uint8Array, DataView, Date, alert: message => notices.push(message), window: {
        __TAURI__: { core: { invoke: async () => { saves++; return null; } } },
    } };
    const helper = new Script(`${readFileSync('Zip.js', 'utf8')}; (async () => { const zip = new Zip('model'); const data = [1]; data.fileUrl = 'model/a.bin'; zip.zip.a = data; await zip.makeZip(); })()`);
    await helper.runInNewContext(context);
    assert.equal(saves, 1);
    assert.deepEqual(notices, []);
});

test('offline pages load scripts, styles and media locally', () => {
    for (const page of ['index.html', 'resources.html', 'ink-colors.html', 'documentation/index.html']) {
        const html = readFileSync(resolve('dist', page), 'utf8');
        assert.match(html, /Content-Security-Policy/);
        assert.doesNotMatch(html, /<(?:script|iframe|source|img)\b[^>]*src=["']https?:\/\//i);
        assert.doesNotMatch(html, /<link\b[^>]*href=["']https?:\/\//i);
    }
});

test('every resource mapping and translation is present', () => {
    const config = JSON.parse(readFileSync('src-tauri/tauri.conf.json', 'utf8'));
    for (const path of Object.keys(config.bundle.resources)) assert.ok(existsSync(resolve('src-tauri', path)), path);
    for (const locale of ['USen', 'CNzh', 'JPja']) {
        const language = JSON.parse(readFileSync(`resources/i18n/${locale}.json`, 'utf8'));
        assert.ok(Object.keys(language).length > 100, locale);
    }
    const windows = JSON.parse(readFileSync('src-tauri/tauri.windows.conf.json', 'utf8'));
    assert.equal(windows.bundle.windows.webviewInstallMode.type, 'offlineInstaller');
    const installer = readFileSync(resolve('src-tauri', windows.bundle.windows.nsis.template), 'utf8');
    assert.match(installer, /SetCompressor "\{\{compression\}\}"/);
    assert.doesNotMatch(installer, /SetCompressor \/SOLID/);
});

test('model resource names can be installed on Windows', () => {
    const check = folder => {
        for (const entry of readdirSync(folder, {withFileTypes: true})) {
            assert.doesNotMatch(entry.name, /[<>:"\\|?*]|[. ]$/, `${folder}/${entry.name}`);
            if (entry.isDirectory()) check(resolve(folder, entry.name));
        }
    };
    check('resources');
});
