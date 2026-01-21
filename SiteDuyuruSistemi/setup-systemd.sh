#!/bin/bash
# ===========================================
# Systemd Servis Kurulumu
# ===========================================

echo "Systemd servisi oluşturuluyor..."

# Mevcut kullanıcıyı al
CURRENT_USER=$(whoami)
HOME_DIR=$(eval echo ~$CURRENT_USER)

sudo tee /etc/systemd/system/siteduyuru.service << EOF
[Unit]
Description=SiteDuyuruSistemi Spring Boot Application
After=network.target mariadb.service

[Service]
User=$CURRENT_USER
WorkingDirectory=$HOME_DIR/siteduyuru
EnvironmentFile=$HOME_DIR/siteduyuru/.env
ExecStart=/usr/bin/java -jar $HOME_DIR/siteduyuru/SiteDuyuruSistemi-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod --spring.datasource.username=\${MYSQL_USERNAME} --spring.datasource.password=\${MYSQL_PASSWORD} --app.jwt.secret=\${JWT_SECRET} --gemini.api.key=\${GEMINI_API_KEY} --stripe.apiKey=\${STRIPE_API_KEY}
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable siteduyuru
sudo systemctl start siteduyuru

echo ""
echo "Servis durumu:"
sudo systemctl status siteduyuru --no-pager

echo ""
echo "=========================================="
echo " Uygulama başlatıldı!"
echo " URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8082"
echo "=========================================="
