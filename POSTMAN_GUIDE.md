# 🚀 Guía Completa de Pruebas con Postman

## 📋 Tabla de Contenidos
1. [Configuración Inicial](#configuración-inicial)
2. [Variables de Entorno](#variables-de-entorno)
3. [Pruebas del Inventory Service](#pruebas-del-inventory-service)
4. [Pruebas del Order Service](#pruebas-del-order-service)
5. [Flujo Completo End-to-End](#flujo-completo-end-to-end)
6. [Casos de Prueba Avanzados](#casos-de-prueba-avanzados)

---

## 🔧 Configuración Inicial

### Paso 1: Verificar que el Sistema está Activo

Antes de comenzar, verifica en tu terminal:

```powershell
cd infrastructure
docker-compose ps
```

Debes ver los 4 servicios con estado "Up":
- ✅ order-service (8080)
- ✅ inventory-service (8081)
- ✅ rabbitmq (5672, 15672)
- ✅ postgres (5432)

### Paso 2: Abrir Postman

1. Descarga Postman desde: https://www.postman.com/downloads/
2. Instala y abre Postman
3. Crea un nuevo Workspace llamado "ESPE - E-Commerce Microservices"

---

## 🌍 Variables de Entorno

### Crear Environment en Postman

1. Click en "Environments" (icono de ojo en la esquina superior derecha)
2. Click en "+" para crear un nuevo environment
3. Nombre: `E-Commerce Local`
4. Agregar las siguientes variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `order_service_url` | http://localhost:8080 | http://localhost:8080 |
| `inventory_service_url` | http://localhost:8081 | http://localhost:8081 |
| `order_id` | | (se llenará automáticamente) |

5. Click en "Save"
6. Selecciona el environment "E-Commerce Local" en el dropdown

---

## 📦 Pruebas del Inventory Service

### 1️⃣ Health Check

**Método:** `GET`  
**URL:** `{{inventory_service_url}}/health`

**Descripción:** Verifica que el servicio de inventario está funcionando.

**Response esperada (200 OK):**
```json
{
  "status": "UP",
  "service": "inventory-service"
}
```

📸 **Captura de Pantalla:**
- Guarda esta request como "1. Inventory - Health Check"

---

### 2️⃣ Consultar Stock - Laptop Dell

**Método:** `GET`  
**URL:** `{{inventory_service_url}}/api/v1/products/P-001/stock`

**Descripción:** Obtiene el stock disponible del producto P-001 (Laptop Dell XPS 15).

**Response esperada (200 OK):**
```json
{
  "productId": "P-001",
  "name": "Laptop Dell XPS 15",
  "availableStock": 25,
  "reservedStock": 0
}
```

📸 **Captura de Pantalla:**
- Guarda como "2. Inventory - Get Stock P-001"

---

### 3️⃣ Consultar Stock - iPhone 15 Pro

**Método:** `GET`  
**URL:** `{{inventory_service_url}}/api/v1/products/P-002/stock`

**Response esperada (200 OK):**
```json
{
  "productId": "P-002",
  "name": "iPhone 15 Pro",
  "availableStock": 50,
  "reservedStock": 0
}
```

📸 **Captura de Pantalla:**
- Guarda como "3. Inventory - Get Stock P-002"

---

### 4️⃣ Consultar Stock - Producto NO Existente

**Método:** `GET`  
**URL:** `{{inventory_service_url}}/api/v1/products/P-999/stock`

**Descripción:** Prueba el manejo de errores cuando el producto no existe.

**Response esperada (404 Not Found):**
```json
{
  "error": "Product P-999 not found"
}
```

📸 **Captura de Pantalla:**
- Guarda como "4. Inventory - Product Not Found (Error)"

---

## 📦 Pruebas del Order Service

### 5️⃣ Crear Orden - Stock Suficiente (1 Producto)

**Método:** `POST`  
**URL:** `{{order_service_url}}/api/v1/orders`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "customerId": "CUST-001",
  "shippingAddress": "Av. Universitaria 123, Sangolquí, Ecuador",
  "paymentReference": "PAY-12345",
  "items": [
    {
      "productId": "P-001",
      "quantity": 2
    }
  ]
}
```

**Response esperada (201 Created):**
```json
{
  "orderId": "abc123...",
  "customerId": "CUST-001",
  "items": [
    {
      "productId": "P-001",
      "quantity": 2
    }
  ],
  "shippingAddress": "Av. Universitaria 123, Sangolquí, Ecuador",
  "paymentReference": "PAY-12345",
  "status": "PENDING",
  "cancellationReason": null,
  "createdAt": "2026-01-21T...",
  "updatedAt": "2026-01-21T..."
}
```

**🔥 Script Post-Response:**
Agrega este script en la pestaña "Tests" para guardar el orderId automáticamente:

```javascript
// Guardar orderId en la variable de entorno
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("order_id", response.orderId);
    console.log("Order ID guardado: " + response.orderId);
}

// Test de validación
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Order status is PENDING", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("PENDING");
});
```

📸 **Captura de Pantalla:**
- Guarda como "5. Order - Create Order (Success Path)"
- Anota el `orderId` que se genera

---

### 6️⃣ Consultar Orden por ID (Verificar Estado CONFIRMED)

**Método:** `GET`  
**URL:** `{{order_service_url}}/api/v1/orders/{{order_id}}`

**⏱️ IMPORTANTE:** Espera 4-5 segundos después de crear la orden antes de ejecutar esta request.

**Descripción:** Verifica que el estado cambió de PENDING → CONFIRMED automáticamente.

**Response esperada (200 OK):**
```json
{
  "orderId": "abc123...",
  "customerId": "CUST-001",
  "items": [
    {
      "productId": "P-001",
      "quantity": 2
    }
  ],
  "shippingAddress": "Av. Universitaria 123, Sangolquí, Ecuador",
  "paymentReference": "PAY-12345",
  "status": "CONFIRMED",  // ✅ Cambió de PENDING a CONFIRMED
  "cancellationReason": null,
  "createdAt": "2026-01-21T...",
  "updatedAt": "2026-01-21T..."  // ✅ updatedAt es diferente a createdAt
}
```

**🔥 Script Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Order status is CONFIRMED", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("CONFIRMED");
});

pm.test("UpdatedAt is after CreatedAt", function () {
    const jsonData = pm.response.json();
    const created = new Date(jsonData.createdAt);
    const updated = new Date(jsonData.updatedAt);
    pm.expect(updated.getTime()).to.be.greaterThan(created.getTime());
});
```

📸 **Captura de Pantalla:**
- Guarda como "6. Order - Get Order by ID (CONFIRMED)"
- Captura que muestre el estado CONFIRMED

---

### 7️⃣ Verificar Actualización de Stock

**Método:** `GET`  
**URL:** `{{inventory_service_url}}/api/v1/products/P-001/stock`

**Descripción:** Verifica que el stock se redujo correctamente.

**Response esperada (200 OK):**
```json
{
  "productId": "P-001",
  "name": "Laptop Dell XPS 15",
  "availableStock": 23,  // ✅ Reducido de 25 a 23
  "reservedStock": 2     // ✅ Reservado 2 unidades
}
```

**🔥 Script Tests:**
```javascript
pm.test("Available stock reduced", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.availableStock).to.be.below(25);
});

pm.test("Reserved stock increased", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.reservedStock).to.be.above(0);
});
```

📸 **Captura de Pantalla:**
- Guarda como "7. Inventory - Verify Stock Reduction"

---

### 8️⃣ Crear Orden - Stock Insuficiente

**Método:** `POST`  
**URL:** `{{order_service_url}}/api/v1/orders`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "customerId": "CUST-002",
  "shippingAddress": "Calle Principal 456, Quito, Ecuador",
  "paymentReference": "PAY-67890",
  "items": [
    {
      "productId": "P-001",
      "quantity": 50
    }
  ]
}
```

**Response esperada (201 Created):**
```json
{
  "orderId": "xyz789...",
  "customerId": "CUST-002",
  "items": [
    {
      "productId": "P-001",
      "quantity": 50
    }
  ],
  "shippingAddress": "Calle Principal 456, Quito, Ecuador",
  "paymentReference": "PAY-67890",
  "status": "PENDING",
  "cancellationReason": null,
  "createdAt": "2026-01-21T...",
  "updatedAt": "2026-01-21T..."
}
```

**🔥 Script Post-Response:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("order_id_rejected", response.orderId);
}

pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
```

📸 **Captura de Pantalla:**
- Guarda como "8. Order - Create Order (Insufficient Stock)"

---

### 9️⃣ Verificar Orden Cancelada

**Método:** `GET`  
**URL:** `{{order_service_url}}/api/v1/orders/{{order_id_rejected}}`

**⏱️ IMPORTANTE:** Espera 4-5 segundos después de crear la orden.

**Response esperada (200 OK):**
```json
{
  "orderId": "xyz789...",
  "customerId": "CUST-002",
  "items": [
    {
      "productId": "P-001",
      "quantity": 50
    }
  ],
  "shippingAddress": "Calle Principal 456, Quito, Ecuador",
  "paymentReference": "PAY-67890",
  "status": "CANCELLED",  // ✅ Cambió a CANCELLED
  "cancellationReason": "Product P-001: requested 50, available 23",  // ✅ Razón específica
  "createdAt": "2026-01-21T...",
  "updatedAt": "2026-01-21T..."
}
```

**🔥 Script Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Order status is CANCELLED", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("CANCELLED");
});

