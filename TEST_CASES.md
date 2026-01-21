# 🧪 CASOS DE PRUEBA - SISTEMA E-COMMERCE

## Test Suite Completo para Evaluación

---

## PRUEBA 1: Flujo Completo Exitoso

### Objetivo
Verificar que un pedido con stock disponible se procesa correctamente y transita de PENDING a CONFIRMED.

### Pasos

1. **Verificar stock inicial del producto P-001**
```bash
curl http://localhost:8081/api/v1/products/P-001/stock
```
**Resultado esperado**: 
```json
{
  "productId": "P-001",
  "name": "Laptop Dell XPS 15",
  "availableStock": 25,
  "reservedStock": 0
}
```

2. **Crear pedido con 3 unidades**
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "items": [
      {
        "productId": "P-001",
        "quantity": 3
      }
    ],
    "shippingAddress": "Av. General Rumiñahui, Sangolquí, Pichincha, Ecuador",
    "paymentReference": "PAY-2026-001-VISA"
  }'
```
**Resultado esperado**: HTTP 201
```json
{
  "orderId": "uuid-generado",
  "status": "PENDING",
  "customerId": "550e8400-e29b-41d4-a716-446655440001",
  "items": [...],
  "createdAt": "2026-01-21T...",
  "updatedAt": "2026-01-21T..."
}
```

3. **Guardar el orderId y esperar 3-5 segundos**

4. **Consultar estado del pedido**
```bash
curl http://localhost:8080/api/v1/orders/{orderId}
```
**Resultado esperado**: 
```json
{
  "orderId": "...",
  "status": "CONFIRMED",
  "cancellationReason": null,
  ...
}
```

5. **Verificar stock actualizado**
```bash
curl http://localhost:8081/api/v1/products/P-001/stock
```
**Resultado esperado**:
```json
{
  "availableStock": 22,  // 25 - 3 = 22
  "reservedStock": 3
}
```

### ✅ Criterios de Aceptación
- [ ] Pedido creado con status PENDING
- [ ] Pedido actualizado automáticamente a CONFIRMED
- [ ] Stock disponible reducido en 3 unidades
- [ ] Stock reservado incrementado en 3 unidades
- [ ] No hay errores en logs

---

## PRUEBA 2: Rechazo por Stock Insuficiente

### Objetivo
Verificar que un pedido que excede el stock disponible es rechazado y marcado como CANCELLED.

### Pasos

1. **Consultar stock actual de P-004**
```bash
curl http://localhost:8081/api/v1/products/P-004/stock
```
**Nota**: Debe tener 15 unidades disponibles

2. **Intentar ordenar 20 unidades (más de las disponibles)**
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "550e8400-e29b-41d4-a716-446655440002",
    "items": [
      {
        "productId": "P-004",
        "quantity": 20
      }
    ],
    "shippingAddress": "Quito, Ecuador",
    "paymentReference": "PAY-2026-002-MC"
  }'
```

3. **Esperar 3-5 segundos y consultar estado**
```bash
curl http://localhost:8080/api/v1/orders/{orderId}
```
**Resultado esperado**:
```json
{
  "status": "CANCELLED",
  "cancellationReason": "Product P-004: requested 20, available 15"
}
```

4. **Verificar que el stock NO cambió**
```bash
curl http://localhost:8081/api/v1/products/P-004/stock
```
**Resultado esperado**:
```json
{
  "availableStock": 15,  // Sin cambios
  "reservedStock": 0     // Sin cambios
}
```

### ✅ Criterios de Aceptación
- [ ] Pedido creado inicialmente con PENDING
- [ ] Pedido actualizado automáticamente a CANCELLED
- [ ] cancellationReason contiene explicación del rechazo
- [ ] Stock NO fue modificado
- [ ] Evento StockRejected publicado correctamente

---

## PRUEBA 3: Pedido Multi-Producto

### Objetivo
Verificar que se pueden ordenar múltiples productos en una sola orden.

### Pasos

