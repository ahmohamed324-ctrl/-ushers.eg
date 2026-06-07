# Dockerfile for .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/UsherHub.slnx ./
COPY backend/src/UshersEg.Domain/*.csproj ./backend/src/UshersEg.Domain/
COPY backend/src/UshersEg.Application/*.csproj ./backend/src/UshersEg.Application/
COPY backend/src/UshersEg.Infrastructure/*.csproj ./backend/src/UshersEg.Infrastructure/
COPY backend/src/UshersEg.API/*.csproj ./backend/src/UshersEg.API/
RUN dotnet restore backend/src/UshersEg.API/UshersEg.API.csproj

COPY backend/src/ ./backend/src/
WORKDIR /src/backend/src/UshersEg.API
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "UshersEg.API.dll"]
