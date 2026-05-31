import os
import json
import uuid
import numpy as np
import urllib.request
import urllib.error
import urllib.parse

# Lightweight custom REST Client fallback to avoid dependency issues on Windows
class SupabaseRESTClient:
    def __init__(self, url, key):
        self.url = url.rstrip('/')
        self.key = key
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
    def table(self, table_name):
        return SupabaseRESTTable(self, table_name)

class SupabaseRESTTable:
    def __init__(self, client, table_name):
        self.client = client
        self.table_name = table_name
        self.method = "GET"
        self.query_params = ""
        
    def select(self, query="*"):
        self.method = "GET"
        self.query_params = f"?select={query}"
        return self
        
    def eq(self, column, value):
        connector = "&" if "?" in self.query_params else "?"
        self.query_params += f"{connector}{column}=eq.{urllib.parse.quote(str(value))}"
        return self
        
    def upsert(self, records):
        self.method = "POST"
        self.body = records
        self.query_params = ""
        self.headers = self.client.headers.copy()
        self.headers["Prefer"] = "resolution=merge-duplicates"
        return self
        
    def insert(self, records):
        self.method = "POST"
        self.body = records
        self.query_params = ""
        return self
        
    def execute(self):
        url = f"{self.client.url}/rest/v1/{self.table_name}{self.query_params}"
        req = urllib.request.Request(
            url,
            headers=getattr(self, "headers", self.client.headers),
            method=self.method
        )
        if hasattr(self, "body"):
            req.data = json.dumps(self.body).encode("utf-8")
            
        try:
            with urllib.request.urlopen(req) as response:
                res_body = response.read().decode("utf-8")
                data = json.loads(res_body) if res_body else []
                
                class ExecResult:
                    def __init__(self, data):
                        self.data = data
                return ExecResult(data)
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8")
            print(f"Supabase REST error for {self.table_name}: {e.code} - {err_msg}")
            raise Exception(f"HTTP {e.code}: {err_msg}")
        except Exception as e:
            print(f"Supabase REST connection error for {self.table_name}: {e}")
            raise e


