import json
import os
import re

def main():
    log_path = r"C:\Users\ratho\.gemini\antigravity\brain\c1c57770-e77d-4b16-a1c8-e56bec3092e0\.system_generated\logs\transcript.jsonl"
    if not os.path.exists(log_path):
        print("Transcript does not exist.")
        return

    target_files = {
        "discovery/page.tsx": "app\\discovery\\page.tsx",
        "digital-twin/page.tsx": "app\\digital-twin\\page.tsx",
        "cognitive-intelligence/page.tsx": "app\\cognitive-intelligence\\page.tsx",
        "time-machine/page.tsx": "app\\time-machine\\page.tsx",
        "attack-lab/page.tsx": "app\\attack-lab\\page.tsx",
        "autonomous-defense/page.tsx": "app\\autonomous-defense\\page.tsx",
        "reports/page.tsx": "app\\reports\\page.tsx",
        "cyber-war-room/page.tsx": "app\\cyber-war-room\\page.tsx",
        "ai-engine/page.tsx": "app\\ai-engine\\page.tsx",
        "prediction/page.tsx": "app\\prediction\\page.tsx"
    }

    restored = {}

    print("Parsing transcript.jsonl ...")
    with open(log_path, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            try:
                step = json.loads(line)
                step_type = step.get("type", "")
                content = step.get("content", "")
                
                if step_type == "VIEW_FILE" and content:
                    # Parse path
                    path_match = re.search(r"File Path:\s+`file:///(.+?)`", content)
                    if path_match:
                        file_uri_path = path_match.group(1).replace("%20", " ")
                        
                        # Extract the code content between line markers, e.g. "1: 'use client';"
                        lines = content.splitlines()
                        code_lines = []
                        for l in lines:
                            # Lines starting with <number>: <content>
                            m = re.match(r"^\s*(\d+):\s(.*)", l)
                            if m:
                                code_lines.append(m.group(2))
                        
                        if code_lines:
                            code_content = "\n".join(code_lines)
                            
                            # Match with our targets
                            for name_key, dest_path in target_files.items():
                                if name_key in file_uri_path.replace("\\", "/"):
                                    # Keep the largest non-empty version found in history
                                    if name_key not in restored or len(code_content) > len(restored[name_key]):
                                        restored[name_key] = code_content
                                        print(f"Line {line_num} | Extracted {name_key} ({len(code_content)} bytes) [Selected]")
            except Exception as e:
                print(f"Error parsing line {line_num}: {e}")

    print(f"\nExtraction results: {len(restored)} files extracted.")
    for name_key, code_content in restored.items():
        dest_path = target_files[name_key]
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        # Patch localhost -> 127.0.0.1
        fixed = code_content.replace("localhost:8000", "127.0.0.1:8000")
        with open(dest_path, "w", encoding="utf-8") as out_f:
            out_f.write(fixed)
        print(f"  Restored and patched: {dest_path}")

if __name__ == "__main__":
    main()
