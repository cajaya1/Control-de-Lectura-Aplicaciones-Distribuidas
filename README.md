# Sistema de E-Commerce con Microservicios y RabbitMQ

## Universidad de las Fuerzas Armadas (ESPE)

---

## ✅ Estado del Proyecto

**🎉 SISTEMA COMPLETAMENTE FUNCIONAL Y VALIDADO**

| Componente | Estado | Puerto | Detalles |
|------------|--------|--------|----------|
| Order Service | ✅ Operativo | 8080 | Spring Boot, H2 Database |
| Inventory Service | ✅ Operativo | 8081 | Node.js, PostgreSQL |
| RabbitMQ | ✅ Operativo | 5672, 15672 | Management UI disponible |
| PostgreSQL | ✅ Operativo | 5432 | Base de datos persistente |

**Validación Completa**: Ver [VALIDATION_REPORT.md](VALIDATION_REPORT.md) para evidencias de pruebas.

---

## Descripción del Proyecto

Sistema de comercio electrónico basado en arquitectura de microservicios con comunicación asíncrona mediante RabbitMQ. Implementa el patrón Event-Driven Architecture para el procesamiento de pedidos e inventario.

### Arquitectura

```
┌─────────────┐      POST /orders      ┌──────────────────┐
│   Cliente   │ ──────────────────────> │  Order Service   │
└─────────────┘                         │  (Spring Boot)   │
                                        │    Puerto 8080   │
                                        └────────┬─────────┘
                                                 │
                                                 │ OrderCreated
                                                 ▼
                                        ┌─────────────────┐
                                        │    RabbitMQ     │
                                        │   Exchange:     │
                                        │ orders.exchange │
                                        └────────┬────────┘
                                                 │
                                                 │ OrderCreated
                                                 ▼
                                        ┌─────────────────────┐
                                        │ Inventory Service   │
                                        │     (Node.js)       │
                                        │    Puerto 8081      │
                                        └──────────┬──────────┘
                                                   │
                         ┌─────────────────────────┴──────────────────┐
                         │                                             │
                  Stock OK │                                    Stock NO │
                         │                                             │
                         ▼                                             ▼
              StockReserved Event                          StockRejected Event
                         │                                             │
                         └─────────────────┬───────────────────────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │  Order Service   │
                                  │ Actualiza Estado │
                                  │ CONFIRMED/       │
                                  │ CANCELLED        │
                                  └──────────────────┘
```

---

## Stack Tecnológico

| Componente | Tecnología | Puerto |
|------------|-----------|--------|
| **Order Service** | Java 17, Spring Boot 3.2.1 | 8080 |
| **Inventory Service** | Node.js 18, Express | 8081 |
| **Message Broker** | RabbitMQ 3.12 | 5672, 15672 |
| **Base de Datos** | H2 (Order) / PostgreSQL 15 (Inventory) | - |
| **Orquestación** | Docker Compose | - |

---

## Estructura del Proyecto

```
ControlDeLectura/
│
├── order-service/                    # Microservicio de Pedidos (Java)
│   ├── src/
│   │   └── main/
│   │       ├── java/ec/edu/espe/orderservice/
│   │       │   ├── controller/       # Endpoints REST
│   │       │   ├── service/          # Lógica de negocio
│   │       │   ├── model/            # Entidades JPA
│   │       │   ├── repository/       # Repositorios
│   │       │   ├── dto/              # DTOs de request/response
│   │       │   ├── event/            # Eventos de RabbitMQ
│   │       │   ├── messaging/        # Productores y Consumidores
│   │       │   └── config/           # Configuración RabbitMQ
│   │       └── resources/
│   │           └── application.properties
│   ├── pom.xml
│   └── Dockerfile
│
├── inventory-service/                # Microservicio de Inventario (Node.js)
│   ├── src/
│   │   ├── config/                   # Configuración DB y RabbitMQ
│   │   ├── models/                   # Modelos Sequelize
│   │   ├── services/                 # Lógica de negocio
│   │   ├── routes/                   # Endpoints REST
│   │   ├── messaging/                # Consumidores RabbitMQ
│   │   ├── utils/                    # Utilidades (seeder)
│   │   └── index.js                  # Punto de entrada
│   ├── package.json
│   ├── .env
│   └── Dockerfile
│
├── infrastructure/                   # Configuración Docker
│   └── docker-compose.yml
│
└── README.md                         # Este archivo
```

---

## Instrucciones de Ejecución

### Prerrequisitos

