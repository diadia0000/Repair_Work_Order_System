#!/bin/bash

# --- 參數設定 (可根據需求修改) ---
STACK_NAME="repair-system"
ADMIN_EMAIL="11211109@gm.nttu.edu.tw" # Demo 用的管理員信箱
ADMIN_PASSWORD="Password123!"         # 需符合你設定的密碼強度規範

# 1. 部署後端服務
echo "正在部署後端服務 (SAM Build & Deploy)..."
sam build
sam deploy --stack-name $STACK_NAME --resolve-s3 --capabilities CAPABILITY_IAM --no-confirm-changeset

# 2. 取得雲端資源資訊
echo " 正在獲取部署後的資源資訊..."
API_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)
USER_POOL_ID=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text)
# 注意：template.yaml 的 Outputs 需包含 UserPoolId 方可動態獲取

echo "後端網址: $API_URL"

# 3. 自動建立管理員帳號並加入 Admin 群組
echo "正在建立測試管理員帳號..."
aws cognito-idp admin-create-user \
    --user-pool-id $USER_POOL_ID \
    --username $ADMIN_EMAIL \
    --user-attributes Name=email,Value=$ADMIN_EMAIL Name=email_verified,Value=true \
    --message-action SUPPRESS

aws cognito-idp admin-set-user-password \
    --user-pool-id $USER_POOL_ID \
    --username $ADMIN_EMAIL \
    --password $ADMIN_PASSWORD \
    --permanent

aws cognito-idp admin-add-user-to-group \
    --user-pool-id $USER_POOL_ID \
    --username $ADMIN_EMAIL \
    --group-name Admin

echo "管理員帳號已就緒: $ADMIN_EMAIL"

# 4. 更新前端配置並打包
echo "更新前端 API 配置..."
echo "export const API_BASE_URL = '$API_URL';" > src/config/api.ts

echo " 打包 React 前端..."
cd src
npm install
npm run build
cd ..

# 5. 上傳至 S3 靜態網頁空間
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
WEB_BUCKET="repair-system-web-$ACCOUNT_ID"
echo "正在同步檔案至 S3 ($WEB_BUCKET)..."
aws s3 sync src/dist/ s3://$WEB_BUCKET --delete

echo "--------------------------------------------------"
echo "部署完成！"
echo "前端連結: http://$WEB_BUCKET.s3-website-us-east-1.amazonaws.com"
echo "測試帳號: $ADMIN_EMAIL / $ADMIN_PASSWORD"
echo "--------------------------------------------------"