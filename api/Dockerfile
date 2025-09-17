# API Dockerfile for .NET 9 application
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy solution file
COPY FoodAndDrinkApi.sln ./

# Copy project files
COPY FoodAndDrinkApi/FoodAndDrinkApi.csproj FoodAndDrinkApi/
COPY FoodAndDrinkDomain/FoodAndDrinkDomain.csproj FoodAndDrinkDomain/
COPY FoodAndDrinkRepository/FoodAndDrinkRepository.csproj FoodAndDrinkRepository/
COPY FoodAndDrinkService/FoodAndDrinkService.csproj FoodAndDrinkService/

# Restore dependencies
RUN dotnet restore FoodAndDrinkApi.sln

# Copy all source code
COPY . .

# Build the solution
WORKDIR /src/FoodAndDrinkApi
RUN dotnet build -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FoodAndDrinkApi.dll"]
