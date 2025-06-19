#!/bin/bash

# SSH 키 설정 도우미 스크립트

echo "🔐 라이트세일 SSH 키 설정 도우미"
echo ""
echo "1. 먼저 AWS Lightsail 콘솔에서 SSH 키를 다운로드하세요."
echo "2. 다운로드한 .pem 파일의 전체 경로를 입력하세요."
echo ""

read -p "SSH 키 파일 경로 (예: ~/Downloads/LightsailDefaultKey-ap-northeast-2.pem): " KEY_PATH

# 경로 확장
KEY_PATH=$(eval echo $KEY_PATH)

if [ ! -f "$KEY_PATH" ]; then
    echo "❌ 파일을 찾을 수 없습니다: $KEY_PATH"
    exit 1
fi

# SSH 디렉토리 생성
mkdir -p ~/.ssh

# 새 키 파일 이름
NEW_KEY_NAME="lightsail-key.pem"
NEW_KEY_PATH="$HOME/.ssh/$NEW_KEY_NAME"

# 키 파일 복사
echo "📋 SSH 키를 ~/.ssh 디렉토리로 복사 중..."
cp "$KEY_PATH" "$NEW_KEY_PATH"

# 권한 설정 (중요!)
echo "🔒 권한 설정 중..."
chmod 600 "$NEW_KEY_PATH"
chmod 700 ~/.ssh

# 키 파일 확인
if [ -f "$NEW_KEY_PATH" ]; then
    echo "✅ SSH 키가 성공적으로 설정되었습니다!"
    echo ""
    echo "다음 환경 변수를 설정하세요:"
    echo ""
    echo "export LIGHTSAIL_SSH_KEY_PATH=\"$NEW_KEY_PATH\""
    echo ""
    echo "또는 ~/.bashrc 또는 ~/.zshrc 파일에 추가하세요:"
    echo "echo 'export LIGHTSAIL_SSH_KEY_PATH=\"$NEW_KEY_PATH\"' >> ~/.zshrc"
    echo ""
    
    # SSH 연결 테스트
    read -p "라이트세일 인스턴스 IP 주소를 입력하세요: " INSTANCE_IP
    
    if [ ! -z "$INSTANCE_IP" ]; then
        echo ""
        echo "🧪 SSH 연결 테스트 중..."
        ssh -i "$NEW_KEY_PATH" -o ConnectTimeout=5 ubuntu@$INSTANCE_IP "echo '✅ SSH 연결 성공!'" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🎉 모든 설정이 완료되었습니다!"
            echo ""
            echo "이제 다음 명령을 실행할 수 있습니다:"
            echo "export LIGHTSAIL_INSTANCE_NAME=\"your-instance-name\""
            echo "export LIGHTSAIL_SSH_KEY_PATH=\"$NEW_KEY_PATH\""
            echo "./scripts/deploy-dashboard.sh status"
        else
            echo ""
            echo "⚠️  SSH 연결에 실패했습니다. 다음을 확인하세요:"
            echo "1. 인스턴스 IP가 올바른지"
            echo "2. 라이트세일 방화벽에서 SSH (22번 포트)가 열려있는지"
            echo "3. 인스턴스가 실행 중인지"
        fi
    fi
else
    echo "❌ SSH 키 설정에 실패했습니다."
    exit 1
fi