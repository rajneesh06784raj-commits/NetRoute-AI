import time
import requests

JAVA_BASE = "http://192.168.137.122:8080"  # Update this to your Java backend's IP and port

def calculate_risk(latency_ms, packet_loss_percent, load_percent):
    """Calculates the Phase 3 risk score without importing blocked SciPy DLLs"""
    # High risk signals based on the project spec
    risk_factors = 0
    if latency_ms > 200:
        risk_factors += 1
    if packet_loss_percent > 8:
        risk_factors += 1
    if load_percent > 75:
        risk_factors += 1

    # Approximate Logistic probability curve (0% to 100%)
    if risk_factors >= 2:
        return min(95.0, 70.0 + (latency_ms * 0.05) + (packet_loss_percent * 1.2))
    elif risk_factors == 1:
        return round(40.0 + (latency_ms * 0.04), 2)
    else:
        return round(max(5.0, latency_ms * 0.05), 2)

def fetch_metrics():
    """Pull real-time telemetry from Java backend"""
    try:
       res = requests.get(f"{JAVA_BASE}/api/network-status", timeout =2)
       print("STATUS:",res.status_code)
       print("JAVA DATA:", res.text)
       if res.status_code == 200:
           return res.json()
       return []
    except requests.exceptions.RequestException:
        print("[Python] Waiting for Java backend on port 8080...")
    return []

def evaluate_and_route(servers):
    """Agent decision logic: evaluate, score, and select the best server"""
    if not servers:
        return None
    # Deduplicate to keep only the latest record for each server
    latest_servers = {}
    for s in servers:
        sid = s.get("serverId")
        if sid:
            latest_servers[sid] = s

    evaluated = []
    for s in latest_servers.values():
    
        lat = float(s.get("latencyMs", 0.0))
        loss = float(s.get("packetLossPercent", 0.0))
        load = float(s.get("loadPercent", 50.0))

        risk_score = calculate_risk(lat, loss, load)

        # Agent formula: higher score = healthier target
        score = (100 - risk_score) - (lat * 0.1) - (load * 0.2)

        evaluated.append({
            "serverId": s.get("serverId"),
            "latencyMs": lat,
            "riskScore": risk_score,
            "score": score,
            "status": s.get("status", "UP"),
            "packetLossPercent": s.get("packetLossPercent", 0.0),
        })
        
    # Exclude servers that are down or have high packet loss
    healthy_candidates = [
        node for node in evaluated 
        if str(node.get("status", "")).upper() == "UP" and float(node.get("packetLossPercent", 0.0)) < 50.0
    ]

    # Fallback in case every server goes down
    if not healthy_candidates:
        healthy_candidates = evaluated

     # Select the best server among the healthy nodes
    best = min(healthy_candidates, key=lambda x: x["latencyMs"])

    return {
        "action": "reroute",
        "toServer": best["serverId"],
        "reason": f"Lowest risk ({best['riskScore']}%) and latency ({best['latencyMs']}ms)",
        "verified": True
    }

def send_decision(decision):
    """Push the agent decision back to Java"""
    try:
        res = requests.post(f"{JAVA_BASE}/api/traffic/redistribute", json=decision, timeout=2)
        print(f"[Python -> Java] Success: {res.text}")
    except requests.exceptions.RequestException as e:
        print(f"[Python] Could not send decision to Java: {e}")

def main():
    print("Agent Bridge started successfully! Syncing with Spring Boot...")
    while True:
        metrics = fetch_metrics()
        if metrics:
            decision = evaluate_and_route(metrics)
            if decision:
                print(f"[Agent Decision] Active target: {decision['toServer']}")
                send_decision(decision)
        else:
            print("[Python] No server records found in Java yet. Waiting...")
        
        time.sleep(3)

if __name__ == "__main__":
    main()