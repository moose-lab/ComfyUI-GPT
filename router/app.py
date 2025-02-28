import os
import sys
import logging
import server
import folder_paths

from aiohttp import web
from pathlib import Path

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ComfyUI-GPT")

# 定义关键路径
try:
    workdir_path = Path(__file__).parent.absolute()
    comfyui_path = Path(folder_paths.__file__).parent.absolute()

    # storage_path = workdir_path / "storage"
    comfyui_gpt_client_path = workdir_path / "client"

    # if not storage_path.exists():
    #     storage_path.mkdir(parents=True)
    #     logger.info("Create database directory at: %s", storage_path)

    if comfyui_gpt_client_path.exists() and comfyui_gpt_client_path.is_dir():
        server.PromptServer.instance.app.add_routes([
            web.static('/', comfyui_gpt_client_path),
        ])

        logger.info("Successfully loaded gpt web routes from: %s", comfyui_gpt_client_path)
    else:
        error_msg = f"GPT web routes not found or invalid: {comfyui_gpt_client_path}"
        logger.error(error_msg)
        print("Error reason is %s", str(error_msg))
        print("Please ensure that the frontend project has been built correctly \
               and the build output has been placed in the correct position.")
    
except Exception as e:
    logger.error(f"Failed to load comfyui-gpt frontend module correctly: {e}")
    print("Critical Error: %s", str(e))
    sys.exit(1)
