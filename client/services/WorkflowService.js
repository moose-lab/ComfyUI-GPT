// 工作流服务
export class WorkflowService {
  // 获取优化的工作流
  static async getOptimizedWorkflow(workflowId, latestInput) {
    try {
      const response = await fetch(`/api/workflow/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_id: workflowId,
          input: latestInput
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error optimizing workflow:', error);
      throw error;
    }
  }
  
  // 批量获取节点信息
  static async batchGetNodeInfo(nodeTypes) {
    try {
      const response = await fetch(`/api/nodes/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          node_types: nodeTypes
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching node info:', error);
      throw error;
    }
  }
  
  // 加载图形数据
  static loadGraphData(workflow) {
    if (window.comfyAPI && window.comfyAPI.graph) {
      window.comfyAPI.graph.loadGraphData(workflow);
    }
  }
  
  // 通过ID获取节点
  static getNodeById(nodeId) {
    if (window.comfyAPI && window.comfyAPI.graph) {
      return window.comfyAPI.graph._nodes_by_id[nodeId];
    }
    return null;
  }
  
  // 刷新画布
  static refreshCanvas() {
    if (window.comfyAPI && window.comfyAPI.graph) {
      window.comfyAPI.graph.setDirtyCanvas(false, true);
    }
  }
} 