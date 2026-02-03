require('dotenv').config();
const { DefaultAzureCredential } = require('@azure/identity');
const { AIProjectClient } = require('@azure/ai-projects');

async function checkAPI() {
  const credential = new DefaultAzureCredential();
  const projectClient = new AIProjectClient(process.env.AZURE_AI_ENDPOINT, credential);

  console.log('AgentsClient properties:');
  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(projectClient.agents)));
  console.log('\nAgentsClient own properties:');
  console.log(Object.keys(projectClient.agents));
}

checkAPI().catch(console.error);
