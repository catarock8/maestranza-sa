#!/usr/bin/env python3
"""
Script para ejecutar el backend localmente
"""
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    print("🚀 Iniciando Maestranza SA Backend (Local)")
    print("📍 URL: http://localhost:8000")
    print("📊 Base de datos: Supabase PostgreSQL")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
