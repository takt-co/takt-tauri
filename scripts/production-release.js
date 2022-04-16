
/* eslint-disable no-console */
require('dotenv').config();
const { exec } = require("child_process");
const packageJson = require("../package.json");
const fetch = require("node-fetch");
const version = packageJson.version;
const filename = `Takt_${version}_aarch64.dmg`;
const filepath = `src-tauri/target/release/bundle/dmg/${filename}`;

console.log("🚀 releasing version:", version);
console.log("---");

// Ensure the version is valid
exec('git status -uno', (error, stdout, stderr) => {
  if (!stdout.includes("Your branch is up to date with 'origin/main'")) {
    console.error("🔴 you can only release from the `origin/main` branch, which must be up to date.");
    return process.exit(1);
  }

  fetch("https://takt-rails.herokuapp.com", {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
    }
  }).then((resp) => {
    resp.json().then(latest => {
      const [a, b, c] = latest.version.split(".").map(i => parseInt(i));
      const [x, y, z] = version.split(".").map(i => parseInt(i));

      if (a > x || b > y || c >= z) {
        console.error("🔴 version already released");
        return process.exit(1);
      }

      exec('yarn tauri build', (_error, stdout, _stderr) => {
        if (stdout.includes(filepath)) {
          console.log("🟢 build successful");
        } else {
          console.error("🔴 build failed");
          return process.exit(1);
        }

        exec(`aws configure set aws_access_key_id ${process.env.S3_BUILDS_KEY}`, () => {
          exec(`aws configure set aws_secret_access_key ${process.env.S3_BUILDS_SECRET}`, () => {
            exec(`aws configure set default_region_name eu-west-1`, () => {
              exec(`aws configure set default_output_format json`, () => {
                exec(`aws s3 cp ${filepath} s3://takt-builds/`, (error, stdout, stderr) => {
                  if (error || stderr) {
                    console.error("🔴 upload failed", { error, stderr });
                    return process.exit(1);
                  }

                  console.log("🟢 upload complete");
                  fetch("https://takt-rails.herokuapp.com/app-builds", {
                    method: 'POST',
                    headers: {
                      Authorization: `Token ${process.env.CLIENT_APPLICATION_TOKEN}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      version,
                      url: `https://takt-builds.s3.eu-west-1.amazonaws.com/${filename}`,
                    }),
                  }).then((resp) => {
                    if (resp.status >= 200 && resp.status < 300) {
                      console.log("🟢 release complete");
                    } else {
                      console.error("🔴 release failed");
                    }
                  }).catch(() => {
                    console.error("🔴 release failed");
                  });
                });
              });
            });
          });
        });
      });
    });
  }).catch(() => {
    console.error("🔴 failed to get current release version");
  });
});
