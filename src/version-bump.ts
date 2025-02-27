import * as ezSpawn from "@jsdevtools/ez-spawn";
import { getNewVersion } from "./get-new-version";
import { getOldVersion } from "./get-old-version";
import { gitCommit, gitPush, gitTag } from "./git";
import { Operation } from "./operation";
import { runNpmScript } from "./run-npm-script";
import { VersionBumpOptions } from "./types/version-bump-options";
import { NpmScript } from "./types/version-bump-progress";
import { VersionBumpResults } from "./types/version-bump-results";
import { updateFiles } from "./update-files";
import { info, success } from "log-symbols";

/**
 * Prompts the user for a version number and updates package.json and package-lock.json.
 *
 * @returns - The new version number
 */
export async function versionBump(): Promise<VersionBumpResults>;

/**
 * Bumps the version number in package.json, package-lock.json.
 *
 * @param release
 * The release version or type. Can be one of the following:
 *
 * - The new version number (e.g. "1.23.456")
 * - A release type (e.g. "major", "minor", "patch", "prerelease", etc.)
 * - "prompt" to prompt the user for the version number
 */
export async function versionBump(release: string): Promise<VersionBumpResults>;

/**
 * Bumps the version number in one or more files, prompting the user if necessary.
 * Optionally also commits, tags, and pushes to git.
 */
export async function versionBump(options: VersionBumpOptions): Promise<VersionBumpResults>;

/**
 * Bumps the version number in one or more files, prompting the user if necessary.
 * Optionally also commits, tags, and pushes to git.
 */
export async function versionBump(arg: VersionBumpOptions | string = {}): Promise<VersionBumpResults> {
  if (typeof arg === "string") {
    arg = { release: arg };
  }

  let operation = await Operation.start(arg);

  // Get the old and new version numbers
  await getOldVersion(operation);
  await getNewVersion(operation);

  // Run npm preversion script, if any
  await runNpmScript(NpmScript.PreVersion, operation);

  // Update the version number in all files
  await updateFiles(operation);

  if (operation.options.execute) {
    console.log(info, "Executing script", operation.options.execute);
    await ezSpawn.async(operation.options.execute, { stdio: "inherit" });
    console.log(success, "Script finished");
  }

  // Run npm version script, if any
  await runNpmScript(NpmScript.Version, operation);

  // Git commit and tag, if enabled
  await gitCommit(operation);
  await gitTag(operation);

  // Run npm postversion script, if any
  await runNpmScript(NpmScript.PostVersion, operation);

  // Push the git commit and tag, if enabled
  await gitPush(operation);

  return operation.results;
}
