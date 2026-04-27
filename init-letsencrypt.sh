#!/bin/bash

# Убедитесь, что скрипт запускается с правами sudo или root
if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Ошибка: docker-compose не установлен.' >&2
  exit 1
fi

domains=(7continent-dagestan.ru www.7continent-dagestan.ru)
rsa_key_size=4096
data_path="./data/certbot"
email="admin@7continent-dagestan.ru" # Можно оставить так, или вписать вашу реальную почту
staging=0 # Если хотите только протестировать, поставьте 1, чтобы не тратить лимиты Let's Encrypt

if [ -d "$data_path" ]; then
  read -p "Уже есть сертификаты для $domains. Заменить их? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Скачивание рекомендованных настроек TLS ..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
  echo
fi

echo "### Создание фейкового сертификата для $domains (нужно для запуска nginx)..."
path="/etc/letsencrypt/live/$domains"
mkdir -p "$data_path/conf/live/$domains"
docker-compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo

echo "### Запуск nginx ..."
docker-compose up --force-recreate -d frontend
echo

echo "### Удаление фейкового сертификата для $domains ..."
docker-compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$domains && \
  rm -Rf /etc/letsencrypt/archive/$domains && \
  rm -Rf /etc/letsencrypt/renewal/$domains.conf" certbot
echo

echo "### Запрос настоящего сертификата Let's Encrypt для $domains ..."
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

# Выбираем email
case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

# Включаем staging (тестовый режим) при необходимости
if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker-compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $email_arg \
    $domain_args \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot
echo

echo "### Перезагрузка nginx ..."
docker-compose exec frontend nginx -s reload

echo "### ГОТОВО! Теперь ваш сайт должен быть доступен по HTTPS."
