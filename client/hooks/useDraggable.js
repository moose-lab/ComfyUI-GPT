/**
 * 创建可拖拽元素的功能
 * @param {HTMLElement} element - 要使其可拖拽的 DOM 元素
 * @param {Object} options - 配置选项
 * @returns {Object} - 包含控制拖拽的方法
 */
export function useDraggable(element, options = {}) {
  // 初始位置设置
  let position = {
    x: options.initialX ?? window.innerWidth - 160,
    y: options.initialY ?? 20
  };
  
  // 内部状态
  let isDragging = false;
  let startPos = { x: 0, y: 0 };
  let clickTime = 0;
  let offset = { x: 0, y: 0 };
  
  // 应用初始位置
  applyPosition();
  
  // 鼠标移动处理
  function handleMouseMove(e) {
    if (isDragging) {
      const boundaryRight = options.boundaryPadding?.right ?? 100;
      const boundaryBottom = options.boundaryPadding?.bottom ?? 40;
      
      const newX = Math.min(
        Math.max(0, e.clientX - offset.x),
        window.innerWidth - boundaryRight
      );
      
      const newY = Math.min(
        Math.max(0, e.clientY - offset.y),
        window.innerHeight - boundaryBottom
      );
      
      position = { x: newX, y: newY };
      applyPosition();
    }
  }
  
  // 鼠标释放处理
  function handleMouseUp(e) {
    if (isDragging) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - startPos.x, 2) + 
        Math.pow(e.clientY - startPos.y, 2)
      );
      
      const timeDiff = Date.now() - clickTime;
      
      // 如果移动距离小且时间短，视为点击
      if (distance < 5 && timeDiff < 200 && options.onClick) {
        options.onClick();
      }
      
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  }
  
  // 鼠标按下处理
  function handleMouseDown(e) {
    e.preventDefault();
    isDragging = true;
    clickTime = Date.now();
    startPos = { x: e.clientX, y: e.clientY };
    
    const rect = element.getBoundingClientRect();
    offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  // 应用位置到元素
  function applyPosition() {
    if (!element) return;

    element.style.position = 'absolute';
    element.style.left = `${position.x}px`;
    element.style.top = `${position.y}px`;
  }
  
  // 设置位置
  function setPosition(newPosition) {
    position = { ...position, ...newPosition };
    applyPosition();
  }
  
  // 初始化拖拽功能
  function init() {
    if (!element) return;

    element.addEventListener('mousedown', handleMouseDown);
    applyPosition();
  }
  
  // 清理拖拽功能
  function destroy() {
    if (!element) return;
    
    element.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  
  // 初始化
  init();
  
  // 返回控制接口
  return {
    setPosition,
    getPosition: () => ({ ...position }),
    destroy
  };
} 