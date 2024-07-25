import os, sys
from typing import Dict
from flask import Flask, send_from_directory, Response, request
import http.client
from http.client import HTTPResponse
import urllib.parse
from contextlib import contextmanager



@contextmanager
def connection(server):
    conn = http.client.HTTPSConnection(server)
    try:
        yield conn
    finally:
        conn.close()

def Headers(headers: Dict[str, str]): 
    default = { 
        "Accept": "*/*",
        "Accept-Language": "*",
        "Sec-Fetch-Mode": "cors",
        "User-Agent": "node",
        "Accept-Encoding": "gzip, deflate"
    }

    if isinstance(headers, dict):
        default["Content-Length"] = headers["Content-Length"]
        default["Content-Type"] = headers["Content-Type"]
        default["Connection"] = headers["Connection"]
        default["Authorization"] = headers["Authorization"]
    
        return default



resource_path = sys._MEIPASS if "_MEIPASS" in dir(sys) else os.getcwd()
distDir = os.path.join(resource_path, 'dist')
server = Flask(__name__, static_folder= distDir)
PORT = 36567
print(distDir)
#os.system("dir "+distDir)

@server.route('/')
@server.route('/<route>')
def index(route: str= ""): 
    file = "index.html" if "." not in route else route
    return send_from_directory(server.static_folder, file)


@server.route('/assets/<name>')
def assets(name: str): return send_from_directory(server.static_folder, 'assets/'+name)



@server.route("/proxy", methods=['GET', 'POST'])
def proxy_client():
    #query = request.args
    method = request.method
    headers = Headers(dict(request.headers))
    print(headers)
    body = request.json
    url = dict(request.headers)['Url']
    if not url: return Response("Error: URL not provided in headers", status= 400)
    parsed_url = urllib.parse.urlsplit(url)
    server = parsed_url.netloc
    endpoint = parsed_url.path
    body = str(body).encode('utf-8')


    with connection(server) as conn:
        conn.request(method, endpoint, body=body, headers=headers)
        response = conn.getresponse()
        if 200 <= response.status < 300:
            if response.headers.get_content_type() == "text/event-stream": 
                return Response(sse_client(response), mimetype="text/event-stream")
            else: Response(response.read().decode(response.headers.get_content_charset('utf-8')))
        
        else: return Response(f"Request failed: {response.read().decode('utf-8')}", status= response.status)


    #try:
    #except Exception as e: return Response(f"Error: cannot establish the connection: {e}", status= 500)



def sse_client(response: HTTPResponse):
    while True:
        chunk = response.read().decode('utf-8')
        if not chunk: break
        yield chunk