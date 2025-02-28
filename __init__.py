from .router.app import *

# ComfyUI-GPT 前端注册到web服务器
WEB_DIRECTORY = "web"


# ComfyUI-GPT 后端注册到custom nodes
NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']