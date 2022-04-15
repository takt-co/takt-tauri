// /* eslint-disable no-console */
const { exec } = require("child_process");
const packageJson = require("../package.json");
const fetch = require("node-fetch");

const version = packageJson.version;
const {
  APP_BUILDS_ENDPOINT,
  CLIENT_APPLICATION_TOKEN,
  S3_BUILDS_KEY,
  S3_BUILDS_SECRET,
  S3_BUILDS_REGION
} = process.env;

console.log("==========================");
console.log("Production release started of version: ", version);
console.log("==========================");

exec(`aws configure set aws_access_key_id ${S3_BUILDS_KEY}`);
exec(`aws configure set aws_secret_access_key ${S3_BUILDS_SECRET}`);
exec(`aws configure set default_region_name ${S3_BUILDS_REGION}`);
exec(`aws configure set default_output_format json`);

const filename = `takt-build-${version.replaceAll(".", "-")}.zip`;

exec(`zip -r ${filename} build`, (error, stdout, stderr) => {
  if (error) {
    console.error(error);
    return process.exit(error.code);
  } else if (stderr) {
    console.error(stderr);
    return process.exit(1);
  } else {
    console.log(`... created ${filename}`);
    exec(`aws s3 cp ${filename} s3://takt-builds/`, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        return process.exit(error.code);
      } else if (stderr) {
        console.error(stderr);
        return process.exit(1);
      } else {
        console.log('... uploaded to s3');
        fetch(APP_BUILDS_ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `Token ${CLIENT_APPLICATION_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            version,
            url: `https://takt-builds.s3.${S3_BUILDS_REGION}.amazonaws.com/${filename}`,
          }),
        }).then(() => {
          console.log("... build released");
        }).catch(() => {
          console.error("Failed to release app build");
          return process.exit(1);
        });
      }
    });
  }
});
