# Hakuba Karate website and members app

Review snapshot: 23 October 2026. This branch is for source/design review, not deployment.

Start with [the current audit and review brief](docs/review-2026-10-23.md). It explains the differences between the React reference and native WordPress implementation and contains current screenshots.

## Important boundaries

- `main` is connected to GitHub Pages. Do not merge this review branch into `main` or publish it without separate approval.
- The intended public-site platform is native WordPress. `wordpress/hakuba-theme/` is the canonical WordPress implementation, not an exported React application.
- `src/` is a runnable React design reference. It has drifted from the newer WordPress templates; its screenshots do not prove WordPress acceptance.
- `private/member-app/` is deliberately included here for source review. A public Git repository does not keep its contents private. On a deployed site, serve the app only through approved server-side authentication. Do not copy this directory into a public document root.
- The WordPress member-app adapter is local-only. Production app delivery and account/progress migration are not implemented by this handoff.
- The contact form does not send club enquiries in the default local preview. The native WordPress form is disabled. Do not use real personal details.
- No database, user accounts, passwords, enquiry records, environment secrets or private download inventories are included.
- The owner explicitly confirmed club clearance to publish the included club photographs on 23 October 2026. This is project-use clearance, not a general licence for third-party reuse. Preserve source/creator rights.

## Run the public React reference

Use a current Node.js version compatible with the locked dependencies (Node 24 was used for this snapshot).

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4173
```

Open http://127.0.0.1:4173/ . The public reference is usable without a WordPress installation. Member sign-in requires a separately configured upstream; it is not supplied by this command.

```sh
npm run lint
npm run build
```

The build prerenders 15 public routes into `dist/`. It is not a production WordPress installation. Do not serve the repository root or the private app as a static site.

## Build WordPress packages

```sh
npm run wordpress:build
```

This produces local theme and club-content plugin ZIPs under `output/wordpress-build/`. They exclude the private app, local adapter, credentials and database. Installation is manual on separate staging after approval. Populate the existing Pages/menu hierarchy, venues, five weekly sessions, exceptions, news and media assignments from approved club records. Activation does not import those records.

`npm run wordpress:preview` only starts a previously installed disposable WordPress runtime. That runtime is absent in this snapshot; the command does not install WordPress. It is not a reproducible fresh-checkout setup command.

## Member source

```sh
npm run member:build
```

This embeds the shared SCSS skin, fonts, icons and separate learning modules into the private app document. It does not authenticate users, migrate progress or deploy the app. `npm run member:check` is a synthetic learning-check suite; it was not run as part of this audit.

## Source map

| Directory | Purpose |
| --- | --- |
| `src/pages`, `src/components`, `src/layout` | React reference and shared public UI |
| `src/data` | React class/venue/content data and public syllabus reading editions |
| `src/styles/partials`, `src/styles/scss` | Shared SCSS and entry points |
| `wordpress/hakuba-theme` | Native WordPress templates and shared frontend behaviour |
| `wordpress/hakuba-club` | Editor-managed venues, sessions and dated cancellations |
| `integrations/wordpress` | Session/approval bridge and local-only member delivery adapter |
| `private/member-app` | Protected-deployment app source, learning modules and presentation |
| `public` | Club-cleared images, logos, fonts, public syllabus PDFs and session script |
| `server` | Separate React development/Node enquiry and member bridge services |
| `scripts` | Build/import helpers; no deployment automation is added |

Historical root HTML/PDF files remain from the older repository. They are not the active rebuild entry point. Local working notes, original provenance inventories, generated ZIPs and browser traces are intentionally excluded from the review snapshot.
