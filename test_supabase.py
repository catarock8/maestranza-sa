#!/usr/bin/env python3
"""
Script para probar la conexión a Supabase con service role key
"""

import os
from dotenv import load_dotenv
from backend.database import init_db, create_sample_data, supabase, supabase_admin

def test_supabase_connection():
    """Prueba la conexión a Supabase"""
    load_dotenv(dotenv_path='backend/.env')
    
    print("🧪 Testing Supabase Connection")
    print("=" * 50)
    
    # Verificar variables de entorno
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_KEY')
    service_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    print(f"SUPABASE_URL: {'✅ Set' if url else '❌ Missing'}")
    print(f"SUPABASE_KEY: {'✅ Set' if key else '❌ Missing'}")
    print(f"SUPABASE_SERVICE_ROLE_KEY: {'✅ Set' if service_key else '❌ Missing'}")
    
    if not all([url, key, service_key]):
        print("\n❌ Please configure all Supabase credentials in backend/.env")
        return False
    
    print(f"\nSUPABASE_URL: {url}")
    print(f"SUPABASE_KEY: {key[:20]}...")
    print(f"SUPABASE_SERVICE_ROLE_KEY: {service_key[:20]}...")
    
    # Probar inicialización de la base de datos
    print("\n🔄 Testing database initialization...")
    try:
        success = init_db()
        if success:
            print("✅ Database initialization successful!")
            
            # Probar creación de datos de ejemplo
            print("\n🔄 Testing sample data creation...")
            create_sample_data()
            print("✅ Sample data creation successful!")
            
            # Probar consulta de productos
            print("\n🔄 Testing products query...")
            response = supabase.table('products').select('*').limit(3).execute()
            print(f"✅ Found {len(response.data)} products")
            
            return True
        else:
            print("❌ Database initialization failed")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_supabase_connection()
