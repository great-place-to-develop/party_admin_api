# Docker Guide

Complete guide for running Party Admin API with Docker.

## Quick Start

### Using Docker Compose (Recommended)

The easiest way to run the application with all dependencies:

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start all services (API + MongoDB)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down
```

The API will be available at `http://localhost:3001`

### Using Docker Only

Build and run the container manually:

```bash
# Build the image
docker build -t party-admin-api .

# Run the container
docker run -d \
  -p 3001:3001 \
  -e MONGODB_URI=your_mongodb_uri \
  -e AUTH0_DOMAIN=your_domain \
  -e AUTH0_AUDIENCE=your_audience \
  --name party-admin-api \
  party-admin-api

# View logs
docker logs -f party-admin-api

# Stop the container
docker stop party-admin-api
```

## Docker Compose Configurations

### Production Setup (`docker-compose.yml`)

Complete production-ready stack with MongoDB:

```bash
# Start all services
docker-compose up -d

# Start with MongoDB Express (web UI)
docker-compose --profile debug up -d

# Scale API service
docker-compose up -d --scale api=3

# View all running services
docker-compose ps

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

**Services included:**
- **api**: Party Admin API (port 3001)
- **mongodb**: MongoDB database (port 27017)
- **mongo-express**: MongoDB web UI (port 8081, debug profile only)

### Development Setup (`docker-compose.dev.yml`)

Development environment with hot-reload:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs with hot-reload output
docker-compose -f docker-compose.dev.yml logs -f api-dev

# Restart API service only
docker-compose -f docker-compose.dev.yml restart api-dev

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

**Features:**
- Hot-reload with nodemon
- Source code mounted as volume
- MongoDB Express included by default
- Separate database (party_admin_dev)

## Environment Variables

### Required Variables

```env
# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.partyadmin.com

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Party Admin <noreply@partyadmin.com>
```

### Optional Variables

```env
# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database (auto-configured in docker-compose)
MONGODB_URI=mongodb://admin:password123@mongodb:27017/party_admin?authSource=admin

# Rate Limiting
EMAIL_RATE_LIMIT=100
EMAIL_RATE_WINDOW_HOURS=1
```

## Docker Commands

### Building

```bash
# Build production image
docker build -t party-admin-api .

# Build development image
docker build -f Dockerfile.dev -t party-admin-api:dev .

# Build with no cache
docker build --no-cache -t party-admin-api .

# Build with specific platform
docker build --platform linux/amd64 -t party-admin-api .
```

### Running

```bash
# Run in foreground
docker run -p 3001:3001 party-admin-api

# Run in background (detached)
docker run -d -p 3001:3001 --name api party-admin-api

# Run with environment file
docker run -d -p 3001:3001 --env-file .env party-admin-api

# Run with custom network
docker run -d --network my-network party-admin-api

# Run with volume mounts
docker run -d \
  -v $(pwd)/logs:/app/logs \
  -p 3001:3001 \
  party-admin-api
```

### Management

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# View logs
docker logs party-admin-api
docker logs -f party-admin-api  # Follow logs
docker logs --tail 100 party-admin-api  # Last 100 lines

# Execute commands in container
docker exec -it party-admin-api sh
docker exec party-admin-api node -v

# Inspect container
docker inspect party-admin-api

# View container stats
docker stats party-admin-api

# Stop container
docker stop party-admin-api

# Remove container
docker rm party-admin-api

# Remove container and volumes
docker rm -v party-admin-api
```

### Images

```bash
# List images
docker images

# Remove image
docker rmi party-admin-api

# Tag image
docker tag party-admin-api:latest party-admin-api:v1.0.0

# Push to registry
docker push your-registry/party-admin-api:latest

# Pull from registry
docker pull your-registry/party-admin-api:latest
```

## Docker Compose Commands

### Service Management

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d api

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart services
docker-compose restart

# Restart specific service
docker-compose restart api

# Pause services
docker-compose pause

# Unpause services
docker-compose unpause
```

### Logs and Monitoring

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Logs for specific service
docker-compose logs -f api

# Last N lines
docker-compose logs --tail 50 api

# Service status
docker-compose ps

# Service stats
docker-compose top
```

### Building and Updating

```bash
# Build images
docker-compose build

# Build without cache
docker-compose build --no-cache

# Pull latest images
docker-compose pull

# Recreate containers
docker-compose up -d --force-recreate

# Update and restart
docker-compose up -d --build
```

## Multi-Stage Build

The production Dockerfile uses multi-stage builds for smaller image size:

**Stage 1 (builder):**
- Install all dependencies
- Build TypeScript to JavaScript

**Stage 2 (production):**
- Install production dependencies only
- Copy built files from builder
- Run as non-root user
- Minimal attack surface

