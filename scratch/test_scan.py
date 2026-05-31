import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from repo_scanner import AurenityRepoScanner

def main():
    scanner = AurenityRepoScanner()
    test_url = "https://github.com/encode/starlette"
    try:
        extract_dir = scanner.download_github_zip(test_url)
        apis = scanner.scan_directory_for_apis(extract_dir)
        print(f"Scan complete. First 10 APIs and matching lines:")
        for api in apis[:10]:
            print(f"  - {api['method']} {api['endpoint']}")
            print(f"    Source File: {api['file_source']}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
