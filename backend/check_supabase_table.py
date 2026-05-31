import urllib.request
import json
import urllib.error

supabase_url = "https://kvurykqgkvlkhlocqwxa.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dXJ5a3Fna3Zsa2hsb2Nxd3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDg5OTAsImV4cCI6MjA5NTU4NDk5MH0.SRiRvEJygRezk33-mjvLSB6-asG0GDZKR9VDQkqzngE"

print("Checking apis table in Supabase...")

# Test SELECT
url_select = f"{supabase_url}/rest/v1/apis?select=*"
headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

req_select = urllib.request.Request(
    url_select,
    headers=headers,
    method="GET"
)

try:
    with urllib.request.urlopen(req_select) as response:
        data = json.loads(response.read().decode("utf-8"))
        print("\nSUCCESS! Successfully read 'apis' table from Supabase.")
        print(f"Number of rows found: {len(data)}")
        if data:
            print("First row:", data[0])
except urllib.error.HTTPError as e:
    print(f"\nFAILED with HTTP status code {e.code}")
    try:
        error_body = json.loads(e.read().decode("utf-8"))
        print("Error details:", json.dumps(error_body, indent=2))
    except Exception:
        print("Could not parse error response.")
except Exception as e:
    print("\nFAILED with connection error:", e)
