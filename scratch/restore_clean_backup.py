import os
import shutil

def main():
    src_dir = r"c:\Users\ratho\Desktop\cipher-3 (1)\cipher-3\aurenity-x-ui\app"
    dest_dir = r"c:\Users\ratho\Desktop\cipher-3 (1)\cipher-3\app"
    
    print("Deleting current corrupted app directory...")
    # Recursively delete files in app/ but keep the directory structure
    for root, dirs, files in os.walk(dest_dir, topdown=False):
        for f in files:
            os.remove(os.path.join(root, f))
            
    print("Copying fresh backup templates from aurenity-x-ui/app...")
    for root, dirs, files in os.walk(src_dir):
        rel_path = os.path.relpath(root, src_dir)
        target_root = dest_dir if rel_path == "." else os.path.join(dest_dir, rel_path)
        os.makedirs(target_root, exist_ok=True)
        for f in files:
            src_file = os.path.join(root, f)
            dest_file = os.path.join(target_root, f)
            shutil.copy2(src_file, dest_file)
            print(f"  Copied: {f}")
            
    print("Baseline templates copied successfully.")

    print("Applying localhost:8000 -> 127.0.0.1:8000 patch...")
    updated_count = 0
    for root, dirs, files in os.walk(dest_dir):
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
                    print(f"  Patched: {os.path.relpath(file_path, dest_dir)}")
                    
    print(f"Restore complete. Patched {updated_count} files.")

if __name__ == "__main__":
    main()
