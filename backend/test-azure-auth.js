// Test Azure AI authentication
require('dotenv').config();
const { DefaultAzureCredential } = require('@azure/identity');
const { AIProjectClient } = require('@azure/ai-projects');

async function testAzureAuth() {
  try {
    console.log('Testing Azure AI authentication...');
    console.log('AZURE_AI_ENDPOINT:', process.env.AZURE_AI_ENDPOINT);
    console.log('AZURE_AGENT_NAME:', process.env.AZURE_AGENT_NAME);
    console.log('');

    // Step 1: Create credential
    console.log('Step 1: Creating DefaultAzureCredential...');
    const credential = new DefaultAzureCredential();
    console.log('✓ DefaultAzureCredential created');
    console.log('');

    // Step 2: Create project client
    console.log('Step 2: Creating AIProjectClient...');
    const projectClient = new AIProjectClient(
      process.env.AZURE_AI_ENDPOINT,
      credential
    );
    console.log('✓ AIProjectClient created');
    console.log('');

    // Step 3: Get Azure OpenAI client
    console.log('Step 3: Getting AzureOpenAI client...');
    const openaiClient = await projectClient.getAzureOpenAIClient({
      apiVersion: '2024-10-21',
    });
    console.log('✓ AzureOpenAI client initialized');
    console.log('');

    // Step 4: Test chat completion
    console.log('Step 4: Testing chat completion...');
    const response = await openaiClient.chat.completions.create({
      model: process.env.AZURE_AGENT_NAME,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello!' }
      ],
    });

    console.log('✓ Chat completion successful!');
    console.log('Response:', response.choices[0].message.content);
    console.log('');
    console.log('🎉 All tests passed! Azure AI is working correctly.');

  } catch (error) {
    console.error('');
    console.error('❌ Error occurred:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);

    if (error.code) {
      console.error('Error code:', error.code);
    }

    if (error.statusCode) {
      console.error('HTTP Status:', error.statusCode);
    }

    if (error.stack) {
      console.error('');
      console.error('Stack trace:');
      console.error(error.stack);
    }

    console.error('');
    console.error('Common issues:');
    console.error('1. Not logged in to Azure CLI: Run "az login"');
    console.error('2. Wrong subscription: Run "az account set --subscription YOUR_SUBSCRIPTION"');
    console.error('3. Missing permissions: Need Contributor role on the AI Project');
    console.error('4. Invalid endpoint or agent name in .env file');

    process.exit(1);
  }
}

testAzureAuth();
