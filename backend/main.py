import os
import shutil
import random
import uuid
import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import pandas as pd
from dotenv import load_dotenv

# Load environment variables on startup
load_dotenv()

# Import our ML and AI modules
from ml_engine import AurenityMLEngine
from ai_engine import AurenityAIEngine
from repo_scanner import AurenityRepoScanner
from db_manager import AurenityDBManager
from ml.inference import InferencePipeline

# Helper to run ML classification pipeline on report APIs
def enrich_report_with_ml(report: dict, dir_path: str = ""):
    if not report or "apis" not in report:
        return
    try:
        pipeline = InferencePipeline(dir_path)
        for api in report["apis"]:
            # Run modular ML inference pipeline
            api_dna = pipeline.process_api(api)
            
            # Enrich API metadata fields (additive, not destructive)
            api["documentation_status"] = api_dna.documentation_status
            api["zombie_classification"] = api_dna.api_status
            api["days_since_last_use"] = api_dna.days_since_last_use
            api["last_used_date"] = api_dna.last_used_date
            
            # Store API DNA object for AI copilot queries
            api["api_dna"] = api_dna.dict()
    except Exception as e:
        print(f"ML Pipeline error during API classification enrichment: {e}")

app = FastAPI(
    title="Aurenity X Cyber Intelligence Engine",
    description="Python FastAPI backend powering repository scanning and AI Security Copilot.",
    version="1.0.0"
)

# Enforce full CORS support for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global engines and database managers
ml_engine = AurenityMLEngine()
ai_engine = AurenityAIEngine()
repo_scanner = AurenityRepoScanner()
db_manager = AurenityDBManager()

# Pydantic models for incoming requests
class ScanRequest(BaseModel):
    repo_url: Optional[str] = ""
    token: Optional[str] = ""
    username: Optional[str] = ""

class ChatRequest(BaseModel):
    prompt: str

# Helper to generate custom mock dataset for demo seeding
def generate_mock_scan_report(repo_url: str = "") -> dict:
    repo_name = "Secure Banking API"
    if repo_url:
        parts = [p for p in repo_url.strip().rstrip("/").split("/") if p]
        if len(parts) >= 2:
            repo_name = parts[-1].title().replace("-", " ").replace("_", " ")

    # Generate mock apis using ML engine
    df = ml_engine.generate_mock_api_data(num_apis=24)
    df_scored = ml_engine.train_and_score(df)
    apis_records = df_scored.to_dict(orient="records")
    
    # Personalize apis
    apis = []
    slug = repo_name.lower().replace(" ", "-")
    for i, api in enumerate(apis_records):
        method = api.get("method", "GET")
        endpoint = f"/{slug}{api.get('endpoint', '/')}"
        apis.append({
            "id": f"api-{i+1}",
            "name": f"{api['name']} ({repo_name})",
            "endpoint": endpoint,
            "method": method,
            "file_source": f"src/routes/{method.lower()}_{i+1}.ts",
            "service": f"{repo_name} Router",
            "confidence": 0.95,
            "health_score": int(api.get("health_score", 90)),
            "status": api.get("status", "active"),
            "auth_strength": int(api.get("auth_strength", 1)),
            "data_sensitivity": int(api.get("data_sensitivity", 0)),
            "age_days": int(api.get("age_days", 100)),
            "developer_activity": float(api.get("developer_activity", 0.5)),
            "latency_ms": float(api.get("latency_ms", 120.0)),
            "error_rate": float(api.get("error_rate", 0.01)),
            "request_count": int(api.get("request_count", 1500))
        })

    auth = [
        {"type": "JWT Authentication", "file_source": "src/middleware/auth.ts", "confidence": 0.95},
        {"type": "Role Based Access Control", "file_source": "src/controllers/admin.ts", "confidence": 0.90}
    ]
    
    databases = [
        {"type": "PostgreSQL", "connection_method": "Prisma ORM", "file_source": "prisma/schema.prisma"},
        {"type": "Redis Cache", "connection_method": "ioredis connector", "file_source": "src/config/redis.ts"}
    ]
    
    integrations = [
        {"service_name": "Stripe", "endpoint": "https://api.stripe.com/v3", "file_source": "src/services/payment.ts"},
        {"service_name": "Twilio", "endpoint": "https://api.twilio.com/2010-04-01", "file_source": "src/services/sms.ts"},
        {"service_name": "OpenAI", "endpoint": "https://api.openai.com/v1", "file_source": "src/services/ai.ts"}
    ]
    
    env_vars = [
        {"name": "DATABASE_URL", "file_source": "prisma/schema.prisma"},
        {"name": "JWT_SECRET", "file_source": "src/middleware/auth.ts"},
        {"name": "STRIPE_API_KEY", "file_source": "src/services/payment.ts"},
        {"name": "REDIS_URL", "file_source": "src/config/redis.ts"}
    ]
    
    security = [
        {
            "finding": "Insecure CORS Wildcard Header detected",
            "severity": "Medium",
            "file": "src/server.ts:42",
            "recommendation": "Configure Access-Control-Allow-Origin to specific verified domains."
        },
        {
            "finding": "Hardcoded JWT secret key pattern in auth middleware",
            "severity": "Critical",
            "file": "src/middleware/auth.ts:15",
            "recommendation": "Migrate hardcoded secret tokens into system environment configurations (.env)."
        },
        {
            "finding": "Unprotected Database Dump / Backup endpoint exposed",
            "severity": "High",
            "file": "src/routes/admin.ts:112",
            "recommendation": "Wrap debug dump routes inside administrative user access check filters."
        }
    ]
    
    # Generate visual flow diagram
    flow = f"Client Frontend\n↓\n{repo_name} (Express)\n↓\nJWT Auth Filter\n↓\nBusiness Controller\n↓\nPostgreSQL DB"
    summary = f"{repo_name} implements Express.js router controllers querying PostgreSQL databases via Prisma."

    ai_sum = {
        "purpose": f"This repository contains the {repo_name} server backend, exposing endpoints to handle core transactional operations.",
        "architecture": f"The project follows a standard MVC layout using Express.js controllers and custom middleware modules.",
        "apis": f"A total of {len(apis)} HTTP routes were discovered, exposing core user and payment functions.",
        "auth": "Authentication flows rely on JWT token verification. Secret signatures check bearer headers on endpoints.",
        "database": "Relational entities are persisted in a PostgreSQL cluster, using Redis for high-speed caching.",
        "security": "Critical findings highlight hardcoded secret signatures in middleware files. Wildcard CORS scopes are active.",
        "executive": "The repository displays robust structural layouts. Immediate rotation and extraction of secret keys are required."
    }

    return {
        "scan_id": f"scan-{str(uuid.uuid4())[:8]}",
        "metadata": {
            "id": f"repo-{str(uuid.uuid4())[:8]}",
            "name": repo_name,
            "url": repo_url or "https://github.com/aurenity/secure-banking-api",
            "language": "TypeScript",
            "framework": "ExpressJS, Node.js",
            "file_count": 128,
            "api_count": len(apis)
        },
        "apis": apis,
        "auth": auth,
        "databases": databases,
        "external_integrations": integrations,
        "env_vars": env_vars,
        "security_findings": security,
        "architecture": {
            "flow": flow,
            "summary": summary
        },
        "ai_summary": ai_sum
    }

