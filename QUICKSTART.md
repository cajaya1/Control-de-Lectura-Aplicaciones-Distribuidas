
```bash
# 1. Abrir PowerShell en el directorio del proyecto
cd "c:\Users\cajh1\OneDrive\Documentos1\ESPE\OCT 25\DISTRIBUIDAS\P3\ControlDeLectura"

# 2. Ejecutar el script de inicio
.\start.bat

# 3. Esperar a que los servicios estén listos (aprox. 30 segundos)
```

#### Opción Manual:
```bash
# Desde el directorio infrastructure/
cd infrastructure
docker-compose up --build
```

---
### 1. RabbitMQ Management Console
- **URL**: http://localhost:15672
- **Usuario**: `guest`
- **Contraseña**: `guest`
- **Verificar**: Debe mostrar 3 queues y 1 exchange

### 2. Order Service
```bash
curl http://localhost:8080/actuator/health
# Respuesta esperada: {"status":"UP"}
```

### 3. Inventory Service
```bash
curl http://localhost:8081/health
# Respuesta esperada: {"status":"UP","service":"inventory-service"}
```

### 4. H2 Console (Base de datos Order Service)
- **URL**: http://localhost:8080/h2-console
- **JDBC URL**: `jdbc:h2:mem:orderdb`
- **Usuario**: `sa`
- **Contraseña**: (dejar vacío)

---

#### Paso 1: Crear un pedido
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d "{\"customerId\":\"CUST-001\",\"items\":[{\"productId\":\"P-001\",\"quantity\":2}],\"shippingAddress\":\"Sangolquí, Ecuador\",\"paymentReference\":\"PAY-001\"}"
```

**Resultado esperado**: HTTP 201 con JSON conteniendo `orderId` y `status: "PENDING"`

#### Paso 2: Copiar el `orderId` de la respuesta

#### Paso 3: Esperar 3 segundos (para que RabbitMQ procese)

#### Paso 4: Consultar el estado del pedido
```bash
curl http://localhost:8080/api/v1/orders/{PEGAR_ORDERID_AQUI}
```

**Resultado esperado**: `status: "CONFIRMED"`

#### Paso 5: Verificar que el stock se redujo
```bash
curl http://localhost:8081/api/v1/products/P-001/stock
```

**Resultado esperado**:
```json
{
  "productId": "P-001",
  "name": "Laptop Dell XPS 15",
  "availableStock": 23,    // Era 25, ahora 23
  "reservedStock": 2       // Incrementó en 2
}
```

---

### Escenario 2: Pedido Rechazado (Stock Insuficiente)

#### Paso 1: Solicitar más stock del disponible
```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d "{\"customerId\":\"CUST-002\",\"items\":[{\"productId\":\"P-001\",\"quantity\":100}],\"shippingAddress\":\"Quito, Ecuador\",\"paymentReference\":\"PAY-002\"}"
```

#### Paso 2: Consultar el estado
```bash
curl http://localhost:8080/api/v1/orders/{ORDERID}
```

**Resultado esperado**:
```json
{
  "orderId": "...",
  "status": "CANCELLED",
  "cancellationReason": "Product P-001: requested 100, available 23"
}
```

---

## Monitoreo en RabbitMQ

1. Abrir http://localhost:15672
2. Ir a **Queues**
3. Observar cómo los mensajes entran y salen de las colas:
   - `order.created.queue`
   - `stock.reserved.queue`
   - `stock.rejected.queue`

---

## Productos Disponibles Inicialmente

| Product ID | Nombre | Stock Inicial |
|------------|--------|---------------|
| P-001 | Laptop Dell XPS 15 | 25 |
| P-002 | Mouse Logitech MX Master | 50 |
| P-003 | Keyboard Mechanical RGB | 30 |
| P-004 | Monitor LG 27" 4K | 15 |
| P-005 | Webcam Logitech C920 | 40 |

---

## Detener el Sistema

```bash
cd infrastructure
docker-compose down

# Para eliminar también los volúmenes (resetear base de datos)
docker-compose down -v
```

---

## Ver Logs en Tiempo Real

```bash
# Todos los servicios
docker-compose logs -f

# Solo Order Service
docker-compose logs -f order-service

# Solo Inventory Service
docker-compose logs -f inventory-service

# Solo RabbitMQ
docker-compose logs -f rabbitmq
```

---

## Solución de Problemas Comunes

### Problema: "Cannot connect to Docker daemon"
**Solución**: Iniciar Docker Desktop

### Problema: "Port 8080 already in use"
**Solución**: Detener otros servicios en ese puerto o cambiar el puerto en docker-compose.yml

### Problema: Los eventos no se procesan
**Solución**: 
1. Verificar logs: `docker-compose logs -f`
2. Verificar en RabbitMQ Management que hay consumidores activos
3. Reiniciar servicios: `docker-compose restart`

---

## Documentación Completa

- **README.md**: Documentación detallada del proyecto
- **ARCHITECTURE.md**: Diagramas de arquitectura y flujos
- **test-requests.http**: Ejemplos de peticiones HTTP

---
