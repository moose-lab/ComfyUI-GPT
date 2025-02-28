import { app } from "../../../scripts/app.js";

// 定义事件常量
const GPT_REGISTERED_EVENTS = {
    EXPLAIN_NODE: 'gpt:explain-node'
};

/**
 * 为节点添加额外的右键菜单选项
 * @param {Object} nodeType - 节点类型对象
 * @param {Object} nodeData - 节点数据
 * @param {Object} app - 应用实例
 */
function addExtraMenuOptions(nodeType, nodeData, app) {
    // 保存原始的getExtraMenuOptions方法
    const originalGetExtraMenuOptions = nodeType.prototype.getExtraMenuOptions;
    
    // 重写getExtraMenuOptions方法
    nodeType.prototype.getExtraMenuOptions = function(_, options) {
        // 调用原始方法（如果存在）
        if (originalGetExtraMenuOptions) {
            originalGetExtraMenuOptions.apply(this, arguments);
        }
        
        // 获取节点的唯一标识符
        const nodeTypeUniqueId = nodeType?.comfyClass || "unknown";
        
        // 添加GPT信息选项到菜单
        options.push({
            content: "GPT Capacity",
            callback: async () => {
                try {
                    // 确保GPT_REGISTERED_EVENTS已定义
                    if (!GPT_REGISTERED_EVENTS || !GPT_REGISTERED_EVENTS.EXPLAIN_NODE) {
                        console.error("GPT_REGISTERED_EVENTS is not defined or EXPLAIN_NODE is none");
                        return;
                    }
                    
                    // 触发自定义事件
                    window.dispatchEvent(new CustomEvent(GPT_REGISTERED_EVENTS.EXPLAIN_NODE, {
                        detail: { nodeType: nodeTypeUniqueId }
                    }));
                } catch (error) {
                    console.error("invoke explain node event error:", error);
                }
            }
        });
    };
}

app.registerExtension({
    name: "ComfyUI-GPT-Extension",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        //右键菜单增加GPT选项
        addExtraMenuOptions(nodeType, nodeData, app);
    },
});