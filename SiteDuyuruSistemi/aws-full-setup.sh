#!/bin/bash
# ===========================================
# SiteDuyuruSistemi - Tam AWS Kurulum Scripti
# ===========================================

set -e

echo "=========================================="
echo " SiteDuyuruSistemi - AWS Full Setup"
echo "=========================================="

# 1. Sistem Güncellemesi
echo "[1/8] Sistem güncelleniyor..."
sudo yum update -y

# 2. Java 17 Kurulumu
echo "[2/8] Java 17 yükleniyor..."
sudo yum install java-17-amazon-corretto-headless git -y
java -version

# 3. MySQL 8 Kurulumu
echo "[3/8] MySQL yükleniyor..."
sudo yum install mariadb105-server -y
sudo systemctl start mariadb
sudo systemctl enable mariadb

# 4. MySQL Veritabanı Kurulumu
echo "[4/8] Veritabanı oluşturuluyor..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS siteduyuru_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'siteduyuru_user'@'localhost' IDENTIFIED BY 'GucluSifre123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON siteduyuru_db.* TO 'siteduyuru_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
echo "Veritabanı oluşturuldu!"

# 5. GitHub'dan Projeyi Çek
echo "[5/8] GitHub'dan proje çekiliyor..."
cd ~
rm -rf sitejava
git clone https://github.com/mubayramm/sitejava.git
cd sitejava/SiteDuyuruSistemi

# 6. Maven Build
echo "[6/8] Uygulama derleniyor..."
chmod +x mvnw
./mvnw clean package -DskipTests

# 7. Uygulama Klasörü ve JAR
echo "[7/8] JAR dosyası kopyalanıyor..."
mkdir -p ~/siteduyuru
cp target/SiteDuyuruSistemi-0.0.1-SNAPSHOT.jar ~/siteduyuru/

# 8. Environment Dosyası
echo "[8/8] Environment dosyası oluşturuluyor..."
cat > ~/siteduyuru/.env << 'EOF'
MYSQL_USERNAME=siteduyuru_user
MYSQL_PASSWORD=GucluSifre123!
JWT_SECRET=super-secret-jwt-key-for-site-duyuru-sistemi-minimum-64-characters-long
GEMINI_API_KEY=
STRIPE_API_KEY=
EOF
chmod 600 ~/siteduyuru/.env

echo ""
echo "=========================================="
echo " İlk Kurulum Tamamlandı!"
echo "=========================================="
