/**
 * 聊天界面组件
 * 提供与GPT交互的界面
 */

import { chatHeader  } from './chat/chatHeader.js';
import { chatMessage } from './chat/chatMessage.js';
import { chatFooter } from './chat/chatFooter.js';

function chatBox() {
  // 创建聊天界面容器
  const container = document.createElement('div');
  container.className = 'comfyui-gpt-chat';
  container.style.position = 'fixed';
  container.style.right = '0';
  container.style.top = '40px'; // 调整为菜单栏高度
  container.style.width = '400px';
  container.style.height = 'calc(100vh - 40px)'; // 减去菜单栏高度
  container.style.backgroundColor = '#222222';
  container.style.borderRadius = '8px 0 0 8px'; // 只在左上和左下有圆角
  container.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.overflow = 'hidden';

  // 聊天历史记录
  let chatHistory = [];

  // 发送消息
  const sendMessage = async (text) => {
    if (!text) return;
    
    // 添加用户消息到界面
    addUserMessage(text);
    
    // 添加到聊天历史
    chatHistory.push({ role: 'user', content: text });
    // 保存聊天历史到本地存储
    saveHistory();
    
    try {
      // 显示加载状态
      const loadingId = showLoadingMessage();
      
      // 调用API发送消息
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: text,
          history: chatHistory // 发送历史记录以保持上下文
        }),
      });
      
      const data = await response.json();
      console.log("API Response:", data);
      
      // 移除加载状态
      removeLoadingMessage(loadingId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      addGPTMessage(data.message.content);
      
      // 添加到聊天历史
      chatHistory.push({ role: 'assistant', content: data.message.content });
      // 保存聊天历史到本地存储
      saveHistory();
    } catch (error) {
      console.error('Failed to send message:', error);
      addGPTMessage('抱歉，发送消息时出现错误。请检查网络连接或稍后再试。');
    }
  };

  const handleClearHistory = () => {
    // 清除消息容器中的所有消息
    messagesContainer.innerHTML = '';
    // 清空聊天历史
    chatHistory = [];
    // 清除localStorage中的记录
    localStorage.removeItem('chatHistory');
    // 添加欢迎消息
    addWelcomeMessage();
  };

  const handleClose = () => {
      // chatBox.remove();
      // 隐藏
      chatBox.style.display = 'none';
  };

  const handlerSumbit = (text) => {
    // 实现sendMessage的逻辑
    sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = e.target.value.trim();
      if (text) {
        sendMessage(text);
        e.target.value = '';
      }
    }
  };

  const header = chatHeader({
    onClose: handleClose,
    onClearHistory: handleClearHistory
  });

  const messagesContainer = chatMessage();

  const footer = chatFooter({onSumbit: handlerSumbit, onKeyDown: handleKeyDown});
  
  // 组装聊天界面
  container.appendChild(header);
  container.appendChild(messagesContainer);
  container.appendChild(footer);
  
  // 添加欢迎消息
  const addWelcomeMessage = () => {
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'comfyui-gpt-message comfyui-gpt-message-ai';
    welcomeMessage.style.marginBottom = '12px';
    welcomeMessage.style.padding = '12px';
    welcomeMessage.style.backgroundColor = '#222222';
    welcomeMessage.style.borderRadius = '8px';
    welcomeMessage.style.maxWidth = '80%';
    welcomeMessage.style.alignSelf = 'flex-start';
    
    welcomeMessage.textContent = '您好！我是 ComfyUI-GPT 助手，有什么可以帮助您的吗？';
    messagesContainer.appendChild(welcomeMessage);
  };
  
  // 添加用户消息
  const addUserMessage = (text) => {
    const message = document.createElement('div');
    message.className = 'comfyui-gpt-message comfyui-gpt-message-user';
    message.style.marginBottom = '12px';
    message.style.padding = '12px';
    message.style.backgroundColor = '#353b50';
    message.style.borderRadius = '8px';
    message.style.maxWidth = '80%';
    message.style.marginLeft = 'auto';
    
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };
  
  // 添加LLM解析的消息
  const addGPTMessage = (text) => {
    const message = document.createElement('div');
    message.className = 'comfyui-gpt-message comfyui-gpt-message-ai';
    message.style.marginBottom = '12px';
    message.style.padding = '12px';
    message.style.backgroundColor = '#353b50';
    message.style.borderRadius = '8px';
    message.style.maxWidth = '80%';
    
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };
  
  // 显示加载状态
  const showLoadingMessage = () => {
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'comfyui-gpt-message comfyui-gpt-message-ai comfyui-gpt-loading';
    loadingMessage.style.marginBottom = '12px';
    loadingMessage.style.padding = '12px';
    loadingMessage.style.backgroundColor = '#353b50';
    loadingMessage.style.borderRadius = '8px';
    loadingMessage.style.maxWidth = '80%';
    
    const loadingDots = document.createElement('div');
    loadingDots.textContent = '正在思考...';
    loadingDots.style.display = 'flex';
    loadingDots.style.alignItems = 'center';
    
    loadingMessage.appendChild(loadingDots);
    messagesContainer.appendChild(loadingMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return loadingMessage.id = `loading-${Date.now()}`;
  };
  
  // 移除加载状态
  const removeLoadingMessage = (id) => {
    const loadingMessage = document.getElementById(id);
    if (loadingMessage) {
      loadingMessage.remove();
    }
  };
  
  // 解释节点功能
  const explainNode = async (nodeId, nodeType) => {
    try {
      // 显示加载状态
      const loadingId = showLoadingMessage();
      
      // 调用API获取节点解释
      const response = await fetch('/api/explain-node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodeId, nodeType }),
      });
      
      // 移除加载状态
      removeLoadingMessage(loadingId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      addGPTMessage(data.explanation);
    } catch (error) {
      console.error('Failed to explain node:', error);
      addGPTMessage('抱歉，获取节点解释时出现错误。请检查网络连接或稍后再试。');
    }
  };
  
  // 保存聊天历史到本地存储
  const saveHistory = () => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  };
  
  // 加载聊天历史
  const loadHistory = () => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        chatHistory = JSON.parse(savedHistory);
        // 显示历史消息
        chatHistory.forEach(msg => {
          if (msg.role === 'user') {
            addUserMessage(msg.content);
          } else if (msg.role === 'assistant') {
            addGPTMessage(msg.content);
          }
        });
      } catch (error) {
        console.error('Failed to load chat history:', error);
        // 如果加载失败，清空历史
        chatHistory = [];
        localStorage.removeItem('chatHistory');
      }
    } else {
      // 如果没有历史记录，添加欢迎消息
      addWelcomeMessage();
    }
  };
  
  // 初始化函数
  const init = () => {
    // 加载聊天历史
    loadHistory();
  };
  
  // 清理函数
  const destroy = () => {
    // 移除事件监听器和清理资源
    // 注意：textarea已经不存在，这里不需要移除事件监听器
  };
  
  return {
    element: container,
    init,
    destroy,
    explainNode,
    addUserMessage,
    addGPTMessage
  };
}

export default chatBox;