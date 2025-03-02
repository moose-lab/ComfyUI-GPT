# Copyright (C) 2025 AIDC-AI
# Licensed under the MIT License.

import json
import os
import asyncio
import time
from typing import TypedDict, Dict, Any, Optional, List, Union
import uuid

import server
from aiohttp import web
import aiohttp
import base64

# 使用内存字典存储会话消息
session_messages = {}

# 在文件开头添加
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")

# 添加 LLM API 配置
LLM_API_CONFIG = {
    "api_base": os.environ.get("LLM_API_BASE", ""),
    "api_key": os.environ.get("LLM_API_KEY", ""),
    "default_model": os.environ.get("LLM_DEFAULT_MODEL", ""),
    "timeout": int(os.environ.get("LLM_API_TIMEOUT", 60))
}

class ExtItem(TypedDict):
    type: str  # 扩展类型
    data: Union[dict, list]  # 扩展数据

class ChatResponse(TypedDict):
    session_id: str  # 会话id
    text: Optional[str]  # 返回文本
    finished: bool  # 是否结束
    type: str  # 返回的类型
    format: str  # 返回的格式
    ext: Optional[List[ExtItem]]  # 扩展信息

# 添加消息类型定义
class Message(TypedDict):
    id: str  # 消息ID
    role: str  # 角色：system, user, assistant
    content: str  # 消息内容
    created_at: int  # 创建时间戳

# 添加会话类型定义
class Session(TypedDict):
    id: str  # 会话ID
    messages: List[Message]  # 消息列表
    created_at: int  # 创建时间戳
    updated_at: int  # 更新时间戳

def get_workflow_templates():
    templates = []
    workflows_dir = os.path.join(STATIC_DIR, "workflows")
    
    for filename in os.listdir(workflows_dir):
        if filename.endswith('.json'):
            with open(os.path.join(workflows_dir, filename), 'r') as f:
                template = json.load(f)
                templates.append(template)
    
    return templates

@server.PromptServer.instance.routes.get("/workspace/fetch_messages_by_id")
async def fetch_messages(request):
    session_id = request.query.get('session_id')
    data = await asyncio.to_thread(fetch_messages_sync, session_id)
    return web.json_response(data)

def fetch_messages_sync(session_id):
    print("fetch_messages: ", session_id)
    return session_messages.get(session_id, [])

# 添加创建会话的函数
def create_session() -> str:
    """创建新的会话并返回会话ID"""
    session_id = str(uuid.uuid4())
    current_time = int(time.time())
    
    session_messages[session_id] = []
    
    return session_id

# 添加创建消息的函数
def create_message(session_id: str, role: str, content: str) -> Message:
    """创建新消息并添加到会话中"""
    if session_id not in session_messages:
        create_session(session_id)
    
    message_id = str(uuid.uuid4())
    current_time = int(time.time())
    
    message = {
        "id": message_id,
        "role": role,
        "content": content,
        "created_at": current_time
    }
    
    session_messages[session_id].append(message)
    return message

# 添加调用 LLM API 的函数
async def call_llm_api(messages: List[Dict[str, str]], model: str = None) -> Dict[str, Any]:
    """调用 LLM API 生成回答"""
    if not model:
        model = LLM_API_CONFIG["default_model"]
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {LLM_API_CONFIG['api_key']}"
    }
    
    payload = {
        "model": model,
        "messages": messages,
        # "temperature": 0.7,
        # "max_tokens": 2000
    }

    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{LLM_API_CONFIG['api_base']}/chat/completions",
                headers=headers,
                json=payload,
                timeout=LLM_API_CONFIG["timeout"]
            ) as response:
                error_text = await response.text()
                # print(f"API Response: {error_text}")
                
                if response.status != 200:
                    print(f"LLM API Error: {response.status} - {error_text}")
                    return {"error": f"API request failed: {response.status}\nResponse: {error_text}"}
                
                try:
                    result = json.loads(error_text)
                    return result
                except json.JSONDecodeError as e:
                    print(f"Failed to parse JSON response: {e}")
                    return {"error": f"Invalid JSON response: {error_text}"}
    except Exception as e:
        print(f"Error calling LLM API: {str(e)}")
        return {"error": str(e)}

