# ÍNDICE DE DOCUMENTACIÓN

## Sistema de E-Commerce con Microservicios y RabbitMQ
### Universidad de las Fuerzas Armadas (ESPE)

---

## INICIO RÁPIDO

### Para Empezar Inmediatamente
1. **[QUICKSTART.md](QUICKSTART.md)** 
   - Instrucciones de inicio en 3 pasos
   - Verificación del sistema
   - Pruebas rápidas
   - Solo para ejecutores/evaluadores

### Scripts de Ejecución
- **[start.bat](start.bat)** - Script de inicio para Windows
- **[start.sh](start.sh)** - Script de inicio para Linux/Mac

---

## 🎯 PRUEBAS CON POSTMAN (NUEVO)

### Guía Rápida de Importación
**[POSTMAN_QUICKSTART.md](POSTMAN_QUICKSTART.md)** - Inicio inmediato
- Importar colección en 3 pasos
- Configurar environment
- Primera prueba en 1 minuto
- Solución de problemas comunes
- Checklist de capturas para ESPE

### Guía Completa de Pruebas
**[POSTMAN_GUIDE.md](POSTMAN_GUIDE.md)** - Documentación detallada
- 13 pruebas paso a paso con screenshots
- Variables de entorno explicadas
- Scripts de test automáticos
- Flujo end-to-end completo
- Casos de prueba avanzados
- Tips para presentación a ESPE

### Archivos Importables
- **[ESPE-ECommerce-Postman-Collection.json](ESPE-ECommerce-Postman-Collection.json)** - Colección completa con 13 requests
- **[ESPE-ECommerce-Environment.postman_environment.json](ESPE-ECommerce-Environment.postman_environment.json)** - Variables de entorno

**Cuándo usar**: Para realizar todas las pruebas de forma profesional con Postman

---

## DOCUMENTACIÓN PRINCIPAL

### 1. README Principal
**[README.md](README.md)** - Documentación completa del proyecto
- Descripción general y arquitectura
- Stack tecnológico detallado
- Estructura del proyecto
- Instrucciones completas de ejecución
- API Endpoints con ejemplos
- Flujo de eventos (Event-Driven)
- Contratos de datos JSON
- Base de datos y modelos
- Pruebas de integración
- Configuración de RabbitMQ
- Troubleshooting

**Cuándo leer**: Después del QUICKSTART para entender el proyecto completo

---

### 2. Resumen Ejecutivo
**[RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)** - Vista general del proyecto
- ✅ Entregables completados
- ✅ Cumplimiento de requerimientos ESPE
- ✅ Arquitectura implementada
- ✅ Datos de prueba
- ✅ Estructura final
- ✅ Puntos destacados para evaluación

**Cuándo leer**: Para profesores/evaluadores que necesitan verificar completitud

---

## ARQUITECTURA Y DISEÑO

### 3. Arquitectura del Sistema
**[ARCHITECTURE.md](ARCHITECTURE.md)** - Diagramas y patrones
- Diagrama de componentes completo
- Flujo de datos detallado
- Patrones de diseño utilizados
- Tecnologías clave
- Decisiones arquitectónicas

**Cuándo leer**: Para entender el diseño y las decisiones técnicas

---

### 4. Diagramas de Secuencia
**[DIAGRAMAS_SECUENCIA.md](DIAGRAMAS_SECUENCIA.md)** - Flujos visuales
- Escenario 1: Procesamiento exitoso
- Escenario 2: Rechazo por stock insuficiente
- Escenario 3: Rollback en multi-producto
- Tiempos de procesamiento
- Estados de la orden
- Componentes del sistema

**Cuándo leer**: Para visualizar el flujo de eventos paso a paso

---

## PRUEBAS Y TESTING

### 5. Reporte de Validación (NUEVO)
**[VALIDATION_REPORT.md](VALIDATION_REPORT.md)** - Evidencias completas del sistema funcional
- ✅ Estado actual de todos los servicios
- ✅ Pruebas exitosas documentadas
- ✅ Caso de éxito: Stock suficiente
- ✅ Caso de fallo: Stock insuficiente
- ✅ Logs del sistema mostrando eventos
- ✅ Datos iniciales del inventario
- ✅ Credenciales de acceso
- ✅ Comandos útiles
- ✅ Cumplimiento de requerimientos ESPE
- ✅ Conclusiones y evidencias

**Cuándo leer**: Para verificar que el sistema está completamente funcional y validado

---