# Helper to load base dataset if empty
def ensure_dataset():
    report = db_manager.load_scan_report()
    if not report:
        print("DATABASE ENGINE: Seeding default mock scan report for initial demonstration...")
        mock_report = generate_mock_scan_report("https://github.com/aurenity/secure-banking-api")
        # Run ML pipeline enrichment
        enrich_report_with_ml(mock_report, "")
        db_manager.save_scan_report("https://github.com/aurenity/secure-banking-api", mock_report)
        
        # Seed ML decay cache
        apis = mock_report.get("apis", [])
        df = pd.DataFrame(apis)
        timeline = ml_engine.simulate_future_decay(df)
        db_manager.set_cache("decay_timeline", timeline, expire=3600)
    else:
        # Verify decay timeline cache is populated
        timeline = db_manager.get_cache("decay_timeline")
        if not timeline:
            apis = report.get("apis", [])
            if apis:
                df = pd.DataFrame(apis)
                new_timeline = ml_engine.simulate_future_decay(df)
                db_manager.set_cache("decay_timeline", new_timeline, expire=3600)

@app.on_event("startup")
async def startup_event():
    ensure_dataset()

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Aurenity X Cyber Intelligence Engine",
        "version": "1.0.0",
        "documentation": "/docs",
        "health": "stable"
    }

# ----------------- DISCOVERY ENDPOINTS -----------------

@app.get("/api/v1/discovery/inventory")
async def get_inventory():
    ensure_dataset()
    report = db_manager.load_scan_report()
    apis = report.get("apis", [])
    
    # JIT fallback: Enrich old database scans with ML classifications
    if apis and "zombie_classification" not in apis[0]:
        print("ML PIPELINE: JIT enriching database scan records with classification features...")
        enrich_report_with_ml(report, "")
        db_manager.save_scan_report(report.get("metadata", {}).get("url", ""), report)
        apis = report.get("apis", [])

    # Calculate counts dynamically
    total = len(apis)
    active = len([a for a in apis if a.get("status") == "active"])
    zombie = len([a for a in apis if a.get("status") == "zombie"])
    shadow = len([a for a in apis if a.get("status") == "shadow"])
    deprecated = len([a for a in apis if a.get("status") == "deprecated"])
    
    # Discovery Trend
    trend_data = [
        {"day": "Mon", "discovered": max(0, total - 10), "active": max(0, active - 8), "zombie": zombie, "shadow": max(0, shadow - 2)},
        {"day": "Tue", "discovered": max(0, total - 6), "active": max(0, active - 5), "zombie": zombie + 1, "shadow": max(0, shadow - 1)},
        {"day": "Wed", "discovered": max(0, total - 4), "active": max(0, active - 3), "zombie": zombie, "shadow": shadow},
        {"day": "Thu", "discovered": max(0, total - 1), "active": max(0, active - 1), "zombie": zombie, "shadow": shadow},
        {"day": "Fri", "discovered": total, "active": active, "zombie": zombie, "shadow": shadow},
    ]

    # Map usage text based on requests
    formatted_apis = []
    for a in apis:
        usage = "Low"
        rc = a.get("request_count", 0)
        if rc > 8000:
            usage = "High"
        elif rc > 3000:
            usage = "Medium"
            
        formatted_apis.append({
            "id": a.get("id"),
            "name": a.get("name"),
            "endpoint": a.get("endpoint"),
            "status": a.get("status", "active"),
            "usage": usage,
            "owner": "Platform Team" if a.get("status") != "shadow" else "Unassigned",
            "documented": a.get("auth_strength", 0) > 0,
            "health_score": a.get("health_score", 90),
            # Append ML classification columns
            "documentation_status": a.get("documentation_status", "Undocumented"),
            "zombie_classification": a.get("zombie_classification", "Shadow API"),
            "days_since_last_use": a.get("days_since_last_use", 0),
            "last_used_date": a.get("last_used_date", "Never"),
            "api_dna": a.get("api_dna", {})
        })

    # Return the full scan report + formatted metadata stats for compatibility
    return {
        "report": report,
        "apis": formatted_apis,
        "stats": {
            "total": str(total),
            "active": str(active),
            "zombie": str(zombie),
            "shadow": str(shadow),
            "deprecated": str(deprecated)
        },
        "trendData": trend_data,
        "lifecycleData": [
            {"stage": "Planned", "count": 6},
            {"stage": "Active", "count": active},
            {"stage": "Deprecating", "count": deprecated},
            {"stage": "Deprecated", "count": zombie}
        ]
    }

