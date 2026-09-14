/**
 * Standalone Azure Communication Services (ACS) Email test.
 *
 * Uses the ACS Email SDK (not SMTP). Two ways to authenticate:
 *
 *   1. Connection string (preferred) - appConfig.json: ACS_CONNECTION_STRING
 *        endpoint=https://<resource>.communication.azure.com/;accesskey=...
 *        Azure portal -> the Communication Service -> Keys -> Connection string.
 *
 *   2. Entra app credentials - falls back to the existing ACS_* keys:
 *        ACS_RESOURCE_NAME / ACS_ENTRA_APP_ID / ACS_ENTRA_TENANT_ID / ACS_ENTRA_SECRET
 *      This requires the app registration to hold a role assignment ON the ACS
 *      resource (e.g. Contributor). Registering the app alone is not enough.
 *
 * The sender must be verified on the ACS Email domain (appConfig.json: ACS_SENDER).
 *
 * Run from the backend/ folder (appConfig.js resolves ./appConfig.json from cwd):
 *   node scripts/testMail.js someone@example.com
 *
 * Overrides (leading "--" optional):
 *   from=DoNotReply@example.com   endpoint=https://<resource>.communication.azure.com
 */
import { EmailClient } from "@azure/communication-email";
import { ClientSecretCredential } from "@azure/identity";
import config from "../appConfig.js";

const args = process.argv.slice(2);
const flag = (name) => {
  const hit = args.find((a) => a.replace(/^--/, "").startsWith(`${name}=`));
  return hit ? hit.replace(/^--/, "").slice(name.length + 1) : undefined;
};
const positional = args.filter((a) => !a.includes("=") && !a.startsWith("--"));

const from = flag("from") || config.ACS_SENDER;
const to = positional[0] || from;

if (!from) {
  console.error("No sender. Set ACS_SENDER in appConfig.json, or pass from=you@example.com");
  process.exit(1);
}
if (!to) {
  console.error("No recipient. Pass one: node scripts/testMail.js you@example.com");
  process.exit(1);
}

let client;
let authMode;

if (config.ACS_CONNECTION_STRING) {
  authMode = "connection string";
  client = new EmailClient(config.ACS_CONNECTION_STRING);
} else {
  const missing = [
    "ACS_RESOURCE_NAME",
    "ACS_ENTRA_APP_ID",
    "ACS_ENTRA_TENANT_ID",
    "ACS_ENTRA_SECRET",
  ].filter((k) => !config[k]);

  if (missing.length) {
    console.error(
      "No ACS_CONNECTION_STRING, and the Entra fallback is missing:",
      missing.join(", "),
    );
    process.exit(1);
  }

  authMode = "Entra app credentials";
  const endpoint =
    flag("endpoint") || `https://${config.ACS_RESOURCE_NAME}.communication.azure.com`;
  // secretKey=SOME_CONFIG_KEY reads the client secret from a different appConfig.json
  // key, to try a candidate value without editing the shared file.
  const secretKey = flag("secretKey");
  if (secretKey && !config[secretKey]) {
    console.error(`No such key in appConfig.json: ${secretKey}`);
    process.exit(1);
  }
  const secret = secretKey ? config[secretKey] : config.ACS_ENTRA_SECRET;
  console.log("secret  :", `${secretKey || "ACS_ENTRA_SECRET"} (${secret.length} chars)`);

  const credential = new ClientSecretCredential(
    config.ACS_ENTRA_TENANT_ID,
    config.ACS_ENTRA_APP_ID,
    secret,
  );
  client = new EmailClient(endpoint, credential);
  console.log("endpoint:", endpoint);
}

console.log("auth    :", authMode);
console.log("from    :", from);
console.log("to      :", to);
console.log("");

try {
  console.log("--- sending test message ---");
  const poller = await client.beginSend({
    senderAddress: from,
    recipients: { to: [{ address: to }] },
    content: {
      subject: `DigiForms ACS test - ${new Date().toISOString()}`,
      plainText: "Plain-text body from the DigiForms ACS Email test script.",
      html: "<p>HTML body from the <b>DigiForms</b> ACS Email test script.</p>",
    },
  });

  const result = await poller.pollUntilDone();
  console.log("\nsent OK");
  console.log("id     :", result.id);
  console.log("status :", result.status);
  process.exit(0);
} catch (err) {
  console.error("\nFAILED");
  console.error("name   :", err.name);
  console.error("code   :", err.code || err.statusCode);
  console.error("message:", err.message);
  process.exit(1);
}
