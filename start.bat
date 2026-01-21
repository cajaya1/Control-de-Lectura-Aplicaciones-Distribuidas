@echo off
REM Script de inicio para el sistema de microservicios
REM Universidad de las Fuerzas Armadas (ESPE)

echo ==========================================
echo   Sistema E-Commerce - Microservicios
echo   ESPE - Aplicaciones Distribuidas
echo ==========================================
echo.

REM Verificar que Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta instalado
    echo Por favor instalar Docker desde: https://www.docker.com/get-started
    pause
    exit /b 1
)

REM Verificar que Docker Compose está instalado
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose no esta instalado
    pause
    exit /b 1
)

echo OK Docker y Docker Compose estan instalados
echo.

REM Navegar al directorio infrastructure
cd infrastructure

echo Construyendo e iniciando servicios...
echo.

REM Construir e iniciar los servicios
docker-compose up --build -d

echo.
echo Esperando que los servicios esten listos...
timeout /t 15 /nobreak >nul

echo.
echo ==========================================
echo   SERVICIOS INICIADOS
echo ==========================================
echo.
echo Order Service:          http://localhost:8080
echo Inventory Service:      http://localhost:8081
echo RabbitMQ Management:    http://localhost:15672
echo    Usuario: guest / Contrasena: guest
echo.
echo H2 Console (Order):     http://localhost:8080/h2-console
echo    JDBC URL: jdbc:h2:mem:orderdb
echo    Usuario: sa / Contrasena: (vacio)
echo.
echo ==========================================
echo   PRUEBAS RAPIDAS
echo ==========================================
echo.
echo 1. Crear un pedido:
echo    curl -X POST http://localhost:8080/api/v1/orders ^
echo      -H "Content-Type: application/json" ^
echo      -d "{\"customerId\":\"CUST-001\",\"items\":[{\"productId\":\"P-001\",\"quantity\":2}],\"shippingAddress\":\"Ecuador\",\"paymentReference\":\"PAY-001\"}"
echo.
echo 2. Consultar stock:
echo    curl http://localhost:8081/api/v1/products/P-001/stock
echo.
echo ==========================================
echo   LOGS DE LOS SERVICIOS
echo ==========================================
echo.
echo Ver logs en tiempo real:
echo    docker-compose logs -f
echo.
echo Para detener los servicios:
echo    docker-compose down
echo.
pause
