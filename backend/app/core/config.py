import os
from pydantic import BaseModel

# Bypass Cython C-extension if OS AppLocker / Application Control is strict on Windows
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

class Settings(BaseModel):
    PROJECT_NAME: str = "RiskRadar - AI-Powered Digital Risk Protection Platform"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Database: Supports PostgreSQL and fallback to SQLite for zero-config portable execution
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./riskradar.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "riskradar-super-secret-jwt-key-2026-production-grade")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # SSRF Protection: Private & loopback CIDR blocks blocked from external fetch
    BLOCKED_IP_PREFIXES: list[str] = [
        "127.", "10.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.",
        "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.",
        "172.28.", "172.29.", "172.30.", "172.31.", "192.168.", "169.254.", "0.", "::1", "localhost"
    ]
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

settings = Settings()
