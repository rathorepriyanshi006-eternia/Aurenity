import json
import os

def main():
    log_path = r"C:\Users\ratho\.gemini\antigravity\brain\c1c57770-e77d-4b16-a1c8-e56bec3092e0\.system_generated\logs\transcript.jsonl"
    if not os.path.exists(log_path):
        print("Transcript does not exist.")
        return

    with open(log_path, "r", encoding="utf-8") as f:
        for i in range(15):
            line = f.readline()
            if not line:
                break
            try:
                data = json.loads(line)
                print(f"Step {i+1} Keys: {list(data.keys())}")
                if "type" in data:
                    print(f"  Type: {data['type']}")
                if "tool_calls" in data:
                    print(f"  Tool calls: {[tc.get('name') for tc in data['tool_calls']]}")
                # Print a small sample of content or output
                for k in ["content", "output"]:
                    if k in data and data[k]:
                        print(f"  {k} snippet: {str(data[k])[:120]}")
            except Exception as e:
                print(f"Error parsing line {i+1}: {e}")

if __name__ == "__main__":
    main()
