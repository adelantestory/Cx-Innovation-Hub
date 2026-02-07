import { DefaultAzureCredential } from '@azure/identity';
import { AIProjectClient } from '@azure/ai-projects';
import { logger } from '../middleware/logger';

const AZURE_AI_ENDPOINT = process.env.AZURE_AI_ENDPOINT || '';
const AZURE_AGENT_NAME = process.env.AZURE_AGENT_NAME || 'DemoAgent';

let projectClient: AIProjectClient | null = null;
let agentId: string | null = null;
let agentName: string | null = null;

/**
 * Initialize the Azure AI Project client and get the agent
 * Following the pattern from agent.py
 */
export async function initializeAzureAI() {
  try {
    if (!AZURE_AI_ENDPOINT) {
      throw new Error('AZURE_AI_ENDPOINT environment variable is not set');
    }

    // Use DefaultAzureCredential for Docker compatibility
    // Will try: environment variables -> managed identity -> Azure CLI (if available)
    logger.info('[Azure AI] Using DefaultAzureCredential');
    const credential = new DefaultAzureCredential();
    projectClient = new AIProjectClient(AZURE_AI_ENDPOINT, credential);

    logger.info('[Azure AI] Project client initialized');
    logger.info(`[Azure AI] Looking for agent: "${AZURE_AGENT_NAME}"`);

    // List all agents and find the one with the matching name
    // TypeScript SDK requires listing to find by name
    logger.info('[Azure AI] Listing agents...');
    logger.info(`[Azure AI] Endpoint: ${AZURE_AI_ENDPOINT}`);

    let agentCount = 0;
    const foundAgents: string[] = [];

    try {
      for await (const agent of projectClient.agents.listAgents()) {
        agentCount++;
        const name = agent.name || '(unnamed)';
        foundAgents.push(name);
        logger.info(`[Azure AI] Agent #${agentCount}: name="${name}", id="${agent.id}"`);

        if (agent.name === AZURE_AGENT_NAME) {
          agentId = agent.id;
          agentName = agent.name;
          logger.info(`[Azure AI] ✓ Matched target agent: ${agent.name} (ID: ${agentId})`);
          break;
        }
      }

      logger.info(`[Azure AI] Total agents found: ${agentCount}`);
      if (agentCount > 0) {
        logger.info(`[Azure AI] Available agents: ${foundAgents.join(', ')}`);
      }
    } catch (listError: any) {
      logger.error('[Azure AI] Error listing agents:', listError);
      throw new Error(`Failed to list agents. Error: ${listError.message}`);
    }

    if (!agentId || !agentName) {
      throw new Error(`Agent "${AZURE_AGENT_NAME}" not found. Please check the agent name and ensure you're authenticated with: az login`);
    }

    return { success: true, agentName };
  } catch (error) {
    logger.error('[Azure AI] Initialization failed:', error);
    throw error;
  }
}

/**
 * Send a message to the Azure AI agent and get a response
 * Uses the Agents API with threads and runs
 * @param userMessage - The user's message
 * @param conversationHistory - Optional conversation history for context
 * @param screenContext - Optional screen context (e.g., "kanban_board", "project_list")
 * @returns The AI agent's response
 */