- **Docker** y **Docker Compose** instalados
- Puertos disponibles: 8080, 8081, 5672, 15672, 5432

### Paso 1: Clonar o Ubicarse en el Proyecto

```bash
cd "c:\Users\cajh1\OneDrive\Documentos1\ESPE\OCT 25\DISTRIBUIDAS\P3\ControlDeLectura"
```

### Paso 2: Construir e Iniciar los Servicios

Desde el directorio `infrastructure/`:

```bash
cd infrastructure
docker-compose up --build
```

Este comando:
- ✅ Levanta RabbitMQ con consola de administración
- ✅ Levanta PostgreSQL para el inventario
- ✅ Construye e inicia el Order Service
- ✅ Construye e inicia el Inventory Service
- ✅ Configura la red compartida entre servicios

### Paso 3: Verificar que los Servicios Están Activos

**RabbitMQ Management Console:**
```
http://localhost:15672
Usuario: guest
Contraseña: guest
```

**Order Service Health:**
```bash
curl http://localhost:8080/actuator/health
# o acceder a H2 Console: http://localhost:8080/h2-console
```

**Inventory Service Health:**
```bash
curl http://localhost:8081/health
```

---

## API Endpoints

### Order Service (Puerto 8080)

#### 1. Crear un Pedido

**Request:**
```bash
POST http://localhost:8080/api/v1/orders
Content-Type: application/json

{
  "customerId": "CUST-001",
  "items": [
    {
      "productId": "P-001",
      "quantity": 2
    },
    {
      "productId": "P-002",
      "quantity": 1
    }
  ],
  "shippingAddress": "Av. General Rumiñahui, Sangolquí, Ecuador",
  "paymentReference": "PAY-20260121-001"
}
```

**Response (201 Created):**
```json
{
  "orderId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "customerId": "CUST-001",
  "items": [
    {
      "productId": "P-001",
      "quantity": 2
    },
    {
      "productId": "P-002",
      "quantity": 1
    }
  ],
  "shippingAddress": "Av. General Rumiñahui, Sangolquí, Ecuador",
  "paymentReference": "PAY-20260121-001",
  "status": "PENDING",
  "cancellationReason": null,
  "createdAt": "2026-01-21T10:30:00",
  "updatedAt": "2026-01-21T10:30:00"
}
```

#### 2. Consultar Estado de un Pedido

**Request:**
```bash
GET http://localhost:8080/api/v1/orders/{orderId}
```

**Response (200 OK):**
```json
{
  "orderId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "CONFIRMED",
  "cancellationReason": null,
  ...
}
```

### Inventory Service (Puerto 8081)

#### Consultar Stock de un Producto

**Request:**
```bash
GET http://localhost:8081/api/v1/products/P-001/stock
```

**Response (200 OK):**
```json
{
  "productId": "P-001",
  "name": "Laptop Dell XPS 15",
  "availableStock": 23,
  "reservedStock": 2
}
```

---

## Flujo de Eventos (Event-Driven)

### Escenario 1: Stock Disponible

1. Cliente envía `POST /api/v1/orders`
2. **Order Service**:
   - Valida y guarda orden con estado `PENDING`
   - Publica evento `OrderCreated` a RabbitMQ
3. **Inventory Service**:
   - Consume `OrderCreated`
   - Verifica stock disponible 
   - Reserva el stock
   - Publica `StockReserved`
4. **Order Service**:
   - Consume `StockReserved`
   - Actualiza orden a `CONFIRMED`

### Escenario 2: Stock Insuficiente

1-2. (Igual que escenario 1)
3. **Inventory Service**:
   - Consume `OrderCreated`
   - Verifica stock insuficiente 
   - Publica `StockRejected` con razón
4. **Order Service**:
   - Consume `StockRejected`
   - Actualiza orden a `CANCELLED` con razón

---

## 📦 Contratos de Eventos (JSON Payloads)

### OrderCreated
```json
{
  "eventType": "OrderCreated",
  "orderId": "uuid-format",
  "items": [
    {
      "productId": "P-001",
      "quantity": 2
    }
  ],
  "correlationId": "uuid-format"
}
```

### StockReserved
```json
{
  "eventType": "StockReserved",
  "orderId": "uuid-format",
  "reservedItems": [
    {
      "productId": "P-001",
      "quantity": 2
    }
  ],
  "correlationId": "uuid-format"
}
```

### StockRejected
```json
{
  "eventType": "StockRejected",
  "orderId": "uuid-format",
  "reason": "Product P-001: requested 100, available 25",
  "correlationId": "uuid-format"
}
```

