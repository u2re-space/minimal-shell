/**
 * HTTPS dev: toolbar minimal shell + default view `viewer` (markdown-view module via CrossWord symlink).
 *
 * WHY: Viewer is the registered id; markdown-view ships as `views/viewer` in this workspace.
 *
 * Override with URL: `/?view=explorer` etc. Uses `rememberChoice: false` so localStorage does not steal the demo default.
 */
import "fest/icon";
import type { ViewId } from "shared/boot/types";
import { bootMinimal } from "boot/BootLoader";

function readInitialViewFromSearch(): ViewId {
    try {
        const q = new URLSearchParams(location.search).get("view");
        const id = q?.trim();
        if (id && isEnabledView(id)) return id as ViewId;
    } catch {
        /* ignore */
    }
    return "viewer";
}

const app = document.querySelector<HTMLElement>("#app") ?? document.body;
const initial = readInitialViewFromSearch();

void bootMinimal(app, initial, { rememberChoice: false }).catch((err) => {
    console.error(err);
    app.textContent = err instanceof Error ? err.message : String(err);
});
