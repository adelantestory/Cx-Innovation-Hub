require('dotenv').config();
const { DefaultAzureCredential } = require('@azure/identity');
const { AIProjectClient } = require('@azure/ai-projects');

async function checkAPI() {
  const credential = new DefaultAzureCredential();
  const projectClient = new AIProjectClient(process.env.AZURE_AI_ENDPOINT, credential);

  console.log('projectClient.agents.runs type:', typeof projectClient.agents.runs);
  console.log('projectClient.agents.runs keys:', Object.keys(projectClient.agents.runs));
  console.log('\nprojectClient.agents.messages type:', typeof projectClient.agents.messages);
  console.log('projectClient.agents.messages keys:', Object.keys(projectClient.agents.messages));
}

checkAPI().catch(console.error);
