FROM php:8.2-apache

# Abilita mod_rewrite
RUN a2enmod rewrite

# Copia tutti i file del sito
COPY . /var/www/html/

# Permessi
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Porta 80
EXPOSE 80

CMD ["apache2-foreground"]