@server.PromptServer.instance.routes.post("/api/chat")
async def chat_api(request):
    """处理聊天 API 请求"""
    try:
        data = await request.json()
        session_id = data.get("session_id")
        messages = data.get("history", [])
        model = data.get("model", LLM_API_CONFIG["default_model"])
        
        # 如果没有提供会话ID，创建新会话
        if not session_id:
            session_id = create_session()
        
        # 确保会话存在
        if session_id not in session_messages:
            session_messages[session_id] = []
        
        # 准备发送给 LLM 的消息
        llm_messages = []
        
        # 添加系统消息
        llm_messages.append({
            "role": "system",
            "content": "你是 ComfyUI-GPT 助手，一个专门帮助用户使用 ComfyUI 的 AI 助手。你可以解释节点功能、推荐工作流、提供使用建议等。请保持回答简洁、专业且有帮助性。"
        })
        
        # 添加历史消息和当前消息
        for msg in messages:
            if msg["role"] in ["user", "assistant", "system"]:
                llm_messages.append({
                    "role": msg["role"],
                    "content": msg.get("content", "")
                })
        
        # 调用 LLM API
        response = await call_llm_api(llm_messages, model)
        
        if "error" in response:
            return web.json_response({"error": response["error"]}, status=500)
        
        # 提取 LLM 回复
        assistant_message = response.get("choices", [{}])[0].get("message", {})
        
        # 将回复保存到会话历史
        if assistant_message and "content" in assistant_message:
            create_message(session_id, "assistant", assistant_message["content"])

        return web.json_response({
            "session_id": session_id,
            "message": assistant_message
        })
    except Exception as e:
        print(f"处理聊天请求时出错: {str(e)}")
        return web.json_response({"error": str(e)}, status=500)

@server.PromptServer.instance.routes.post("/workspace/workflow_gen")
async def workflow_gen(request):
    print("Received workflow_gen request")
    req_json = await request.json()
    print("Request JSON:", req_json)
    
    response = web.StreamResponse(
        status=200,
        reason='OK',
        headers={
            'Content-Type': 'application/json',
            'X-Content-Type-Options': 'nosniff'
        }
    )
    await response.prepare(request)
    
    session_id = req_json.get('session_id')
    user_message = req_json.get('message')
    
    # 如果没有会话ID，创建新会话
    if not session_id:
        session_id = create_session()
    
    # 创建用户消息并保存到会话历史
    create_message(session_id, "user", user_message)
    
    # 准备发送给 LLM 的消息
    llm_messages = [
        {
            "role": "system",
            "content": "U'r ComfyUI-GPT assistant, help users use ComfyUI。用户正在询问关于工作流或节点的问题。"
        }
    ]
    
    # 添加历史消息
    for msg in session_messages.get(session_id, []):
        if msg["role"] in ["user", "assistant"]:
            llm_messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
    
    if "workflow" in user_message.lower():
        workflow = {
            "name": "basic_image_gen",
            "description": "Create a basic image generation workflow",
            "image": "https://placehold.co/600x400",
            "workflow": """{ ... }"""  # Your workflow JSON here
        }
        
        chat_response = ChatResponse(
            session_id=session_id,
            text="",
            finished=False,
            type="workflow_option",
            format="text",
            ext=[{"type": "workflows", "data": [workflow]}]
        )
        
        await response.write(json.dumps(chat_response).encode() + b"\n")
        
        # 调用 LLM 生成回复
        llm_response = await call_llm_api(llm_messages)
        
        if "error" in llm_response:
            message = f"抱歉，处理您的请求时出现错误: {llm_response['error']}"
        else:
            message = llm_response.get("choices", [{}])[0].get("message", {}).get("content", "")
            # 保存 LLM 回复到会话历史
            create_message(session_id, "assistant", message)
        
        # 流式返回回复
        accumulated = ""
        for char in message:
            accumulated += char
            chat_response["text"] = accumulated
            await response.write(json.dumps(chat_response).encode() + b"\n")
            await asyncio.sleep(0.01)
        
        chat_response["finished"] = True
        chat_response["text"] = message
        await response.write(json.dumps(chat_response).encode() + b"\n")
        
    elif "recommend" in user_message.lower():
        existing_nodes = [
            {
                "name": "LoraLoader",
                "description": "Load LoRA weights for conditioning.",
                "image": "",
                "github_url": "https://github.com/CompVis/taming-transformers",
                "from_index": 0,
                "to_index": 0
            },
            {
                "name": "KSampler",
                "description": "Generate images using K-diffusion sampling.",
                "image": "",
                "github_url": "https://github.com/CompVis/taming-transformers",
                "from_index": 0,
                "to_index": 0
            }
        ]
        
        missing_nodes = [
            {
                "name": "CLIPTextEncode",
                "description": "Encode text prompts for conditioning.",
                "image": "",
                "github_url": "https://github.com/CompVis/clip-interrogator",
                "from_index": 0,
                "to_index": 0
            }
        ]
        
        node_info = {
            "existing_nodes": existing_nodes,
            "missing_nodes": missing_nodes
        }
        
        chat_response = ChatResponse(
            session_id=session_id,
            text="",
            finished=False,
            type="downstream_node_recommend",
            format="text",
            ext=[{"type": "node_info", "data": node_info}]
        )
        
        await response.write(json.dumps(chat_response).encode() + b"\n")
        
        # 调用 LLM 生成回复
        llm_response = await call_llm_api(llm_messages)
        
        if "error" in llm_response:
            message = f"抱歉，处理您的请求时出现错误: {llm_response['error']}"
        else:
            message = llm_response.get("choices", [{}])[0].get("message", {}).get("content", "")
            # 保存 LLM 回复到会话历史
            create_message(session_id, "assistant", message)
        
        # 流式返回回复
        accumulated = ""
        for char in message:
            accumulated += char
            chat_response["text"] = accumulated
            await response.write(json.dumps(chat_response).encode() + b"\n")
            await asyncio.sleep(0.01)
        
        chat_response["finished"] = True
        chat_response["text"] = message
        await response.write(json.dumps(chat_response).encode() + b"\n")
        
    else:
        chat_response = ChatResponse(
            session_id=session_id,
            text="",
            finished=False,
            type="message",
            format="text",
            ext=[{"type": "guides", "data": ["General Chat", "Query Node", "Query Model", "Query Workflow"]}]
        )
        
        await response.write(json.dumps(chat_response).encode() + b"\n")
        
        # 调用 LLM 生成回复
        llm_response = await call_llm_api(llm_messages)
        
        if "error" in llm_response:
            message = f"抱歉，处理您的请求时出现错误: {llm_response['error']}"
        else:
            message = llm_response.get("choices", [{}])[0].get("message", {}).get("content", "")
            # 保存 LLM 回复到会话历史
            create_message(session_id, "assistant", message)
        
        # 流式返回回复
        accumulated = ""
        for char in message:
            accumulated += char
            chat_response["text"] = accumulated
            await response.write(json.dumps(chat_response).encode() + b"\n")
            await asyncio.sleep(0.01)
        
        chat_response["finished"] = True
        chat_response["text"] = message
        await response.write(json.dumps(chat_response).encode() + b"\n")
    
    await response.write_eof()
    return response