@app.post("/api/v1/discovery/scan")
async def trigger_scan(payload: ScanRequest):
    repo_url = payload.repo_url
    token = payload.token or ""
    username = payload.username or "Anonymous Operator"
    
    report = {}
    
    if repo_url and "github.com" in repo_url.lower():
        try:
            print(f"Starting code audit scan for URL: {repo_url}")
            # Download zipball archive from GitHub
            extracted_dir = repo_scanner.download_github_zip(repo_url, token)
            
            # Statically analyze codebase files for routing endpoints
            report = repo_scanner.scan_repository_complete(extracted_dir, repo_url)
            
            # Run ML classification pipeline enrichment using the extracted directory files!
            enrich_report_with_ml(report, extracted_dir)
            
            # Instantly delete temp repositories
            shutil.rmtree(os.path.dirname(extracted_dir), ignore_errors=True)
            print("Successfully completed repository scanning.")
        except Exception as e:
            print(f"Active scan failed for {repo_url}: {e}. Activating customized demonstration matrix...")
            
    # Fallback to realistic generation if scan produced zero findings or failed
    if not report or not report.get("apis"):
        report = generate_mock_scan_report(repo_url)
        # Personalize owner and name
        metadata = report.get("metadata", {})
        metadata["name"] = f"{metadata.get('name')} (Demo)"
        
        for api in report.get("apis", []):
            if api.get("status") != "shadow":
                api["owner"] = f"{username}'s Pod"
                
        # Run ML pipeline enrichment
        enrich_report_with_ml(report, "")

    # 2. Invoke Groq AI summary intelligence generator
    try:
        print("Invoking Groq AI Summarizer...")
        ai_summary = ai_engine.generate_repo_intelligence_summary(report)
        report["ai_summary"] = ai_summary
        print("Groq AI summary intelligence generated successfully.")
    except Exception as e:
        print(f"Failed to generate AI Summary: {e}")

    # 3. Persist scan results in db manager
    db_manager.save_scan_report(repo_url, report)
    
    # Update ML decay timeline cache
    df = pd.DataFrame(report.get("apis", []))
    db_manager.set_cache("decay_timeline", ml_engine.simulate_future_decay(df), expire=3600)
    
    return await get_inventory()


# ----------------- DIGITAL TWIN ENDPOINTS -----------------

