/* eslint-disable no-console */
const { exec } = require("child_process");
const tauriJson = require("../src-tauri/tauri.conf.json");
const packageJson = require("../package.json");

if (tauriJson.package.version !== packageJson.version) {
  process.stderr.write(
    "tauri.conf.json and package.json are out of sync! These should match so new version detection works correctly.",
  );
  return process.exit(1);
}

exec(
  "git diff --name-only $(git rev-parse --abbrev-ref HEAD) origin/main",
  (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      return process.exit(error.code);
    } else if (stderr) {
      console.error(stderr);
      return process.exit(1);
    } else {
      const hasAppCodeChanges = stdout.includes(".tsx");
      // It's possible a commit might touch the app code and this file
      // without including a version bump, but its unlikely
      const hasVersionBump =
        stdout.includes("tauri.conf.json") && stdout.includes("package.json");
      if (hasAppCodeChanges && !hasVersionBump) {
        process.stderr.write(
          [
            `This pull-request introduces ✨changes✨ to application code.`,
            `You need increment the "version" number in package.json and tauri.conf.json, so that existing apps know to fetch the new update 🌍`,
            `The following files were touched 👆:`,
            stdout
              .split("\n")
              .filter((line) => line.includes(".tsx"))
              .join("\n"),
            "",
            "Add a new commit which increments the version numbers and try again 👮",
          ].join("\n"),
        );
        return process.exit(1);
      } else {
        return process.exit(0);
      }
    }
  },
);
