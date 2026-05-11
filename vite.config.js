/**
 * Minimal shell HTTPS dev (toolbar + single view). Default view: `viewer` (markdown-view under `modules/views`).
 * Port 443, PEM pair in `./certs` or `@vitejs/plugin-basic-ssl` fallback; plain HTTP via `VIEW_DEV_HTTP=1`.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { getViewResolveAliases, workspaceRoot, viewsRoot } from "../shared/view-resolve-aliases.js";
import { tryLoadDevSslFromDir } from "../shared/vite.view.config.js";

const pkgRoot = resolve(import.meta.dirname);
const crosswordFrontend = resolve(workspaceRoot, "apps/CrossWord/src/frontend");
const shellsRoot = resolve(workspaceRoot, "modules/shells");

function resolveDevServerPort() {
    const raw = process.env.VIEW_DEV_PORT;
    if (raw != null && String(raw).trim() !== "") {
        const n = Number(raw);
        return Number.isFinite(n) && n > 0 ? n : 443;
    }
    return 443;
}

const port = resolveDevServerPort();
const useHttps = process.env.VIEW_DEV_HTTP !== "1";
const projectSsl = tryLoadDevSslFromDir(pkgRoot, { sslDir: "certs" });
const plugins = useHttps ? (projectSsl !== null ? [] : [basicSsl()]) : [];
const serverHttps = !useHttps ? false : projectSsl !== null ? projectSsl : undefined;

const viteDevOrigin = (process.env.VITE_DEV_ORIGIN || "").trim();

const fsAllow = [
    searchForWorkspaceRoot(pkgRoot),
    workspaceRoot,
    viewsRoot,
    resolve(workspaceRoot, "modules/views"),
    shellsRoot
];
if (existsSync(crosswordFrontend)) fsAllow.push(crosswordFrontend);

export default defineConfig({
    root: pkgRoot,
    plugins,
    resolve: {
        alias: getViewResolveAliases(pkgRoot)
    },
    server: {
        host: "0.0.0.0",
        open: false,
        strictPort: false,
        port,
        ...(viteDevOrigin ? { origin: viteDevOrigin } : {}),
        https: serverHttps,
        fs: {
            allow: fsAllow
        }
    },
    build: {
        target: "esnext",
        outDir: "dist",
        emptyOutDir: true,
        /* WHY: lightningcss minify fails on some Veela `::slotted` shapes (same as markdown-view). */
        cssMinify: false,
        rollupOptions: {
            input: {
                main: resolve(pkgRoot, "index.html")
            }
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true
            }
        }
    }
});
