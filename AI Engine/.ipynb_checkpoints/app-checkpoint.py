from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Load the trained model from the notebook
model = joblib.load("risk_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    input_data = request.json
    
    df = pd.DataFrame([{
        "latencyMs": input_data["latencyMs"],
        "packetLossPercent": input_data["packetLossPercent"],
        "loadPercent": input_data["loadPercent"]
    }])
    
    # Calculate probability of high risk
    risk_prob = model.predict_proba(df)[0][1]
    risk_score = round(risk_prob * 100, 2)
    level = "high" if risk_score > 70 else "medium" if risk_score > 40 else "low"
    
    return jsonify({
        "serverId": input_data.get("serverId"),
        "riskScore": risk_score,
        "riskLevel": level
    })

def choose_best_server(servers_metrics):
    for s in servers_metrics:
        s["score"] = (100 - s["riskScore"]) - (s["latencyMs"] * 0.1) - (s["loadPercent"] * 0.2)
    
    best = max(servers_metrics, key=lambda s: s["score"])
    return {
        "action": "reroute",
        "toServer": best["serverId"],
        "reason": f"Lowest risk ({best['riskScore']}%) aur latency ({best['latencyMs']}ms)"
    }

@app.route("/decision", methods=["POST"])
def decision():
    servers_metrics = request.json
    result = choose_best_server(servers_metrics)
    result["verified"] = True
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=5000, debug=True)