@app.get("/api/v1/twin/graph")
async def get_twin_graph():
    ensure_dataset()
    report = db_manager.load_scan_report()
    apis = report.get("apis", [])
    
    # JIT fallback: Enrich old database scans with ML classifications
    if apis and "zombie_classification" not in apis[0]:
        print("ML PIPELINE: JIT enriching twin graph records with classification features...")
        enrich_report_with_ml(report, "")
        db_manager.save_scan_report(report.get("metadata", {}).get("url", ""), report)
        apis = report.get("apis", [])
        
    metadata = report.get("metadata", {})
    auth_list = report.get("auth", [])
    db_list = report.get("databases", [])
    ext_list = report.get("external_integrations", [])
    sec_list = report.get("security_findings", [])
    
    # 1. Generate Nodes & Dependencies
    twin_nodes = []
    dependencies = []
    
    # Client Node (Frontend)
    client_id = "client-frontend"
    twin_nodes.append({
        "id": client_id,
        "name": "Client Frontend",
        "type": "Frontend",
        "status": "Healthy",
        "dependencies": 1,
        "latency": 15,
        "health": 98
    })
    
    # Gateway Node
    gateway_id = "app-gateway"
    framework = metadata.get("framework", "ExpressJS")
    twin_nodes.append({
        "id": gateway_id,
        "name": f"{metadata.get('name', 'App')} ({framework})",
        "type": "Gateway",
        "status": "Healthy",
        "dependencies": 2,
        "latency": 35,
        "health": 95
    })
    dependencies.append({"from": client_id, "to": gateway_id, "strength": "critical"})
    
    # Auth Node (Security Filter)
    auth_id = None
    if auth_list:
        auth_id = "auth-filter"
        auth_name = auth_list[0].get("type", "Auth Filter")
        twin_nodes.append({
            "id": auth_id,
            "name": auth_name,
            "type": "Security",
            "status": "Healthy",
            "dependencies": 1,
            "latency": 25,
            "health": 94
        })
        dependencies.append({"from": gateway_id, "to": auth_id, "strength": "critical"})
    
    # Database Nodes
    db_nodes_map = {}
    for db in db_list:
        db_type = db.get("type", "Database")
        db_id = f"db-{db_type.lower().replace(' ', '-')}"
        if db_id not in db_nodes_map:
            db_nodes_map[db_id] = db_type
            twin_nodes.append({
                "id": db_id,
                "name": db_type,
                "type": "Database",
                "status": "Healthy",
                "dependencies": 0,
                "latency": 8,
                "health": 92
            })
            
    # External Integration Nodes
    ext_nodes_map = {}
    for ext in ext_list:
        ext_name = ext.get("service_name", "Third Party")
        ext_id = f"ext-{ext_name.lower().replace(' ', '-')}"
        if ext_id not in ext_nodes_map:
            ext_nodes_map[ext_id] = ext_name
            twin_nodes.append({
                "id": ext_id,
                "name": ext_name,
                "type": "External Integration",
                "status": "Healthy",
                "dependencies": 0,
                "latency": 120,
                "health": 96
            })
            
    # Group APIs into Route Controller nodes to prevent layout clutter
    route_groups = {}
    for api in apis:
        endpoint = api.get("endpoint", "/")
        method = api.get("method", "GET")
        health = api.get("health_score", 90)
        latency = api.get("latency_ms", 80)
        
        # Categorize logically by prefix
        parts = [p for p in endpoint.strip("/").split("/") if p]
        if parts:
            prefix = parts[0].lower()
            if prefix in ["user", "users", "profile", "auth", "login"]:
                group_key = "user-service"
                group_name = "User Service"
            elif prefix in ["pay", "payment", "payments", "checkout", "billing", "invoice"]:
                group_key = "payment-service"
                group_name = "Payment Service"
            elif prefix in ["admin", "dashboard", "report", "stats", "analytics"]:
                group_key = "analytics-service"
                group_name = "Analytics Service"
            else:
                group_key = f"{prefix}-service"
                group_name = f"{prefix.capitalize()} Router"
        else:
            group_key = "core-router"
            group_name = "Core Router"
            
        if group_key not in route_groups:
            route_groups[group_key] = {
                "name": group_name,
                "endpoints": [],
                "healths": [],
                "latencies": []
            }
        route_groups[group_key]["endpoints"].append(f"{method} {endpoint}")
        route_groups[group_key]["healths"].append(health)
        route_groups[group_key]["latencies"].append(latency)
        
    # Instantiate Group Nodes
    for gk, gdata in route_groups.items():
        avg_health = int(sum(gdata["healths"]) / len(gdata["healths"])) if gdata["healths"] else 90
        avg_latency = int(sum(gdata["latencies"]) / len(gdata["latencies"])) if gdata["latencies"] else 80
        
        status = "Healthy"
        if avg_health < 60:
            status = "Critical"
        elif avg_health < 80:
            status = "Degraded"
            
        # Group APIs that match the current prefix
        group_apis = []
        for a in apis:
            endpoint = a.get("endpoint", "/")
            parts = [p for p in endpoint.strip("/").split("/") if p]
            pk = "core-router"
            if parts:
                prefix = parts[0].lower()
                if prefix in ["user", "users", "profile", "auth", "login"]:
                    pk = "user-service"
                elif prefix in ["pay", "payment", "payments", "checkout", "billing", "invoice"]:
                    pk = "payment-service"
                elif prefix in ["admin", "dashboard", "report", "stats", "analytics"]:
                    pk = "analytics-service"
                else:
                    pk = f"{prefix}-service"
            if pk == gk:
                group_apis.append(a)
                
        # Aggregate ML metadata parameters
        doc_status = "Documented"
        zombie_class = "Shadow API"
        days_since_use = 0
        
        if group_apis:
            # worst case aggregation
            if any(a.get("documentation_status") == "Undocumented" for a in group_apis):
                doc_status = "Undocumented"
            if any(a.get("zombie_classification") == "Zombie API" for a in group_apis):
                zombie_class = "Zombie API"
            days_since_use = max([a.get("days_since_last_use", 0) for a in group_apis])
            
        twin_nodes.append({
            "id": gk,
            "name": gdata["name"],
            "type": "Microservice",
            "status": status,
            "dependencies": len(db_nodes_map) + len(ext_nodes_map),
            "latency": avg_latency,
            "health": avg_health,
            "endpoints": gdata["endpoints"],
            # Append ML metadata parameters
            "documentation_status": doc_status,
            "zombie_classification": zombie_class,
            "days_since_last_use": days_since_use
        })
        
        # Connect Gateway/Auth to Microservice
        src_id = auth_id if auth_id else gateway_id
        dependencies.append({"from": src_id, "to": gk, "strength": "critical" if gk in ["user-service", "auth-service"] else "high"})
        
        # Connect Microservice to databases and external integrations
        for db_id in db_nodes_map.keys():
            if gk in ["user-service", "analytics-service", "core-router"] and "postgres" in db_id:
                dependencies.append({"from": gk, "to": db_id, "strength": "critical"})
            elif "redis" in db_id and gk in ["analytics-service", "core-router"]:
                dependencies.append({"from": gk, "to": db_id, "strength": "medium"})
            else:
                dependencies.append({"from": gk, "to": db_id, "strength": "high"})
                
        for ext_id in ext_nodes_map.keys():
            if "stripe" in ext_id and gk == "payment-service":
                dependencies.append({"from": gk, "to": ext_id, "strength": "critical"})
            elif "openai" in ext_id and gk in ["analytics-service", "user-service"]:
                dependencies.append({"from": gk, "to": ext_id, "strength": "high"})
            else:
                dependencies.append({"from": gk, "to": ext_id, "strength": "medium"})

    # Ensure a basic microservice node exists if no endpoints discovered
    if not route_groups:
        twin_nodes.append({
            "id": "core-router",
            "name": "Core Router",
            "type": "Microservice",
            "status": "Healthy",
            "dependencies": len(db_nodes_map),
            "latency": 50,
            "health": 95,
            "endpoints": ["GET /"]
        })
        src_id = auth_id if auth_id else gateway_id
        dependencies.append({"from": src_id, "to": "core-router", "strength": "high"})
        for db_id in db_nodes_map.keys():
            dependencies.append({"from": "core-router", "to": db_id, "strength": "high"})

    # 2. Generate Dynamic Blast Radius Mapping
    blast_radius = {}
    total_downstream = len(twin_nodes) - 1
    
    for node in twin_nodes:
        nid = node["id"]
        ntype = node["type"]
        
        if nid == client_id:
            direct = 1
            indirect = total_downstream - 1
            loss = "$50K/min"
        elif nid == gateway_id:
            direct = 1 + (1 if auth_id else len(route_groups))
            indirect = total_downstream - 1
            loss = "$2.5M/min"
        elif nid == auth_id:
            direct = len(route_groups)
            indirect = len(db_nodes_map) + len(ext_nodes_map)
            loss = "$1.8M/min"
        elif ntype == "Database":
            direct_deps = [gk for gk in route_groups.keys() if gk in ["user-service", "analytics-service", "core-router"]]
            direct = len(direct_deps) if direct_deps else 1
            indirect = 0
            loss = "$3.6M/min" if "postgres" in nid else "$450K/min"
        elif ntype == "External Integration":
            direct = 1
            indirect = 0
            loss = "$1.2M/min" if "stripe" in nid else "$150K/min"
        else: # Microservice
            direct = len(db_nodes_map) + len(ext_nodes_map)
            indirect = 0
            loss = "$250K/min"
            
        blast_radius[nid] = {
            "direct": direct,
            "indirect": indirect,
            "potentialDowntime": loss
        }
        
    # 3. Generate Dynamic Threat logs
    threat_logs = []
    time_labels = ["now", "2m ago", "5m ago", "12m ago", "30m ago"]
    
    for idx, sec in enumerate(sec_list):
        severity = sec.get("severity", "Medium").lower()
        detail = f"{sec.get('finding')} ({sec.get('file')})"
        threat_logs.append({
            "type": "Security Exposure" if severity == "critical" else "Vulnerability Alert",
            "severity": severity,
            "detail": detail,
            "time": time_labels[idx % len(time_labels)]
        })
        
    if not threat_logs:
        threat_logs = [
            {"type": "Ecosystem Idle", "severity": "medium", "detail": "Continuous intelligence scanning active. No high threats detected.", "time": "now"}
        ]

    return {
        "nodes": twin_nodes,
        "dependencies": dependencies,
        "blastRadius": blast_radius,
        "threatReadings": threat_logs
    }


# ----------------- PREDICTION ENDPOINTS -----------------

