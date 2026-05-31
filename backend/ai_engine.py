import os
import re
import json
import random
import numpy as np

class AurenityAIEngine:
    def __init__(self):
        # Support Triple-Engine API Keys
        xai_key = os.environ.get("XAI_API_KEY", "")
        groq_key = os.environ.get("GROQ_API_KEY", "")
        openai_key = os.environ.get("OPENAI_API_KEY", "")
        
        self.api_key = ""
        self.base_url = None
        self.model = "gpt-4"
        self.api_available = False
        
        if xai_key.strip():
            self.api_key = xai_key.strip()
            if self.api_key.startswith("sb_"):
                self.base_url = "https://api.sambanova.ai/v1"
                self.model = "Meta-Llama-3.3-70B-Instruct"
                print(f"AI COPILOT: SambaNova Cloud active (model: {self.model})")
            else:
                self.base_url = "https://api.x.ai/v1"
                self.model = "grok-beta"
                print(f"AI COPILOT: xAI Grok chat active (model: {self.model})")
            self.api_available = True
        elif groq_key.strip():
            self.api_key = groq_key.strip()
            self.base_url = "https://api.groq.com/openai/v1"
            self.model = "llama-3.3-70b-versatile"
            self.api_available = True
            print(f"AI COPILOT: Groq Cloud active (model: {self.model})")
        elif openai_key.strip():
            self.api_key = openai_key.strip()
            self.base_url = None
            self.model = "gpt-4o-mini"
            self.api_available = True
            print(f"AI COPILOT: OpenAI chat active (model: {self.model})")

    def generate_response(self, user_prompt: str, report: dict) -> str:
        """
        Generates dynamic security analysis. Uses Grok, Groq, or OpenAI if keys are 
        available, otherwise triggers the local context-aware rule emulator.
        """
        metadata = report.get("metadata", {})
        apis = report.get("apis", [])
        auth = report.get("auth", [])
        databases = report.get("databases", [])
        integrations = report.get("external_integrations", [])
        security = report.get("security_findings", [])
        
        if self.api_available:
            try:
                from openai import OpenAI
                if self.base_url:
                    client = OpenAI(api_key=self.api_key, base_url=self.base_url)
                else:
                    client = OpenAI(api_key=self.api_key)
                
                # Format a concise context for the LLM
                api_summary = []
                for api in apis[:15]:
                    api_summary.append(
                        f"Name: {api['name']}, Endpoint: {api['endpoint']}, Status: {api['status']}, "
                        f"Health: {api.get('health_score', 100)}/100, Auth Strength: {api.get('auth_strength', 0)}, "
                        f"Sensitivity: {api.get('data_sensitivity', 0)}, Error Rate: {api.get('error_rate', 0.0):.2f}, Latency: {api.get('latency_ms', 100.0):.1f}ms"
                    )
                
                context_str = "\n".join(api_summary)
                auth_str = ", ".join([a.get("type", "Auth") for a in auth])
                db_str = ", ".join([d.get("type", "DB") for d in databases])
                ext_str = ", ".join([i.get("service_name", "Third Party") for i in integrations])
                sec_str = "\n".join([f"[{s.get('severity', 'Medium')}] {s.get('finding')} in {s.get('file')}" for s in security])
                
                system_message = (
                    "You are Aurenity X's AI Security Copilot, a senior cyber intelligence agent.\n"
                    "You analyze API networks for critical vulnerabilities, shadow API endpoints, and dependency flaws.\n"
                    "We have integrated a lightweight ML Classification pipeline layer. Discovered APIs now contain an "
                    "internal API DNA metadata object with fields: documentation_status (Documented / Undocumented), "
                    "zombie_classification (Zombie API / Shadow API), and days_since_last_use (days count since last query).\n"
                    "If the user asks why an API is classified as Zombie, Shadow, Documented, or Undocumented, refer to these ML DNA metrics and explain the reasoning.\n"
                    "Decision criteria:\n"
                    "- days_since_last_use > 50 -> Zombie API (inactive/neglected debt)\n"
                    "- days_since_last_use <= 50 -> Shadow API (recently active, but review auth/docs)\n"
                    "- documentation_exists -> Documented, otherwise Undocumented.\n"
                    "Be highly professional, direct, concise, and technical. Avoid platitudes. Recommend specific code "
                    "or operational fixes (e.g. rate-limit parameters, rotation scripts, JWT validators).\n\n"
                    f"Current Scanned API Ecosystem Context:\n"
                    f"Repository: {metadata.get('name', 'Repository')}\n"
                    f"Language: {metadata.get('language', 'TypeScript')}\n"
                    f"Framework: {metadata.get('framework', 'ExpressJS')}\n"
                    f"Active APIs:\n{context_str}\n"
                    f"Authentication: {auth_str}\n"
                    f"Databases: {db_str}\n"
                    f"External Integrations: {ext_str}\n"
                    f"Security Findings:\n{sec_str}"
                )
                
                response = client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=400,
                    temperature=0.3
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"AI Copilot request failed ({self.model}): {e}. Falling back to Rule-Based Intelligence Engine...")
        
        # --- Context-Aware Cybersecurity Rule Engine (Premium Emulator) ---
        user_prompt_lower = user_prompt.lower()
        if not apis:
            return (
                "Aurenity Threat Copilot requires active scan telemetry to map context. "
                "Please trigger an 'API Discovery Scan' on the Discovery tab to initialize my intelligence matrix."
            )

        shadow_apis = [api for api in apis if api.get("status") == "shadow"]
        zombie_apis = [api for api in apis if api.get("status") == "zombie"]
        vulnerable_apis = [api for api in apis if api.get("health_score", 100) < 70]
        avg_health = np.mean([api.get("health_score", 100) for api in apis])

        # 0. Capability: Explain ML API Classification DNA
        if any(w in user_prompt_lower for w in ["why", "classification", "zombie", "shadow", "documented", "undocumented", "dna"]):
            # Check if user named a specific API, or talk generally
            matched_api = None
            for api in apis:
                clean_api_name = api.get("name", "").lower()
                clean_api_ep = api.get("endpoint", "").lower()
                if clean_api_name in user_prompt_lower or clean_api_ep in user_prompt_lower or api.get("id", "").lower() in user_prompt_lower:
                    matched_api = api
                    break
            
            if matched_api:
                name = matched_api.get("name")
                ep = matched_api.get("endpoint")
                doc_status = matched_api.get("documentation_status", "Undocumented")
                classification = matched_api.get("zombie_classification", "Shadow API")
                days = matched_api.get("days_since_last_use", 0)
                last_date = matched_api.get("last_used_date", "Never")
                
                explanation = f"### ML DNA Intelligence Profiler: `{name}` (`{ep}`)\n\n"
                explanation += f"- **Classification**: **{classification}**\n"
                explanation += f"- **Documentation Status**: **{doc_status}**\n"
                explanation += f"- **Days Since Last Usage**: **{days} days** (Last active: `{last_date}`)\n\n"
                
                explanation += "#### ML Decision Boundaries Explanation:\n"
                if classification == "Zombie API":
                    explanation += f"1. **Zombie Status**: The ML pipeline classified this endpoint as a `Zombie API` because it has been **inactive for {days} days**, exceeding the critical threshold boundary of **50 days** without query activity. This presents a high risk of knowledge decay.\n"
                else:
                    explanation += f"1. **Shadow Status**: The ML pipeline classified this endpoint as a `Shadow API` because it has been **recently active ({days} days ago)**, which is within the safe operational threshold window of **50 days** or less, but might lack proper documentation or authorization credentials.\n"
                    
                if doc_status == "Documented":
                    explanation += f"2. **Documentation Detection**: Verified that the API documentation (`API_DOC` file or auth middleware guards) exists for this endpoint, marking it as `Documented`.\n"
                else:
                    explanation += f"2. **Documentation Detection**: No active documentation or validation guards were detected for this route, marking it as `Undocumented`.\n\n"
                    
                explanation += "**Remediation Recommendation**: "
                if classification == "Zombie API":
                    explanation += f"Assign a developer squad to clean up or deprecate `{ep}` to reduce security attack surface."
                else:
                    explanation += f"Ensure JWT/OAuth validation logic is implemented in `{matched_api.get('file_source')}` to secure this active shadow router."
                return explanation
            
            else:
                # General ML classification pipeline explanation
                return (
                    "### Aurenity X ML Classification Pipeline Architecture\n\n"
                    "Our ML Pipeline parses the codebase repository and compiles an internal **API DNA Object** for each endpoint using 3 primary stages:\n\n"
                    "1. **Feature Engineering**: Checks for documentation files (`API_DOC`) and last usage indicators (`API_LASTDATE`) to compute `documentation_exists` and `days_since_last_use` variables.\n"
                    "2. **Classification Layer**: A modular classifier groups endpoints into categories:\n"
                    "   - **Zombie API**: days_since_last_use > 50 days (neglected codebase debt)\n"
                    "   - **Shadow API**: days_since_last_use <= 50 days (active, but check credentials)\n"
                    "   - **Documented / Undocumented**: maps the presence of API specifications.\n"
                    "3. **Inference Output**: Feeds metadata to the inventory panel, digital twin node colors, and Copilot contexts.\n\n"
                    "*Tip: Ask me about a specific API name or endpoint route (e.g. 'Why is links API classified as Shadow?') to inspect its detailed DNA metrics.*"
                )
        
        # 1. Capability: Explain Risks
        if any(w in user_prompt_lower for w in ["risk", "vulnerab", "exposure", "threat", "weakness"]):
            if not security:
                return (
                    f"### API Risk Profiling for `{metadata.get('name', 'App')}`\n\n"
                    "✓ **Ecosystem Rating**: **95%+ Secure**\n"
                    "No immediate high-priority vulnerabilities were flagged in the code. "
                    "Authorization checks and authentication parameters appear tight."
                )
            
            risk_list = []
            for s in security:
                risk_list.append(
                    f"- **[{s.get('severity')}] {s.get('finding')}**\n"
                    f"  - **File**: `{s.get('file')}`\n"
                    f"  - **Implication**: Exposes endpoint to exploit parameters."
                )
            risks_str = "\n".join(risk_list)
            return (
                f"### Cyber Exposure Assessment: `{metadata.get('name', 'Repository')}`\n\n"
                f"Scanned files revealed **{len(security)} active security issues**:\n\n"
                f"{risks_str}\n\n"
                "**Action Recommended**: Address Critical/High findings immediately to mitigate lateral propagation."
            )
            
        # 2. Capability: Explain Dependencies
        elif any(w in user_prompt_lower for w in ["dependency", "dependencies", "relation", "flow", "call", "connect"]):
            db_names = [d.get("type") for d in databases] if databases else ["In-Memory"]
            ext_names = [i.get("service_name") for i in integrations] if integrations else ["None"]
            auth_name = auth[0].get("type", "No Auth Middleware") if auth else "No Auth Filter"
            
            return (
                f"### System Dependency Mapping\n\n"
                f"The application architecture for `{metadata.get('name', 'App')}` is structured as follows:\n\n"
                f"```mermaid\n"
                f"graph TD\n"
                f"  Client[Client Frontend] --> Gateway[App Gateway: {metadata.get('framework', 'REST')}]\n"
                f"  Gateway --> Auth[Auth Filter: {auth_name}]\n"
                f"  Auth --> Router[Core API Routers]\n"
                f"  Router --> DB[Data Stores: {', '.join(db_names)}]\n"
                f"  Router --> Ext[Integrations: {', '.join(ext_names)}]\n"
                f"```\n\n"
                f"**Data Flow Analysis**:\n"
                f"- Database: Microservice nodes interface with **{', '.join(db_names)}** for persistence.\n"
                f"- Integrations: Calls route outbound to third-party endpoints: **{', '.join(ext_names)}**."
            )

        # 3. Capability: Generate Remediation Plans
        elif any(w in user_prompt_lower for w in ["remediate", "remediation", "fix", "repair", "mitigate"]):
            if not security:
                return "✓ Scanned codebase is clear. No active remediation plans required."
                
            remediations = []
            for idx, s in enumerate(security[:2]):
                finding = s.get("finding")
                file_path = s.get("file")
                rec = s.get("recommendation")
                
                remediations.append(
                    f"#### Remediation #{idx+1}: {finding}\n"
                    f"- **Target File**: `{file_path}`\n"
                    f"- **Fix Playbook**: {rec}\n"
                    f"- **Code Implementation**:\n"
                    f"  ```bash\n"
                    f"  # Recommended patch action\n"
                    f"  npm install dotenv --save\n"
                    f"  # Move hardcoded credential tokens into environment file variables\n"
                    f"  echo \"SECRET_KEY=highly_secure_generated_hash\" >> .env\n"
                    f"  ```"
                )
            
            remedy_str = "\n\n".join(remediations)
            return (
                f"### Step-by-Step Remediation Plan\n\n"
                f"Remediation roadmap to resolve flagged vulnerabilities in `{metadata.get('name')}`:\n\n"
                f"{remedy_str}"
            )
            
        # 4. Capability: Summarize Infrastructure
        elif any(w in user_prompt_lower for w in ["summarize", "summary", "infrastructure", "structure"]):
            db_names = [d.get("type") for d in databases] if databases else ["Local Memory"]
            ext_names = [i.get("service_name") for i in integrations] if integrations else ["No external APIs"]
            
            return (
                f"### Infrastructure Summary: `{metadata.get('name')}`\n\n"
                f"- **Core Stack**: Built in **{metadata.get('language')}** utilizing **{metadata.get('framework')}**.\n"
                f"- **File Scale**: Scanned **{metadata.get('file_count', 0)} codebase files**.\n"
                f"- **Route Ingress**: Discovered **{len(apis)} API endpoints** in routers.\n"
                f"- **Persistent Storage**: Uses **{', '.join(db_names)}** backend engines.\n"
                f"- **Outbound Connections**: Interfaces with external APIs: **{', '.join(ext_names)}**."
            )
            
        # 5. Capability: Generate Reports
        elif any(w in user_prompt_lower for w in ["report", "audit"]):
            db_names = [d.get("type") for d in databases] if databases else ["None"]
            ext_names = [i.get("service_name") for i in integrations] if integrations else ["None"]
            auth_name = auth[0].get("type", "None") if auth else "None"
            
            return (
                f"# CYBER SECURITY AUDIT REPORT: {metadata.get('name', 'Repository').upper()}\n\n"
                f"**Date**: 2026-05-31 | **Classification**: Confidential | **Scanned Scope**: {metadata.get('file_count')} Files\n\n"
                f"## 1. Executive Summary\n"
                f"Aurenity X conducted a static code audit of `{metadata.get('name')}`. "
                f"The ecosystem exposes {len(apis)} APIs. Overall security index averages **{avg_health:.1f}/100**.\n\n"
                f"## 2. Infrastructure Inventory\n"
                f"- **Runtime framework**: {metadata.get('framework')}\n"
                f"- **Authentication method**: {auth_name}\n"
                f"- **Databases**: {', '.join(db_names)}\n"
                f"- **External integrations**: {', '.join(ext_names)}\n\n"
                f"## 3. Vulnerability Findings\n"
                f"Audited **{len(security)} exposures** requiring attention. "
                f"Critical findings highlight JWT secret exposures in config files and unvalidated inputs.\n\n"
                f"--- \n"
                f"*Report compiled by Aurenity AI Assistant*"
            )
            
        else:
            return (
                f"Hello, I am your Aurenity AI Security Copilot. I have analyzed the repository scan context for **{metadata.get('name', 'your app')}**.\n\n"
                "I am equipped to handle specific SeCOps inquiries. Try asking me:\n"
                "- **Show vulnerable risks** (explain security findings)\n"
                "- **Explain dependencies** (reveal system architecture mapping)\n"
                "- **Generate remediation plan** (yield dynamic fix playbooks)\n"
                "- **Summarize infrastructure** (summarize code frameworks and files)\n"
                "- **Compile security report** (generate markdown audit summaries)"
            )

    def generate_repo_intelligence_summary(self, report: dict) -> dict:
        """
        Sends scanned code findings in metadata blocks to Groq (or uses emulated fallback)
        to generate Repository Purpose, Architecture Summary, API Intelligence Summary,
        Authentication Flow, Database Relationships, Security Insights, and Executive Summary.
        """
        metadata = report.get("metadata", {})
        apis = report.get("apis", [])
        auth = report.get("auth", [])
        databases = report.get("databases", [])
        integrations = report.get("external_integrations", [])
        security = report.get("security_findings", [])
        
        # Prepare context payload for LLM (very concise to fit tokens)
        summary_payload = {
            "repository": metadata.get("name", "Unknown"),
            "primary_language": metadata.get("language", "Unknown"),
            "framework": metadata.get("framework", "Unknown"),
            "files_scanned": metadata.get("file_count", 0),
            "apis_count": len(apis),
            "endpoints": [f"{a['method']} {a['endpoint']}" for a in apis[:10]],
            "auth_detected": [a["type"] for a in auth[:5]],
            "databases_detected": [d["type"] for d in databases[:5]],
            "external_integrations": [i["service_name"] for i in integrations[:5]],
            "security_findings": [f"[{s['severity']}] {s['finding']}" for s in security[:8]]
        }
        
        if self.api_available:
            try:
                from openai import OpenAI
                if self.base_url:
                    client = OpenAI(api_key=self.api_key, base_url=self.base_url)
                else:
                    client = OpenAI(api_key=self.api_key)
                    
                system_prompt = (
                    "You are Aurenity X's AI Security Copilot, a senior cyber intelligence agent.\n"
                    "Given a static analysis report of a GitHub repository, generate a comprehensive cyber intelligence summary.\n"
                    "Return ONLY a raw JSON object (no markdown code blocks, no explanations, no text), matching this schema:\n"
                    "{\n"
                    "  \"purpose\": \"Explain what the application does and its main purpose.\",\n"
                    "  \"architecture\": \"Explain the backend, routing, and system architecture summary.\",\n"
                    "  \"apis\": \"Summarize the discovered APIs, their methods, and exposures.\",\n"
                    "  \"auth\": \"Explain the authentication and authorization flow logic.\",\n"
                    "  \"database\": \"Explain the databases detected and data model relationships.\",\n"
                    "  \"security\": \"Detail security findings, severity ratings, risks, and mitigations.\",\n"
                    "  \"executive\": \"Provide a concise, professional high-level executive summary.\"\n"
                    "}"
                )
                
                response = client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Scan Data:\n{json.dumps(summary_payload, indent=2)}"}
                    ],
                    max_tokens=600,
                    temperature=0.2
                )
                
                raw_text = response.choices[0].message.content.strip()
                # Clean markdown blocks if returned
                if raw_text.startswith("```"):
                    json_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
                    if json_match:
                        raw_text = json_match.group(0)
                    else:
                        raw_text = raw_text.replace("```json", "").replace("```", "").strip()
                        
                parsed_summary = json.loads(raw_text)
                return parsed_summary
            except Exception as e:
                print(f"Failed to generate AI repository intelligence summary via {self.model}: {e}. Initializing local emulation fallback...")

        # --- High Quality Cybersecurity Emulation Engine fallback ---
        repo_name = metadata.get("name", "Unknown Repo")
        lang = metadata.get("language", "Unknown")
        fw = metadata.get("framework", "Unknown")
        db_str = databases[0]["type"] if databases else "In-Memory Store"
        auth_str = auth[0]["type"] if auth else "No Auth Middleware"
        
        purpose = f"This repository contains the source code for {repo_name}, a backend service built in {lang} utilizing the {fw} framework. Its primary function is exposing API gateways, managing records and data pipelines."
        
        architecture = f"The application is structured around a {fw} architecture. Incoming client REST calls map to controller routing functions, passing through a middleware verification layer before querying database structures on {db_str}."
        
        apis_summary = f"Discovered {len(apis)} active API paths in the codebase. Typical exposed endpoints include transactional queries, status routes, and database record CRUD functions."
        
        auth_flow = f"Security verification processes map to {auth_str}. Middleware filters analyze credential tokens on sensitive paths (e.g. JWT verification filters or session checks)."
        
        database_flow = f"Data storage uses {db_str}. Entities are managed through standard ORM drivers, maintaining transaction tables and relational indexes."
        
        sec_flow = f"Audited {len(security)} security findings. Key recommendations: rotate exposed credentials in files, bind wildcard CORS headers to specific domain endpoints, and secure unprotected API gateways."
        
        exec_summary = f"{repo_name} provides robust framework structures. To ensure production readiness, security teams must enforce bearer validations, rate limit routes, and isolate database credential variables."

        return {
            "purpose": purpose,
            "architecture": architecture,
            "apis": apis_summary,
            "auth": auth_flow,
            "database": database_flow,
            "security": sec_flow,
            "executive": exec_summary
        }