### 6. Casos de Prueba
**[TEST_CASES.md](TEST_CASES.md)** - Suite completa de testing
- ✅ Prueba 1: Flujo completo exitoso
- ✅ Prueba 2: Rechazo por stock insuficiente
- ✅ Prueba 3: Pedido multi-producto
- ✅ Prueba 4: Rechazo parcial (atomicidad)
- ✅ Prueba 5: Producto inexistente
- ✅ Prueba 6: Validación de entrada
- ✅ Prueba 7: Monitoreo de RabbitMQ
- ✅ Prueba 8: Verificación de logs
- Resumen de pruebas con checklist
- Puntos de evaluación ESPE

**Cuándo usar**: Para ejecutar pruebas sistemáticas del sistema

---

### 7. Peticiones HTTP de Ejemplo
**[test-requests.http](test-requests.http)** - Ejemplos listos para usar
- Crear pedido con stock disponible
- Consultar pedido
- Consultar stock de producto
- Crear pedido con stock insuficiente
- Health checks

**Cuándo usar**: Para pruebas rápidas con VS Code REST Client o similar

---

## CÓDIGO FUENTE

### Order Service (Java Spring Boot)
```
order-service/
├── src/main/java/ec/edu/espe/orderservice/
│   ├── OrderServiceApplication.java    ← Punto de entrada
│   ├── controller/
│   │   └── OrderController.java        ← Endpoints REST
│   ├── service/
│   │   └── OrderService.java           ← Lógica de negocio
│   ├── model/
│   │   ├── Order.java                  ← Entidad JPA
│   │   ├── OrderItem.java
│   │   └── OrderStatus.java
│   ├── repository/
│   │   └── OrderRepository.java        ← Acceso a datos
│   ├── dto/
│   │   ├── CreateOrderRequest.java     ← DTOs de request
│   │   ├── OrderItemDto.java
│   │   └── OrderResponse.java
│   ├── event/
│   │   ├── OrderCreatedEvent.java      ← Eventos de mensajería
│   │   ├── StockReservedEvent.java
│   │   └── StockRejectedEvent.java
│   ├── messaging/
│   │   ├── OrderEventProducer.java     ← Publicador
│   │   └── StockEventConsumer.java     ← Consumidor
│   └── config/
│       └── RabbitMQConfig.java         ← Configuración RabbitMQ
├── src/main/resources/
│   └── application.properties          ← Configuración del servicio
├── pom.xml                             ← Dependencias Maven
└── Dockerfile                          ← Imagen Docker
```

### Inventory Service (Node.js)
```
inventory-service/
├── src/
│   ├── index.js                        ← Punto de entrada
│   ├── config/
│   │   ├── database.js                 ← Config PostgreSQL
│   │   └── rabbitmq.js                 ← Config RabbitMQ
│   ├── models/
│   │   └── Product.js                  ← Modelo Sequelize
│   ├── services/
│   │   └── inventoryService.js         ← Lógica de negocio
│   ├── routes/
│   │   └── inventoryRoutes.js          ← Endpoints REST
│   ├── messaging/
│   │   └── rabbitmqConsumer.js         ← Consumidor/Publicador
│   └── utils/
│       └── seeder.js                   ← Datos iniciales
├── package.json                        ← Dependencias npm
├── .env                                ← Variables de entorno
└── Dockerfile                          ← Imagen Docker
```

### Infraestructura
```
infrastructure/
└── docker-compose.yml                  ← Orquestación de servicios
```

---

## GUÍA DE LECTURA RECOMENDADA

### Para Evaluadores/Profesores
1. **[RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)** - Vista general
2. **[QUICKSTART.md](QUICKSTART.md)** - Ejecutar el sistema
3. **[TEST_CASES.md](TEST_CASES.md)** - Ejecutar pruebas
4. **[README.md](README.md)** - Revisar documentación completa

### Para Estudiantes que Quieren Aprender
1. **[README.md](README.md)** - Entender el proyecto
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Comprender la arquitectura
3. **[DIAGRAMAS_SECUENCIA.md](DIAGRAMAS_SECUENCIA.md)** - Visualizar flujos
4. **Código Fuente** - Estudiar implementación
5. **[TEST_CASES.md](TEST_CASES.md)** - Practicar con pruebas

### Para Desarrolladores que Quieren Replicar
1. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Entender diseño
2. **Código Fuente** - Revisar implementación
3. **[README.md](README.md)** - Configuración y setup
4. **[QUICKSTART.md](QUICKSTART.md)** - Ejecutar localmente