1. **Crear pedido con 3 productos diferentes**
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "550e8400-e29b-41d4-a716-446655440003",
    "items": [
      {
        "productId": "P-001",
        "quantity": 1
      },
      {
        "productId": "P-002",
        "quantity": 2
      },
      {
        "productId": "P-005",
        "quantity": 1
      }
    ],
    "shippingAddress": "Latacunga, Ecuador",
    "paymentReference": "PAY-2026-003-AMEX"
  }'
```

2. **Consultar estado después de 3-5 segundos**
```bash
curl http://localhost:8080/api/v1/orders/{orderId}
```
**Resultado esperado**: `status: "CONFIRMED"`

3. **Verificar stock de cada producto**
```bash
# Producto 1
curl http://localhost:8081/api/v1/products/P-001/stock
# availableStock debe disminuir en 1

# Producto 2
curl http://localhost:8081/api/v1/products/P-002/stock
# availableStock debe disminuir en 2

# Producto 5
curl http://localhost:8081/api/v1/products/P-005/stock
# availableStock debe disminuir en 1
```

### ✅ Criterios de Aceptación
- [ ] Pedido con múltiples items procesado correctamente
- [ ] Stock de TODOS los productos actualizado
- [ ] Orden confirmada exitosamente

---

## PRUEBA 4: Rechazo Parcial (Un producto sin stock)

### Objetivo
Verificar que si UNO de los productos no tiene stock suficiente, TODA la orden se cancela (transacción atómica).

### Pasos

1. **Crear pedido donde uno de los productos excede el stock**
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "550e8400-e29b-41d4-a716-446655440004",
    "items": [
      {
        "productId": "P-002",
        "quantity": 5
      },
      {
        "productId": "P-004",
        "quantity": 100
      }
    ],
    "shippingAddress": "Ambato, Ecuador",
    "paymentReference": "PAY-2026-004-CASH"
  }'
```
**Nota**: P-002 tiene stock suficiente, pero P-004 NO

2. **Consultar estado**
```bash
curl http://localhost:8080/api/v1/orders/{orderId}
```
**Resultado esperado**:
```json
{
  "status": "CANCELLED",
  "cancellationReason": "Product P-004: requested 100, available 15"
}
```

3. **Verificar que NINGÚN stock cambió (rollback automático)**
```bash
curl http://localhost:8081/api/v1/products/P-002/stock
# Stock debe permanecer SIN CAMBIOS

curl http://localhost:8081/api/v1/products/P-004/stock
# Stock debe permanecer SIN CAMBIOS
```

### ✅ Criterios de Aceptación
- [ ] Orden rechazada completamente
- [ ] Stock de P-002 NO modificado (a pesar de tener disponibilidad)
- [ ] Stock de P-004 NO modificado
- [ ] Comportamiento de "todo o nada" (atomicidad)

---

## PRUEBA 5: Producto Inexistente

### Objetivo
Verificar el manejo de errores cuando se solicita un producto que no existe.

### Pasos

1. **Crear pedido con producto inexistente**
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "550e8400-e29b-41d4-a716-446655440005",
    "items": [
      {
        "productId": "P-999",
        "quantity": 1
      }
    ],
    "shippingAddress": "Cuenca, Ecuador",
    "paymentReference": "PAY-2026-005"
  }'
```

2. **Consultar estado**
```bash
curl http://localhost:8080/api/v1/orders/{orderId}
```
**Resultado esperado**:
```json
{
  "status": "CANCELLED",
  "cancellationReason": "Product P-999 not found"
}
```

### ✅ Criterios de Aceptación
- [ ] Orden cancelada con razón "Product not found"
- [ ] No se produce error catastrófico
- [ ] Mensaje de error claro

---

## PRUEBA 6: Validación de Entrada

### Objetivo
Verificar que el Order Service valida correctamente los datos de entrada.

### Pasos

1. **Intentar crear pedido sin customerId**
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "P-001", "quantity": 1}],
    "shippingAddress": "Ecuador",
    "paymentReference": "PAY-001"
  }'
```
**Resultado esperado**: HTTP 400 Bad Request