---

## Base de Datos

### Order Service (H2 In-Memory)

**Acceso a H2 Console:**
```
URL: http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:orderdb
Usuario: sa
Contraseña: (vacío)
```

**Tablas:**
- `orders`: Almacena los pedidos
- `order_items`: Items de cada pedido

### Inventory Service (PostgreSQL)

**Tabla: products_stock**
```sql
CREATE TABLE products_stock (
  product_id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  available_stock INTEGER DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Datos Iniciales (Seeder):**
| product_id | name | available_stock |
|------------|------|-----------------|
| P-001 | Laptop Dell XPS 15 | 25 |
| P-002 | Mouse Logitech MX Master | 50 |
| P-003 | Keyboard Mechanical RGB | 30 |
| P-004 | Monitor LG 27" 4K | 15 |
| P-005 | Webcam Logitech C920 | 40 |

---

## Pruebas de Integración

### Prueba 1: Pedido Exitoso (Stock Disponible)

```bash
# 1. Crear pedido
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-001",
    "items": [{"productId": "P-001", "quantity": 2}],
    "shippingAddress": "Sangolquí, Ecuador",
    "paymentReference": "PAY-001"
  }'

# 2. Copiar el orderId de la respuesta

# 3. Consultar estado (esperar 2-3 segundos)
curl http://localhost:8080/api/v1/orders/{orderId}
# Debe mostrar status: "CONFIRMED"

# 4. Verificar stock actualizado
curl http://localhost:8081/api/v1/products/P-001/stock
# availableStock debe ser 23, reservedStock: 2
```

### Prueba 2: Pedido Rechazado (Stock Insuficiente)

```bash
# 1. Crear pedido con cantidad excesiva
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-002",
    "items": [{"productId": "P-001", "quantity": 100}],
    "shippingAddress": "Quito, Ecuador",
    "paymentReference": "PAY-002"
  }'

# 2. Consultar estado
curl http://localhost:8080/api/v1/orders/{orderId}
# Debe mostrar:
# status: "CANCELLED"
# cancellationReason: "Product P-001: requested 100, available 25"
```

---

## RabbitMQ - Configuración

### Exchange
- **Nombre:** `orders.exchange`
- **Tipo:** Topic
- **Durable:** Yes

### Queues
| Queue | Routing Key | Consumidor |
|-------|-------------|------------|
| order.created.queue | order.created | Inventory Service |
| stock.reserved.queue | stock.reserved | Order Service |
| stock.rejected.queue | stock.rejected | Order Service |

### Visualización en RabbitMQ Management

1. Acceder a `http://localhost:15672`
2. Ir a **Exchanges** → Ver `orders.exchange`
3. Ir a **Queues** → Monitorear mensajes
4. Ir a **Connections** → Verificar servicios conectados

---

## Detener los Servicios

```bash
# Desde el directorio infrastructure/
docker-compose down

# Para eliminar también los volúmenes (datos de PostgreSQL)
docker-compose down -v
```

---

## Troubleshooting

### Problema: Order Service no se conecta a RabbitMQ

**Solución:**
- Verificar que RabbitMQ esté corriendo: `docker ps | grep rabbitmq`
- Revisar logs: `docker logs order-service`
- Esperar a que RabbitMQ esté completamente iniciado (healthcheck)

### Problema: Inventory Service no encuentra productos

**Solución:**
- Verificar que la base de datos PostgreSQL esté activa
- Revisar logs del seeder: `docker logs inventory-service`
- Conectarse a PostgreSQL y verificar tabla:
  ```bash
  docker exec -it postgres psql -U postgres -d inventorydb
  \dt
  SELECT * FROM products_stock;
  ```

### Problema: Los eventos no se procesan

**Solución:**
- Verificar en RabbitMQ Management Console que:
  - Exchange `orders.exchange` existe
  - Queues tienen bindings correctos
  - Hay consumidores activos en las queues
- Revisar logs de ambos servicios

---

## Referencias

- [Spring AMQP Documentation](https://docs.spring.io/spring-amqp/reference/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [Event-Driven Architecture Patterns](https://martinfowler.com/articles/201701-event-driven.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## Autor

Carlos Andrés Jaya Herrera
**Universidad de las Fuerzas Armadas (ESPE)**  
Asignatura: Aplicaciones Distribuidas  
Fecha: Enero 2026

---

## Licencia

Este proyecto es con fines académicos para la Universidad de las Fuerzas Armadas (ESPE).
