# Maestranza SA - Setup Local

## ⚡ Inicio Rápido (3 pasos)

### 1. Configurar Supabase (2 minutos)
- Ve a https://supabase.com → Crear proyecto
- Settings > Database → Copiar Host y Password
- Editar `backend/.env` con tus datos

### 2. Instalar (1 minuto)
```bash
cd backend && pip install -r requirements.txt
cd ../frontend && npm install
```

### 3. Ejecutar
```bash
# Terminal 1
cd backend && python run_local.py

# Terminal 2  
cd frontend && npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Crear datos: POST http://localhost:8000/create-sample-data

## 🛠️ Estructura Simple
```
maestranza-sa/
├── backend/
│   ├── .env             # ← Editar con datos Supabase
│   ├── main.py          # API
│   ├── database.py      # Modelos
│   └── run_local.py     # Ejecutar
└── frontend/
    ├── .env.local       # ← Ya configurado para localhost
    └── src/pages/Products.jsx
```

## 🚨 Problemas Comunes
- **Error DB**: Verificar credenciales en `backend/.env`
- **Puerto ocupado**: Cerrar otras apps en puerto 8000/3000
- **Módulos**: Ejecutar `pip install -r requirements.txt`

¡Listo! 🚀
