#!/usr/bin/env python3
"""
Script de debug para probar la conectividad del backend
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración
BASE_URL = "http://54.233.95.170:8000"  # URL del servidor EC2
# BASE_URL = "http://localhost:8000"  # Para pruebas locales

def test_connection():
    """Probar conexión básica"""
    print("🔍 Probando conexión básica...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        print(f"✅ Conexión exitosa: {response.status_code}")
        print(f"📄 Respuesta: {response.json()}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_create_user():
    """Crear usuario inicial"""
    print("\n👤 Creando usuario inicial...")
    try:
        response = requests.post(f"{BASE_URL}/create-initial-user", timeout=10)
        print(f"📊 Status: {response.status_code}")
        print(f"📄 Respuesta: {response.json()}")
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"❌ Error creando usuario: {e}")
        return False

def test_login():
    """Probar login con usuario admin"""
    print("\n🔐 Probando login...")
    try:
        # Datos del formulario OAuth2
        data = {
            'username': 'admin',
            'password': 'admin123'
        }
        
        response = requests.post(
            f"{BASE_URL}/token", 
            data=data,  # application/x-www-form-urlencoded
            timeout=10
        )
        
        print(f"📊 Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Login exitoso")
            print(f"🎫 Token: {result.get('access_token', 'N/A')[:50]}...")
            return result.get('access_token')
        else:
            print(f"❌ Login falló: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error en login: {e}")
        return None

def test_protected_endpoint(token):
    """Probar endpoint protegido"""
    print("\n🛡️ Probando endpoint protegido...")
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(f"{BASE_URL}/products", headers=headers, timeout=10)
        
        print(f"📊 Status: {response.status_code}")
        if response.status_code == 200:
            products = response.json()
            print(f"✅ Productos obtenidos: {len(products)} items")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error en endpoint protegido: {e}")
        return False

def main():
    print("🚀 DIAGNOSTICO DEL BACKEND - MAESTRANZA S.A.")
    print("=" * 50)
    
    # Test 1: Conexión básica
    if not test_connection():
        print("\n❌ No se pudo conectar al backend. Verifica:")
        print("   - Que el servidor esté corriendo")
        print("   - Que la URL sea correcta")
        print("   - Que no haya firewall bloqueando")
        return
    
    # Test 2: Crear usuario
    test_create_user()
    
    # Test 3: Login
    token = test_login()
    if not token:
        print("\n❌ No se pudo hacer login. Verifica:")
        print("   - Que el usuario admin existe")
        print("   - Que la contraseña sea 'admin123'")
        print("   - Que el endpoint /token funcione")
        return
    
    # Test 4: Endpoint protegido
    test_protected_endpoint(token)
    
    print("\n✅ DIAGNOSTICO COMPLETADO")
    print("🎯 Si todos los tests pasaron, el backend funciona correctamente")

if __name__ == "__main__":
    main()
