import json
import os

def main():
    log_path = r"C:\Users\ratho\.gemini\antigravity\brain\c1c57770-e77d-4b16-a1c8-e56bec3092e0\.system_generated\logs\transcript.jsonl"
    if not os.path.exists(log_path):
        print(f"Log path does not exist: {log_path}")
        return

    # Files we want to restore
    target_files = [
        "ai-engine/page.tsx",
        "attack-lab/page.tsx",
        "autonomous-defense/page.tsx",
        "cognitive-intelligence/page.tsx",
        "cyber-war-room/page.tsx",
        "digital-twin/page.tsx",
        "discovery/page.tsx",
        "prediction/page.tsx",
        "reports/page.tsx",
        "time-machine/page.tsx"
    ]
    
    restored = {}

    print("Reading transcript.jsonl ...")
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                step = json.loads(line)
                # Check for write_to_file or replace_file_content or multi_replace_file_content
                if "tool_calls" in step:
                    for tc in step["tool_calls"]:
                        args = tc.get("args", {})
                        target_file = args.get("TargetFile", "")
                        for tf in target_files:
                            if tf in target_file:
                                # Found a tool call writing to our target file
                                content = args.get("CodeContent", "") or args.get("ReplacementContent", "")
                                if content:
                                    restored[tf] = content
            except Exception as e:
                pass

    print(f"Extraction complete. Found original contents for {len(restored)} files:")
    for tf, content in restored.items():
        print(f"  - {tf} ({len(content)} bytes)")
        
        # Recreate the file path under app/
        out_path = os.path.join("app", tf.replace("/", "\\"))
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        # Apply the localhost -> 127.0.0.1 replacement while saving!
        fixed_content = content.replace("localhost:8000", "127.0.0.1:8000")
        with open(out_path, "w", encoding="utf-8") as out_f:
            out_f.write(fixed_content)
        print(f"    Restored & patched: {out_path}")

if __name__ == "__main__":
    main()
