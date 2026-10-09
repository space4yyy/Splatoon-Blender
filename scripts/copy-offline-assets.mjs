import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const zipHelper = resolve(root, "Zip.js");

if (!existsSync(dist)) throw new Error("The Vite build output is missing: dist");
if (!existsSync(zipHelper)) throw new Error("Required offline asset is missing: Zip.js");

// This legacy helper is loaded as a classic script from HTML, so Vite leaves it
// in place instead of bundling it. Large model libraries are bundled separately
// by Tauri as app resources so they do not inflate the executable.
copyFileSync(zipHelper, resolve(dist, "Zip.js"));
