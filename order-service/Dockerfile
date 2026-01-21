FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copiar archivos de Maven
COPY pom.xml .
COPY src ./src

# Construir la aplicación (necesita Maven instalado en la imagen o usar Maven Wrapper)
RUN apk add --no-cache maven
RUN mvn clean package -DskipTests

# Etapa de ejecución
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copiar el JAR generado
COPY --from=build /app/target/*.jar app.jar

# Exponer puerto
EXPOSE 8080

# Comando de inicio
ENTRYPOINT ["java", "-jar", "app.jar"]
