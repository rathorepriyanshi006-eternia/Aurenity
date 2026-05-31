-- Supabase DDL SQL Schema for Aurenity X Repository Intelligence Scans

-- 1. Repositories table
CREATE TABLE IF NOT EXISTS public.repositories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    language TEXT,
    framework TEXT,
    file_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Scans table
CREATE TABLE IF NOT EXISTS public.scans (
    id TEXT PRIMARY KEY,
    repository_url TEXT REFERENCES public.repositories(url) ON DELETE CASCADE,
    status TEXT NOT NULL,
    api_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. API Endpoints table
CREATE TABLE IF NOT EXISTS public.api_endpoints (
    id TEXT PRIMARY KEY,
    scan_id TEXT REFERENCES public.scans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    method TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    file_source TEXT,
    service TEXT,
    confidence DOUBLE PRECISION DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Authentication Findings table
CREATE TABLE IF NOT EXISTS public.authentication_findings (
    id TEXT PRIMARY KEY,
    scan_id TEXT REFERENCES public.scans(id) ON DELETE CASCADE,
    auth_type TEXT NOT NULL,
    file_source TEXT,
    confidence DOUBLE PRECISION DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Database Findings table
CREATE TABLE IF NOT EXISTS public.database_findings (
    id TEXT PRIMARY KEY,
    scan_id TEXT REFERENCES public.scans(id) ON DELETE CASCADE,
    database_type TEXT NOT NULL,
    connection_method TEXT,
    file_source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. External Integrations table
CREATE TABLE IF NOT EXISTS public.external_integrations (
    id TEXT PRIMARY KEY,
    scan_id TEXT REFERENCES public.scans(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    endpoint TEXT,
    file_source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Environment Variables table
CREATE TABLE IF NOT EXISTS public.environment_variables (
    id TEXT PRIMARY KEY,
    scan_id TEXT REFERENCES public.scans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Security Findings table
CREATE TABLE IF NOT EXISTS public.security_findings (
    id TEXT PRIMARY KEY,
    scan_id TEXT REFERENCES public.scans(id) ON DELETE CASCADE,
    finding TEXT NOT NULL,
    severity TEXT NOT NULL, -- Low, Medium, High, Critical
    file TEXT,
    recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Architecture Summaries table
CREATE TABLE IF NOT EXISTS public.architecture_summaries (
    id TEXT PRIMARY KEY,
    scan_id TEXT REFERENCES public.scans(id) ON DELETE CASCADE,
    flow TEXT,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. AI Summaries table
CREATE TABLE IF NOT EXISTS public.ai_summaries (
    id TEXT PRIMARY KEY,
    scan_id TEXT REFERENCES public.scans(id) ON DELETE CASCADE,
    purpose TEXT,
    architecture TEXT,
    apis TEXT,
    auth TEXT,
    database TEXT,
    security TEXT,
    executive TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authentication_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environment_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.architecture_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;

-- Create public read/write access policies (suitable for hackathon/development environment)
CREATE POLICY "Allow public read repositories" ON public.repositories FOR SELECT USING (true);
CREATE POLICY "Allow public write repositories" ON public.repositories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read scans" ON public.scans FOR SELECT USING (true);
CREATE POLICY "Allow public write scans" ON public.scans FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read api_endpoints" ON public.api_endpoints FOR SELECT USING (true);
CREATE POLICY "Allow public write api_endpoints" ON public.api_endpoints FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read auth_findings" ON public.authentication_findings FOR SELECT USING (true);
CREATE POLICY "Allow public write auth_findings" ON public.authentication_findings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read db_findings" ON public.database_findings FOR SELECT USING (true);
CREATE POLICY "Allow public write db_findings" ON public.database_findings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read ext_integrations" ON public.external_integrations FOR SELECT USING (true);
CREATE POLICY "Allow public write ext_integrations" ON public.external_integrations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read env_vars" ON public.environment_variables FOR SELECT USING (true);
CREATE POLICY "Allow public write env_vars" ON public.environment_variables FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read sec_findings" ON public.security_findings FOR SELECT USING (true);
CREATE POLICY "Allow public write sec_findings" ON public.security_findings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read arch_summaries" ON public.architecture_summaries FOR SELECT USING (true);
CREATE POLICY "Allow public write arch_summaries" ON public.architecture_summaries FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read ai_summaries" ON public.ai_summaries FOR SELECT USING (true);
CREATE POLICY "Allow public write ai_summaries" ON public.ai_summaries FOR ALL USING (true) WITH CHECK (true);
