from ml.data_loader import DataLoader
from ml.feature_engineering import FeatureEngineer
from ml.classifier import Classifier
from ml.schemas import APIDNA

class InferencePipeline:
    def __init__(self, dir_path: str):
        self.loader = DataLoader(dir_path)
        self.engineer = FeatureEngineer()
        self.classifier = Classifier()

    def process_api(self, api_record: dict) -> APIDNA:
        """
        Coordinates the ML classification stages:
        1. Data Collection
        2. Feature Engineering
        3. Feature Dataset / Columns
        4. Classification Layer
        5. Prediction Output (APIDNA Object)
        """
        # Stage 1: Load raw metadata files
        raw_metadata = self.loader.load_api_metadata(api_record)
        
        # Stage 2 & 3: Feature Engineering and Dataset
        features = self.engineer.extract_features(raw_metadata)
        
        # Stage 4: Classification
        predictions = self.classifier.classify(features)
        
        # Stage 5: Output DNA predictions
        return APIDNA(
            api_name=features["api_name"],
            documentation_exists=features["documentation_exists"],
            last_used_date=features["last_used_date"],
            days_since_last_use=features["days_since_last_use"],
            api_status=predictions["api_status"],
            documentation_status=predictions["documentation_status"]
        )
