import json
import os

def main():
    log_path = r"C:\Users\ratho\.gemini\antigravity\brain\c1c57770-e77d-4b16-a1c8-e56bec3092e0\.system_generated\logs\transcript.jsonl"
    if not os.path.exists(log_path):
        print("Transcript does not exist.")
        return

    with open(log_path, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            try:
                step = json.loads(line)
                if "tool_calls" in step:
                    for tc in step["tool_calls"]:
                        name = tc.get("name", "")
                        args = tc.get("args", {})
                        target = args.get("TargetFile", "") or args.get("AbsolutePath", "")
                        if "app/" in target.lower() or "app\\" in target.lower() or "components/" in target.lower():
                            print(f"Line {line_num} | Tool: {name} | Target: {target}")
            except Exception as e:
                pass

if __name__ == "__main__":
    main()
