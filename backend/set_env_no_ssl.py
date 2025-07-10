"""
Script para configurar el entorno sin SSL
Ejecutar ANTES de iniciar la aplicación
"""
import os
import warnings

# Deshabilitar warnings SSL
os.environ['PYTHONWARNINGS'] = 'ignore:Unverified HTTPS request'
warnings.filterwarnings('ignore')

# Variable para deshabilitar SSL en requests/httpx
os.environ['CURL_CA_BUNDLE'] = ""
os.environ['REQUESTS_CA_BUNDLE'] = ""
os.environ['HTTPX_VERIFY'] = "0"

print("✅ Variables de entorno configuradas para omitir SSL")
print("⚠️  SOLO para desarrollo - NO usar en producción")