**Benefits:**
- Smaller final image (~150MB vs ~500MB)
- Faster deployment
- More secure (no build tools in production)
- Cached layers for faster rebuilds

## Health Checks

Both Dockerfile and docker-compose include health checks:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' party-admin-api

# View health check logs
docker inspect --format='{{json .State.Health}}' party-admin-api | jq
```

**Health check endpoint:** `GET /health`

## Security Best Practices

### Image Security

1. **Non-root user**: Container runs as `nodejs` user (UID 1001)
2. **Minimal base**: Uses Alpine Linux
3. **No secrets in image**: Environment variables only
4. **Read-only filesystem**: Source code mounted read-only in dev

### Network Security

```bash
# Create custom network
docker network create --driver bridge party-admin-net

# Run with custom network
docker run -d --network party-admin-net party-admin-api

# Inspect network
docker network inspect party-admin-net
```

### Secrets Management

Use Docker secrets for sensitive data:

```bash
# Create secret
echo "my-secret-value" | docker secret create db_password -

# Use in docker-compose.yml
secrets:
  db_password:
    external: true

services:
  api:
    secrets:
      - db_password
```

## Debugging

### Debug Running Container

```bash
# Shell into container
docker exec -it party-admin-api sh

# Check environment variables
docker exec party-admin-api env

# Check running processes
docker exec party-admin-api ps aux

# Check file system
docker exec party-admin-api ls -la /app

# Check logs location
docker exec party-admin-api ls -la /app/logs
```

### Debug Build Issues

```bash
# Build with output
docker build --progress=plain -t party-admin-api .

# Build specific stage
docker build --target builder -t party-admin-api:builder .

# Run builder stage for debugging
docker run -it party-admin-api:builder sh
```

### Debug Network Issues

```bash
# Check container IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' party-admin-api

# Test network connectivity
docker exec party-admin-api ping mongodb

# Check DNS resolution
docker exec party-admin-api nslookup mongodb
```

## Production Deployment

### Docker Registry

```bash
# Login to registry
docker login your-registry.com

# Tag image
docker tag party-admin-api your-registry.com/party-admin-api:latest
docker tag party-admin-api your-registry.com/party-admin-api:v1.0.0

# Push to registry
docker push your-registry.com/party-admin-api:latest
docker push your-registry.com/party-admin-api:v1.0.0
```

### Orchestration Platforms

#### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml party-admin

# List services
docker service ls

# Scale service
docker service scale party-admin_api=3

# Remove stack
docker stack rm party-admin
```

#### Kubernetes

Create deployment and service manifests (see `k8s/` directory).

```bash
# Apply manifests
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/party-admin-api
```

### Environment-Specific Builds

```bash
# Build for specific environment
docker build \
  --build-arg NODE_ENV=production \
  --build-arg BUILD_VERSION=1.0.0 \
  -t party-admin-api:production .

# Use different compose file
docker-compose -f docker-compose.prod.yml up -d
```

## Performance Optimization

### Layer Caching

Order Dockerfile commands for optimal caching:

1. Copy package files
2. Install dependencies
3. Copy source code
4. Build application

### Build Performance

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build -t party-admin-api .

# Parallel builds
docker-compose build --parallel

# Limit build resources
docker build --memory 2g --cpus 2 -t party-admin-api .
```

### Runtime Performance

```bash
# Limit container resources
docker run -d \
  --memory 512m \
  --cpus 1 \
  --name api \
  party-admin-api

# In docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Troubleshooting

### Common Issues

**Issue**: Container exits immediately
```bash
# Check logs
docker logs party-admin-api

# Check exit code
docker inspect -f '{{.State.ExitCode}}' party-admin-api
```

**Issue**: Cannot connect to MongoDB
```bash
# Check if MongoDB is running
docker-compose ps mongodb

# Check network
docker network inspect party-admin-network

# Test connection
docker exec api ping mongodb
```

**Issue**: Port already in use
```bash
# Find process using port
lsof -i :3001

# Use different port
docker run -p 3002:3001 party-admin-api
```

**Issue**: Build fails
```bash
# Clear build cache
docker builder prune

# Build without cache
docker build --no-cache -t party-admin-api .
```

## Maintenance

### Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes

# Remove specific volume
docker volume rm party_admin_api_mongodb_data
```

### Backups

```bash
# Backup MongoDB data
docker exec mongodb mongodump --out /backup

# Copy backup from container
docker cp mongodb:/backup ./mongodb-backup

# Restore from backup
docker exec mongodb mongorestore /backup
```

### Updates

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build

# Rolling update (zero downtime)
docker-compose up -d --no-deps --build api
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)

## Support

For Docker-related issues:
- Check this guide
- Review Docker logs: `docker-compose logs`
- Check container health: `docker-compose ps`
- Inspect container: `docker inspect party-admin-api`