pm.test("Cancellation reason is provided", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.cancellationReason).to.not.be.null;
    pm.expect(jsonData.cancellationReason).to.include("requested 50");
});
```

📸 **Captura de Pantalla:**
- Guarda como "9. Order - Get Cancelled Order"

---

### 🔟 Crear Orden con Múltiples Productos

**Método:** `POST`  
**URL:** `{{order_service_url}}/api/v1/orders`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "customerId": "CUST-003",
  "shippingAddress": "Av. Los Shyris 234, Quito, Ecuador",
  "paymentReference": "PAY-MULTI-001",
  "items": [
    {
      "productId": "P-001",
      "quantity": 1
    },
    {
      "productId": "P-002",
      "quantity": 3
    },
    {
      "productId": "P-003",
      "quantity": 2
    }
  ]
}
```

**Response esperada (201 Created):**
```json
{
  "orderId": "multi123...",
  "customerId": "CUST-003",
  "items": [
    {
      "productId": "P-001",
      "quantity": 1
    },
    {
      "productId": "P-002",
      "quantity": 3
    },
    {
      "productId": "P-003",
      "quantity": 2
    }
  ],
  "shippingAddress": "Av. Los Shyris 234, Quito, Ecuador",
  "paymentReference": "PAY-MULTI-001",
  "status": "PENDING",
  "cancellationReason": null,
  "createdAt": "2026-01-21T...",
  "updatedAt": "2026-01-21T..."
}
```

