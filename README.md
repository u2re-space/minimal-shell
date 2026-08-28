# minimal-shell

Тулбар сверху, статусбар, **одна** активная view. Без split, sidebar и вкладок.

Демо по умолчанию — markdown viewer, HTTPS `:443` / `dev:8434`.

```ts
import { MinimalShell } from "minimal-shell";
```

```bash
cd modules/shells/minimal-shell
npm run ssl:localhost
npm run dev
npm run dev:8434
```

`?shell=minimal` на хосте (например md.u2re.space) берёт эту оболочку, не environment.
