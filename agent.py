from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
myEndpoint = "https://first-ai-agent-project-resource.services.ai.azure.com/api/projects/first-ai-agent-project"

project_client = AIProjectClient(endpoint=myEndpoint, credential=DefaultAzureCredential())
myAgent = "DemoAgent"


# Get an existing agent

agent = project_client.agents.get(agent_name=myAgent)
print(f"Retrieved agent: {agent.name}")

openai_client = project_client.get_openai_client()

# Reference the agent to get a response
response = openai_client.responses.create(    input=[{"role": "user", "content": "Tell me what you can help with."}],    extra_body={"agent": {"name": agent.name, "type": "agent_reference"}},)

print(f"Response output: {response.output_text}")