# CHANGELOG

<!-- version list -->

## v0.8.3 (2026-09-23)

### Bug Fixes

- **ci**: Centralize container promotion naming
  ([#14](https://github.com/SpencerRWood/portfolio-website/pull/14),
  [`48c39aa`](https://github.com/SpencerRWood/portfolio-website/commit/48c39aa067641df8d2623c5b150d3512b8c46a21))


## v0.8.2 (2026-09-23)

### Bug Fixes

- **ci**: Consume shared container dev promotion workflow
  ([#13](https://github.com/SpencerRWood/portfolio-website/pull/13),
  [`a144ae5`](https://github.com/SpencerRWood/portfolio-website/commit/a144ae510f87fee5176b6ffd943296b86af56746))


## v0.8.1 (2026-09-23)

### Bug Fixes

- **ci**: Explain missing infrastructure checks permission
  ([`39aed3d`](https://github.com/SpencerRWood/portfolio-website/commit/39aed3d3cb0b22a4edf78c1290415915211ebb78))

- **ci**: Gate dev promotion on infrastructure commit status
  ([`39aed3d`](https://github.com/SpencerRWood/portfolio-website/commit/39aed3d3cb0b22a4edf78c1290415915211ebb78))


## v0.8.0 (2026-09-23)

### Bug Fixes

- **ci**: Fail and retry dev promotion stage
  ([#10](https://github.com/SpencerRWood/portfolio-website/pull/10),
  [`365865f`](https://github.com/SpencerRWood/portfolio-website/commit/365865f958e38343710e82c2c251d91846efb9bd))

### Features

- **ci**: Auto-promote validated dev image pins
  ([#10](https://github.com/SpencerRWood/portfolio-website/pull/10),
  [`365865f`](https://github.com/SpencerRWood/portfolio-website/commit/365865f958e38343710e82c2c251d91846efb9bd))

- **ci**: Automatically promote validated dev images
  ([#10](https://github.com/SpencerRWood/portfolio-website/pull/10),
  [`365865f`](https://github.com/SpencerRWood/portfolio-website/commit/365865f958e38343710e82c2c251d91846efb9bd))


## v0.7.0 (2026-09-23)

### Bug Fixes

- **ci**: Inspect branch rules with contents access
  ([#9](https://github.com/SpencerRWood/portfolio-website/pull/9),
  [`a9e3771`](https://github.com/SpencerRWood/portfolio-website/commit/a9e3771d808782a3baa9c3b7e9aff6401b22f97f))

### Features

- **ci**: Gate dev image PR auto-merge on validation
  ([#9](https://github.com/SpencerRWood/portfolio-website/pull/9),
  [`a9e3771`](https://github.com/SpencerRWood/portfolio-website/commit/a9e3771d808782a3baa9c3b7e9aff6401b22f97f))

- **ci**: Propose published website image to infrastructure
  ([#9](https://github.com/SpencerRWood/portfolio-website/pull/9),
  [`a9e3771`](https://github.com/SpencerRWood/portfolio-website/commit/a9e3771d808782a3baa9c3b7e9aff6401b22f97f))

- **ci**: Propose released portfolio image through infrastructure PR
  ([#9](https://github.com/SpencerRWood/portfolio-website/pull/9),
  [`a9e3771`](https://github.com/SpencerRWood/portfolio-website/commit/a9e3771d808782a3baa9c3b7e9aff6401b22f97f))


## v0.6.0 (2026-09-22)

### Features

- **release**: Publish website container to GHCR
  ([`3048888`](https://github.com/SpencerRWood/portfolio-website/commit/304888825ac5b40d31b8a89d841952f834256302))


## v0.5.4 (2026-09-21)

### Bug Fixes

- Pass configured database url to website backend
  ([`9ef67b2`](https://github.com/SpencerRWood/portfolio-website/commit/9ef67b288aec621cf31c9d4b4c2cbcd636ed0eb9))


## v0.5.3 (2026-09-19)

### Bug Fixes

- Remove undeclared release secret
  ([`4e5d4cb`](https://github.com/SpencerRWood/portfolio-website/commit/4e5d4cb1994f14d05d843d3e7ce325beefdb32c2))


## v0.5.2 (2026-09-19)

### Bug Fixes

- Normalize analytics event taxonomy
  ([`0eedbab`](https://github.com/SpencerRWood/portfolio-website/commit/0eedbabda74e1ef7b2ade4cb47f6b34e74cbaff5))


## v0.5.1 (2026-09-18)

### Bug Fixes

- Harden content driven page analytics
  ([`850a315`](https://github.com/SpencerRWood/portfolio-website/commit/850a315c43bbc64923cce9fa148c73e2e7bd2b67))

- Make page analytics content driven
  ([`8604e69`](https://github.com/SpencerRWood/portfolio-website/commit/8604e695246379adef360aa55fa2cd45d415f0ad))


## v0.5.0 (2026-09-18)

### Bug Fixes

- Correct site landmarks and featured metadata
  ([`3c1af88`](https://github.com/SpencerRWood/portfolio-website/commit/3c1af88a4ab8d2c3b9ce728f37be42dfb7e0b338))

- Move site content to jinja markdown publishing
  ([`1e5d33e`](https://github.com/SpencerRWood/portfolio-website/commit/1e5d33e284a99f037366d6fae64d7c2db3fe97f3))

- Reorganize homepage around educational topics
  ([`0f85029`](https://github.com/SpencerRWood/portfolio-website/commit/0f850293f55b0114d3096d4954ac95a57008f2e4))

- Reorganize homepage around educational topics
  ([`dcf7d68`](https://github.com/SpencerRWood/portfolio-website/commit/dcf7d685252a91d9fdf0b1d89fa8210589418356))

- Separate homepage content from presentation
  ([`6a84425`](https://github.com/SpencerRWood/portfolio-website/commit/6a844257d8f7d83eba63a70cc51e762bd49605b6))

### Features

- Publish routed portfolio content
  ([`5c8a40a`](https://github.com/SpencerRWood/portfolio-website/commit/5c8a40af097c4425694e498417d46721e01f1963))

- Refine editorial blog experience
  ([`0708f53`](https://github.com/SpencerRWood/portfolio-website/commit/0708f534a31e0cde9fa793c6906d1e467f00b68a))


## v0.4.0 (2026-09-18)

### Features

- Implement portfolio visual design system
  ([`22e9d20`](https://github.com/SpencerRWood/portfolio-website/commit/22e9d204f8765dd29dbf961ec6a4da4e4757d77d))


## v0.3.0 (2026-09-18)

### Features

- Implement application event instrumentation
  ([`4231616`](https://github.com/SpencerRWood/portfolio-website/commit/42316160d67c40d86bdccca6f131c17d42a1e2ab))


## v0.2.0 (2026-09-17)

### Features

- Implement contact lead capture
  ([`674f86f`](https://github.com/SpencerRWood/portfolio-website/commit/674f86f74bc9fd04c1e9e5241dc569e0d69b3695))


## v0.1.0 (2026-09-15)


## v0.0.1 (2026-09-15)


## v0.0.0 (2026-09-15)

- Initial Release
