export function chatMessage() {
    // 创建聊天消息区域
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'comfyui-gpt-messages';
    messagesContainer.style.flex = '1';
    messagesContainer.style.overflowY = 'auto';
    messagesContainer.style.padding = '16px';

    return messagesContainer;
}