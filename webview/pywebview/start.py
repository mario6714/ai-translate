import sys
from flask import Flask, send_from_directory
import webview
from clipboard import Clipboard
from settings import SettingsApi
from xlsx import XLSX, os
#from binary_fs import FS, os



resource_path = sys._MEIPASS if "_MEIPASS" in dir(sys) else os.getcwd()
distDir = os.path.join(resource_path, 'dist')
server = Flask(__name__, static_folder= distDir)
PORT = 36567
print(distDir)
os.system("dir "+distDir)

@server.route('/')
@server.route('/<route>')
def index(route: str= ""): 
    file = "index.html" if "." not in route else route
    return send_from_directory(server.static_folder, file)

@server.route('/assets/<name>')
def assets(name: str): return send_from_directory(server.static_folder, 'assets/'+name)



class Api(Clipboard, XLSX, SettingsApi):
    def ping(self):
        print("pinged from webview!")
        return "Pong!"

    def pin(self): main_window.on_top = True if main_window.on_top == False else False

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
        http_port= PORT
    )
    main_window.on_top = True

    webview.settings = { 
        'ALLOW_DOWNLOADS': False,
        "OPEN_EXTERNAL_LINKS_IN_BROWSER": True,
        'ALLOW_FILE_URLS': True,
        'OPEN_DEVTOOLS_IN_DEBUG': True
    }

    webview.start(debug=True)



