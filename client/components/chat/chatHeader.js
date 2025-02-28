export function chatHeader({onClose, onClearHistory}) {

    // 创建聊天头部
     const header = document.createElement('div');
     header.className = 'comfyui-gpt-chat-header';
     header.style.padding = '12px 16px';
     header.style.borderBottom = '1px solid #000000';
     header.style.display = 'flex';
     header.style.justifyContent = 'space-between';
     header.style.alignItems = 'center';
 
 
     const title = document.createElement('h3');
     title.textContent = 'ComfyUI-GPT Assistant';
     title.style.margin = '0';
     title.style.fontSize = '16px';
     title.style.fontWeight = '600';
 
     // 添加按钮容器
     const buttonContainer = document.createElement('div');
     buttonContainer.style.display = 'flex';
     buttonContainer.style.gap = '8px';
     
     // 添加清除历史按钮
     const clearButton = document.createElement('button');
     clearButton.innerHTML = '🗑️';
     clearButton.title = 'Clear the chat history';
     clearButton.style.background = 'none';
     clearButton.style.border = 'none';
     clearButton.style.fontSize = '16px';
     clearButton.style.cursor = 'pointer';
     clearButton.style.padding = '0 4px';
     clearButton.onclick = onClearHistory;
     
     const closeButton = document.createElement('button');
     closeButton.innerHTML = '&times;';
     closeButton.style.background = 'none';
     closeButton.style.border = 'none';
     closeButton.style.fontSize = '20px';
     closeButton.style.cursor = 'pointer';
     closeButton.style.padding = '0 4px';
     closeButton.onclick = onClose;
     
     buttonContainer.appendChild(clearButton);
     buttonContainer.appendChild(closeButton);
     
     header.appendChild(title);
     header.appendChild(buttonContainer);
 
     return header;
}