📸 **Captura de Pantalla:**
- Guarda como "10. Order - Create Multi-Product Order"

---

### 1️⃣1️⃣ Listar Todas las Órdenes

**Método:** `GET`  
**URL:** `{{order_service_url}}/api/v1/orders`

**Descripción:** Obtiene todas las órdenes creadas.

**Response esperada (200 OK):**
```json
[
  {
    "orderId": "abc123...",
    "customerId": "CUST-001",
    "status": "CONFIRMED",
    ...
  },
  {
    "orderId": "xyz789...",
    "customerId": "CUST-002",
    "status": "CANCELLED",
    ...
  },
  {
    "orderId": "multi123...",
    "customerId": "CUST-003",
    "status": "CONFIRMED",
    ...
  }
]
```

**🔥 Script Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});

pm.test("At least one order exists", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.length).to.be.above(0);
});
```

📸 **Captura de Pantalla:**
- Guarda como "11. Order - List All Orders"

---

## 🔄 Flujo Completo End-to-End

### Secuencia de Pruebas Recomendada

**Ejecuta las requests en este orden para simular un flujo real:**

1. ✅ **1. Inventory - Health Check** → Verificar sistema activo
2. ✅ **2. Inventory - Get Stock P-001** → Ver stock inicial (25)
3. ✅ **5. Order - Create Order (Success Path)** → Crear orden de 2 unidades
4. ⏱️ **Esperar 5 segundos**
5. ✅ **6. Order - Get Order by ID (CONFIRMED)** → Verificar estado CONFIRMED
6. ✅ **7. Inventory - Verify Stock Reduction** → Verificar stock (23)
7. ✅ **8. Order - Create Order (Insufficient Stock)** → Intentar orden de 50 unidades
8. ⏱️ **Esperar 5 segundos**
9. ✅ **9. Order - Get Cancelled Order** → Verificar estado CANCELLED

### ⏱️ Tip: Automatizar Esperas en Postman

Para evitar esperar manualmente, agrega este script en la pestaña "Tests" de la request de creación de orden:

```javascript
// Esperar 5 segundos y ejecutar la siguiente request automáticamente
setTimeout(function() {
    console.log("Esperando 5 segundos para que el evento se procese...");
}, 5000);
```

---

## 🧪 Casos de Prueba Avanzados

### 1️⃣2️⃣ Prueba de Validación - Campo Requerido Faltante

**Método:** `POST`  
**URL:** `{{order_service_url}}/api/v1/orders`  
**Body:**
```json
{
  "customerId": "CUST-004",
  "shippingAddress": "Test Address",
  "items": [
    {
      "productId": "P-001",
      "quantity": 1
    }
  ]
  // ❌ Falta paymentReference
}
```

**Response esperada (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "message": "paymentReference is required"
}
```

