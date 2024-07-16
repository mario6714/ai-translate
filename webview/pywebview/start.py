import webview
from clipboard import Clipboard
from settings import SettingsApi
from xlsx import XLSX, os
from server import server, distDir, PORT
from window import get_screen_width
#from binary_fs import FS, os



class Api(Clipboard, XLSX, SettingsApi):
    def OpenConfigWindow(self):
        port = PORT if os.path.exists(distDir) else "5173"
        window = webview.create_window("Settings", 
            js_api= Api(),
            url= f"http://localhost:{port}/settings",
        )
        window.show()
        window.focus = True


if __name__ == "__main__":
    main_window = webview.create_window("AI Translate", 
        js_api= Api(),
        url= server if os.path.exists(distDir) else "http://localhost:5173/",
        http_port= PORT,
        width= 580,
        height= 342,
        y= 0,
        x= abs(get_screen_width()-580)
    )
    main_window.on_top = True

    webview.settings = { 
        'ALLOW_DOWNLOADS': False,
        "OPEN_EXTERNAL_LINKS_IN_BROWSER": True,
        'ALLOW_FILE_URLS': True,
        'OPEN_DEVTOOLS_IN_DEBUG': True,
    }

    webview.start()



