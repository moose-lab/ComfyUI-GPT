import { DRAWER_Z_INDEX, GPT_REGISTERED_EVENTS } from "../constants.js";
// import { createChatContext } from './context/ChatContext.js';
import { useDraggable } from '../hooks/useDraggable.js';

// 动态导入 WorkflowChat 组件
// function loadWorkflowChat() {
//   return import("./workflowChat/workflowChat.js").then(module => module.default);
// }

/**
 * ComfyUI-GPT 应用主组件
 * 创建一个可拖拽的按钮，点击后显示聊天界面
 */
function App() {
  // 创建DOM元素
  const container = document.createElement('div');
  container.className = 'comfyui-gpt-container';
  container.style.position = 'fixed';
  container.style.zIndex = DRAWER_Z_INDEX.BUTTON;
  
  // 创建按钮元素
  const button = document.createElement('button');
  button.className = 'comfyui-gpt-button';
  button.style.padding = '0';
  button.style.border = 'none';
  button.style.borderRadius = '50%';
  button.style.backgroundColor = '#ffffff';
  button.style.color = '#000000';
  button.style.cursor = 'grab';
  button.style.transition = 'all 0.2s';
  button.style.userSelect = 'none';
  button.style.width = '64px';
  button.style.height = '64px';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  
  // 添加悬停效果
  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = '#93c5fd';
    button.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = '#ffffff';
    button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  });
  
  // 创建图标
  const icon = document.createElement('img');
  icon.src = '/client/assets/gpt-icon.png';
  icon.alt = 'ComfyUI-GPT Icon';
  icon.style.height = '100%';
  icon.style.width = '100%';
  icon.style.borderRadius = '50%';
  
  // 组装按钮
  button.appendChild(icon);
  container.appendChild(button);
  
  // 聊天界面容器
  const chatContainer = document.createElement('div');
  chatContainer.className = 'comfyui-gpt-chat-container';
  chatContainer.style.display = 'none';
  chatContainer.style.opacity = '0';
  chatContainer.style.transition = 'opacity 0.2s ease-in-out';
  container.appendChild(chatContainer);
  
  // 状态变量
  let isChatVisible = false;
  let chatComponent = null;
  
  // 点击按钮显示/隐藏聊天界面
  const toggleChat = async () => {
    console.log("记录日记");
    if (!isChatVisible) {
      // 懒加载聊天组件
      if (!chatComponent) {
        try {
          const ChatModule = await import('./chatBox.js');
          chatComponent = ChatModule.default();
          chatContainer.appendChild(chatComponent.element);
          chatComponent.init();
        } catch (error) {
          console.error('Failed to load chat component:', error);
          return;
        }
      }
      
      chatContainer.style.display = 'block';
      // Use setTimeout to ensure the display change takes effect before opacity transition
      setTimeout(() => {
        chatContainer.style.opacity = '1';
      }, 0);
      isChatVisible = true;
    } else {
      chatContainer.style.opacity = '0';
      // Wait for opacity transition to complete before hiding
      setTimeout(() => {
        chatContainer.style.display = 'none';
      }, 200); // Match the transition duration
      isChatVisible = false;
    }
  };
  
  // 监听节点解释事件
  const handleExplainNode = () => {
    if (!isChatVisible) {
      toggleChat();
    }
    
    // 如果聊天组件已加载，触发解释节点功能
    if (chatComponent && chatComponent.explainNode) {
      chatComponent.explainNode();
    }
  };
  
  // 初始化函数
  const init = () => {
    // 初始化拖拽
    draggable = useDraggable(button, {
      initialX: window.innerWidth - 160,
      initialY: 20,
      boundaryPadding: { right: 100, bottom: 40 },
      onClick: toggleChat
    });
    
    // 注册事件监听
    window.addEventListener(GPT_REGISTERED_EVENTS.EXPLAIN_NODE, handleExplainNode);
    
  };
  
  // 清理函数
  const destroy = () => {
    if (draggable) {
      draggable.destroy();
    }
    
    window.removeEventListener(GPT_REGISTERED_EVENTS.EXPLAIN_NODE, handleExplainNode);
    button.removeEventListener('click', toggleChat);
    
    if (chatComponent && chatComponent.destroy) {
      chatComponent.destroy();
    }
  };
  
  return {
    element: container,
    init,
    destroy,
    toggleChat
  };
}

export default App;