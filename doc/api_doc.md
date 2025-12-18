# API 文件

## 系統架構

```
使用者請求
    ↓
API Gateway (REST API)
    ↓
Lambda: TicketAPIHandler
    ├── DynamoDB: TicketTable (工單資料)
    ├── S3: 圖片儲存
    └── SQS: TicketQueue (通知佇列)
           ↓
        Lambda: NotificationWorker
           ↓
        SNS → Email 通知
```

**認證**: AWS Cognito (JWT Token)  
**權限**: Admin 與 User

---

## API 端點

### 使用者管理

#### 註冊
```http
POST /tickets
```
```json
{
  "action": "register",
  "email": "user@example.com",
  "password": "Password123!",
  "name": "使用者名稱"
}
```

**密碼規則** (後端驗證):
- 至少 8 字元
- 需包含大寫字母 (A-Z)
- 需包含小寫字母 (a-z)
- 需包含數字 (0-9)
- 需包含特殊符號 (!@#$%^&* 等)

**成功回應**:
```json
{
  "message": "User registered successfully"
}
```

**錯誤回應**:
```json
{
  "error": "Password must contain at least one uppercase letter"
}
```

#### 登入
```http
POST /tickets
```
```json
{
  "action": "login",
  "email": "user@example.com",
  "password": "Password123!"
}
```
**回應**:
```json
{
  "message": "Login successful",
  "user": {
    "email": "user@example.com",
    "name": "使用者名稱"
  }
}
```

---

### 工單操作

#### 查詢所有工單
```http
GET /tickets
Authorization: {JWT_TOKEN}
```
**回應**:
```json
{
  "count": 2,
  "items": [
    {
      "ticket_id": "550e8400-...",
      "title": "冷氣故障",
      "description": "307 教室冷氣無法啟動",
      "priority": "High",
      "status": "Open",
      "created_at": "2025-12-06T14:30:00",
      "user_email": "student@school.edu.tw",
      "user_name": "王小明",
      "images": ["https://s3.../image.jpg"],
      "type": "ticket"
    }
  ]
}
```

**備註**: 會自動過濾掉使用者資料 (ticket_id 以 `USER#` 開頭的項目)

#### 建立工單
```http
POST /tickets
Authorization: {JWT_TOKEN}
```
```json
{
  "title": "冷氣故障",
  "description": "307 教室冷氣無法啟動",
  "priority": "High",
  "user_email": "student@school.edu.tw",
  "user_name": "王小明",
  "images": ["https://s3.../image.jpg"]
}
```

**備註**:
- `priority`: Low / Medium / High
- `status`: 自動設為 "Open"
- `type`: 自動設為 "ticket"
- 建立後自動發送訊息到 SQS，觸發 Email 通知

**回應**:
```json
{
  "message": "Success",
  "ticket_id": "550e8400-..."
}
```

#### 更新工單狀態 (Admin only)
```http
PUT /tickets/{ticket_id}
Authorization: {JWT_TOKEN}
```
```json
{
  "status": "Processing"
}
```

**備註**: 
- `ticket_id` 可從 URL path 或 body 中取得
- 目前只支援更新 `status` 欄位
- `status` 可選值: Open / Processing / Closed

**回應**:
```json
{
  "message": "Updated",
  "status": "Processing"
}
```

#### 刪除工單 (Admin or Owner)
```http
DELETE /tickets/{ticket_id}
Authorization: {JWT_TOKEN}
```

**權限**:
- Admin: 可刪除任何工單
- Owner: 只能刪除自己的工單 (根據 `user_email` 比對)

**回應**:
```json
{
  "message": "Deleted"
}
```

---

### 圖片上傳

#### 取得上傳 URL
```http
POST /tickets
Authorization: {JWT_TOKEN}
```
```json
{
  "action": "get_upload_url",
  "file_name": "photo.jpg",
  "file_type": "image/jpeg"
}
```
**回應**:
```json
{
  "upload_url": "https://s3.../presigned-url",
  "image_url": "https://repair-work-order-system.s3.amazonaws.com/tickets/uuid/timestamp_photo.jpg",
  "key": "tickets/uuid/timestamp_photo.jpg"
}
```

**上傳流程**:
1. 呼叫此 API 取得 `upload_url` (Pre-signed URL)
2. 使用 PUT 方法上傳檔案到 `upload_url`，需設定 `Content-Type` header
3. 將 `image_url` 儲存到工單資料的 `images` 陣列

**檔案命名規則**: `tickets/{uuid}/{timestamp}_{filename}`  
**URL 有效期**: 5 分鐘

---

## 資料結構

### DynamoDB: TicketTable

| 欄位        | 型別   | 說明                   |
| ----------- | ------ | ---------------------- |
| ticket_id   | String | Partition Key (UUID)   |
| type        | String | "ticket" 或 "user"     |
| title       | String | 工單標題               |
| description | String | 詳細說明               |
| priority    | String | Low/Medium/High        |
| status      | String | Open/Processing/Closed |
| user_email  | String | 報告者 Email           |
| user_name   | String | 報告者姓名             |
| images      | List   | 圖片 URL 陣列          |
| created_at  | String | ISO 8601 時間戳        |

**備註**: 使用者資料的 ticket_id 為 `USER#{email}` 格式

---

## 錯誤處理

| Status | 說明         |
| ------ | ------------ |
| 400    | 缺少必要參數 |
| 401    | 登入失敗     |
| 403    | 權限不足     |
| 404    | 路由不存在   |
| 500    | 伺服器錯誤   |

---

## AWS 服務配置

### Lambda Function

**TicketAPIHandler**
- Runtime: Python 3.x
- Memory: 512 MB
- Timeout: 30s
- Permissions: DynamoDB, SQS, S3

**TicketNotificationWorker**
- Trigger: SQS
- Runtime: Python 3.x
- Permissions: SNS

### 其他服務

**SQS Queue**: TicketQueue (Standard)  
**SNS Topic**: TicketNotificationTopic  
**S3 Bucket**: repair-work-order-system  
**DynamoDB Table**: TicketTable

---

## 環境變數

在 `TicketAPIHandler.py`:
```python
SQS_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/463414760499/TicketQueue'
TABLE_NAME = 'TicketTable'
S3_BUCKET_NAME = 'repair-work-order-system'
```

在 `TicketNotificationWorker.py`:
```python
SNS_TOPIC_ARN = 'arn:aws:sns:us-east-1:463414760499:TicketNotificationTopic'
```

---

## 實作細節

### JWT Token 驗證
從 Authorization Header 解析 JWT，取得 email 和 `cognito:groups` 資訊判斷權限。
Token 格式支援 `Bearer {token}` 或直接 `{token}`。

### 密碼安全
使用 SHA-256 搭配 email (小寫) 作為 salt 雜湊儲存：
```python
salt = email.lower()
hashed_password = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
```

### S3 Pre-signed URL
產生 5 分鐘有效期的上傳連結，避免直接暴露 S3 憑證

### 通知機制
建立工單時發送訊息到 SQS → Lambda (TicketNotificationWorker) 消費訊息 → SNS 發送 Email

### CORS 處理
所有請求回應包含以下 Headers:
```python
headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
}
```

### DecimalEncoder
處理 DynamoDB 回傳的 Decimal 型別，自動轉換為 float 以便 JSON 序列化
