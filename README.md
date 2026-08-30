# AppSearch

Find App Store bundle IDs quickly. Search by app name, pick a platform (iPhone, iPad, or Mac), and copy the bundle ID from the results.

**Live site:** [appsearch.co](https://appsearch.co)

Brought to you by [Rewind Technology](https://rewindtechnology.com).

## How it works

AppSearch is a client-side single-page app. There is no backend — search requests go directly from your browser to the public [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/Searching.html) via JSONP.

1. Enter an app name in the search box.
2. Select **iPhone**, **iPad**, or **Mac** to run a search for that store, or press **Enter** if a platform is already selected.
3. Click a result's bundle ID (with the copy icon) to copy it to the clipboard.

Each platform uses its own iTunes entity type so Mac apps are returned correctly:

| Platform | iTunes entity   |
| -------- | --------------- |
| iPhone   | `software`      |
| iPad     | `iPadSoftware`  |
| Mac      | `macSoftware`   |

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vite.dev/) for dev server and production builds
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- [React Router 7](https://reactrouter.com/) for client-side routing
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for tests

## Getting started

**Requirements:** Node.js 20+ and npm

```bash
git clone https://github.com/weldon/appsearch.co.git
cd appsearch.co
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the Vite dev server            |
| `npm run build`    | Type-check and build to `dist/`      |
| `npm run preview`  | Serve the production build locally   |
| `npm test`         | Run the test suite once              |
| `npm run test:watch` | Run tests in watch mode            |
| `npm run deploy:aws` | Build and sync `dist/` to S3       |

## Testing

```bash
npm test
```

Tests cover search URL construction, routing, platform selection behavior, stale-request handling, and bundle ID copy interactions.

## Deployment (AWS S3 + CloudFront)

Production is a static site in the **`appsearch.co`** S3 bucket, served through CloudFront.

**Prerequisites:**

- AWS CLI configured (`aws sts get-caller-identity`)
- CloudFront custom error responses mapping **403** and **404** to `/index.html` (HTTP 200) for client-side routing

```bash
npm run deploy:aws
```

The deploy script syncs `dist/` to `s3://appsearch.co` with long-lived cache headers on hashed assets and short cache on HTML. To invalidate CloudFront after deploy:

```bash
export CLOUDFRONT_DISTRIBUTION_ID="E1234567890"
npm run deploy:aws
```

Override the bucket if needed:

```bash
S3_BUCKET=appsearch.co npm run deploy:aws
```

## Project structure

```
src/
  components/     UI components (search form, platform selector, result cards)
  pages/          Home and About pages
  services/       iTunes Search API integration
  utils/          Shared helpers (e.g. clipboard copy)
  types/          TypeScript types
  test/           Vitest setup
scripts/
  deploy-aws.sh   S3 sync and CloudFront invalidation
public/           Static assets (icons, manifest, iOS mask SVGs)
dist/             Production build output (generated)
```

## License

Private — © Rewind Technology
