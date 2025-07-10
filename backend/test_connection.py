"""
Script simple para probar la conexión
"""
import os
from dotenv import load_dotenv
from supabase import create_client

# Cargar .env
load_dotenv()

# Obtener credenciales
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')

print(f"URL: {url}")
print(f"KEY: {key[:20]}..." if key else "KEY: NOT SET")

try:
    # Crear cliente simple
    supabase = create_client(url, key)
    
    # Probar consulta simple
    response = supabase.table('products').select('id, name').limit(5).execute()
    
    print(f"\n✅ Conexión exitosa!")
    print(f"Productos encontrados: {len(response.data)}")
    
    for product in response.data:
        print(f"  - {product['name']}")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nVerifica:")
    print("1. Que las credenciales en .env sean correctas")
    print("2. Que uses SUPABASE_KEY (anon key)")
    print("3. Que las tablas estén creadas en Supabase")