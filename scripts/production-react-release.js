// /* eslint-disable no-console */
const { exec } = require("child_process");
const packageJson = require("../package.json");

const version = packageJson.version;
const { S3_BUILDS_KEY, S3_BUILDS_SECRET, S3_BUILDS_REGION } = process.env;

console.log("==========================");
console.log("Production release started of version: ", version);
console.log("==========================");

exec(`aws configure set aws_access_key_id ${S3_BUILDS_KEY}`);
exec(`aws configure set aws_secret_access_key ${S3_BUILDS_SECRET}`);
exec(`aws configure set default_region_name ${S3_BUILDS_REGION}`);
exec(`aws configure set default_output_format json`);

const filename = `takt-build-${version.replaceAll(".", "-")}.zip`;

exec(`zip -r ${filename} build`, (error, stdout, stderr) => {
  console.log({ error });
  console.log({ stdout });
  console.log({ stderr });
});

exec(`aws s3 cp ${filename} s3://takt-builds/`, (error, stdout, stderr) => {
  console.log({ error });
  console.log({ stdout });
  console.log({ stderr });

  // if it was a success - update API

  // else - process.exit
});

// exec(
//   "git diff --name-only $(git rev-parse --abbrev-ref HEAD) origin/main",
//   (error, stdout, stderr) => {
//     if (error) {
//       console.error(error);
//       return process.exit(error.code);
//     } else if (stderr) {
//       console.error(stderr);
//       return process.exit(1);
//     } else {
//       const hasAppCodeChanges = stdout.includes(".tsx");
//       // It's possible a commit might touch the app code and this file
//       // without including a version bump, but its unlikely
//       const hasVersionBump =
//         stdout.includes("src-tauri/tauri.conf.json") && stdout.includes("package.json");
//       if (hasAppCodeChanges && !hasVersionBump) {
//         process.stderr.write(
//           [
//             `This pull-request introduces ✨changes✨ to application code.`,
//             `You need increment the "version" number in public/app.json and package.json, so that existing apps know to fetch the new update 🌍`,
//             `The following files were touched 👆:`,
//             stdout
//               .split("\n")
//               .filter((line) => line.includes(".tsx"))
//               .join("\n"),
//             "",
//             "Add a new commit which increments the version numbers and try again 👮",
//           ].join("\n"),
//         );
//         return process.exit(1);
//       } else {
//         return process.exit(0);
//       }
//     }
//   },
// );
