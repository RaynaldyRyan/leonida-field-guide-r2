# Leonida Field Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/RaynaldyRyan/leonida-field-guide-r2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/RaynaldyRyan/leonida-field-guide-r2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze). Every trophy carries its official name, description and grade, a guide in our own words with cited sources (PowerPyx, Exophase), a roadmap to the platinum in three phases, and a missable flag — only #28 Positive Mental Attitude is missable, and the guide says exactly when to do it. The tracker saves progress in the browser (localStorage), exports and imports it as JSON, filters by grade, kind, earned state and text, and hides story spoilers until earned. No network at run time; no Rockstar logo or artwork.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output dir, validates the 55 trophies (every guide non-blank, every trophy cited), and writes `dossier.json` with the kit's `buildDossier`. It finds the repo from its own file location, so it works from any working directory — the grader runs `node /bot/main.ts`.

## Sources

Guides are original writing. Facts are cited beside each guide: [PowerPyx — GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/grand-theft-auto-vi-gta-6-trophy-guide-roadmap/) and [Exophase — GTA VI trophy list](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/). Steps that could not be independently confirmed say so in the guide instead of inventing a location.

---

<sub>Entered on [make.fun](https://make.fun/?ref=rhhrb4xy&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