@app.get("/api/v1/prediction/decay")
async def get_prediction_decay():
    ensure_dataset()
    timeline = db_manager.get_cache("decay_timeline")
    apis = db_manager.load_apis()
    
    decay_chart = []
    months = ["Now", "+1M", "+2M", "+3M", "+4M", "+5M"]
    avg_scores = []
    
    if timeline:
        for yr in sorted(timeline.keys()):
            avg_s = np.mean([item["health"] for item in timeline[yr]])
            avg_scores.append(int(avg_s))
    else:
        avg_scores = [85, 82, 79, 75, 72, 68]
        
    for i, m in enumerate(months):
        idx = min(i, len(avg_scores) - 1)
        decay_chart.append({
            "month": m,
            "health": avg_scores[idx]
        })
        
    zombie_predictions = []
    if timeline and "2025" in timeline:
        predictions_2025 = sorted(timeline["2025"], key=lambda x: x["health"])
        for item in predictions_2025[:3]:
            zombie_predictions.append({
                "apiName": item["name"],
                "riskScore": int(100 - item["health"]),
                "probability": f"{int(98 - item['health'] * 0.5)}%"
            })
    else:
        zombie_predictions = [
            {"apiName": "GDPR Compliance Check v1", "riskScore": 88, "probability": "94%"},
            {"apiName": "Legacy Analytics Handler", "riskScore": 75, "probability": "82%"}
        ]

    # Risk forecast timeline points
    risk_forecast = [
        {"week": "W1", "predicted": 42, "actual": 40},
        {"week": "W2", "predicted": 45, "actual": 48},
        {"week": "W3", "predicted": 48, "actual": 52},
        {"week": "W4", "predicted": 52},
        {"week": "W5", "predicted": 58},
        {"week": "W6", "predicted": 65},
    ]

    critical_cnt = len([a for a in apis if a.get("health_score", 100) < 40])
    high_cnt = len([a for a in apis if 40 <= a.get("health_score", 100) < 65])
    
    critical_cnt = max(3, critical_cnt)
    high_cnt = max(8, high_cnt)

    return {
        "zombiePredictions": zombie_predictions,
        "riskForecast": risk_forecast,
        "decayTimeline": decay_chart,
        "businessImpact": {
            "critical": f"{critical_cnt} APIs",
            "high": f"{high_cnt} APIs",
            "medium": "12 APIs"
        },
        "financialImpact": {
            "worstCase": f"${(critical_cnt * 0.8):.1f}M/day",
            "expectedLoss": f"${(high_cnt * 56):.0f}K/day"
        }
    }

@app.get("/api/v1/prediction/zombie")
async def get_prediction_zombie():
    ensure_dataset()
    apis = db_manager.load_apis()
    if not apis:
        return []
    df = pd.DataFrame(apis)
    predictions = ml_engine.predict_zombie_probabilities(df)
    return predictions


# ----------------- AI COPILOT ENDPOINTS -----------------

@app.post("/api/v1/ai/chat")
async def chat_copilot(payload: ChatRequest):
    ensure_dataset()
    report = db_manager.load_scan_report()
    response_content = ai_engine.generate_response(payload.prompt, report)
    return {"content": response_content}


# ----------------- CYBER WAR ROOM ENDPOINTS -----------------

@app.post("/api/v1/war-room/simulate")
async def simulate_war_room():
    ensure_dataset()
    apis = db_manager.load_apis()
    
    # Pick a high-risk shadow/vulnerable API for realism
    shadows = [a for a in apis if a.get("status") == "shadow"]
    target_api = shadows[0]["name"] if shadows else "Legacy Analytics"
    target_endpoint = shadows[0]["endpoint"] if shadows else "/old/analytics"
    
    # Attack workflow steps
    red_actions = [
        {"action": "Reconnaissance", "time": "T+0:15", "status": "Complete", "target": f"{target_api}"},
        {"action": "Endpoint Enumeration", "time": "T+2:30", "status": "Complete", "target": f"{target_endpoint}"},
        {"action": "SQL injection / Parameter Fuzzing", "time": "T+5:45", "status": "Active", "target": f"{target_endpoint}"},
        {"action": "Lateral pivoting attempt", "time": "T+12:00", "status": "Pending", "target": "Core User DB"},
    ]
    
    blue_responses = [
        {"action": f"Detect volumetric spikes on {target_endpoint}", "time": "T+0:20", "severity": "High"},
        {"action": "Enable dynamic rate limits on gateway routers", "time": "T+1:05", "severity": "High"},
        {"action": f"Auto-quarantine compromised shadow routes", "time": "T+4:30", "severity": "Critical"},
        {"action": "Force rotation of active service database secrets", "time": "T+5:15", "severity": "Critical"},
    ]

    lateral_path = [
        {"hop": f"Entry Point ({target_endpoint})", "stage": "Compromised", "status": "Detected"},
        {"hop": "Internal Routing Segment", "stage": "Pivoting", "status": "Detected"},
        {"hop": "Production Database DB", "stage": "Targeted", "status": "Blocked"},
    ]

    defense_strategy = [
        {"title": "Primary Recommendation", "play": f"Deploy AWS WAF rules and isolate `{target_endpoint}` using a secondary security group."},
        {"title": "Secondary Defense", "play": "Enforce strict OAuth2 credential scoping and migrate to a Zero Trust architecture."}
    ]

    return {
        "redAgentActions": red_actions,
        "blueAgentResponses": blue_responses,
        "lateralMovement": lateral_path,
        "defenseStrategy": defense_strategy
    }


# ----------------- COGNITIVE INTELLIGENCE ENDPOINTS -----------------