---

## RECURSOS ESPECÍFICOS

### Configuración de RabbitMQ
- **Order Service**: `order-service/src/main/java/ec/edu/espe/orderservice/config/RabbitMQConfig.java`
- **Inventory Service**: `inventory-service/src/config/rabbitmq.js`
- **Documentación**: Sección en [README.md](README.md#-rabbitmq---configuración)

### Modelos de Datos
- **Order**: `order-service/src/main/java/ec/edu/espe/orderservice/model/Order.java`
- **OrderItem**: `order-service/src/main/java/ec/edu/espe/orderservice/model/OrderItem.java`
- **Product**: `inventory-service/src/models/Product.js`

### Eventos y Mensajería
- **OrderCreated**: `order-service/src/main/java/ec/edu/espe/orderservice/event/OrderCreatedEvent.java`
- **StockReserved**: `order-service/src/main/java/ec/edu/espe/orderservice/event/StockReservedEvent.java`
- **StockRejected**: `order-service/src/main/java/ec/edu/espe/orderservice/event/StockRejectedEvent.java`
- **Contratos**: Sección en [README.md](README.md#-contratos-de-eventos-json-payloads)

### Docker y Despliegue
- **Docker Compose**: `infrastructure/docker-compose.yml`
- **Order Service Dockerfile**: `order-service/Dockerfile`
- **Inventory Service Dockerfile**: `inventory-service/Dockerfile`
- **Instrucciones**: [README.md](README.md#-instrucciones-de-ejecución)

---

## ESTADÍSTICAS DEL PROYECTO

| Métrica | Valor |
|---------|-------|
| **Microservicios** | 2 (Order, Inventory) |
| **Lenguajes** | Java 17, JavaScript (Node.js 18) |
| **Frameworks** | Spring Boot 3.2.1, Express |
| **Bases de Datos** | H2, PostgreSQL 15 |
| **Archivos de Código** | ~20 archivos principales |
| **Archivos de Documentación** | 7 archivos MD |
| **Endpoints REST** | 3 endpoints públicos |
| **Eventos RabbitMQ** | 3 tipos (OrderCreated, StockReserved, StockRejected) |
| **Contenedores Docker** | 4 (RabbitMQ, PostgreSQL, Order, Inventory) |
| **Productos de Prueba** | 5 productos iniciales |
| **Casos de Prueba** | 8 escenarios completos |

---

## ENLACES ÚTILES

### URLs del Sistema (cuando está ejecutándose)
- **Order Service**: http://localhost:8080
- **Inventory Service**: http://localhost:8081
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **H2 Console**: http://localhost:8080/h2-console

### Comandos Rápidos
```bash
# Iniciar sistema
cd infrastructure && docker-compose up --build

# Ver logs
docker-compose logs -f

# Detener sistema
docker-compose down

# Crear pedido de prueba
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST-001","items":[{"productId":"P-001","quantity":2}],"shippingAddress":"Ecuador","paymentReference":"PAY-001"}'
```

---

## CHECKLIST DE EVALUACIÓN

### Requerimientos Funcionales
- [ ] Order Service funcionando en puerto 8080
- [ ] Inventory Service funcionando en puerto 8081
- [ ] RabbitMQ configurado y operativo
- [ ] Comunicación asíncrona mediante eventos
- [ ] Estados de pedido (PENDING → CONFIRMED/CANCELLED)
- [ ] Gestión de stock con reserva
- [ ] UUIDs en todos los identificadores

### Requerimientos Técnicos
- [ ] API REST según especificaciones
- [ ] Persistencia en bases de datos
- [ ] Docker Compose funcional
- [ ] Documentación completa
- [ ] Casos de prueba ejecutables
- [ ] Manejo de errores
- [ ] Logging apropiado

### Calidad del Código
- [ ] Código limpio y organizado
- [ ] Comentarios donde necesario
- [ ] Buenas prácticas
- [ ] Separación de responsabilidades
- [ ] Manejo de transacciones

---

## CONCLUSIÓN

Este índice sirve como guía de navegación para toda la documentación del proyecto. El sistema está completamente funcional y documentado, listo para ser ejecutado y evaluado.

**Total de Documentos**: 7 archivos Markdown + Código fuente completo

**Estado del Proyecto**: COMPLETADO

---

**Universidad de las Fuerzas Armadas (ESPE)**  
Aplicaciones Distribuidas  
Control de Lectura - Microservicios con RabbitMQ  
Enero 2026
