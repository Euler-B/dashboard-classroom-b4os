# Dashboard B4OS - GitHub Classroom + Supabase

Sistema completo para sincronizar Challenges resueltos/en-progreso de GitHub Classroom con Supabase y visualizarlas en un dashboard web moderno.

## 🚀 Características

- **Sincronización automática** de Challenges resueltos/en-progreso desde GitHub Classroom
- **Dashboard web** con visualizaciones en tiempo real
- **Base de datos PostgreSQL** en Supabase
- **Interfaz moderna** con Next.js + React + TypeScript
- **Gráficos interactivos** y tablas de datos
- **Filtros y búsquedas** avanzadas

## 📁 Estructura del Proyecto

```
automate-classroom-grades/
├── 📁 backend/                    # Script de sincronización
│   └── download_grades_supabase.py
├── 📁 frontend/                   # Dashboard web
│   ├── src/
│   │   ├── app/                   # Páginas Next.js
│   │   ├── components/            # Componentes React
│   │   └── lib/                   # Configuración Supabase
│   ├── package.json
│   └── next.config.js
├── 📁 logs/                       # Logs del sistema
├── setup_database.sql            # Script de base de datos
├── requirements.txt              # Dependencias Python
└── README.md
```

## 🛠️ Instalación

### 1. Configurar Backend

```bash
# Instalar dependencias Python
pip3 install -r requirements.txt

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus credenciales de Supabase
```

### 2. Configurar Base de Datos

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar `setup_database.sql` en el SQL Editor
3. Obtener URL y clave de Supabase

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

## ⚙️ Configuración

### Variables de Entorno Backend (.env)
```env
CLASSROOM_NAME=B4OS-Dev-2025
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_clave_anon_aqui
ASSIGNMENT_ID=
LOG_LEVEL=INFO
MAX_RETRIES=3
TIMEOUT_SECONDS=30
```

### Variables de Entorno Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

## 🚀 Uso

### Sincronización Manual
```bash
# Ejecutar sincronización
python3 backend/download_grades_supabase.py
```

### Dashboard Web
```bash
cd frontend
npm run dev
# Abrir http://localhost:3000
```

### Sincronización desde el Dashboard
- Usar el botón "Sincronizar" en el dashboard
- Los datos se actualizarán automáticamente

## 📊 Funcionalidades del Dashboard

### Estadísticas Generales
- Total de estudiantes
- Total de Challenges liberados
- Total de Challenges resueltos/en-progreso
- Promedio general

### Visualizaciones
- **Gráfico de barras**: Challenges resueltos/en-progreso por asignación
- **Gráfico circular**: Distribución de Challenges resueltos/en-progreso
- **Tabla interactiva**: Lista completa de estudiantes

### Filtros y Búsquedas
- Buscar por nombre de estudiante
- Filtrar por asignación
- Ordenar por diferentes criterios

## 🗄️ Base de Datos

### Tablas
- **`students`**: Información de estudiantes
- **`assignments`**: Challenges liberados del curso
- **`grades`**: Challenges resueltos/en-progreso individuales
- **`consolidated_grades`**: Vista consolidada (vista)

### Vistas
- **`consolidated_grades`**: Combina todas las tablas
- **`get_student_summary()`**: Resumen por estudiante

## 🔧 Tecnologías

### Backend
- **Python 3.8+**
- **Supabase Client**
- **GitHub CLI**
- **Pandas** para procesamiento de datos

### Frontend
- **Next.js 14**
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Recharts** para gráficos
- **Supabase Client**

### Base de Datos
- **PostgreSQL** (Supabase)
- **Row Level Security (RLS)**

## 📈 Características Avanzadas

- **Manejo robusto de errores** con retry automático
- **Logging estructurado** para debugging
- **Validación de datos** completa
- **Type safety** con TypeScript
- **Responsive design** para móviles
- **Tiempo real** con Supabase

## 🚨 Solución de Problemas

### Error de conexión a Supabase
- Verificar `SUPABASE_URL` y `SUPABASE_KEY`
- Asegurar que las tablas estén creadas

### Error de GitHub CLI
- Ejecutar `gh auth status`
- Verificar permisos en GitHub Classroom

### Error en el frontend
- Verificar variables de entorno
- Revisar consola del navegador
- Verificar conexión a Supabase

## 📄 Licencia

MIT License - Ver `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request