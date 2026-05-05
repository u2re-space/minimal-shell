/**
 * Minimal shell HTTPS dev (toolbar + single view). Default view: `viewer` (markdown-view via CrossWord symlink).
 * Port 443, PEM pair in `./certs` or `@vitejs/plugin-basic-ssl` fallback; plain HTTP via `VIEW_DEV_HTTP=1`.
 */
import { resolve } from "node:path";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import {
    getViewResolveAliases,
    workspaceRoot,
    viewsRoot,
    subsystemRoot
} from "../../views/shared/view-resolve-aliases.js";
import { tryLoadDevSslFromDir } from "../../views/shared/vite.view.config.js";

const pkgRoot = resolve(import.meta.dirname);
const crosswordFrontend = resolve(workspaceRoot, "apps/CrossWord/src/frontend");
const crosswordViews = resolve(crosswordFrontend, "views");
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

const alias = (find, replacement) => ({ find, replacement });

/**
 * Mirrors CrossWord `src/shared` (→ subsystem/src) plus shell/view lazy-import targets.
 * Prepended before getViewResolveAliases so full `com/config/Names` wins over the view stub.
 */
function getMinimalShellBootAliases() {
    return [
        { find: /^com\/config\/(.+)$/, replacement: `${resolve(subsystemRoot, "other/config")}/$1` },
        { find: /^com\/core\/(.+)$/, replacement: `${resolve(subsystemRoot, "routing/channel")}/$1` },
        { find: /^com\/service\/(.+)$/, replacement: `${resolve(subsystemRoot, "service")}/$1` },
        { find: /^com\/template\/(.+)$/, replacement: `${resolve(subsystemRoot, "service/template")}/$1` },
        { find: /^core\/config\/(.+)$/, replacement: `${resolve(subsystemRoot, "other/config")}/$1` },
        { find: /^core\/utils\/(.+)$/, replacement: `${resolve(subsystemRoot, "other/utils")}/$1` },
        { find: /^core\/document\/(.+)$/, replacement: `${resolve(subsystemRoot, "other/document")}/$1` },
        { find: /^core\/workers\/(.+)$/, replacement: `${resolve(subsystemRoot, "routing/workers")}/$1` },
        { find: /^core\/pwa\/(.+)$/, replacement: `${resolve(subsystemRoot, "routing/pwa")}/$1` },
        { find: /^core\/store\/(.+)$/, replacement: `${resolve(subsystemRoot, "store")}/$1` },
        { find: /^core\/constants\/(.+)$/, replacement: `${resolve(subsystemRoot, "routing/constants")}/$1` },
        { find: /^core\/storage\/(.+)$/, replacement: `${resolve(subsystemRoot, "store")}/$1` },
        { find: /^core\/service\/(.+)$/, replacement: `${resolve(subsystemRoot, "service")}/$1` },
        alias("core/modules/Clipboard", resolve(subsystemRoot, "modules/Clipboard.ts")),
        alias("core/modules/TemplateManager", resolve(workspaceRoot, "modules/projects/lur.e/src/interactive/modules/TemplateManager.ts")),
        alias("core/text", resolve(subsystemRoot, "text.ts")),
        alias("core/clipboard-device", resolve(workspaceRoot, "modules/projects/subsystem/runtime/clipboard-device.ts")),
        alias("shared/routing/registry", resolve(subsystemRoot, "routing/core/registry.ts")),
        alias("shared/routing/views", resolve(subsystemRoot, "routing/core/views.ts")),
        alias("shared/routing/view-prefetch", resolve(subsystemRoot, "routing/core/view-prefetch.ts")),
        alias("shared/routing/layer-manager", resolve(subsystemRoot, "routing/core/layer-manager.ts")),
        alias("shared/routing/app-layers", resolve(subsystemRoot, "routing/core/app-layers.ts")),
        alias("shared/routing/implicit-view-bridge", resolve(subsystemRoot, "routing/core/implicit-view-bridge.ts")),
        alias("shared/routing/channel-unknown", resolve(subsystemRoot, "routing/core/channel-unknown.ts")),
        alias("shared/routing/view-transitions", resolve(subsystemRoot, "routing/core/view-transitions.ts")),
        alias("shared/policies/ingress-pipeline-guard", resolve(subsystemRoot, "routing/policies/ingress-pipeline-guard.ts")),
        alias("shared/policies/event-handling-policy", resolve(subsystemRoot, "routing/policies/event-handling-policy.ts")),
        alias("shared/native/cws-bridge", resolve(subsystemRoot, "routing/native/cws-bridge.ts")),
        alias("shared/native/clipboard-device", resolve(subsystemRoot, "routing/native/clipboard-device.ts")),
        alias("shared/styles", resolve(subsystemRoot, "styles.ts")),
        alias("shared/transport/hub-socket-boot", resolve(subsystemRoot, "boot/hub-socket-boot.ts")),
        alias("shared/transport/websocket", resolve(subsystemRoot, "boot/websocket.ts")),
        { find: /^shared\/pwa\/(.+)$/, replacement: `${resolve(subsystemRoot, "routing/pwa")}/$1` },
        { find: /^shared\/config\/(.+)$/, replacement: `${resolve(subsystemRoot, "other/config")}/$1` },
        { find: /^shared\/utils\/(.+)$/, replacement: `${resolve(subsystemRoot, "other/utils")}/$1` },
        { find: /^shared\/(.+)$/, replacement: `${subsystemRoot}/$1` },
        { find: /^boot\/ts\/(.+)$/, replacement: `${resolve(subsystemRoot, "boot")}/$1` },
        alias("frontend/shells/base/index", resolve(crosswordFrontend, "shells/base/index.ts")),
        alias("shells/window", resolve(crosswordFrontend, "ai-slop/window/index.ts")),
        alias("shells/immersive/index", resolve(shellsRoot, "immersive-shell/src/index.ts")),
        alias("shells/content/index", resolve(shellsRoot, "content-shell/src/index.ts")),
        alias("shells/minimal/preview", resolve(shellsRoot, "minimal-shell/src/preview.ts")),
        alias("views/apis/channel-actions", resolve(subsystemRoot, "routing/api/channel-actions.ts")),
        alias("views/apis/channel-invokable", resolve(subsystemRoot, "routing/api/channel-invokable.ts")),
        { find: /^views\/(.+)$/, replacement: `${crosswordViews}/$1` }
    ];
}

export default defineConfig({
    root: pkgRoot,
    plugins,
    resolve: {
        alias: [...getMinimalShellBootAliases(), ...getViewResolveAliases()]
    },
    server: {
        host: "0.0.0.0",
        open: false,
        strictPort: false,
        port,
        ...(viteDevOrigin ? { origin: viteDevOrigin } : {}),
        https: serverHttps,
        fs: {
            allow: [
                searchForWorkspaceRoot(pkgRoot),
                workspaceRoot,
                viewsRoot,
                crosswordFrontend,
                resolve(workspaceRoot, "modules/views"),
                shellsRoot
            ]
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
