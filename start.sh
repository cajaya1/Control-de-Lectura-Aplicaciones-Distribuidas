#!/bin/bash

# Script de inicio para el sistema de microservicios
# Universidad de las Fuerzas Armadas (ESPE)

echo "=========================================="
echo "  Sistema E-Commerce - Microservicios"
echo "  ESPE - Aplicaciones Distribuidas"
echo "=========================================="
echo ""

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo "Por favor instalar Docker desde: https://www.docker.com/get-started"
    exit 1
fi

# Verificar que Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose no está instalado"
    exit 1
fi

echo "✅ Docker y Docker Compose están instalados"
echo ""

# Navegar al directorio infrastructure
cd infrastructure

echo "🚀 Construyendo e iniciando servicios..."
echo ""

# Construir e iniciar los servicios
docker-compose up --build -d

echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 15

echo ""
echo "=========================================="
echo "   SERVICIOS INICIADOS"
echo "=========================================="
echo ""
echo " Order Service:          http://localhost:8080"
echo " Inventory Service:      http://localhost:8081"
echo " RabbitMQ Management:    http://localhost:15672"
echo "   Usuario: guest / Contraseña: guest"
echo ""
echo " H2 Console (Order):     http://localhost:8080/h2-console"
echo "   JDBC URL: jdbc:h2:mem:orderdb"
echo "   Usuario: sa / Contraseña: (vacío)"
echo ""
echo "=========================================="
echo "  PRUEBAS RÁPIDAS"
echo "=========================================="
echo ""
echo "1. Crear un pedido:"
echo "   curl -X POST http://localhost:8080/api/v1/orders \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"customerId\":\"CUST-001\",\"items\":[{\"productId\":\"P-001\",\"quantity\":2}],\"shippingAddress\":\"Ecuador\",\"paymentReference\":\"PAY-001\"}'"
echo ""
echo "2. Consultar stock:"
echo "   curl http://localhost:8081/api/v1/products/P-001/stock"
echo ""
echo "=========================================="
echo "  LOGS DE LOS SERVICIOS"
echo "=========================================="
echo ""
echo "Ver logs en tiempo real:"
echo "   docker-compose logs -f"
echo ""
echo "Para detener los servicios:"
echo "   docker-compose down"
echo ""
