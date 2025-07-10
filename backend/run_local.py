#!/usr/bin/env python3
import set_env_no_ssl  # Agregar esta línea AL INICIO
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    print("🚀 Iniciando Maestranza SA Backend (Local)")
    print("📍 URL: http://localhost:8000")
    print("📊 Base de datos: Supabase PostgreSQL")
    print("⚠️  SSL deshabilitado para desarrollo")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )