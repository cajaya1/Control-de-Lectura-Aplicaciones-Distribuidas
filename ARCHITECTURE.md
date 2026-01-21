# Arquitectura del Sistema - E-Commerce con Microservicios

## Diagrama de Componentes

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CAPA DE CLIENTE                              │
│                    (Postman, curl, Frontend)                          │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             │ HTTP REST
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      ORDER SERVICE (Port 8080)                        │
│                                                                       │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │   Controller    │──│     Service      │──│    Repository    │   │
│  │  OrderController│  │  OrderService    │  │ OrderRepository  │   │
│  └─────────────────┘  └──────────────────┘  └──────────────────┘   │
│           │                    │                       │             │
│           │                    ▼                       ▼             │
│           │           ┌──────────────────┐    ┌─────────────┐      │
│           │           │  Event Producer  │    │  H2 Database│      │
│           │           │ OrderEventProducer    │   orderdb   │      │
│           │           └────────┬─────────┘    └─────────────┘      │
│           │                    │                                     │
│           │                    │ Publish: OrderCreated               │
│           ▼                    ▼                                     │
│  ┌──────────────────────────────────┐                               │
│  │      Event Consumer              │                               │
│  │   StockEventConsumer             │                               │
│  │  - handleStockReserved()         │                               │
│  │  - handleStockRejected()         │                               │
│  └────────┬─────────────────────────┘                               │
└───────────┼─────────────────────────────────────────────────────────┘
            │ Consume: StockReserved, StockRejected
            │
            │
            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    RABBITMQ MESSAGE BROKER                            │
│                         (Port 5672, 15672)                            │
│                                                                       │
│  Exchange: orders.exchange (Topic)                                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                 │ │
│  │  Queue: order.created.queue    ← order.created                │ │
│  │  Queue: stock.reserved.queue   ← stock.reserved               │ │
│  │  Queue: stock.rejected.queue   ← stock.rejected               │ │
│  │                                                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
└───────────┬─────────────────────────────────────────────────────────┘
            │
            │ Consume: OrderCreated
            │ Publish: StockReserved, StockRejected
            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   INVENTORY SERVICE (Port 8081)                       │
│                                                                       │
│  ┌──────────────────────────────────┐                               │
│  │     Event Consumer               │                               │
│  │  RabbitMQConsumer                │                               │
│  │  - handleOrderCreated()          │                               │
│  └────────┬─────────────────────────┘                               │
│           │                                                           │
│           ▼                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │    Controller    │  │     Service      │  │      Model       │  │
│  │InventoryRoutes   │──│InventoryService  │──│   Product.js     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                 │                      │             │
│                                 │                      ▼             │
│                                 │              ┌─────────────────┐  │
│                                 │              │   PostgreSQL    │  │
│                                 │              │   inventorydb   │  │
│                                 │              │ products_stock  │  │
│                                 │              └─────────────────┘  │
│                                 │                                    │
│                                 ▼                                    │
│                        ┌──────────────────┐                         │
│                        │  Event Producer  │                         │
│                        │  (publish to     │                         │
│                        │   RabbitMQ)      │                         │
│                        └──────────────────┘                         │
└──────────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### Caso 1: Pedido Exitoso

```
1. Cliente → POST /api/v1/orders → Order Service
2. Order Service → Guarda Order (PENDING) → H2 Database
3. Order Service → Publica OrderCreated → RabbitMQ
4. RabbitMQ → Enruta a order.created.queue
5. Inventory Service → Consume OrderCreated
6. Inventory Service → Verifica Stock → PostgreSQL
7. Inventory Service → Reserva Stock (UPDATE)
8. Inventory Service → Publica StockReserved → RabbitMQ
9. RabbitMQ → Enruta a stock.reserved.queue
10. Order Service → Consume StockReserved
11. Order Service → Actualiza Order (CONFIRMED) → H2
12. Cliente ← GET /api/v1/orders/{id} → Status: CONFIRMED
```

### Caso 2: Pedido Rechazado

```
1-6. (Igual que Caso 1)
7. Inventory Service → Stock Insuficiente
8. Inventory Service → Publica StockRejected → RabbitMQ
9. RabbitMQ → Enruta a stock.rejected.queue
10. Order Service → Consume StockRejected
11. Order Service → Actualiza Order (CANCELLED + reason) → H2
12. Cliente ← GET /api/v1/orders/{id} → Status: CANCELLED
```

## Patrones Utilizados

1. **Event-Driven Architecture**: Comunicación asíncrona mediante eventos
2. **Choreography-based Saga**: Sin coordinador central, cada servicio reacciona a eventos
3. **CQRS (básico)**: Separación de lectura/escritura en el estado del pedido
4. **Repository Pattern**: Abstracción de acceso a datos
5. **Publish/Subscribe**: Desacoplamiento mediante RabbitMQ
6. **Domain Events**: OrderCreated, StockReserved, StockRejected

## Tecnologías Clave

- **Spring Boot 3.2.1**: Framework para Order Service
- **Spring AMQP**: Integración con RabbitMQ en Java
- **Node.js 18 + Express**: Runtime para Inventory Service
- **amqplib**: Cliente RabbitMQ para Node.js
- **Sequelize**: ORM para PostgreSQL
- **Docker Compose**: Orquestación de contenedores