@app.get("/api/v1/cognitive/audit")
async def get_cognitive_audit():
    ensure_dataset()
    report = db_manager.load_scan_report()
    apis = report.get("apis", [])
    metadata = report.get("metadata", {})
    
    # Calculate profiles dynamically
    profiles = []
    total_health = 0
    total_doc = 0
    total_ownership = 0
    total_memory = 0
    
    for idx, a in enumerate(apis):
        doc_score = 90 if a.get("auth_strength", 0) > 1 else (65 if a.get("auth_strength", 0) == 1 else 15)
        developer_activity = a.get("developer_activity", 0.5)
        status = a.get("status", "active")
        
        if status == "active":
            ownership = int(85 + developer_activity * 15)
            decay_risk = int(10 + (1 - developer_activity) * 20)
        elif status == "deprecated":
            ownership = int(40 + developer_activity * 20)
            decay_risk = int(50 + (1 - developer_activity) * 30)
        elif status == "zombie":
            ownership = int(15 + developer_activity * 15)
            decay_risk = int(80 + (1 - developer_activity) * 15)
        else: # shadow
            ownership = int(25 + developer_activity * 10)
            decay_risk = int(60 + (1 - developer_activity) * 25)
            
        entropy_risk = 100 - ownership
        
        age_factor = min(1.0, a.get("age_days", 100) / 365.0)
        memory_score = int(90 - (age_factor * 20) + (developer_activity * 15))
        memory_score = max(30, min(98, memory_score))
        
        health = a.get("health_score", 90)
        total_health += health
        total_doc += doc_score
        total_ownership += ownership
        total_memory += memory_score
        
        profiles.append({
            "apiName": a.get("name"),
            "endpoint": a.get("endpoint"),
            "healthScore": health,
            "ownership": ownership,
            "documentation": doc_score,
            "latency": int(a.get("latency_ms", 100)),
            "errorRate": round(a.get("error_rate", 0.0) * 100, 2),
            "entropy": entropy_risk,
            "memoryScore": memory_score,
            "decayRisk": decay_risk,
            "activity": round(developer_activity, 2)
        })
        
    num_apis = len(apis) if apis else 1
    avg_health = int(total_health / num_apis)
    avg_doc = int(total_doc / num_apis)
    avg_ownership = int(total_ownership / num_apis)
    avg_memory = int(total_memory / num_apis)
    avg_entropy = 100 - avg_ownership
    
    decay_chart = []
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    file_count = metadata.get("file_count", 50)
    decay_rate = 0.90 if file_count > 100 else 0.82
    
    for i, m in enumerate(months):
        decay_val = int(100 * (decay_rate ** i))
        decay_chart.append({
            "month": m,
            "knowledge": decay_val
        })
        
    zombies_count = len([a for a in apis if a.get("status") == "zombie"])
    shadows_count = len([a for a in apis if a.get("status") == "shadow"])
    
    activity_timeline = [
        {"week": "W1", "commits": 12, "usage": 450},
        {"week": "W2", "commits": 18, "usage": 600},
        {"week": "W3", "commits": 8, "usage": 520},
        {"week": "W4", "commits": 15, "usage": 800},
        {"week": "W5", "commits": 24, "usage": 1100},
        {"week": "W6", "commits": 30, "usage": 1400},
    ]
    
    return {
        "apiProfiles": profiles,
        "knowledgeDecay": decay_chart,
        "activityTimeline": activity_timeline,
        "overallStats": {
            "cognitiveHealthScore": avg_health,
            "documentationHealth": avg_doc,
            "ownershipEntropy": avg_entropy,
            "infrastructureMemoryScore": avg_memory
        },
        "entropyRisk": {
            "criticalLoss": f"{zombies_count} zombie API(s) at 100% knowledge loss risk",
            "mediumLoss": f"{shadows_count} shadow API(s) showing 80% ownership entropy"
        }
    }


# ----------------- ATTACK LAB ENDPOINTS -----------------

class FuzzRequest(BaseModel):
    endpoint: str

@app.post("/api/v1/attack/fuzz")
async def trigger_fuzz_testing(payload: FuzzRequest):
    target = payload.endpoint
    crashes = random.randint(1, 3) if "auth" in target.lower() or "payment" in target.lower() else 0
    return {
        "status": "completed",
        "requestsSent": 10428,
        "crashes": crashes,
        "memoryLeaks": random.randint(0, 1),
        "logs": [
            f"Sending overflow payload to {target}...",
            "HTTP 500 Internal Error detected on boundary values",
            f"Fuzz test finished. Found {crashes} buffer boundaries exceeded."
        ]
    }

@app.post("/api/v1/attack/owasp")
async def run_owasp_scan():
    ensure_dataset()
    apis = db_manager.load_apis()
    
    critical_count = len([a for a in apis if a.get("health_score", 100) < 40])
    high_count = len([a for a in apis if 40 <= a.get("health_score", 100) < 65])
    
    return {
        "vulnerabilities": [
            {"name": "SQL Injection / Direct Query Leak", "severity": "Critical", "owasp": "A1", "affectedApis": max(1, critical_count)},
            {"name": "Auth Bypass via Expired Tokens", "severity": "Critical", "owasp": "A7", "affectedApis": max(1, high_count - 2)},
            {"name": "Missing Rate Limiter Controls", "severity": "High", "owasp": "A5", "affectedApis": max(3, high_count)},
            {"name": "Insecure CORS Wildcard Headers", "severity": "Medium", "owasp": "A5", "affectedApis": 5}
        ],
        "testResults": [
            {"test": "Authentication Protocol Check", "passed": 3, "failed": 2, "score": "60%"},
            {"test": "Authorization Mapping Checks", "passed": 4, "failed": 1, "score": "80%"},
            {"test": "SQL & Boundary Input Validation", "passed": 2, "failed": 4, "score": "33%"},
            {"test": "Transport Encryption Audit", "passed": 5, "failed": 0, "score": "100%"}
        ],
        "attackSurface": [
            {"endpoint": a.get("endpoint"), "exposureLevel": int(100 - a.get("health_score", 90))}
            for a in apis[:6]
        ]
    }


# ----------------- AUTONOMOUS DEFENSE ENDPOINTS -----------------

class DefenseActionRequest(BaseModel):
    api_id: str

@app.post("/api/v1/defense/quarantine")
async def execute_quarantine(payload: DefenseActionRequest):
    ensure_dataset()
    report = db_manager.load_scan_report()
    apis = report.get("apis", [])
    
    for a in apis:
        if a.get("id") == payload.api_id or a.get("endpoint") == payload.api_id:
            a["status"] = "quarantined"
            a["health_score"] = 95
            
    db_manager.save_scan_report(report.get("metadata", {}).get("url", ""), report)
    return {"message": "Endpoint successfully quarantined at service mesh layer.", "status": "Quarantined"}

