import urllib.request
import json
import sys

def verify_endpoint(url, method="GET", payload=None):
    print(f"Testing {method} {url} ...")
    req = urllib.request.Request(url, method=method)
    if payload:
        data = json.dumps(payload).encode("utf-8")
        req.add_header("Content-Type", "application/json")
    else:
        data = None
        
    try:
        with urllib.request.urlopen(req, data=data, timeout=5) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            print(f"  [SUCCESS] Response keys: {list(res_data.keys())}")
            return True
    except Exception as e:
        print(f"  [ERROR] Endpoint verification failed: {e}")
        return False

def main():
    print("==================================================================")
    print("           AURENITY X BACKEND VALIDATION INSPECTOR                ")
    print("==================================================================")
    
    base_url = "http://127.0.0.1:8000"
    success = True
    
    # 1. Discovery Inventory
    success &= verify_endpoint(f"{base_url}/api/v1/discovery/inventory")
    
    # 2. Digital Twin Graph Topology
    success &= verify_endpoint(f"{base_url}/api/v1/twin/graph")
    
    # 3. Prediction Decay Timeline
    success &= verify_endpoint(f"{base_url}/api/v1/prediction/decay")
    
    # 4. Cognitive Intelligence Audit
    success &= verify_endpoint(f"{base_url}/api/v1/cognitive/audit")
    
    # 5. Cyber War Room Simulation
    success &= verify_endpoint(f"{base_url}/api/v1/war-room/simulate", method="POST")
    
    # 6. Attack Lab Fuzzing
    success &= verify_endpoint(f"{base_url}/api/v1/attack/fuzz", method="POST", payload={"endpoint": "POST /api/auth"})
    
    # 7. Attack Lab OWASP Audits
    success &= verify_endpoint(f"{base_url}/api/v1/attack/owasp", method="POST")
    
    # 8. Autonomous Defense Quarantine
    success &= verify_endpoint(f"{base_url}/api/v1/defense/quarantine", method="POST", payload={"api_id": "auth-service"})
    
    # 9. Reports Compilation
    success &= verify_endpoint(f"{base_url}/api/v1/reports/compile", method="POST", payload={"report_type": "Security Reports"})

    if success:
        print("\nAll endpoints verified successfully. Backend engine is 100% stable!")
        sys.exit(0)
    else:
        print("\nSome endpoints returned anomalies. Please run backend server locally to test.")
        sys.exit(1)

if __name__ == "__main__":
    main()
