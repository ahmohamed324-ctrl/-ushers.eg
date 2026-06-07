# Dockerfile for .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/UsherHub.slnx ./
COPY backend/src/UsherHub.Domain/*.csproj ./backend/src/UsherHub.Domain/
COPY backend/src/UsherHub.Application/*.csproj ./backend/src/UsherHub.Application/
COPY backend/src/UsherHub.Infrastructure/*.csproj ./backend/src/UsherHub.Infrastructure/
COPY backend/src/UsherHub.API/*.csproj ./backend/src/UsherHub.API/
RUN dotnet restore backend/src/UsherHub.API/UsherHub.API.csproj

COPY backend/src/ ./backend/src/
WORKDIR /src/backend/src/UsherHub.API
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "UsherHub.API.dll"]