# 添加节点解释 API
@server.PromptServer.instance.routes.post("/api/explain_node")
async def explain_node(request):
    """处理节点解释请求"""
    try:
        data = await request.json()
        session_id = data.get("session_id")
        node_type = data.get("node_type")
        
        # 如果没有提供会话ID，创建新会话
        if not session_id:
            session_id = create_session()
        
        # 创建用户消息
        user_message = f"请解释 {node_type} 节点的功能和用法"
        create_message(session_id, "user", user_message)
        
        # 准备发送给 LLM 的消息
        llm_messages = [
            {
                "role": "system",
                "content": f"You're ComfyUI-GPT assistant, help users use ComfyUI. User is asking about '{node_type}' node. \
                    Please provide detailed explanation of the node, including its functionality, parameter description, and usage scenarios."
            },
            {
                "role": "user",
                "content": user_message
            }
        ]
        
        # 调用 LLM API
        response = await call_llm_api(llm_messages)
        
        if "error" in response:
            return web.json_response({"error": response["error"]}, status=500)
        
        # 提取 LLM 回复
        assistant_message = response.get("choices", [{}])[0].get("message", {})
        
        # 将回复保存到会话历史
        if assistant_message and "content" in assistant_message:
            create_message(session_id, "assistant", assistant_message["content"])
        
        return web.json_response({
            "session_id": session_id,
            "message": assistant_message
        })
    except Exception as e:
        print(f"处理节点解释请求时出错: {str(e)}")
        return web.json_response({"error": str(e)}, status=500)

@server.PromptServer.instance.routes.post("/api/chat/invoke")
async def invoke_chat(request):
    data = await request.json()
    session_id = data['session_id']
    prompt = data['prompt']

    # 如果没有会话ID，创建新会话
    if not session_id:
        session_id = create_session()
    
    # 创建用户消息
    create_message(session_id, "user", prompt)

    # 准备发送给 LLM 的消息
    llm_messages = [
        {
            "role": "system",
            "content": "U'r ComfyUI-GPT assistant, help users use ComfyUI."
        }
    ]
    
    # 添加历史消息
    for msg in session_messages.get(session_id, []):
        if msg["role"] in ["user", "assistant"]:
            llm_messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
    
    # 调用 LLM API
    response = await call_llm_api(llm_messages)
    
    if "error" in response:
        return web.json_response({"error": response["error"]}, status=500)
    
    # 提取 LLM 回复
    assistant_message = response.get("choices", [{}])[0].get("message", {})
    
    # 将回复保存到会话历史
    if assistant_message and "content" in assistant_message:
        create_message(session_id, "assistant", assistant_message["content"])
    
    return web.json_response({
        "session_id": session_id,
        "message": assistant_message
    })
