# Multi-stage Dockerfile for ParaPharma.NET API
# Optimized for Render hosting

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for dependency restoration
COPY ParaPharma/*.csproj ParaPharma/
COPY ParaPharma.Core/*.csproj ParaPharma.Core/
COPY ParaPharma.Infrastructure/*.csproj ParaPharma.Infrastructure/
COPY ParaPharma.DWH/*.csproj ParaPharma.DWH/

# Restore dependencies
RUN dotnet restore ParaPharma/ParaPharma.API.csproj

# Copy all source files
COPY . .

# Build the application
WORKDIR /src/ParaPharma
RUN dotnet build ParaPharma.API.csproj -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish ParaPharma.API.csproj -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Copy published application
COPY --from=publish /app/publish .

# Configure for Render hosting
ENV ASPNETCORE_URLS=http://+:10000
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true

# Expose port 10000 (Render default)
EXPOSE 10000

# Entry point
ENTRYPOINT ["dotnet", "ParaPharma.API.dll"]