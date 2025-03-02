export function chatFooter({onSumbit, onKeyDown}) { 
    // 创建输入区域
    const footer = document.createElement('div');
    footer.className = 'comfyui-gpt-input-container';
    footer.style.padding = '12px 16px';
    footer.style.borderTop = '2px solid #444444';
    footer.style.display = 'flex';
    footer.style.flexDirection = 'column';  // 改为垂直排列
    footer.style.gap = '12px';  // 添加垂直间距
    
    const textarea = document.createElement('textarea');
    textarea.className = 'comfyui-gpt-input';
    textarea.placeholder = 'Ask Anything...';
    textarea.style.width = '100%';  // 设置宽度占满
    textarea.style.padding = '12px';  // 增加内边距
    textarea.style.border = '1px solid #d1d5db';
    textarea.style.borderRadius = '8px';  // 增加圆角
    textarea.style.resize = 'vertical';  // 允许垂直调整大小
    textarea.style.minHeight = '120px';  // 设置最小高度
    textarea.style.maxHeight = '300px';  // 设置最大高度
    textarea.addEventListener('keydown', onKeyDown);

    // 创建底部操作栏容器
    const actionBar = document.createElement('div');
    actionBar.style.display = 'flex';
    actionBar.style.justifyContent = 'space-between';
    actionBar.style.alignItems = 'center';
    actionBar.style.width = '100%';

    // 创建模型选择下拉框
    const modelSelect = document.createElement('select');
    modelSelect.className = 'Model-select';
    modelSelect.style.padding = '8px';
    modelSelect.style.border = '1px solid #444444';
    modelSelect.style.borderRadius = '6px';
    modelSelect.style.backgroundColor = '#222222';
    modelSelect.style.color = '#ffffff';
    modelSelect.style.cursor = 'pointer';
    modelSelect.style.width = '200px';  // 设置固定宽度
     
    // 添加模型选项
    const defaultOption = document.createElement('option');
    defaultOption.value = 'deepseek-r1';
    defaultOption.textContent = 'Deepseek-R1';
    modelSelect.appendChild(defaultOption);
    
    const sumbitButton = document.createElement('button');
    sumbitButton.textContent = 'Sumbit';
    sumbitButton.className = 'comfyui-gpt-sumbit-button';
    sumbitButton.style.padding = '3px 6px';
    sumbitButton.style.backgroundColor = '#444444';
    sumbitButton.style.color = '#ffffff';
    sumbitButton.style.border = '1px solid #444444';
    sumbitButton.style.borderRadius = '4px';
    sumbitButton.style.cursor = 'pointer';
    sumbitButton.style.alignSelf = 'flex-end';  // 按钮靠右对齐
    sumbitButton.onclick = onSumbit;

    actionBar.appendChild(modelSelect);
    actionBar.appendChild(sumbitButton);

    footer.appendChild(textarea);
    footer.appendChild(actionBar);

    return footer;
}