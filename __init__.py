# ComfyUI-GPT 前端注册到web服务器
WEB_DIRECTORY = "web"

try:
    from .router.app import *
except Exception as e:
    import logging
    logging.error("Loading the static web routes failed: %s", str(e))
    raise e


# ComfyUI-GPT 后端注册到custom nodes
NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']