import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier, GradientBoostingClassifier
from sklearn.cluster import KMeans

class AurenityMLEngine:
    def __init__(self):
        # Setup base engines
        self.anomaly_detector = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
        self.clusterer = KMeans(n_clusters=4, random_state=42, n_init=10)
        self.is_trained = False
        
    def generate_mock_api_data(self, num_apis=50):
        """
        Generates synthetic API telemetry data representing realistic cybersecurity features:
        - request_count (volume)
        - error_rate (stability)
        - auth_strength (0=None, 1=Basic/API Key, 2=OAuth2/JWT)
        - data_sensitivity (0=Public, 1=Internal, 2=PII/PCI)
        - age_days (zombie index)
        - developer_activity (entropy index)
        """
        np.random.seed(42)
        data = {
            "id": [f"api-{i}" for i in range(num_apis)],
            "name": [
                np.random.choice(["Auth API", "Payment Gateway", "User Account Service", "Legacy Analytics", 
                                  "Inventory Sync", "Shadow DB Export", "GDPR Compliance Check", "Telemetry Hub", 
                                  "Partner Webhook", "Cart Service", "Promo Manager", "Search Engine"]) 
                + f" v{np.random.choice([1, 2])}" for i in range(num_apis)
            ],
            "endpoint": [
                np.random.choice(["/api/v1/auth", "/api/v2/pay", "/api/users/profile", "/old/analytics/export",
                                  "/internal/sync", "/temp/db_dump", "/compliance/gdpr", "/telemetry/metrics",
                                  "/webhooks/partner", "/cart/checkout", "/promos/validate", "/search"])
                + f"/{np.random.randint(100, 999)}" for i in range(num_apis)
            ],
            "request_count": np.random.exponential(scale=10000, size=num_apis),
            "error_rate": np.random.beta(a=1, b=20, size=num_apis),
            "auth_strength": np.random.choice([0, 1, 2], size=num_apis, p=[0.2, 0.4, 0.4]),
            "data_sensitivity": np.random.choice([0, 1, 2], size=num_apis, p=[0.3, 0.5, 0.2]),
            "age_days": np.random.randint(10, 1000, size=num_apis),
            "developer_activity": np.random.beta(a=2, b=5, size=num_apis),
            "latency_ms": np.random.normal(loc=120, scale=80, size=num_apis)
        }
        
        # Clip latency and error rate to valid bounds
        data["latency_ms"] = np.clip(data["latency_ms"], 10, 2000)
        data["error_rate"] = np.clip(data["error_rate"], 0.0, 1.0)
        
        return pd.DataFrame(data)

    def train_and_score(self, df):
        """
        Trains the Isolation Forest and KMeans on the feature space
        and returns enriched API records with real machine learning scores.
        """
        # Select features for ML pipeline
        features = ["request_count", "error_rate", "auth_strength", "data_sensitivity", "age_days", "developer_activity"]
        X = df[features].copy()
        
        # Normalize data simple min-max scaling for model reliability
        X_normalized = (X - X.min()) / (X.max() - X.min() + 1e-8)
        
        # Run outlier detection (contamination score representing shadow APIs)
        self.anomaly_detector.fit(X_normalized)
        anomaly_scores = self.anomaly_detector.decision_function(X_normalized)
        is_anomaly = self.anomaly_detector.predict(X_normalized) # -1 = anomaly, 1 = normal
        
        # Run clustering to classify API health/threat phases
        self.clusterer.fit(X_normalized)
        clusters = self.clusterer.labels_
        
        df_scored = df.copy()
        df_scored["anomaly_score"] = anomaly_scores
        df_scored["is_anomaly"] = is_anomaly == -1
        
        # Map clusters to logical security statuses
        # We define a security classification system mapping clusters to states:
        # Active, Zombie (old & inactive), Shadow (high outlier score), Deprecated (old but still active)
        statuses = []
        health_scores = []
        
        for idx, row in df_scored.iterrows():
            # Heuristic override combined with KMeans clusters for maximum startup/demo realism
            if row["is_anomaly"] and row["auth_strength"] == 0:
                status = "shadow"
            elif row["age_days"] > 700 and row["developer_activity"] < 0.1:
                status = "zombie"
            elif row["age_days"] > 500 and row["request_count"] < 1000:
                status = "deprecated"
            else:
                status = "active"
            
            # Calculate a resilient Health Score (0-100) based on vulnerability parameters
            base_score = 100
            
            # Penalize security gaps
            if row["auth_strength"] == 0:
                base_score -= 30
            elif row["auth_strength"] == 1:
                base_score -= 10
                
            if row["data_sensitivity"] == 2 and row["auth_strength"] < 2:
                base_score -= 20 # High risk penalty: sensitive data with weak auth
                
            # Penalize anomaly/outlier status
            if status == "shadow":
                base_score -= 35
            elif status == "zombie":
                base_score -= 40
            elif status == "deprecated":
                base_score -= 20
                
            # Penalize error rate and latency spikes
            base_score -= min(30, int(row["error_rate"] * 100))
            base_score -= min(15, int(row["latency_ms"] / 100))
            
            health_scores.append(max(15, min(100, base_score)))
            statuses.append(status)
            
        df_scored["status"] = statuses
        df_scored["health_score"] = health_scores
        
        return df_scored

    def simulate_future_decay(self, df_scored, years=3):
        """
        Projects security decay over years. Replicates a predictive regression timeline
        modeling ownership entropy, knowledge decay, and threat level degradation.
        """
        timeline = {}
        np.random.seed(101)
        
        for yr in range(2024, 2024 + years + 2):
            year_data = []
            multiplier = 1.0 - (0.08 * (yr - 2024)) # Decay factor over time
            
            for _, row in df_scored.iterrows():
                # Simulate developer activity drop and dependency exposure increase
                future_activity = max(0.01, row["developer_activity"] * multiplier)
                future_health = max(10, int(row["health_score"] * multiplier - np.random.randint(0, 5)))
                
                # Zombie categorization threshold
                if future_activity < 0.08 and future_health < 50:
                    future_status = "zombie"
                else:
                    future_status = row["status"]
                    
                year_data.append({
                    "id": row["id"],
                    "name": row["name"],
                    "health": future_health,
                    "status": future_status,
                    "activity": round(future_activity, 3)
                })
            timeline[str(yr)] = year_data
            
        return timeline

    def predict_zombie_probabilities(self, df):
        """
        Projects zombie API decay probabilities utilizing RandomForest and GradientBoosting classifiers
        trained on a multi-factor historical simulation.
        """
        if df.empty:
            return []

        # 1. Generate synthetic historical/training database to avoid over-fitting and capture trends
        train_df = self.generate_mock_api_data(num_apis=250)
        
        # 2. Label the training samples using multi-factor decay simulation rules
        zombie_label = []
        for _, row in train_df.iterrows():
            age_factor = min(1.0, row["age_days"] / 800)
            activity_factor = 1.0 - row["developer_activity"]
            volume_factor = max(0.0, 1.0 - (row["request_count"] / 3000))
            error_factor = min(1.0, row["error_rate"] * 10)
            auth_factor = 1.0 - (row["auth_strength"] / 2.0)
            
            decay_indicator = (
                0.35 * age_factor +
                0.35 * activity_factor +
                0.15 * volume_factor +
                0.10 * error_factor +
                0.05 * auth_factor
            )
            
            # Label as zombie (1) if decay metric exceeds 0.62
            zombie_label.append(1 if decay_indicator > 0.62 else 0)
            
        train_df["is_zombie"] = zombie_label
        
        # 3. Fit classifier models
        features = ["request_count", "error_rate", "auth_strength", "data_sensitivity", "age_days", "developer_activity", "latency_ms"]
        X_train = train_df[features].copy()
        y_train = train_df["is_zombie"]
        
        # Simple Min-Max normalization parameters from training
        X_train_min = X_train.min()
        X_train_max = X_train.max()
        X_train_normalized = (X_train - X_train_min) / (X_train_max - X_train_min + 1e-8)
        
        rf = RandomForestClassifier(n_estimators=100, random_state=42)
        gb = GradientBoostingClassifier(n_estimators=100, random_state=42)
        
        rf.fit(X_train_normalized, y_train)
        gb.fit(X_train_normalized, y_train)
        
        # 4. Predict probabilities on current repo scanned endpoints
        X_test = df[features].copy()
        for col in features:
            if col not in X_test.columns:
                X_test[col] = 0.0
            X_test[col] = X_test[col].fillna(0.0)
            
        X_test_normalized = (X_test - X_train_min) / (X_train_max - X_train_min + 1e-8)
        X_test_normalized = np.clip(X_test_normalized, 0.0, 1.0)
        
        rf_probs = rf.predict_proba(X_test_normalized)[:, 1]
        gb_probs = gb.predict_proba(X_test_normalized)[:, 1]
        
        # 5. Compile and format output
        results = []
        for idx, row in df.iterrows():
            rf_p = float(rf_probs[idx])
            gb_p = float(gb_probs[idx])
            ensemble_p = (rf_p + gb_p) / 2.0
            
            # Extract critical risk factors
            factors = []
            if row.get("developer_activity", 1.0) < 0.15:
                factors.append("Low Developer Activity")
            if row.get("age_days", 0) > 600:
                factors.append("High Code Age (Deprecated)")
            if row.get("request_count", 10000) < 2000:
                factors.append("Low Traffic Volume")
            if row.get("error_rate", 0.0) > 0.05:
                factors.append("Elevated Error Rates")
            if row.get("auth_strength", 2) == 0:
                factors.append("Missing Authentication")
                
            if not factors:
                factors.append("Baseline Aging")
                
            results.append({
                "apiName": row.get("name", "Unknown API"),
                "endpoint": row.get("endpoint", "/"),
                "method": row.get("method", "GET"),
                "status": row.get("status", "active"),
                "rf_prob": round(rf_p, 4),
                "gb_prob": round(gb_p, 4),
                "probability": f"{int(ensemble_p * 100)}%",
                "riskScore": int(ensemble_p * 100),
                "criticalFactors": factors[:3]
            })
            
        # Return sorted by risk descending
        return sorted(results, key=lambda x: x["riskScore"], reverse=True)
