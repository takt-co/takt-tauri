/* eslint-disable no-console */
const packageJson = require("../package.json");
const tauriJson = require("../src-tauri/tauri.conf.json");
const fetch = require("../node_modules/node-fetch");

const version = packageJson.version;

if (tauriJson.package.version !== version) {
  process.stderr.write(
    "🔴 package.json and src-tauri/tauri.conf.json versions are out of sync",
  );
  process.exit(1);
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
    } else {
      console.error("🟢 version bumped");
      return process.exit(0);
    }
  });
}).catch(() => {
  return process.exit(1);
});
