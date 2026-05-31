import json
import os
import shutil

def main():
    log_path = r"C:\Users\ratho\.gemini\antigravity\brain\c1c57770-e77d-4b16-a1c8-e56bec3092e0\.system_generated\logs\transcript.jsonl"
    if not os.path.exists(log_path):
        print("Transcript does not exist.")
        return

    # 1. Restore all files from aurenity-x-ui/app/ to app/
    src_dir = r"c:\Users\ratho\Desktop\cipher-3 (1)\cipher-3\aurenity-x-ui\app"
    dest_dir = r"c:\Users\ratho\Desktop\cipher-3 (1)\cipher-3\app"
    
    print("Copying baseline app templates from aurenity-x-ui/app to app ...")
    for root, dirs, files in os.walk(src_dir):
        rel_path = os.path.relpath(root, src_dir)
        target_root = dest_dir if rel_path == "." else os.path.join(dest_dir, rel_path)
        os.makedirs(target_root, exist_ok=True)
        for f in files:
            src_file = os.path.join(root, f)
            dest_file = os.path.join(target_root, f)
            shutil.copy2(src_file, dest_file)
            
    print("Baseline templates copied successfully.")

    # 2. Replay all tool calls chronologically
    print("Parsing and replaying transcript.jsonl edits ...")
    with open(log_path, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            try:
                step = json.loads(line)
                if "tool_calls" not in step:
                    continue
                for tc in step["tool_calls"]:
                    name = tc.get("name", "")
                    args = tc.get("args", {})
                    target_file = args.get("TargetFile", "") or args.get("AbsolutePath", "")
                    
                    if not target_file:
                        continue
                    
                    # Strip double quotes
                    target_file = target_file.strip('"')
                    target_file = os.path.abspath(target_file)
                    
                    if name == "write_to_file":
                        if "app\\" in target_file or "app/" in target_file:
                            content = args.get("CodeContent", "")
                            if content:
                                print(f"Line {line_num} | Replaying write_to_file for {os.path.basename(target_file)}")
                                with open(target_file, "w", encoding="utf-8") as out_f:
                                    out_f.write(content)
                                    
                    elif name == "replace_file_content":
                        if "app\\" in target_file or "app/" in target_file:
                            target_content = args.get("TargetContent", "")
                            replacement_content = args.get("ReplacementContent", "")
                            if target_content:
                                print(f"Line {line_num} | Replaying replace_file_content for {os.path.basename(target_file)}")
                                if os.path.exists(target_file):
                                    with open(target_file, "r", encoding="utf-8") as in_f:
                                        file_text = in_f.read()
                                    # Normalize line endings to \n
                                    norm_file_text = file_text.replace("\r\n", "\n")
                                    norm_target_content = target_content.replace("\r\n", "\n")
                                    norm_replacement_content = replacement_content.replace("\r\n", "\n")
                                    
                                    if norm_target_content in norm_file_text:
                                        new_text = norm_file_text.replace(norm_target_content, norm_replacement_content)
                                        with open(target_file, "w", encoding="utf-8") as out_f:
                                            out_f.write(new_text)
                                    else:
                                        # Let's check with lowercase or whitespace normalization if still failing
                                        print(f"  [WARNING] Target content not found in {os.path.basename(target_file)}")
                                else:
                                    print(f"  [ERROR] File {target_file} does not exist.")
            except Exception as e:
                print(f"Error replaying line {line_num}: {e}")

    # 3. Apply the localhost -> 127.0.0.1 replacement safely on all restored files!
    print("Applying localhost:8000 -> 127.0.0.1:8000 patch ...")
    app_dir = r"c:\Users\ratho\Desktop\cipher-3 (1)\cipher-3\app"
    updated_count = 0
    for root, dirs, files in os.walk(app_dir):
        for f in files:
            if f.endswith(".tsx") or f.endswith(".ts") or f.endswith(".js"):
                file_path = os.path.join(root, f)
                with open(file_path, "r", encoding="utf-8", errors="ignore") as in_f:
                    text = in_f.read()
                if "localhost:8000" in text:
                    text = text.replace("localhost:8000", "127.0.0.1:8000")
                    with open(file_path, "w", encoding="utf-8") as out_f:
                        out_f.write(text)
                    updated_count += 1
                    print(f"  Patched host in: {os.path.relpath(file_path, app_dir)}")
                    
    print(f"Restore & patch finished. Patched {updated_count} files.")

if __name__ == "__main__":
    main()
