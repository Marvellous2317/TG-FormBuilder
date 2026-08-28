/**
 * Standalone Azure Communication Services (ACS) SMTP test.
 *
 * ACS SMTP auth uses a 3-part username:
 *   <ACS resource name>.<Entra app id>.<Entra tenant id>
 * and the password is the Entra app registration's client secret VALUE.
 *
 * Run from the backend/ folder (appConfig.js resolves ./appConfig.json from cwd):
 *   node scripts/testAcsMail.js someone@example.com
 *
 * Falls back to Email_From as the recipient when no address is passed.
 */
import nodemailer from "nodemailer";
import config from "../appConfig.js";

const to = process.argv[2] || config.Email_From;

if (!to) {
  console.error("No recipient. Pass one: node scripts/testAcsMail.js you@example.com");
  process.exit(1);
}

const missing = [
  "ACS_RESOURCE_NAME",
  "ACS_ENTRA_APP_ID",
  "ACS_ENTRA_TENANT_ID",
  "ACS_ENTRA_SECRET",
].filter((k) => !config[k]);

if (missing.length) {
  console.error("Missing in appConfig.json:", missing.join(", "));
  process.exit(1);
}

const acsUsername = [
  config.ACS_RESOURCE_NAME,
  config.ACS_ENTRA_APP_ID,
  config.ACS_ENTRA_TENANT_ID,
].join(".");

console.log("host    :", config.Email_Host);
console.log("port    :", config.Email_Port);
console.log("user    :", acsUsername);
console.log("secret  :", `set (${config.ACS_ENTRA_SECRET.length} chars)`);
console.log("from    :", config.Email_From);
console.log("to      :", to);
console.log("");

const transporter = nodemailer.createTransport({
  host: config.Email_Host,
  port: config.Email_Port,
  secure: false,        // ACS uses STARTTLS on 587
  requireTLS: true,
  auth: {
    user: acsUsername,
    pass: config.ACS_ENTRA_SECRET,
  },
  tls: { rejectUnauthorized: true },
  logger: true,
  debug: true,
});

try {
  console.log("--- verifying connection/auth ---");
  await transporter.verify();
  console.log("verify OK\n");

  console.log("--- sending test message ---");
  const info = await transporter.sendMail({
    from: config.Email_From,
    to,
    subject: `DigiForms ACS test - ${new Date().toISOString()}`,
    text: "Plain-text body from the DigiForms ACS SMTP test script.",
    html: "<p>HTML body from the <b>DigiForms</b> ACS SMTP test script.</p>",
  });

  console.log("\nsent OK");
  console.log("messageId:", info.messageId);
  console.log("response :", info.response);
  console.log("accepted :", info.accepted);
  console.log("rejected :", info.rejected);
  process.exit(0);
} catch (err) {
  console.error("\nFAILED");
  console.error("name   :", err.name);
  console.error("code   :", err.code);
  console.error("command:", err.command);
  console.error("message:", err.message);
  if (err.response) console.error("response:", err.response);
  process.exit(1);
} finally {
  transporter.close();
}
