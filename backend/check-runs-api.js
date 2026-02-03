require('dotenv').config();
const { DefaultAzureCredential } = require('@azure/identity');
const { AIProjectClient } = require('@azure/ai-projects');

async function checkAPI() {
  const credential = new DefaultAzureCredential();
  const projectClient = new AIProjectClient(process.env.AZURE_AI_ENDPOINT, credential);

  console.log('Runs operations:');
  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(projectClient.agents.runs)));
  console.log('\nMessages operations:');
  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(projectClient.agents.messages)));
}

checkAPI().catch(console.error);
