CREATE DATABASE image_to_excel;

USE image_to_excel;


CREATE DATABASE IF NOT EXISTS image_to_excel;

CREATE USER IF NOT EXISTS 'image_app'@'localhost'
IDENTIFIED BY 'ImageApp@2026';

GRANT ALL PRIVILEGES ON image_to_excel.*
TO 'image_app'@'localhost';

FLUSH PRIVILEGES;