# 🚀 Guía Rápida - Importar Colección en Postman

## Opción 1: Importar Archivos JSON (RECOMENDADO)

### Paso 1: Importar la Colección

1. Abre Postman
2. Click en **"Import"** (esquina superior izquierda)
3. Click en **"Upload Files"** o arrastra el archivo:
   ```
   ESPE-ECommerce-Postman-Collection.json
   ```
4. Click en **"Import"**
5. ✅ Verás la colección "ESPE E-Commerce Microservices" en el panel izquierdo

### Paso 2: Importar el Environment

1. Click en el icono de engranaje ⚙️ (esquina superior derecha)
2. Click en **"Environments"**
3. Click en **"Import"**
4. Selecciona el archivo:
   ```
   ESPE-ECommerce-Environment.postman_environment.json
   ```
5. Click en **"Import"**
6. ✅ Verás el environment "E-Commerce Local"

### Paso 3: Activar el Environment

1. En el dropdown de la esquina superior derecha (donde dice "No Environment")
2. Selecciona **"E-Commerce Local"**
3. ✅ Las variables están listas para usar

---

## Opción 2: Configuración Manual

Si prefieres crear todo manualmente, sigue la guía completa en [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md)

---

## ✅ Verificación Rápida

### 1. Verificar Variables de Entorno

Click en el icono de ojo 👁️ → Deberías ver:
- `order_service_url`: http://localhost:8080
- `inventory_service_url`: http://localhost:8081
- `order_id`: (vacío, se llenará automáticamente)

### 2. Ejecutar Primera Prueba

1. Abre la colección "ESPE E-Commerce Microservices"
2. Navega a: **"1. Health Checks" → "1. Inventory - Health Check"**
3. Click en **"Send"**
4. ✅ Deberías ver:
   ```json
   {
     "status": "UP",
     "service": "inventory-service"
   }
   ```

---

## 🔄 Flujo de Pruebas Recomendado

### Secuencia Automática

Las requests están numeradas para seguir este orden:

1. **1. Inventory - Health Check** ✅
2. **2. Inventory - Get Stock P-001** → Stock inicial: 25
3. **5. Order - Create Order (Success Path)** → Crea orden
4. ⏱️ **ESPERA 5 SEGUNDOS**
5. **6. Order - Get Order by ID (CONFIRMED)** → Verifica estado CONFIRMED
6. **7. Inventory - Verify Stock Reduction** → Verifica stock: 23
7. **8. Order - Create Order (Insufficient Stock)** → Orden con 50 unidades
8. ⏱️ **ESPERA 5 SEGUNDOS**
9. **9. Order - Get Cancelled Order** → Verifica estado CANCELLED

---

## 📊 Estructura de la Colección

```
📁 ESPE E-Commerce Microservices
├── 📁 1. Health Checks
│   └── 1. Inventory - Health Check
│
├── 📁 2. Inventory Service
│   ├── 2. Inventory - Get Stock P-001
│   ├── 3. Inventory - Get Stock P-002
│   ├── 4. Inventory - Product Not Found
│   └── 7. Inventory - Verify Stock Reduction
│
├── 📁 3. Order Service - Success Path
│   ├── 5. Order - Create Order (Success Path)
│   ├── 6. Order - Get Order by ID (CONFIRMED)
│   └── 10. Order - Create Multi-Product Order
│
├── 📁 4. Order Service - Error Handling
│   ├── 8. Order - Create Order (Insufficient Stock)
│   └── 9. Order - Get Cancelled Order
│
└── 📁 5. General
    └── 11. Order - List All Orders
```

---

## 🧪 Scripts de Test Automáticos

Todas las requests incluyen **tests automáticos** que validan:

- ✅ Status codes correctos (200, 201, 404)
- ✅ Estructura de las respuestas
- ✅ Estados de las órdenes (PENDING, CONFIRMED, CANCELLED)
- ✅ Actualización automática de variables de entorno

### Ver Resultados de Tests

Después de ejecutar una request:
1. Ve a la pestaña **"Test Results"**
2. Verás los tests con ✅ (passed) o ❌ (failed)

---

## 🎯 Tips Importantes

### 1. Variables Automáticas

Las siguientes variables se guardan **automáticamente**:
- `order_id` → Cuando creas una orden exitosa
- `order_id_rejected` → Cuando creas una orden con stock insuficiente
- `order_id_multi` → Cuando creas una orden con múltiples productos

### 2. Logs en Console

Abre la **Console de Postman** (View → Show Postman Console) para ver:
- IDs de órdenes creadas
- Mensajes de espera
- Detalles de las responses

### 3. Esperas entre Requests

⚠️ **IMPORTANTE**: Cuando crees una orden, espera **5 segundos** antes de consultar su estado. Esto permite que RabbitMQ procese los eventos.

---

## 🐛 Solución de Problemas

### Error: "Could not get any response"

**Causa**: Los servicios no están activos.

**Solución**:
```powershell
cd infrastructure
docker-compose ps
```
Verifica que todos los servicios estén "Up".

### Error: "Cannot read property 'orderId' of undefined"

**Causa**: La variable `order_id` está vacía.

**Solución**:
1. Ejecuta primero la request **"5. Order - Create Order (Success Path)"**
2. Espera que el status sea 201
3. Verifica que en Environment aparezca el `order_id`

### Las órdenes no cambian de estado

**Causa**: RabbitMQ no está procesando los eventos.

**Solución**:
1. Verifica que RabbitMQ esté activo:
   ```powershell
   docker-compose logs rabbitmq --tail=20
   ```
2. Verifica los logs del inventory-service:
   ```powershell
   docker-compose logs inventory-service --tail=20
   ```

---

## 📸 Capturas para Entrega ESPE

Toma capturas de pantalla de:

1. ✅ Environment configurado con las variables
2. ✅ Request "2. Get Stock P-001" mostrando stock inicial (25)
3. ✅ Request "5. Create Order" con status 201 y estado PENDING
4. ✅ Request "6. Get Order by ID" mostrando estado CONFIRMED
5. ✅ Request "7. Verify Stock Reduction" mostrando stock reducido (23)
6. ✅ Request "9. Get Cancelled Order" mostrando estado CANCELLED
7. ✅ Pestaña "Test Results" mostrando tests passed (✅)
8. ✅ Console mostrando los logs de ejecución

---

## 📚 Documentación Adicional

- **Guía Completa de Postman**: [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md)
- **Reporte de Validación**: [VALIDATION_REPORT.md](VALIDATION_REPORT.md)
- **README Principal**: [README.md](README.md)

---

## ✅ Checklist Final

Antes de tu presentación, verifica:

- [ ] Sistema activo (docker-compose ps)
- [ ] Colección importada en Postman
- [ ] Environment configurado y activado
- [ ] Health Check ejecutado exitosamente
- [ ] Al menos 1 flujo completo ejecutado (orden exitosa + orden rechazada)
- [ ] Capturas de pantalla tomadas
- [ ] Console de Postman abierta para mostrar logs

---

## 🎓 ¡Listo para ESPE!

Con estos archivos puedes:
- ✅ Importar la colección completa en segundos
- ✅ Ejecutar todas las pruebas de forma ordenada
- ✅ Validar el funcionamiento del sistema
- ✅ Demostrar el flujo event-driven
- ✅ Presentar evidencias profesionales

**¡Mucha suerte en tu presentación! 🚀**