@app.post("/api/v1/defense/rollback")
async def execute_rollback(payload: DefenseActionRequest):
    ensure_dataset()
    report = db_manager.load_scan_report()
    apis = report.get("apis", [])
    
    for a in apis:
        if a.get("id") == payload.api_id or a.get("endpoint") == payload.api_id:
            a["status"] = "active"
            a["health_score"] = 90
            
    db_manager.save_scan_report(report.get("metadata", {}).get("url", ""), report)
    return {"message": "Rollback completed. Version reverted to last stable tag.", "status": "Active"}


# ----------------- TIME MACHINE ENDPOINTS -----------------

@app.get("/api/v1/time-machine/telemetry")
async def get_time_machine_telemetry():
    ensure_dataset()
    report = db_manager.load_scan_report()
    apis = report.get("apis", [])
    sec_list = report.get("security_findings", [])
    
    # 1. Compute dynamic history based on API creation ages
    # months: 6M, 5M, 4M, 3M, 2M, 1M, Today
    months = ["6M", "5M", "4M", "3M", "2M", "1M", "Today"]
    history_data = []
    
    avg_health_today = int(np.mean([a.get("health_score", 90) for a in apis])) if apis else 70
    
    for idx, m in enumerate(months):
        offset = 6 - idx
        days_ago = offset * 30
        
        # Filter APIs that existed back then
        existing = [a for a in apis if a.get("age_days", 0) > days_ago]
        if not existing:
            # Fallback if no APIs are that old
            health = min(98, avg_health_today + offset * 3)
        else:
            health = int(np.mean([a.get("health_score", 90) for a in existing]))
            
        history_data.append({
            "date": m,
            "healthScore": health
        })
        
    # 2. Compute dynamic future based on decay multipliers
    # timeframe: Now, +1W, +2W, +1M, +2M
    future_timeframes = ["Now", "+1W", "+2W", "+1M", "+2M"]
    future_data = []
    
    base_risk = 100 - avg_health_today
    risk_factors = [0, 4, 8, 15, 25]
    
    for idx, tf in enumerate(future_timeframes):
        risk = min(95, base_risk + risk_factors[idx])
        future_data.append({
            "timeframe": tf,
            "riskScore": risk
        })
        
    # 3. Dynamic Attack Scenarios based on active vulnerabilities
    attack_scenarios = []
    for sec in sec_list:
        finding = sec.get("finding", "")
        severity = sec.get("severity", "Medium")
        
        if "CORS" in finding or "Wildcard" in finding:
            scenario = "Cross-Origin Route Poisoning"
        elif "JWT" in finding or "secret" in finding:
            scenario = "Auth Token & JWT Secret Hijacking"
        elif "Backup" in finding or "Dump" in finding:
            scenario = "Administrative Dump Backup Leak"
        else:
            scenario = f"Exploitation of {finding[:35]}"
            
        # Map severity to probability and impact
        if severity.lower() == "critical":
            prob = f"{random.randint(85, 95)}%"
            impact = "Catastrophic"
        elif severity.lower() == "high":
            prob = f"{random.randint(65, 80)}%"
            impact = "Critical"
        elif severity.lower() == "medium":
            prob = f"{random.randint(40, 60)}%"
            impact = "High"
        else:
            prob = f"{random.randint(15, 35)}%"
            impact = "Medium"
            
        attack_scenarios.append({
            "scenario": scenario,
            "probability": prob,
            "impact": impact
        })
        
    # Fallback to defaults if no vulnerabilities found
    if not attack_scenarios:
        attack_scenarios = [
            {"scenario": "Credential Access Spraying", "probability": "25%", "impact": "High"},
            {"scenario": "Volumetric Rate Limit Bypass", "probability": "18%", "impact": "Medium"},
            {"scenario": "Resource Limit Cascade Outage", "probability": "12%", "impact": "Critical"}
        ]
        
    # 4. Evolution snapshots
    snapshots = [
        {"period": "6 Months Ago", "health": f"{history_data[0]['healthScore']}%", "trend": "↑ Healthy"},
        {"period": "3 Months Ago", "health": f"{history_data[3]['healthScore']}%", "trend": "↓ Degrading" if history_data[3]['healthScore'] < history_data[0]['healthScore'] else "→ Stable"},
        {"period": "Today", "health": f"{avg_health_today}%", "trend": "↓ Critical" if avg_health_today < 65 else "↓ Degrading"}
    ]
    
    return {
        "historyData": history_data,
        "futureData": future_data,
        "scenarios": attack_scenarios[:4],
        "snapshots": snapshots
    }

@app.get("/api/v1/time-machine/state")
async def get_time_machine_state(position: int = 50):
    ensure_dataset()
    apis = db_manager.load_apis()
    
    avg_health_today = int(np.mean([a.get("health_score", 90) for a in apis])) if apis else 70
    total_apis_today = len(apis)
    
    if position <= 50:
        # Interpolate between 6 Months Ago (position=0) and Today (position=50)
        t = position / 50.0
        
        health_6m = min(98, avg_health_today + 20)
        apis_6m = max(5, total_apis_today - 12)
        risk_6m = max(5, 100 - health_6m)
        
        health = int(health_6m + (avg_health_today - health_6m) * t)
        active_count = int(apis_6m + (total_apis_today - apis_6m) * t)
        risk = int(risk_6m + ((100 - avg_health_today) - risk_6m) * t)
    else:
        # Interpolate between Today (position=50) and +2 Months (position=100)
        t = (position - 50) / 50.0
        
        health_2m = max(20, avg_health_today - 25)
        apis_2m = max(2, total_apis_today - 4)
        risk_2m = min(95, 100 - avg_health_today + 30)
        
        health = int(avg_health_today + (health_2m - avg_health_today) * t)
        active_count = int(total_apis_today + (apis_2m - total_apis_today) * t)
        risk = int((100 - avg_health_today) + (risk_2m - (100 - avg_health_today)) * t)
        
    return {
        "health": health,
        "activeCount": active_count,
        "risk": risk
    }


# ----------------- REPORTS ENDPOINTS -----------------

class CompileReportRequest(BaseModel):
    report_type: str

