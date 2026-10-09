import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, statSync } from "node:fs";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const offlineBuild = process.env.VITE_OFFLINE_BUILD === "1";
const characterArchive = resolve(projectRoot, "add-ons/character.zip");
const characterCreatorBundled =
  offlineBuild && existsSync(characterArchive) && statSync(characterArchive).size > 0;

function offlinePageTransform() {
  return {
    name: "splatoon-offline-page-transform",
    transformIndexHtml(html) {
      if (!offlineBuild) return html;

      const offlineCsp = [
        "default-src 'self' blob: data:",
        "connect-src 'self' ipc: http://ipc.localhost blob:",
        "font-src 'self' data:",
        "img-src 'self' blob: data:",
        "media-src 'self' blob: data:",
        "style-src 'self' 'unsafe-inline'",
        "script-src 'self' 'unsafe-inline'",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ");

      return html
        .replace(/<head\b[^>]*>/i, match => `${match}\n    <meta http-equiv="Content-Security-Policy" content="${offlineCsp}">`)
        .replace(/<link\b[^>]*href=["']https:\/\/fonts\.googleapis\.com[^"']*["'][^>]*>/gi, "")
        .replace(/<link\b[^>]*href=["']https:\/\/fonts\.gstatic\.com[^"']*["'][^>]*>/gi, "")
        .replace(
          /<iframe\b[^>]*src=["']https:\/\/discord\.com\/widget[^"']*["'][^>]*><\/iframe>/gi,
          '<p class="offline-community-note">Discord preview is unavailable offline.</p>',
        )
        .replace(/\s+href=["']https?:\/\/[^"']*["']/gi, "")
        .replace(/\s+target=["']_blank["']/gi, "");
    },
  };
}

export default defineConfig({
  base: "./",
  publicDir: false,
  define: {
    __DESKTOP_OFFLINE__: JSON.stringify(offlineBuild),
    __CHARACTER_CREATOR_BUNDLED__: JSON.stringify(characterCreatorBundled),
  },
  plugins: [offlinePageTransform()],
  build: {
    // Tauri embeds current WKWebView/WebView2 engines; preserve the existing
    // top-level await used by the character preview modules.
    target: "esnext",
    rollupOptions: {
      input: {
        main: resolve(projectRoot, "index.html"),
        resources: resolve(projectRoot, "resources.html"),
        inkColors: resolve(projectRoot, "ink-colors.html"),
        documentation: resolve(projectRoot, "documentation/index.html"),
      },
    },
  },
});
