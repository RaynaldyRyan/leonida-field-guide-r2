/* Leonida Field Guide — entrypoint: copy app/ + screenshots/ to the output dir and
   write dossier.json with buildDossier from the kit's vendor/makefun-frontend.ts.
   Node 22, standard library only. Run: MAKEFUN_OUTPUT_DIR=out node main.ts
   The repo dir comes from this file's own location (import.meta.url), never from
   process.cwd(): the grader runs `node /bot/main.ts` from another working directory. */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const DOSSIER_MAX_BYTES = 1572864;
const TROPHY_COUNT = 55;

function fail(message: string): never {
  throw new Error("leonida-field-guide main.ts: " + message);
}

function validateTrophies(appDir: string): void {
  const dataPath = join(appDir, "data", "trophies.json");
  if (!existsSync(dataPath)) fail("app/data/trophies.json is missing");
  const parsed = JSON.parse(readFileSync(dataPath, "utf8"));
  const trophies = Array.isArray(parsed) ? parsed : parsed.trophies;
  if (!Array.isArray(trophies)) fail("trophies.json holds no trophies array");
  if (trophies.length !== TROPHY_COUNT) {
    fail("expected " + TROPHY_COUNT + " trophies, found " + trophies.length);
  }
  const grades = new Set<string>();
  for (const trophy of trophies) {
    if (typeof trophy.name !== "string" || !trophy.name.trim()) fail("trophy with no name");
    if (typeof trophy.guide !== "string" || !trophy.guide.trim()) {
      fail("trophy " + trophy.name + " has a blank guide");
    }
    if (typeof trophy.grade === "string") grades.add(trophy.grade);
    if (!Array.isArray(trophy.sources) || trophy.sources.length === 0) {
      fail("trophy " + trophy.name + " cites no source");
    }
    for (const source of trophy.sources) {
      if (typeof source.name !== "string" || !source.name.trim()) {
        fail("trophy " + trophy.name + " has a source with no name");
      }
      // A citation must point somewhere a reader can follow: name alone is
      // not a source. Only http(s) links count; a bare name would fail here.
      if (typeof source.url !== "string" || !/^https?:\/\//.test(source.url)) {
        fail("trophy " + trophy.name + " cites " + source.name + " with no link");
      }
    }
  }
  for (const grade of ["platinum", "gold", "silver", "bronze"]) {
    if (!grades.has(grade)) fail("no " + grade + " trophy in trophies.json");
  }
}

function copyEntryDir(sourceDir: string, targetDir: string): void {
  if (!existsSync(sourceDir)) fail("missing directory: " + sourceDir);
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  const repoDir = fileURLToPath(new URL(".", import.meta.url));
  const appDir = join(repoDir, "app");
  const shotsDir = join(repoDir, "screenshots");
  validateTrophies(appDir);
  mkdirSync(outDir, { recursive: true });
  copyEntryDir(appDir, join(outDir, "app"));
  copyEntryDir(shotsDir, join(outDir, "screenshots"));
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  if (dossier.length > DOSSIER_MAX_BYTES) {
    fail("dossier is " + dossier.length + " bytes, over the 1.5 MiB cap");
  }
  writeFileSync(join(outDir, "dossier.json"), dossier);
  const shots = readdirSync(shotsDir).filter((name) => !name.startsWith("."));
  let appBytes = 0;
  for (const name of readdirSync(join(outDir, "app"), { recursive: true }) as string[]) {
    const path = join(outDir, "app", name);
    if (statSync(path).isFile()) appBytes += statSync(path).size;
  }
  console.log("Leonida Field Guide: 55 trophies validated, " + shots.length + " screenshots, " + appBytes + " app bytes, dossier " + dossier.length + " bytes -> " + outDir);
}

main();
