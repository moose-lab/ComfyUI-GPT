import server
from aiohttp import web
import json

@server.PromptServer.instance.routes.get("/api/gpt/models")
async def fetch_models():
    # 定义可用的LLM模型列表
    available_models = [
        {"id": "deepseek-r1", "name": "DeepSeek-R1", "description": "DeepSeek R1模型"},
        {"id": "claude-3-5-sonnet", "name": "Claude 3.5 Sonnet", "description": "Anthropic的Claude 3.5 Sonnet模型"},
        {"id": "claude-3-7", "name": "Claude 3.7", "description": "Anthropic的Claude 3.7模型"},
        {"id": "gpt-4o", "name": "GPT-4o", "description": "OpenAI的GPT-4o模型"}
    ]
    
    # 返回JSON格式的模型列表
    return web.json_response({"models": available_models})