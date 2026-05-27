name: Build & Push to GHCR

on:
  push:
    branches:
      - main


jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build & Push API
        uses: docker/build-push-action@v6
        with:
          context: ./backend
          file: ./backend/Workshop.Api/Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ghcr.io/lynn61liu/nzat-api:latest

      - name: Build & Push Web
        uses: docker/build-push-action@v6
        with:
          context: ./apps/shell
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ghcr.io/lynn61liu/nzat-web:latest
          no-cache: true
          build-args: |
            GIT_SHA=${{ github.sha }}

   
  deploy-server-a:
    runs-on: ubuntu-latest
    needs: build-and-push
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Ensure deploy directory exists on server A
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_A_HOST }}
          username: ${{ secrets.SERVER_A_USER }}
          key: ${{ secrets.SERVER_A_SSH_KEY }}
          port: ${{ secrets.SERVER_A_PORT }}
          script: |
            mkdir -p /www/wwwroot/NZAT.NET

      - name: Upload deployment files to server A
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SERVER_A_HOST }}
          username: ${{ secrets.SERVER_A_USER }}
          key: ${{ secrets.SERVER_A_SSH_KEY }}
          port: ${{ secrets.SERVER_A_PORT }}
          source: "deploy/primary-linux/docker-compose.yml,deploy/primary-linux/deploy.sh,deploy/primary-linux/env.example"
          target: /www/wwwroot/NZAT.NET/
          strip_components: 2

      - name: Deploy to server A via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_A_HOST }}
          username: ${{ secrets.SERVER_A_USER }}
          key: ${{ secrets.SERVER_A_SSH_KEY }}
          port: ${{ secrets.SERVER_A_PORT }}
          script: |
            chmod +x /www/wwwroot/NZAT.NET/deploy.sh
            /www/wwwroot/NZAT.NET/deploy.sh

  deploy-server-b:
    runs-on: ubuntu-latest
    needs: build-and-push
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Ensure deploy directory exists on server B
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_B_HOST }}
          username: ${{ secrets.SERVER_B_USER }}
          key: ${{ secrets.SERVER_B_SSH_KEY }}
          port: ${{ secrets.SERVER_B_PORT }}
          script: |
            mkdir -p /Users/lynn/www/wwwroot/NZAT.NET

      - name: Upload deployment files to server B
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SERVER_B_HOST }}
          username: ${{ secrets.SERVER_B_USER }}
          key: ${{ secrets.SERVER_B_SSH_KEY }}
          port: ${{ secrets.SERVER_B_PORT }}
          source: "deploy/secondary-mac/docker-compose.yml,deploy/secondary-mac/deploy.sh,deploy/secondary-mac/env.example"
          target: /Users/lynn/www/wwwroot/NZAT.NET/
          strip_components: 2

      - name: Deploy to server B via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_B_HOST }}
          username: ${{ secrets.SERVER_B_USER }}
          key: ${{ secrets.SERVER_B_SSH_KEY }}
          port: ${{ secrets.SERVER_B_PORT }}
          script: |
            chmod +x /Users/lynn/www/wwwroot/NZAT.NET/deploy.sh
            /Users/lynn/www/wwwroot/NZAT.NET/deploy.sh

name: Demo Web Build & Deploy

on:
  push:
    branches:
      - demo
  workflow_dispatch:
    inputs:
      deploy_demo:
        description: "Deploy demo-web after pushing the image"
        required: false
        default: false
        type: boolean

jobs:
  build-demo-web:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build & Push Demo Web
        uses: docker/build-push-action@v6
        with:
          context: ./apps/shell
          file: ./apps/shell/Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ghcr.io/lynn61liu/nzat-web:demo-en
          no-cache: true
          build-args: |
            GIT_SHA=${{ github.sha }}

  deploy-demo-web:
    runs-on: ubuntu-latest
    needs: build-demo-web
    if: github.event_name == 'workflow_dispatch' && inputs.deploy_demo == true
    steps:
      - name: Deploy demo web via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DEMO_SERVER_HOST }}
          username: ${{ secrets.DEMO_SERVER_USER }}
          key: ${{ secrets.DEMO_SERVER_SSH_KEY }}
          port: ${{ secrets.DEMO_SERVER_PORT }}
          script: |
            set -euo pipefail
            cd "${{ secrets.DEMO_SERVER_DEPLOY_DIR }}"

            if grep -q '^WEB_IMAGE_TAG=' .env; then
              sed -i.bak 's/^WEB_IMAGE_TAG=.*/WEB_IMAGE_TAG=demo-en/' .env
            else
              echo 'WEB_IMAGE_TAG=demo-en' >> .env
            fi

            docker compose pull web || docker-compose pull web
            docker compose up -d web || docker-compose up -d web



1. 第一个项目当前部署结构
你现在已经可以比较明确地写成这样：

运行用户：deploy
容器引擎：rootless Podman
编排单元：Pod
容器关系：前端、后端、数据库在同一个 Pod / 同一虚拟网络
启动管理：systemd --user
对外暴露：宿主机 Nginx / 反向代理
运行特征：不是 Kubernetes Pod，而是 Podman Pod
权限边界：不依赖 root Docker daemon，而是用户态运行
这很重要，因为它说明你现在不是走 Docker Compose，也不是走 K8s，而是一个比较清晰的：
Podman Pod + systemd user service + reverse proxy
模式。