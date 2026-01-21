#!/bin/bash
# ===========================================
# SiteDuyuruSistemi - EC2 Initial Setup Script
# ===========================================
# Amazon Linux 2023 veya Ubuntu 22.04 için
# Bu script'i EC2'ye ilk bağlandığınızda çalıştırın

set -e  # Hata durumunda dur

echo "=========================================="
echo " SiteDuyuruSistemi - EC2 Kurulum"
echo "=========================================="

# İşletim sistemi kontrolü
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "İşletim sistemi tespit edilemedi!"
    exit 1
fi

echo "İşletim Sistemi: $OS"
echo ""

# ========================
# 1. Sistem Güncellemesi
# ========================
echo "[1/6] Sistem güncelleniyor..."
if [ "$OS" = "amzn" ]; then
    sudo yum update -y
elif [ "$OS" = "ubuntu" ]; then
    sudo apt update && sudo apt upgrade -y
fi

# ========================
# 2. Java 17 Kurulumu
# ========================
echo "[2/6] Java 17 yükleniyor..."
if [ "$OS" = "amzn" ]; then
    sudo yum install java-17-amazon-corretto-headless -y
elif [ "$OS" = "ubuntu" ]; then
    sudo apt install openjdk-17-jdk-headless -y
fi

java -version
echo "Java kurulumu tamamlandı!"
echo ""

# ========================
# 3. MySQL 8 Kurulumu
# ========================
echo "[3/6] MySQL 8 yükleniyor..."
if [ "$OS" = "amzn" ]; then
    # Amazon Linux için MySQL repo ekle
    sudo yum install mysql-community-server -y 2>/dev/null || {
        echo "MySQL Community repo ekleniyor..."
        sudo yum install https://dev.mysql.com/get/mysql80-community-release-el9-1.noarch.rpm -y
        sudo yum install mysql-community-server -y
    }
    sudo systemctl start mysqld
    sudo systemctl enable mysqld
    
    echo ""
    echo "⚠️ MySQL root geçici şifresi:"
    sudo grep 'temporary password' /var/log/mysqld.log || echo "Şifre bulunamadı, boş olabilir"
    
elif [ "$OS" = "ubuntu" ]; then
    sudo apt install mysql-server -y
    sudo systemctl start mysql
    sudo systemctl enable mysql
fi

echo "MySQL kurulumu tamamlandı!"
echo ""

# ========================
# 4. Uygulama Klasörü
# ========================
echo "[4/6] Uygulama klasörü oluşturuluyor..."
APP_DIR="/home/$USER/siteduyuru"
mkdir -p $APP_DIR
cd $APP_DIR

echo "Klasör: $APP_DIR"
echo ""

# ========================
# 5. Environment Dosyası
# ========================
echo "[5/6] Environment template oluşturuluyor..."
cat > $APP_DIR/.env.template << 'ENVEOF'
# MySQL Database
MYSQL_USERNAME=siteduyuru_user
MYSQL_PASSWORD=YOUR_SECURE_PASSWORD_HERE

# JWT Secret (64+ karakter)
JWT_SECRET=YOUR_JWT_SECRET_HERE

# Gemini AI API Key
GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE

# Stripe API Key
STRIPE_API_KEY=YOUR_STRIPE_KEY_HERE
ENVEOF

chmod 600 $APP_DIR/.env.template
echo ".env.template oluşturuldu"
echo ""

# ========================
# 6. MySQL Database Setup
# ========================
echo "[6/6] MySQL veritabanı kurulum talimatları..."
echo ""
echo "=========================================="
echo " MANUEL ADIMLAR (MySQL içinde yapılacak)"
echo "=========================================="
echo ""
echo "1. MySQL'e root olarak giriş yapın:"
echo "   sudo mysql -u root -p"
echo ""
echo "2. Aşağıdaki komutları çalıştırın:"
echo ""
echo "   CREATE DATABASE siteduyuru_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "   CREATE USER 'siteduyuru_user'@'localhost' IDENTIFIED BY 'GÜÇLÜ_ŞİFRE';"
echo "   GRANT ALL PRIVILEGES ON siteduyuru_db.* TO 'siteduyuru_user'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo "   EXIT;"
echo ""
echo "3. .env dosyası oluşturun:"
echo "   cp $APP_DIR/.env.template $APP_DIR/.env"
echo "   nano $APP_DIR/.env  # Değerleri güncelleyin"
echo ""
echo "4. .env dosyasını güvenli yapın:"
echo "   chmod 600 $APP_DIR/.env"
echo ""
echo "=========================================="
echo " EC2 Kurulum Scripti Tamamlandı!"
echo "=========================================="
echo ""
echo "Sonraki adım: GitHub'dan deploy yaparak JAR dosyasını yükleyin"