2. **Intentar crear pedido con quantity = 0**
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-001",
    "items": [{"productId": "P-001", "quantity": 0}],
    "shippingAddress": "Ecuador",
    "paymentReference": "PAY-001"
  }'
```
**Resultado esperado**: HTTP 400 Bad Request

3. **Intentar crear pedido sin items**
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-001",
    "items": [],
    "shippingAddress": "Ecuador",
    "paymentReference": "PAY-001"
  }'
```
**Resultado esperado**: HTTP 400 Bad Request

### ✅ Criterios de Aceptación
- [ ] Validación de campos obligatorios
- [ ] Validación de cantidad mínima
- [ ] Respuestas HTTP apropiadas (400)

---

## PRUEBA 7: Monitoreo de RabbitMQ

### Objetivo
Verificar que los eventos se publican y consumen correctamente.

### Pasos

1. **Abrir RabbitMQ Management Console**
   - URL: http://localhost:15672
   - Usuario: guest / Contraseña: guest

2. **Verificar Exchange**
   - Ir a tab "Exchanges"
   - Buscar "orders.exchange"
   - Verificar que existe y es de tipo "topic"

3. **Verificar Queues**
   - Ir a tab "Queues"
   - Debe haber 3 queues:
     - order.created.queue
     - stock.reserved.queue
     - stock.rejected.queue

4. **Crear un pedido y observar en tiempo real**
   - Ir a la queue "order.created.queue"
   - Click en "Get Messages"
   - Crear un pedido
   - Refrescar y observar mensaje (breve aparición antes de consumirse)

5. **Verificar Consumers**
   - Cada queue debe tener 1 consumidor activo
   - order.created.queue → inventory-service
   - stock.reserved.queue → order-service
   - stock.rejected.queue → order-service

### ✅ Criterios de Aceptación
- [ ] Exchange configurado correctamente
- [ ] 3 queues creadas y vinculadas
- [ ] Consumidores activos en cada queue
- [ ] Mensajes se procesan (no quedan atascados)

---

## PRUEBA 8: Verificación de Logs

### Objetivo
Verificar que los servicios generan logs informativos.

### Pasos

1. **Ver logs del Order Service**
```bash
docker-compose logs order-service | tail -50
```
**Buscar**:
- "Publishing OrderCreated event"
- "Received StockReserved event"
- "Order X confirmed"

2. **Ver logs del Inventory Service**
```bash
docker-compose logs inventory-service | tail -50
```
**Buscar**:
- "Received OrderCreated event"
- "Publishing StockReserved event"
- "Stock reserved for product"

### ✅ Criterios de Aceptación
- [ ] Logs claros y descriptivos
- [ ] Sin errores críticos
- [ ] Trazabilidad de eventos

---

## 📊 RESUMEN DE PRUEBAS

| # | Prueba | Objetivo | Estado |
|---|--------|----------|--------|
| 1 | Flujo Exitoso | Orden confirmada con stock | ⬜ |
| 2 | Stock Insuficiente | Orden cancelada | ⬜ |
| 3 | Multi-Producto | Múltiples items | ⬜ |
| 4 | Rechazo Parcial | Atomicidad | ⬜ |
| 5 | Producto Inexistente | Manejo de errores | ⬜ |
| 6 | Validación | Datos inválidos | ⬜ |
| 7 | RabbitMQ | Mensajería | ⬜ |
| 8 | Logs | Trazabilidad | ⬜ |

---

## 🎯 Puntos de Evaluación ESPE

- **Arquitectura (20%)**: Microservicios independientes ✓
- **Comunicación Asíncrona (25%)**: RabbitMQ con eventos ✓
- **Persistencia (15%)**: H2 y PostgreSQL ✓
- **Contratos de Datos (15%)**: JSON con UUIDs ✓
- **Dockerización (15%)**: docker-compose funcional ✓
- **Pruebas (10%)**: Casos de prueba documentados ✓

---

**Universidad de las Fuerzas Armadas (ESPE)**  
Aplicaciones Distribuidas - Test Suite v1.0
