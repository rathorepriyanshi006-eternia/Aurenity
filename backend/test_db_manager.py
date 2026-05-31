import os
from dotenv import load_dotenv

# Load env
load_dotenv()

from db_manager import AurenityDBManager
from ml_engine import AurenityMLEngine

print("Initializing DB Manager...")
db = AurenityDBManager()
ml = AurenityMLEngine()

print("\n--- Initial Load ---")
apis = db.load_apis()
print(f"Loaded APIs count: {len(apis)}")
if not apis:
    print("Memory store is empty. Let's populate it.")
    df = ml.generate_mock_api_data(num_apis=5)
    df_scored = ml.train_and_score(df)
    records = df_scored.to_dict(orient="records")
    
    print("Saving 5 APIs...")
    db.save_apis(records)
    
    print("\n--- Load After Save ---")
    apis_after = db.load_apis()
    print(f"Loaded APIs count after save: {len(apis_after)}")
    for a in apis_after:
        print(f"- {a['name']} ({a['endpoint']})")
else:
    for a in apis[:5]:
        print(f"- {a['name']} ({a['endpoint']})")
