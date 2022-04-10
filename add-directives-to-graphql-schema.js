const fs = require("fs");
const path = require("path");

// Apollo strips all directives when stitching the schema
// https://www.apollographql.com/docs/federation/gateway/#type-system-directives
// We need to add them back in to get node fetching to work properly

// What is fetchable?
// https://dev-clone.nuxtjs.app/marais/506600

// We need these to be fetchable since implementing nodes can't be done when
// using federation, different subgraphs have responsibility for different types,
// the ruby api implements the `node` field, but the ts-api is the one that knows
// how to fetch a SurveyVersion

const schemaPath = path.join(__dirname, "../schema.graphql");
let schemaString = fs.readFileSync(schemaPath);

schemaString =
  "directive @fetchable(field_name: String) on OBJECT\n\n" + schemaString;

schemaString = schemaString.replace(
  `type SurveyRelease {`,
  `type SurveyRelease @fetchable(field_name: "id") {`
);
schemaString = schemaString.replace(
  `type SurveyVersion {`,
  `type SurveyVersion @fetchable(field_name: "id") {`
);

fs.writeFileSync(schemaPath, schemaString);
