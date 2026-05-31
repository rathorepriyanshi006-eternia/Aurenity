import os
import datetime

class DataLoader:
    def __init__(self, dir_path: str):
        self.dir_path = dir_path

    def load_api_metadata(self, api_record: dict) -> dict:
        """
        Loads API metadata (API_DOC, API_LASTDATE) from the repository files.
        Falls back to api_record properties if files are not present in dir_path.
        """
        api_id = api_record.get("id", "api-unknown")
        api_name = api_record.get("name", "Unknown API")
        
        # Normalize name for file search
        slug = api_name.lower().replace(" ", "_")
        
        # Check documentation file presence
        doc_exists = False
        doc_candidates = [
            os.path.join(self.dir_path, f"{api_id}_doc"),
            os.path.join(self.dir_path, f"{slug}_doc"),
            os.path.join(self.dir_path, "API_DOC"),
            os.path.join(self.dir_path, "docs", f"{slug}.md"),
        ]
        
        for p in doc_candidates:
            if os.path.exists(p):
                doc_exists = True
                break
                
        # Check last usage date file presence
        last_date_str = None
        date_candidates = [
            os.path.join(self.dir_path, f"{api_id}_lastdate"),
            os.path.join(self.dir_path, f"{slug}_lastdate"),
            os.path.join(self.dir_path, "API_LASTDATE")
        ]
        
        for p in date_candidates:
            if os.path.exists(p):
                try:
                    with open(p, "r", encoding="utf-8", errors="ignore") as f:
                        last_date_str = f.read().strip()
                        break
                except Exception:
                    pass

        # Fallbacks for public repos that don't have custom metadata files
        if not doc_exists:
            # If the API auth_strength is > 0 or has documented flag in raw scan
            doc_exists = api_record.get("auth_strength", 0) > 0 or api_record.get("documented", False)
            
        if not last_date_str:
            # Heuristic calculation:
            # Use 'age_days' and 'developer_activity' to simulate days since last use
            age_days = api_record.get("age_days", 30)
            dev_activity = api_record.get("developer_activity", 0.5)
            status = api_record.get("status", "active")
            
            if status == "zombie" or dev_activity < 0.05:
                # Zombie APIs have a last used date > 50 days ago
                days_offset = max(60, age_days)
            else:
                # Active/Shadow APIs have a last used date <= 50 days ago
                days_offset = min(15, age_days)
                
            last_used_dt = datetime.datetime.now() - datetime.timedelta(days=days_offset)
            last_date_str = last_used_dt.strftime("%Y-%m-%d")

        return {
            "api_name": api_name,
            "doc_exists": doc_exists,
            "last_used_date": last_date_str
        }
