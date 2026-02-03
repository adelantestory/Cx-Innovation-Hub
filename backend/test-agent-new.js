// Test Azure AI Agent connection
require('dotenv').config();
const { DefaultAzureCredential } = require('@azure/identity');
const { AIProjectClient } = require('@azure/ai-projects');

async function testAzureAgent() {
  try {
    console.log('Testing Azure AI Agent connection...');
    console.log('AZURE_AI_ENDPOINT:', process.env.AZURE_AI_ENDPOINT);
    console.log('AZURE_AGENT_NAME:', process.env.AZURE_AGENT_NAME);
    console.log('');

    const credential = new DefaultAzureCredential();
    const projectClient = new AIProjectClient(process.env.AZURE_AI_ENDPOINT, credential);

    console.log('Listing all agents...');
    const agents = await projectClient.agents.listAgents();
    console.log(`Found ${agents.data.length} agents:`);
    agents.data.forEach(a => console.log(`  - ${a.name} (ID: ${a.id})`));
    console.log('');

    const agent = agents.data.find(a => a.name === process.env.AZURE_AGENT_NAME);
    if (!agent) {
      throw new Error(`Agent "${process.env.AZURE_AGENT_NAME}" not found`);
    }

    console.log('✓ Found agent:', agent.name);
    console.log('Creating thread and testing conversation...');

    const thread = await projectClient.agents.createThread();
    await projectClient.agents.createMessage(thread.id, {
      role: 'user',
      content: 'Hello!'
    });

    const run = await projectClient.agents.createRun(thread.id, agent.id);
    console.log('Waiting for response...');

    let runStatus = await projectClient.agents.getRun(thread.id, run.id);
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await projectClient.agents.getRun(thread.id, run.id);
    }

    if (runStatus.status !== 'completed') {
      throw new Error(`Run failed: ${runStatus.status}`);
    }

    const messages = await projectClient.agents.listMessages(thread.id);
    const response = messages.data.filter(m => m.role === 'assistant')[0];
    const text = response.content[0].text.value;

    console.log('✓ Agent response:', text);
    await projectClient.agents.deleteThread(thread.id);
    console.log('');
    console.log('🎉 Success! Agent is working.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

testAzureAgent();
