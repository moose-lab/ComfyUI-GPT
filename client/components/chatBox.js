/**
 * 聊天界面组件
 * 提供与GPT交互的界面
 */

import { chatHeader  } from './chat/chatHeader.js';

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

  const handleClearHistory = () => {
    // 清除消息容器中的所有消息
    messageContainer.innerHTML = '';
    // 如果有存储聊天历史的数组，也需要清空
    chatHistory = [];
    // 可能还需要清除localStorage中的记录
    localStorage.removeItem('chatHistory');
  };

  const handleClose = () => {
      // chatBox.remove();
      // 隐藏
      chatBox.style.display = 'none';
  };

  const header = chatHeader({
    onClose: handleClose,
    onClearHistory: handleClearHistory
  });

  container.appendChild(header);
  
  // 创建聊天消息区域
  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'comfyui-gpt-messages';
  messagesContainer.style.flex = '1';
  messagesContainer.style.overflowY = 'auto';
  messagesContainer.style.padding = '16px';
  
  // 创建输入区域
  const inputContainer = document.createElement('div');
  inputContainer.className = 'comfyui-gpt-input-container';
  inputContainer.style.padding = '12px 16px';
  inputContainer.style.borderTop = '1px solid #222222';
  inputContainer.style.display = 'flex';
  
  const textarea = document.createElement('textarea');
  textarea.className = 'comfyui-gpt-input';
  textarea.placeholder = '输入您的问题...';
  textarea.style.flex = '1';
  textarea.style.padding = '8px 12px';
  textarea.style.border = '1px solid #d1d5db';
  textarea.style.borderRadius = '4px';
  textarea.style.resize = 'none';
  textarea.style.height = '40px';
  textarea.style.maxHeight = '120px';
  
  const sendButton = document.createElement('button');
  sendButton.textContent = '发送';
  sendButton.className = 'comfyui-gpt-send-button';
  sendButton.style.marginLeft = '8px';
  sendButton.style.padding = '8px 16px';
  sendButton.style.backgroundColor = '#3b82f6';
  sendButton.style.color = '#ffffff';
  sendButton.style.border = 'none';
  sendButton.style.borderRadius = '4px';
  sendButton.style.cursor = 'pointer';
  
  inputContainer.appendChild(textarea);
  inputContainer.appendChild(sendButton);
  
  // 组装聊天界面
  container.appendChild(header);
  container.appendChild(messagesContainer);
  container.appendChild(inputContainer);
  
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
    message.style.backgroundColor = '#dbeafe';
    message.style.borderRadius = '8px';
    message.style.maxWidth = '80%';
    message.style.marginLeft = 'auto';
    
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };
  
  // 添加AI消息
  const addAIMessage = (text) => {
    const message = document.createElement('div');
    message.className = 'comfyui-gpt-message comfyui-gpt-message-ai';
    message.style.marginBottom = '12px';
    message.style.padding = '12px';
    message.style.backgroundColor = '#f3f4f6';
    message.style.borderRadius = '8px';
    message.style.maxWidth = '80%';
    
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };
  
  // 发送消息
  const sendMessage = async () => {
    const text = textarea.value.trim();
    if (!text) return;
    
    // 添加用户消息到界面
    addUserMessage(text);
    textarea.value = '';
    
    try {
      // 这里应该调用API发送消息
      // 暂时模拟一个响应
      setTimeout(() => {
        addAIMessage(`您发送了: ${text}\n\n这是一个模拟的回复，实际功能需要连接到后端API。`);
      }, 1000);
    } catch (error) {
      console.error('Failed to send message:', error);
      addAIMessage('抱歉，发送消息时出现错误。');
    }
  };
  
  // 解释节点功能
  const explainNode = () => {
    addAIMessage('正在分析当前选中的节点...\n\n这是一个模拟的节点解释，实际功能需要连接到后端API。');
  };
  
  // 事件处理
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // 初始化函数
  const init = () => {
    // 添加事件监听
    closeButton.addEventListener('click', () => {
      container.style.display = 'none';
    });
    
    sendButton.addEventListener('click', sendMessage);
    textarea.addEventListener('keydown', handleKeyDown);
    
    // 添加欢迎消息
    addWelcomeMessage();
  };
  
  // 清理函数
  const destroy = () => {
    closeButton.removeEventListener('click', () => {
      container.style.display = 'none';
    });
    
    sendButton.removeEventListener('click', sendMessage);
    textarea.removeEventListener('keydown', handleKeyDown);
  };
  
  return {
    element: container,
    init,
    destroy,
    explainNode,
    addUserMessage,
    addAIMessage
  };
}

export default chatBox;