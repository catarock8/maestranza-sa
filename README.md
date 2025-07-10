Maestranza SA - Sistema de Inventarios
Sistema de control de inventarios para Maestranza SA con React + FastAPI + Supabase.

🚀 Configuración Rápida (5 minutos)
1️⃣ Configurar Supabase
Crear cuenta en supabase.com
Crear nuevo proyecto
Ir a Settings → API
Copiar:
Project URL
anon public key (NO uses la service role key)
2️⃣ Configurar Backend
bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales de Supabase
3️⃣ Crear Tablas en Supabase
En Supabase Dashboard → SQL Editor
Pegar y ejecutar el contenido de database_setup_simple.sql
(Opcional) Ejecutar additional_data_simple.sql para más datos de ejemplo
4️⃣ Instalar Dependencias
bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
5️⃣ Ejecutar
bash
# Terminal 1 - Backend
cd backend
python run_local.py

# Terminal 2 - Frontend
cd frontend
npm run dev
📁 Estructura del Proyecto
maestranza-sa/
├── backend/
│   ├── .env              # Configuración (crear desde .env.example)
│   ├── main.py           # API endpoints
│   ├── database.py       # Conexión Supabase
│   ├── requirements.txt  # Dependencias Python
│   └── run_local.py      # Script para ejecutar
│
├── frontend/
│   ├── src/
│   │   ├── pages/        # Páginas de la app
│   │   ├── api.js        # Cliente API
│   │   └── App.jsx       # Componente principal
│   └── package.json      # Dependencias Node
│
└── database_setup_simple.sql  # Script para crear tablas
🔧 Solución de Problemas
Error de conexión a Supabase
Verifica que uses la anon key (NO la service role key)
Confirma que la URL no tenga espacios o caracteres extra
Verifica que las tablas estén creadas en Supabase
No se muestran productos
Verifica en Supabase Dashboard → Table Editor que existan datos
Revisa la consola del navegador para errores
Verifica los logs del backend
🌐 URLs
Frontend: http://localhost:3000
Backend: http://localhost:8000
API Docs: http://localhost:8000/docs
📝 Notas
Usuario admin por defecto: admin / admin123
Los datos de ejemplo incluyen productos, categorías y proveedores
El sistema usa autenticación simplificada para desarrollo
