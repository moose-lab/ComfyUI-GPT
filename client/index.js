let app = null;
let api = null;

const api_base = location.pathname.split("/").slice(0, -1).join("/");

// 等待文档body加载完成
function waitForDocumentBody() {
    return new Promise((resolve) => {
      if (document.body) {
        return resolve(document.body);
      }
  
      document.addEventListener("DOMContentLoaded", () => {
        resolve(document.body);
      });
    });
}

// 等待ComfyUI应用加载
async function waitForApp() {
    try {
        await Promise.all([
            import(api_base + "/scripts/api.js").then((apiJs) => {
              api = apiJs?.api;
            }),
      
            import(api_base + "/scripts/app.js").then((appJs) => {
              app = appJs?.app;
            }),
          ]);
    } catch (e) {
        console.error("waitForApp error", e);
    }

}

// 动态导入App组件
function loadApp() {
    return import("./components/app.js").then(module => module.default);
}

// 创建并渲染应用
function renderApp(AppComponent) {
    // 创建一个web component
    const topbar = document.createElement("div");
    topbar.id = "comfyui-gpt-id";
    document.body.append(topbar);
    
    // JavaScript创建应用容器comfyui-gpt
    const appContainer = document.createElement("div");
    appContainer.className = "comfyui-gpt-app";
    topbar.appendChild(appContainer);
    
    // 渲染App组件
    const app = AppComponent(); // 调用App函数获取返回的对象
    const appElement = app.element; // 获取DOM元素
    appContainer.appendChild(appElement); // 将元素添加到容器中
    app.init(); // 调用初始化方法
}

// 主函数
async function main() {
    try {
      // Step1: 等待文档加载完成
      await waitForDocumentBody();
      
      // Step2: 等待ComfyUI应用加载
      await waitForApp();
      
      // Step3: 加载App组件
      const App = await loadApp();
      
      // Step4: 渲染应用
      renderApp(App);
      
      console.log("ComfyUI-GPT frontend loaded successfully");
    } catch (error) {
      console.error("Loading ComfyUI-GPT frontend failed:", error);
    }
}

export { app, api };

main();