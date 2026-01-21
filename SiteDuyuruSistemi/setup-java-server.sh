#!/bin/bash
# ================================================
# SITE PROJESI - AWS EC2 TAM KURULUM
# Server: 16.16.255.16 (Java Spring Boot + MySQL)
# ================================================
# Bu scripti AWS sunucusunda çalıştırın:
# chmod +x setup-java-server.sh && sudo ./setup-java-server.sh
# ================================================

set -e

echo "🚀 Site Duyuru Java Backend Kurulumu Başlıyor..."
echo "================================================"

# ========================================
# 1. SISTEM GÜNCELLEME
# ========================================
echo "📦 Sistem güncelleniyor..."
sudo apt update && sudo apt upgrade -y

# ========================================
# 2. JAVA 17 KURULUMU
# ========================================
echo "☕ Java 17 kuruluyor..."
sudo apt install -y openjdk-17-jdk
java -version

# ========================================
# 3. MYSQL KURULUMU
# ========================================
echo "🐬 MySQL kuruluyor..."
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# MySQL güvenlik ayarları
echo "🔐 MySQL veritabanı oluşturuluyor..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS siteduyuru_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'siteduyuru'@'localhost' IDENTIFIED BY 'SiteDuyuru2024!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON siteduyuru_db.* TO 'siteduyuru'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo "✅ MySQL veritabanı hazır!"
echo "   - Database: siteduyuru_db"
echo "   - User: siteduyuru"
echo "   - Password: SiteDuyuru2024!"

# ========================================
# 4. GIT KURULUMU VE PROJE KLONLAMA
# ========================================
echo "📥 Proje klonlanıyor..."
sudo apt install -y git
cd /home/ubuntu

if [ -d "siteprojesi" ]; then
    echo "Mevcut proje güncelleniyor..."
    cd siteprojesi
    git pull origin main
else
    git clone https://github.com/omerdikmen13/siteprojesi.git
    cd siteprojesi
fi

# ========================================
# 5. MAVEN BUILD (JAR OLUŞTURMA)
# ========================================
echo "🔨 Maven build yapılıyor..."
cd /home/ubuntu/siteprojesi/SiteDuyuruSistemi
chmod +x mvnw
./mvnw clean package -DskipTests

echo "✅ JAR dosyası oluşturuldu:"
ls -la target/*.jar

# ========================================
# 6. ENVIRONMENT DOSYASI
# ========================================
echo "📝 Environment dosyası oluşturuluyor..."
cat > /home/ubuntu/siteprojesi/SiteDuyuruSistemi/.env << 'EOF'
MYSQL_USERNAME=siteduyuru
MYSQL_PASSWORD=SiteDuyuru2024!
JWT_SECRET=SiteDuyuruSuperGizliAnahtar2024CokUzunBirSecretKeyJWTicin_1234567890
GEMINI_API_KEY=your_gemini_api_key
STRIPE_API_KEY=your_stripe_api_key
SPRING_PROFILES_ACTIVE=prod
EOF

# ========================================
# 7. SYSTEMD SERVISI (7/24 ÇALIŞMA)
# ========================================
echo "⚙️ Systemd servisi oluşturuluyor..."
sudo tee /etc/systemd/system/site-duyuru.service > /dev/null << 'EOF'
[Unit]
Description=Site Duyuru Java Backend
After=network.target mysql.service
Wants=mysql.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/siteprojesi/SiteDuyuruSistemi
Environment="JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64"
Environment="MYSQL_USERNAME=siteduyuru"
Environment="MYSQL_PASSWORD=SiteDuyuru2024!"
Environment="JWT_SECRET=SiteDuyuruSuperGizliAnahtar2024CokUzunBirSecretKeyJWTicin_1234567890"
Environment="GEMINI_API_KEY=your_gemini_api_key"
Environment="STRIPE_API_KEY=your_stripe_api_key"
Environment="SPRING_PROFILES_ACTIVE=prod"
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod target/SiteDuyuruSistemi-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# ========================================
# 8. SERVİSİ BAŞLAT
# ========================================
echo "🔄 Servis başlatılıyor..."
sudo systemctl daemon-reload
sudo systemctl enable site-duyuru
sudo systemctl start site-duyuru

sleep 5

# ========================================
# 9. DURUM KONTROLÜ
# ========================================
echo ""
echo "================================================"
echo "✅ KURULUM TAMAMLANDI!"
echo "================================================"
echo ""
echo "📌 Servis Durumu:"
sudo systemctl status site-duyuru --no-pager || true
echo ""
echo "📌 MySQL Durumu:"
sudo systemctl status mysql --no-pager | head -5
echo ""
echo "📌 Port Kontrolü:"
sudo netstat -tlnp | grep -E '8080|3306' || echo "Portlar henüz açılmadı..."
echo ""
echo "📌 Faydalı Komutlar:"
echo "   sudo systemctl status site-duyuru"
echo "   sudo journalctl -u site-duyuru -f"
echo "   curl http://localhost:8080"
echo ""
echo "🌐 External URL: http://16.16.255.16:8080"
