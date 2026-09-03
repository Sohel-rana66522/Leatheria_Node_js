# Leatheria — Next.js customer website

Migrated from the Flutter Web customer frontend. Full analysis and decisions
are documented in `MIGRATION_PLAN.md`; test status is in
`MIGRATION_TEST_REPORT.md`. Read both before deploying.

## Setup

```bash
cp .env.example .env.local
# fill in the real Firebase web config values in .env.local
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm run start
```

## What this connects to

The same Firebase project (`leatheria`) and the same Firestore collections
(`OurProducts`, `BannerImg`, `users`, `orders`) as the existing Flutter app —
no new project, no schema changes, no data migration. See
`MIGRATION_PLAN.md` §2 and §4.

## Before deploying

See "Recommended next steps" at the bottom of `MIGRATION_TEST_REPORT.md` —
in particular, this was built and tested in a sandbox with no network
access to Firestore, so every Firestore-dependent code path (product
loading, checkout, login, order status) needs a real click-through against
the live project before shipping.
