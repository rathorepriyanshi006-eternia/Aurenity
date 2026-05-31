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
                if "tool_calls" not in step:
                    continue
                for tc in step["tool_calls"]:
                    name = tc.get("name", "")
                    args = tc.get("args", {})
                    target_file = args.get("TargetFile", "")
                    
                    if name == "replace_file_content" and target_file and "app" in target_file.lower():
                        target_file = target_file.strip('"')
                        print(f"==========================================================")
                        print(f"Line {line_num} | File: {os.path.basename(target_file)}")
                        print(f"TargetContent:\n{args.get('TargetContent', '')}")
                        print(f"ReplacementContent:\n{args.get('ReplacementContent', '')}")
            except Exception as e:
                pass

if __name__ == "__main__":
    main()