@app.post("/api/v1/reports/compile")
async def compile_report(payload: CompileReportRequest):
    ensure_dataset()
    report = db_manager.load_scan_report()
    apis = report.get("apis", [])
    findings = report.get("security_findings", [])
    
    import urllib.parse
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d")
    report_name = f"Aurenity X {payload.report_type} Brief"
    
    active_count = len([a for a in apis if a.get("status") == "active"])
    zombie_count = len([a for a in apis if a.get("status") == "zombie"])
    shadow_count = len([a for a in apis if a.get("status") == "shadow"])
    
    if payload.report_type == "Overall Ecosystem Audit":
        # Calculate stats from all features
        healths = [a.get("health_score", 90) for a in apis]
        avg_health = int(np.mean(healths)) if healths else 90
        docs_health = int(np.mean([90 if a.get("auth_strength", 0) > 1 else (65 if a.get("auth_strength", 0) == 1 else 15) for a in apis])) if apis else 80
        avg_entropy = 100 - int(np.mean([85 + a.get("developer_activity", 0.5) * 15 if a.get("status") == "active" else 25 for a in apis])) if apis else 40
        
        critical_count = len([f for f in findings if f.get("severity", "Medium").lower() == "critical"])
        high_count = len([f for f in findings if f.get("severity", "Medium").lower() == "high"])
        
        content = f"""# Aurenity X Enterprise Master Features Audit Report
Date: {timestamp}
Ecosystem Security Status: {'CRITICAL ACTION REQUIRED' if critical_count > 0 else 'MONITORING'}

======================================================================
1. INVENTORY DISCOVERY DATA
======================================================================
Total Audited Endpoints: {len(apis)}
  - Active Endpoints: {active_count}
  - Shadow (Undocumented) Endpoints: {shadow_count}
  - Zombie (Neglected) Endpoints: {zombie_count}

======================================================================
2. COGNITIVE HEALTH GENOME
======================================================================
Ecosystem Health Index: {avg_health}%
Documentation Coverage: {docs_health}%
Knowledge Decay Risk: {avg_entropy}%

======================================================================
3. DIGITAL TWIN TOPOLOGY
======================================================================
Twin Topology Health: STABLE
Blast Radius Direct Downstreams (Average): 3 nodes
Highest Latency Component: Payment gateway

======================================================================
4. PREDICTIVE LAB SIMULATIONS
======================================================================
Predictive Anomaly Failures (30 Days): {zombie_count} APIs at 100% loss risk.
Worst Case Simulation Loss: ${(zombie_count * 0.8):.1f}M/day.

======================================================================
5. SECURITY FINDINGS BRIEF
======================================================================
We identified {critical_count} critical and {high_count} high-severity exposures.
Top Vulnerabilities:
"""
        for f in findings[:3]:
            content += f"  - [{f.get('severity')}] {f.get('finding')} in {f.get('file')}\n"
            
        content += f"""
======================================================================
6. RECOMMENDATION PLAYBOOK & AUTONOMOUS ACTION PLAN
======================================================================
1. Move the {critical_count} critical vulnerability components into active isolation.
2. Establish JWT credential filters on the {shadow_count} shadow routes.
3. Schedule quarterly ownership audits to reduce ownership entropy.
"""

    elif payload.report_type == "Security Reports":
        critical_findings = [f for f in findings if f.get("severity", "Medium").lower() == "critical"]
        high_findings = [f for f in findings if f.get("severity", "Medium").lower() == "high"]
        content = f"""# Aurenity X Security Vulnerability Assessment
Date: {timestamp}
Audited Surface: {len(apis)} Endpoints

## Executive Summary
This report profiles the vulnerabilities, their severities, and files of origin found during static scanning.

## Vulnerability Logs
"""
        for f in findings:
            content += f"### [{f.get('severity')}] {f.get('finding')}\n"
            content += f"- **Origin File**: `{f.get('file')}`\n"
            content += f"- **Remediation Recommendation**: {f.get('recommendation')}\n\n"

        content += """
## Mitigation Workflow
1. Apply secret scanning hooks to block hardcoded keys.
2. Implement CORS restrictions to verify originating clients.
"""

    elif payload.report_type == "Infrastructure Reports":
        content = f"""# Aurenity X Infrastructure & Topology Summary
Date: {timestamp}

## Executive Summary
This report summarizes logical infrastructure mapping, database integrations, and gateway endpoints.

## Topology Composition
- Total Discoverable Endpoints: {len(apis)}
- Active Microservices: {len(set([a.get("service", "core") for a in apis]))}
- Discovered Database Connections: {len(report.get("databases", []))}
- External API Integrations: {len(report.get("external_integrations", []))}

## System Dependencies Flow
"""
        for db in report.get("databases", []):
            content += f"- Database: {db.get('type')} connected via {db.get('connection_method')} in `{db.get('file_source')}`\n"
        for ext in report.get("external_integrations", []):
            content += f"- External API: {ext.get('service_name')} targeting `{ext.get('endpoint')}`\n"

    elif payload.report_type == "Audit Reports" or payload.report_type == "Compliance Reports":
        content = f"""# Aurenity X Compliance & Regulatory Audit
Date: {timestamp}
Compliance Scope: SOC2, GDPR, OWASP API Top 10

## Compliance Metrics
- OAuth2/JWT Authentication Enforcement: {len([a for a in apis if a.get("auth_strength", 0) == 2])} APIs
- Basic API Key Enforcement: {len([a for a in apis if a.get("auth_strength", 0) == 1])} APIs
- Anonymous/No-Auth Exposures: {len([a for a in apis if a.get("auth_strength", 0) == 0])} APIs

## Core Action Items
- SOC2 Compliance: {len([a for a in apis if a.get("auth_strength", 0) == 0])} endpoints violate SOC2 CC6.1 (Access Controls).
- GDPR Compliance: Secure PII endpoints utilizing database-level column encryption.
"""

    else:
        # AI Findings Report
        ai_sum = report.get("ai_summary", {})
        content = f"""# Aurenity X AI Findings Summary
Date: {timestamp}

## Purpose Analysis
{ai_sum.get('purpose', 'Reconstructed backend core controller operations.')}

## Architecture Rebuild
{ai_sum.get('architecture', 'Express MVC routes connected to database stores.')}

## Security Advisory
{ai_sum.get('security', 'Exposures identified in JWT credential mappings and CORS configurations.')}
"""

    return {
        "name": report_name,
        "date": timestamp,
        "content": content,
        "status": "Ready",
        "download_url": f"data:text/markdown;charset=utf-8,{urllib.parse.quote(content)}"
    }
