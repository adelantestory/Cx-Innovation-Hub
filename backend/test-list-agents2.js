require('dotenv').config();
const { DefaultAzureCredential } = require('@azure/identity');
const { AIProjectClient } = require('@azure/ai-projects');

async function test() {
  const credential = new DefaultAzureCredential();
  const projectClient = new AIProjectClient(process.env.AZURE_AI_ENDPOINT, credential);

  console.log('Listing agents (using async iterator)...');
  const agents = [];

  for await (const agent of projectClient.agents.listAgents()) {
    agents.push(agent);
    console.log('  - Name:', agent.name, ', ID:', agent.id);
  }

  console.log('');
  console.log('Total agents found:', agents.length);

  const targetAgent = agents.find(a => a.name === 'DemoAgent');
  if (targetAgent) {
    console.log('');
    console.log('Success! Found DemoAgent:', targetAgent.id);
  } else {
    console.log('');
    console.log('DemoAgent not found.');
    console.log('Available agents:', agents.map(a => a.name).join(', ') || 'none');
  }
}

test().catch(console.error);
