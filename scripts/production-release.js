// /* eslint-disable no-console */
const { exec } = require("child_process");

console.log("==========================");
console.log("Production release started");
console.log("==========================");

const { S3_BUILDS_KEY, S3_BUILDS_SECRET, S3_BUILDS_REGION } = process.env;
console.log("...Configuring AWS:", { S3_BUILDS_KEY, S3_BUILDS_SECRET, S3_BUILDS_REGION });

// exec(`yarn cross-var aws configure set aws_access_key_id ${S3_BUILDS_KEY}`);
// exec(`yarn cross-var aws configure set aws_secret_access_key ${S3_BUILDS_SECRET}`);
// exec(`yarn cross-var aws configure set default_region_name ${S3_BUILDS_REGION}`);
// exec(`yarn cross-var aws configure set default_output_format json`);

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