📸 **Captura de Pantalla:**
- Guarda como "12. Order - Validation Error (Missing Field)"

---

### 1️⃣3️⃣ Prueba de Validación - Cantidad Cero

**Método:** `POST`  
**URL:** `{{order_service_url}}/api/v1/orders`  
**Body:**
```json
{
  "customerId": "CUST-005",
  "shippingAddress": "Test Address",
  "paymentReference": "PAY-000",
  "items": [
    {
      "productId": "P-001",
      "quantity": 0  // ❌ Cantidad inválida
    }
  ]
}
```

**Response esperada (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "message": "Quantity must be greater than 0"
}
```

📸 **Captura de Pantalla:**
- Guarda como "13. Order - Validation Error (Zero Quantity)"

---

### 1️⃣4️⃣ Prueba de Todos los Productos

**Ejecuta estas requests para verificar todos los productos del catálogo:**

```
GET {{inventory_service_url}}/api/v1/products/P-001/stock  → Laptop Dell XPS 15
GET {{inventory_service_url}}/api/v1/products/P-002/stock  → iPhone 15 Pro
GET {{inventory_service_url}}/api/v1/products/P-003/stock  → Samsung Galaxy S24
GET {{inventory_service_url}}/api/v1/products/P-004/stock  → MacBook Pro M3
GET {{inventory_service_url}}/api/v1/products/P-005/stock  → iPad Air
```

---

## 📊 Exportar Colección de Postman

### Paso 1: Organizar las Requests

Crea una Collection llamada "ESPE E-Commerce API" con las siguientes carpetas:

```
📁 ESPE E-Commerce API
├── 📁 1. Health Checks
│   ├── 1. Inventory - Health Check
│
├── 📁 2. Inventory Service
│   ├── 2. Inventory - Get Stock P-001
│   ├── 3. Inventory - Get Stock P-002
│   ├── 4. Inventory - Product Not Found (Error)
│   └── 7. Inventory - Verify Stock Reduction
│
├── 📁 3. Order Service - Success Path
│   ├── 5. Order - Create Order (Success Path)
│   ├── 6. Order - Get Order by ID (CONFIRMED)
│   └── 10. Order - Create Multi-Product Order
│
├── 📁 4. Order Service - Error Handling
│   ├── 8. Order - Create Order (Insufficient Stock)
│   ├── 9. Order - Get Cancelled Order
│   ├── 12. Order - Validation Error (Missing Field)
│   └── 13. Order - Validation Error (Zero Quantity)
│
└── 📁 5. General
    └── 11. Order - List All Orders
