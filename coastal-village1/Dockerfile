# Этап сборки (build stage)
FROM node:18-alpine AS build
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем production билд
RUN npm run build

# Этап продакшена (serve stage)
FROM nginx:alpine

# Копируем собранные файлы React из предыдущего этапа
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем кастомный конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