class AurenityDBManager:
    def __init__(self):
        # 1. Supabase PostgreSQL Config
        self.supabase_url = os.environ.get("SUPABASE_URL", "").strip()
        self.supabase_key = os.environ.get("SUPABASE_KEY", "").strip()
        self.supabase_client = None
        self.supabase_active = False

        if self.supabase_url and self.supabase_key:
            try:
                # Try importing official SDK first
                from supabase import create_client
                self.supabase_client = create_client(self.supabase_url, self.supabase_key)
                self.supabase_active = True
                print("DATABASE ENGINE: Connected to Supabase PostgreSQL using SDK.")
            except Exception as e:
                print("DATABASE ENGINE: Supabase SDK not available or failed. Initializing custom REST client fallback...")
                try:
                    self.supabase_client = SupabaseRESTClient(self.supabase_url, self.supabase_key)
                    self.supabase_active = True
                    print("DATABASE ENGINE: Connected to Supabase PostgreSQL using REST Client.")
                except Exception as ex:
                    print(f"DATABASE ENGINE: Supabase REST client initialization failed: {ex}")

        # Local JSON persistence path (stored in root folder of the project to avoid backend StatReload loops)
        self.local_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "db.json"))
        print(f"DATABASE ENGINE: Local JSON database path: {self.local_db_path}")

        # 2. Neo4j Graph Aura Config
        self.neo4j_uri = os.environ.get("NEO4J_URI", "").strip()
        self.neo4j_user = os.environ.get("NEO4J_USER", "").strip()
        self.neo4j_password = os.environ.get("NEO4J_PASSWORD", "").strip()
        self.neo4j_driver = None
        self.neo4j_active = False

        if self.neo4j_uri and self.neo4j_user and self.neo4j_password:
            try:
                from neo4j import GraphDatabase
                self.neo4j_driver = GraphDatabase.driver(
                    self.neo4j_uri, 
                    auth=(self.neo4j_user, self.neo4j_password)
                )
                self.neo4j_driver.verify_connectivity()
                self.neo4j_active = True
                print("DATABASE ENGINE: Connected to Neo4j Aura Graph.")
            except Exception as e:
                print(f"DATABASE ENGINE: Neo4j connection failed: {e}")

        # 3. Qdrant Vector DB Config
        self.qdrant_host = os.environ.get("QDRANT_HOST", "").strip()
        self.qdrant_key = os.environ.get("QDRANT_API_KEY", "").strip()
        self.qdrant_client = None
        self.qdrant_active = False

        if self.qdrant_host:
            try:
                from qdrant_client import QdrantClient
                if self.qdrant_key:
                    self.qdrant_client = QdrantClient(url=self.qdrant_host, api_key=self.qdrant_key)
                else:
                    self.qdrant_client = QdrantClient(url=self.qdrant_host)
                self.qdrant_active = True
                print("DATABASE ENGINE: Connected to Qdrant Vector DB.")
            except Exception as e:
                print(f"DATABASE ENGINE: Qdrant connection failed: {e}")

        # 4. Redis Cache Config
        self.redis_url = os.environ.get("REDIS_URL", "").strip()
        self.redis_client = None
        self.redis_active = False

        if self.redis_url:
            try:
                import redis
                self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
                self.redis_client.ping()
                self.redis_active = True
                print("DATABASE ENGINE: Connected to Redis Cache.")
            except Exception as e:
                print(f"DATABASE ENGINE: Redis connection failed: {e}")

        # In-memory database cache
        self.memory_store = {
            "apis": [],
            "decay": {}
        }
        
        # Load local database into memory store on startup
        self.load_local_db_into_memory()

    # ----------------- Local JSON DB Helpers -----------------
    
    def load_local_db(self) -> dict:
        """Loads the raw local JSON database."""
        if os.path.exists(self.local_db_path):
            try:
                with open(self.local_db_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"DATABASE ENGINE: Failed to read local db.json: {e}")
        return {}

    def save_local_db(self, data: dict):
        """Saves the raw local JSON database."""
        try:
            with open(self.local_db_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"DATABASE ENGINE: Failed to write to local db.json: {e}")

    def load_local_db_into_memory(self):
        """Initializes the memory store from local db.json if available."""
        db_data = self.load_local_db()
        if "latest_scan" in db_data and "apis" in db_data["latest_scan"]:
            self.memory_store["apis"] = db_data["latest_scan"]["apis"]
            print(f"DATABASE ENGINE: Initialized memory cache with {len(self.memory_store['apis'])} APIs from local db.json.")

    # ----------------- Unified Scan Report CRUD -----------------
    
    def save_scan_report(self, repo_url: str, report: dict):
        """Saves a complete repository intelligence scan report to local JSON and Supabase PostgreSQL."""
        # 1. Update in-memory cache and local file
        self.memory_store["apis"] = report.get("apis", [])
        
        db_data = self.load_local_db()
        db_data["latest_scan"] = report
        if "scans" not in db_data:
            db_data["scans"] = {}
        db_data["scans"][repo_url] = report
        self.save_local_db(db_data)
        print("DATABASE ENGINE: Saved scan report locally to db.json.")

        # 2. Write to Neo4j and Qdrant
        if self.neo4j_active:
            self._sync_neo4j_graph(report.get("apis", []))
        if self.qdrant_active:
            self._sync_qdrant_vectors(report.get("apis", []))

        # 3. Save to Supabase (each table insert handles missing schema/tables gracefully)
        if self.supabase_active:
            try:
                # 3.1 Save to repositories table
                metadata = report.get("metadata", {})
                repo_record = {
                    "id": metadata.get("id", str(uuid.uuid4())),
                    "name": metadata.get("name", "Unknown Repo"),
                    "url": repo_url,
                    "language": metadata.get("language", "Unknown"),
                    "framework": metadata.get("framework", "Unknown"),
                    "file_count": int(metadata.get("file_count", 0))
                }
                try:
                    self.supabase_client.table("repositories").upsert(repo_record).execute()
                    print("[Supabase] Saved repository metadata.")
                except Exception as err:
                    print(f"[Supabase] Skip 'repositories' insert: {err}")

                # 3.2 Save to scans table
                scan_record = {
                    "id": report.get("scan_id", str(uuid.uuid4())),
                    "repository_url": repo_url,
                    "status": "completed",
                    "api_count": int(metadata.get("api_count", 0))
                }
                scan_id = scan_record["id"]
                try:
                    self.supabase_client.table("scans").upsert(scan_record).execute()
                    print(f"[Supabase] Saved scan log: {scan_id}.")
                except Exception as err:
                    print(f"[Supabase] Skip 'scans' insert: {err}")

                # 3.3 Save API Endpoints
                apis_records = []
                for item in report.get("apis", []):
                    apis_records.append({
                        "id": item.get("id") or f"api-{str(uuid.uuid4())[:8]}",
                        "scan_id": scan_id,
                        "name": item.get("name", "API Endpoint"),
                        "method": item.get("method", "GET"),
                        "endpoint": item.get("endpoint", "/"),
                        "file_source": item.get("file_source", ""),
                        "service": item.get("service", "Default Service"),
                        "confidence": float(item.get("confidence", 1.0))
                    })
                if apis_records:
                    try:
                        self.supabase_client.table("api_endpoints").upsert(apis_records).execute()
                        print(f"[Supabase] Saved {len(apis_records)} API Endpoints.")
                    except Exception as err:
                        print(f"[Supabase] Skip 'api_endpoints' insert: {err}")

                # 3.4 Save Authentication findings
                auth_records = []
                for item in report.get("auth", []):
                    auth_records.append({
                        "id": f"auth-{str(uuid.uuid4())[:8]}",
                        "scan_id": scan_id,
                        "auth_type": item.get("type", "Unknown Auth"),
                        "file_source": item.get("file_source", ""),
                        "confidence": float(item.get("confidence", 1.0))
                    })
                if auth_records:
                    try:
                        self.supabase_client.table("authentication_findings").insert(auth_records).execute()
                        print(f"[Supabase] Saved {len(auth_records)} Auth mechanisms.")
                    except Exception as err:
                        print(f"[Supabase] Skip 'authentication_findings' insert: {err}")

                # 3.5 Save Database findings
                db_records = []
                for item in report.get("databases", []):
                    db_records.append({
                        "id": f"db-{str(uuid.uuid4())[:8]}",
                        "scan_id": scan_id,
                        "database_type": item.get("type", "Unknown DB"),
                        "connection_method": item.get("connection_method", ""),
                        "file_source": item.get("file_source", "")
                    })
                if db_records:
                    try:
                        self.supabase_client.table("database_findings").insert(db_records).execute()
                        print(f"[Supabase] Saved {len(db_records)} DB findings.")
                    except Exception as err:
                        print(f"[Supabase] Skip 'database_findings' insert: {err}")

                # 3.6 Save External Integrations
                ext_records = []
                for item in report.get("external_integrations", []):
                    ext_records.append({
                        "id": f"ext-{str(uuid.uuid4())[:8]}",
                        "scan_id": scan_id,
                        "service_name": item.get("service_name", "Third Party"),
                        "endpoint": item.get("endpoint", ""),
                        "file_source": item.get("file_source", "")
                    })
                if ext_records:
                    try:
                        self.supabase_client.table("external_integrations").insert(ext_records).execute()
                        print(f"[Supabase] Saved {len(ext_records)} External Integrations.")
                    except Exception as err:
                        print(f"[Supabase] Skip 'external_integrations' insert: {err}")

                # 3.7 Save Environment Variables
                env_records = []
                for item in report.get("env_vars", []):
                    env_records.append({
                        "id": f"env-{str(uuid.uuid4())[:8]}",
                        "scan_id": scan_id,
                        "name": item.get("name", "ENV_VAR"),
                        "file_source": item.get("file_source", "")
                    })
                if env_records:
                    try:
                        self.supabase_client.table("environment_variables").insert(env_records).execute()
                        print(f"[Supabase] Saved {len(env_records)} Env vars.")
                    except Exception as err:
                        print(f"[Supabase] Skip 'environment_variables' insert: {err}")

                # 3.8 Save Security Findings
                sec_records = []
                for item in report.get("security_findings", []):
                    sec_records.append({
                        "id": f"sec-{str(uuid.uuid4())[:8]}",
                        "scan_id": scan_id,
                        "finding": item.get("finding", "Issue"),
                        "severity": item.get("severity", "Low"),
                        "file": item.get("file", ""),
                        "recommendation": item.get("recommendation", "")
                    })
                if sec_records:
                    try:
                        self.supabase_client.table("security_findings").insert(sec_records).execute()
                        print(f"[Supabase] Saved {len(sec_records)} Security findings.")
                    except Exception as err:
                        print(f"[Supabase] Skip 'security_findings' insert: {err}")

                # 3.9 Save Architecture summaries
                arch = report.get("architecture", {})
                arch_record = {
                    "id": f"arch-{str(uuid.uuid4())[:8]}",
                    "scan_id": scan_id,
                    "flow": arch.get("flow", ""),
                    "summary": arch.get("summary", "")
                }
                try:
                    self.supabase_client.table("architecture_summaries").insert(arch_record).execute()
                    print("[Supabase] Saved Architecture summaries.")
                except Exception as err:
                    print(f"[Supabase] Skip 'architecture_summaries' insert: {err}")

                # 3.10 Save AI Summaries
                ai_sum = report.get("ai_summary", {})
                ai_record = {
                    "id": f"ai-{str(uuid.uuid4())[:8]}",
                    "scan_id": scan_id,
                    "purpose": ai_sum.get("purpose", ""),
                    "architecture": ai_sum.get("architecture", ""),
                    "apis": ai_sum.get("apis", ""),
                    "auth": ai_sum.get("auth", ""),
                    "database": ai_sum.get("database", ""),
                    "security": ai_sum.get("security", ""),
                    "executive": ai_sum.get("executive", "")
                }
                try:
                    self.supabase_client.table("ai_summaries").insert(ai_record).execute()
                    print("[Supabase] Saved AI summary analysis.")
                except Exception as err:
                    print(f"[Supabase] Skip 'ai_summaries' insert: {err}")

            except Exception as e:
                print(f"DATABASE ENGINE: Supabase batch insert encountered error: {e}")

    def load_scan_report(self, repo_url: str = None) -> dict:
        """Loads a complete repository intelligence scan report. Falls back to local JSON."""
        # Try loading from local db.json first for high-speed local development
        db_data = self.load_local_db()
        if repo_url:
            if "scans" in db_data and repo_url in db_data["scans"]:
                return db_data["scans"][repo_url]
        else:
            if "latest_scan" in db_data:
                return db_data["latest_scan"]

        # Default fallback structure if nothing exists
        return {}

    # ----------------- Backward Compatibility CRUD -----------------
    
    def save_apis(self, apis_list):
        """Legacy helper to save list of APIs."""
        self.memory_store["apis"] = apis_list
        db_data = self.load_local_db()
        if "latest_scan" not in db_data:
            db_data["latest_scan"] = {}
        db_data["latest_scan"]["apis"] = apis_list
        self.save_local_db(db_data)

        # Legacy direct API table write
        if self.supabase_active:
            try:
                records = []
                for api in apis_list:
                    records.append({
                        "id": api.get("id") or f"api-{str(uuid.uuid4())[:8]}",
                        "name": api.get("name"),
                        "endpoint": api.get("endpoint"),
                        "method": api.get("method", "GET"),
                        "status": api.get("status", "active"),
                        "auth_strength": int(api.get("auth_strength", 0)),
                        "data_sensitivity": int(api.get("data_sensitivity", 0)),
                        "age_days": int(api.get("age_days", 10)),
                        "developer_activity": float(api.get("developer_activity", 0.5)),
                        "latency_ms": float(api.get("latency_ms", 100)),
                        "error_rate": float(api.get("error_rate", 0.0)),
                        "request_count": int(api.get("request_count", 0)),
                        "health_score": int(api.get("health_score", 100))
                    })
                self.supabase_client.table("apis").upsert(records).execute()
            except Exception as e:
                print(f"DATABASE ENGINE: Legacy Supabase upsert skipped: {e}")

    def load_apis(self):
        """Loads APIs list, falling back to memory store."""
        if not self.memory_store["apis"]:
            db_data = self.load_local_db()
            if "latest_scan" in db_data and "apis" in db_data["latest_scan"]:
                self.memory_store["apis"] = db_data["latest_scan"]["apis"]
        return self.memory_store["apis"]

    # ----------------- Neo4j Graph DB Sync -----------------
    
    def _sync_neo4j_graph(self, apis_list):
        try:
            with self.neo4j_driver.session() as session:
                session.run("MATCH (n) DETACH DELETE n")
                for api in apis_list:
                    session.run(
                        "CREATE (a:ApiNode {id: $id, name: $name, endpoint: $endpoint, status: $status, health: $health})",
                        id=api.get("id", str(uuid.uuid4())),
                        name=api.get("name", "API"),
                        endpoint=api.get("endpoint", "/"),
                        status=api.get("status", "active"),
                        health=api.get("health_score", 90)
                    )
                for i in range(len(apis_list) - 1):
                    session.run(
                        """
                        MATCH (a:ApiNode {id: $from_id}), (b:ApiNode {id: $to_id})
                        CREATE (a)-[:DEPENDS_ON {strength: $strength}]->(b)
                        """,
                        from_id=apis_list[i].get("id"),
                        to_id=apis_list[i+1].get("id"),
                        strength="critical" if i % 2 == 0 else "medium"
                    )
                print("DATABASE ENGINE: Synced graph nodes with Neo4j.")
        except Exception as e:
            print(f"DATABASE ENGINE: Neo4j Sync failed: {e}")

    # ----------------- Qdrant Vector DB Embeddings -----------------
    
    def _sync_qdrant_vectors(self, apis_list):
        try:
            collection_name = "aurenity_apis"
            collections = self.qdrant_client.get_collections()
            exist = any(c.name == collection_name for c in collections.collections)
            
            if not exist:
                from qdrant_client.models import Distance, VectorParams
                self.qdrant_client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
                )

            points = []
            for idx, api in enumerate(apis_list):
                summary = f"API Endpoint: {api['endpoint']}, Method: {api.get('method', 'GET')}. " \
                          f"Friendly Name: {api['name']}. Status: {api.get('status', 'active')}. " \
                          f"Health Indicator: {api.get('health_score', 100)}/100."
                np.random.seed(idx)
                mock_vector = np.random.randn(1536).tolist()
                
                from qdrant_client.models import PointStruct
                points.append(PointStruct(
                    id=idx + 1,
                    vector=mock_vector,
                    payload={"id": api.get("id"), "name": api["name"], "endpoint": api["endpoint"], "summary": summary}
                ))
            
            self.qdrant_client.upsert(collection_name=collection_name, points=points)
            print(f"DATABASE ENGINE: Synced vectors with Qdrant.")
        except Exception as e:
            print(f"DATABASE ENGINE: Qdrant Sync failed: {e}")

    # ----------------- Redis Caching -----------------
    
    def set_cache(self, key, value, expire=300):
        if self.redis_active:
            try:
                self.redis_client.setex(key, expire, json.dumps(value))
                return True
            except Exception as e:
                print(f"DATABASE ENGINE: Redis Cache set failed: {e}")
        self.memory_store["decay"][key] = value
        return True

    def get_cache(self, key):
        if self.redis_active:
            try:
                data = self.redis_client.get(key)
                if data:
                    return json.loads(data)
            except Exception as e:
                print(f"DATABASE ENGINE: Redis Cache get failed: {e}")
        return self.memory_store["decay"].get(key)