```

### Paso 2: Exportar la Colección

1. Click derecho en "ESPE E-Commerce API"
2. Click en "Export"
3. Selecciona "Collection v2.1"
4. Guarda como `ESPE-ECommerce-Postman-Collection.json`

---

## 📸 Checklist de Capturas de Pantalla para Entrega

Para tu informe de ESPE, toma capturas de pantalla de:

- [ ] Variables de entorno configuradas
- [ ] Request #2: Stock inicial de P-001 (25 unidades)
- [ ] Request #5: Creación de orden exitosa (Status: PENDING)
- [ ] Request #6: Orden confirmada automáticamente (Status: CONFIRMED)
- [ ] Request #7: Stock reducido (23 disponibles, 2 reservados)
- [ ] Request #8: Creación de orden con stock insuficiente
- [ ] Request #9: Orden cancelada (Status: CANCELLED con razón)
- [ ] Request #11: Lista de todas las órdenes
- [ ] RabbitMQ Management UI mostrando los exchanges y queues
- [ ] Terminal con logs de inventory-service mostrando eventos

---

## 🎓 Tips para la Presentación a ESPE

### 1. Demostración en Vivo

**Secuencia recomendada:**
1. Mostrar sistema activo: `docker-compose ps`
2. Abrir RabbitMQ Management UI: http://localhost:15672
3. Ejecutar Health Check en Postman
4. Consultar stock inicial
5. Crear orden exitosa
6. **Mientras esperas 5 segundos**, mostrar en RabbitMQ que el mensaje fue procesado
7. Verificar orden confirmada
8. Verificar stock actualizado
9. Crear orden con stock insuficiente
10. Verificar orden cancelada

### 2. Puntos Clave a Mencionar

- ✅ **Comunicación Asíncrona**: Los servicios no se bloquean esperando respuestas
- ✅ **Event-Driven Architecture**: OrderCreated → StockReserved/StockRejected
- ✅ **Desacoplamiento**: Order Service e Inventory Service son independientes
- ✅ **Resiliencia**: Si un servicio falla, los mensajes quedan en la cola
- ✅ **Escalabilidad**: Puedes tener múltiples instancias de cada servicio

### 3. Preparación

- Ejecuta todas las pruebas al menos 2 veces antes de la presentación
- Ten las capturas de pantalla listas
- Prepara un script de lo que vas a decir en cada paso
- Ten abierto el RabbitMQ Management UI para mostrar los exchanges
- Ten los logs abiertos en otra ventana para mostrar el flujo de eventos

---

## 🔗 Recursos Adicionales

- **Documentación Completa**: [README.md](README.md)
- **Reporte de Validación**: [VALIDATION_REPORT.md](VALIDATION_REPORT.md)
- **Diagramas de Arquitectura**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Diagramas de Secuencia**: [DIAGRAMAS_SECUENCIA.md](DIAGRAMAS_SECUENCIA.md)

---

## ✅ Conclusión

Siguiendo esta guía, podrás:
- ✅ Realizar todas las pruebas de forma estructurada
- ✅ Validar el funcionamiento completo del sistema
- ✅ Demostrar el flujo event-driven
- ✅ Presentar evidencias profesionales a ESPE
- ✅ Responder preguntas técnicas con confianza

**¡Mucha suerte en tu presentación! 🎓🚀**
