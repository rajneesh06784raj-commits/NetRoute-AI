from flask import Flask
import os
import time

app = Flask(__name__)

@app.route("/health")
def health():
    if os.getenv("SLOW_MODE", "false").lower() == "true":
        time.sleep(3)

    return {
        "status": "UP",
        "server": os.getenv("SERVER_ID", "server-1")
    }

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)