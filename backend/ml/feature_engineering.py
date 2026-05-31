import datetime

class FeatureEngineer:
    def __init__(self, current_date: datetime.date = None):
        # Default current evaluation date (May 31, 2026 or dynamic today)
        self.current_date = current_date or datetime.date.today()

    def extract_features(self, raw_metadata: dict) -> dict:
        """
        Engineers features:
        - documentation_exists: Boolean
        - days_since_last_use: Integer
        """
        doc_exists = raw_metadata.get("doc_exists", False)
        last_used_str = raw_metadata.get("last_used_date")
        
        days_since_last_use = 0
        if last_used_str:
            try:
                # Try parsing standard YYYY-MM-DD format
                dt = datetime.datetime.strptime(last_used_str, "%Y-%m-%d").date()
                days_since_last_use = (self.current_date - dt).days
            except Exception:
                # Fallback to standard offset
                days_since_last_use = 15
                
        return {
            "api_name": raw_metadata.get("api_name"),
            "documentation_exists": doc_exists,
            "days_since_last_use": max(0, days_since_last_use),
            "last_used_date": last_used_str
        }
