require('dotenv').config();
const { DefaultAzureCredential } = require('@azure/identity');
const { AIProjectClient } = require('@azure/ai-projects');

async function test() {
  const credential = new DefaultAzureCredential();
  const projectClient = new AIProjectClient(process.env.AZURE_AI_ENDPOINT, credential);

  console.log('Listing agents...');
  const result = await projectClient.agents.listAgents();
  console.log('Result type:', typeof result);
  console.log('Result keys:', Object.keys(result));
  console.log('Full result:', JSON.stringify(result, null, 2));
}

test().catch(console.error);
