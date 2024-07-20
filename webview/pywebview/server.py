import os, sys
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



#@server.route("/proxy", methods=['GET', 'POST'])
def proxy_client():
    #query = request.args
    method = request.method
    headers = request.headers
    body = request.json
    url = body['url']
    if not url: return Response("Error: URL not provided in headers", status= 400)
    parsed_url = urllib.parse.urlsplit(url)
    server = parsed_url.netloc
    endpoint = parsed_url.path
    del body['url']
    body = str(body).encode('utf-8')


    #try:
    with connection(server) as conn:
        conn.request(method, endpoint, body=body, headers=dict(headers))
        response = conn.getresponse()
        if 200 <= response.status < 300:
            if response.headers.get_content_type() == "text/event-stream": 
                return Response(sse_client(response), mimetype="text/event-stream")
            else: Response(response.read().decode(response.headers.get_content_charset('utf-8')))
        
        else: return Response(f"Request failed: {response.reason}", status= response.status)


    #except Exception as e: return Response(f"Error: cannot establish the connection: {e}", status= 500)



def sse_client(response: HTTPResponse):
    while True:
        chunk = response.read().decode('utf-8')
        if not chunk: break
        yield chunk