from pydantic import BaseModel
from typing import Optional

class APIDNA(BaseModel):
    api_name: str
    documentation_exists: bool
    last_used_date: str
    days_since_last_use: int
    api_status: str  # "Zombie API" or "Shadow API"
    documentation_status: str  # "Documented" or "Undocumented"
