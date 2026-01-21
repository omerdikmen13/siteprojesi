# ===========================================
# SiteDuyuruSistemi - Restart Script
# ===========================================
# EC2'de uygulamayı yeniden başlatmak için kullanılır

# Dinamik klasör yolu (kullanıcı adından bağımsız)
APP_DIR="$HOME/siteduyuru"
JAR_NAME="SiteDuyuruSistemi-0.0.1-SNAPSHOT.jar"
LOG_FILE="${APP_DIR}/app.log"
PID_FILE="${APP_DIR}/app.pid"

# Renk kodları (log için)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}[INFO]${NC} SiteDuyuruSistemi Restart Script"
echo "============================================="

# Environment variables yükle
if [ -f ${APP_DIR}/.env ]; then
    echo -e "${GREEN}[OK]${NC} Loading environment variables..."
    export $(cat ${APP_DIR}/.env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}[WARN]${NC} .env file not found, using system environment"
fi

# Mevcut process'i durdur
if [ -f $PID_FILE ]; then
    PID=$(cat $PID_FILE)
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${YELLOW}[INFO]${NC} Stopping existing process (PID: $PID)..."
        kill $PID
        sleep 5
        
        # Eğer hala çalışıyorsa zorla durdur
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${RED}[WARN]${NC} Process still running, force killing..."
            kill -9 $PID
            sleep 2
        fi
    fi
    rm -f $PID_FILE
fi

# JAR dosyasını bul
cd $APP_DIR
JAR_FILE=$(ls -t *.jar 2>/dev/null | head -1)

if [ -z "$JAR_FILE" ]; then
    echo -e "${RED}[ERROR]${NC} No JAR file found in $APP_DIR"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Found JAR: $JAR_FILE"

# Uygulamayı başlat
echo -e "${YELLOW}[INFO]${NC} Starting application..."

nohup java -jar $JAR_FILE \
    --spring.profiles.active=prod \
    --spring.datasource.username=${MYSQL_USERNAME:-siteduyuru_user} \
    --spring.datasource.password=${MYSQL_PASSWORD} \
    --app.jwt.secret=${JWT_SECRET} \
    --gemini.api.key=${GEMINI_API_KEY} \
    --stripe.apiKey=${STRIPE_API_KEY} \
    > $LOG_FILE 2>&1 &

# PID'i kaydet
echo $! > $PID_FILE
NEW_PID=$(cat $PID_FILE)

# Başarılı mı kontrol et
sleep 3
if ps -p $NEW_PID > /dev/null 2>&1; then
    echo -e "${GREEN}[SUCCESS]${NC} Application started with PID: $NEW_PID"
    echo -e "${GREEN}[INFO]${NC} Log file: $LOG_FILE"
    echo ""
    echo "Son 10 satır log:"
    echo "---------------------------------------------"
    tail -10 $LOG_FILE
else
    echo -e "${RED}[ERROR]${NC} Application failed to start!"
    echo "Son 20 satır log:"
    tail -20 $LOG_FILE
    exit 1
fi
