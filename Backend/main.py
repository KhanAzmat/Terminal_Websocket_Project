import uvicorn
import pty
import os
import subprocess
import json
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

# create fastApi app
app = FastAPI()


# allowed origins for CORS
origins = [
    'http://localhost:5173',
    'localhost:5173'
]


# Initialise the app
app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ['*'],
    allow_headers = ['*'],
)


# create shell
# shell = sys.executable if options.use_python else os.environ.get('SHELL', 'sh')
shell = os.environ.get('SHELL', 'sh')

@app.get('/', tags=['root'])
async def read_root() -> dict :
    return {'message' : 'Welcome to your react App'}


@app.websocket('/ws')
async def websocket_endpoint(websocket:WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        data = json.loads(data)
        print(type(data))
        print(data['data'])
        # Run the command synchronously
        try:
            result = subprocess.run(
                data['data'],
                shell=True,  # Allows running shell commands
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True  # Ensures the output is returned as a string
            )

            # Send the output or error back through the WebSocket
            if result.stdout:
                res = json.dumps({"type" : "data", "data" : result.stdout})
                print(type(res))
                # await websocket.send_text(f'"type": "data", "data" : {result.stdout}')
                await websocket.send_text(res)
            if result.stderr:
                await websocket.send_text(f'"Error": {result.stderr}')
        except Exception as e:
            await websocket.send_text(f"Exception: {str(e)}")



        # pty.spawn('/bin/sh')

        # await websocket.send_text(f'Message text was : {data}')


if __name__ == '__main__':
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)