export async function getAIResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  screenContext?: string
): Promise<string> {
  try {
    if (!projectClient || !agentId) {
      await initializeAzureAI();
    }

    if (!projectClient || !agentId) {
      throw new Error('Azure AI Project client not initialized');
    }

    // Build the system message with context
    let systemPrompt = `You are a helpful AI assistant for Taskify, a team productivity and task management platform.
You help users with questions about their projects, tasks, team members, and how to use the application effectively.`;

    if (screenContext) {
      const contextDescriptions: Record<string, string> = {
        kanban_board: 'The user is currently viewing a Kanban board with tasks organized in columns: To Do, In Progress, In Review, and Done.',
        project_list: 'The user is currently viewing the list of all their projects.',
        task_detail: 'The user is currently viewing details of a specific task, including comments and assignments.',
      };

      const contextDesc = contextDescriptions[screenContext] || screenContext;
      systemPrompt += `\n\nCurrent context: ${contextDesc}`;
    }

    systemPrompt += `\n\nProvide helpful, concise responses. If asked about specific data, remind users that you can see the general context but they should check the UI for specific task details.`;

    // Create a thread for this conversation
    const thread = await projectClient.agents.threads.create();

    logger.info(`[Azure AI] Created thread: ${thread.id}`);

    // Add conversation history to the thread (if any)
    if (conversationHistory.length > 0) {
      logger.info(`[Azure AI] Adding ${conversationHistory.length} previous messages to thread`);
      for (const msg of conversationHistory) {
        await projectClient.agents.messages.create(
          thread.id,
          msg.role === 'assistant' ? 'assistant' : 'user',
          msg.content
        );
      }
    }

    // Add the current user message to the thread
    logger.info(`[Azure AI] Adding user message: "${userMessage.substring(0, 50)}..."`);
    await projectClient.agents.messages.create(thread.id, 'user', userMessage);

    // Run the agent on the thread with system instructions
    const run = await projectClient.agents.runs.create(thread.id, agentId, {
      additionalInstructions: systemPrompt,
    });

    logger.info(`[Azure AI] Created run: ${run.id}`);

    // Poll for completion (wait for the agent to finish)
    let runStatus = await projectClient.agents.runs.get(thread.id, run.id);
    let pollCount = 0;

    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      runStatus = await projectClient.agents.runs.get(thread.id, run.id);
      pollCount++;
      if (pollCount % 5 === 0) {
        logger.info(`[Azure AI] Still waiting for agent response... (${pollCount}s, status: ${runStatus.status})`);
      }
    }

    logger.info(`[Azure AI] Run completed with status: ${runStatus.status} (took ${pollCount}s)`);

    if (runStatus.status !== 'completed') {
      logger.error(`[Azure AI] Run failed with status: ${runStatus.status}`);
      throw new Error(`Agent run failed with status: ${runStatus.status}`);
    }

    // Get the messages from the thread (the agent's response will be the latest)
    const messagesResult = [];
    for await (const message of projectClient.agents.messages.list(thread.id)) {
      messagesResult.push(message);
    }

    // Find the latest assistant message
    const assistantMessages = messagesResult
      .filter((msg: any) => msg.role === 'assistant')
      .sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
      });

    if (assistantMessages.length === 0) {
      throw new Error('No response from agent');
    }

    // Extract the text content from the latest message
    const latestMessage = assistantMessages[0];
    let responseText = '';

    if (latestMessage.content && Array.isArray(latestMessage.content)) {
      for (const contentItem of latestMessage.content) {
        if (contentItem.type === 'text' && 'text' in contentItem) {
          responseText += contentItem.text.value;
        }
      }
    }

    if (!responseText) {
      responseText = 'I apologize, but I was unable to generate a response. Please try again.';
      logger.warn('[Azure AI] No response text extracted from agent message');
    } else {
      logger.info(`[Azure AI] Generated response (${responseText.length} chars): "${responseText.substring(0, 100)}..."`);
    }

    // Clean up: delete the thread to avoid accumulation
    await projectClient.agents.threads.delete(thread.id);
    logger.info('[Azure AI] Thread deleted');

    return responseText;
  } catch (error) {
    logger.error('[Azure AI] Error generating response:', error);
    throw new Error('Failed to get AI response. Please try again later.');
  }
}

/**
 * Get context-aware help based on the current screen
 */
export async function getContextualHelp(screenContext: string): Promise<string> {
  const contextQuestions: Record<string, string> = {
    kanban_board: 'How can I work with tasks on this Kanban board?',
    project_list: 'What can I do with my projects?',
    task_detail: 'How do I manage this task?',
  };

  const question = contextQuestions[screenContext] || 'How can you help me?';

  return getAIResponse(question, [], screenContext);
}
