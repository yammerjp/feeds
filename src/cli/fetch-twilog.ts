import { writeFileSync } from "node:fs";
import { fetchTwilog } from "../microblog/twilog.js";

function printUsage() {
  console.log(`Usage: fetch-twilog <username> <output-file>

Fetch tweets from Twilog and save as JSON.

Arguments:
  username     Twitter username to fetch
  output-file  Path to output JSON file
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    printUsage();
    process.exit(1);
  }

  const [username, outputFile] = args;

  console.log(`Fetching tweets from Twilog for @${username}...`);

  try {
    const tweets = await fetchTwilog(username);
    const json = JSON.stringify(tweets, null, 2);
    writeFileSync(outputFile, json);
    console.log(`Saved ${tweets.length} tweets to ${outputFile}`);
  } catch (error) {
    console.error("Error fetching tweets:", error);
    process.exit(1);
  }
}

main();
