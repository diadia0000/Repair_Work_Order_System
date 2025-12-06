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
  "password": "password123",
  "name": "使用者名稱"
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
  "password": "password123"
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
Authorization: Bearer {JWT_TOKEN}
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
      "images": ["https://s3.../image.jpg"]
    }
  ]
}
```

#### 建立工單
```http
POST /tickets
Authorization: Bearer {JWT_TOKEN}
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
建立後自動發送 Email 通知

#### 更新工單狀態 (Admin only)
```http
PUT /tickets/{ticket_id}
Authorization: Bearer {JWT_TOKEN}
```
```json
{
  "status": "Processing"
}
```

#### 刪除工單 (Admin or Owner)
```http
DELETE /tickets/{ticket_id}
Authorization: Bearer {JWT_TOKEN}
```

---

### 圖片上傳

#### 取得上傳 URL
```http
POST /tickets
Authorization: Bearer {JWT_TOKEN}
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
  "image_url": "https://s3.../photo.jpg",
  "key": "tickets/uuid/photo.jpg"
}
```

**上傳流程**:
1. 呼叫此 API 取得 `upload_url`
2. 用 PUT 上傳檔案到 `upload_url`
3. 將 `image_url` 儲存到工單資料

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
SQS_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/.../TicketQueue'
TABLE_NAME = 'TicketTable'
S3_BUCKET_NAME = 'repair-work-order-system'
```

在 `TicketNotificationWorker.py`:
```python
SNS_TOPIC_ARN = 'arn:aws:sns:us-east-1:.../TicketNotificationTopic'
```

---

## 實作細節

### JWT Token 驗證
從 Authorization Header 解析 JWT，取得 email 和 groups 資訊判斷權限

### 密碼安全
使用 SHA-256 搭配 email 作為 salt 雜湊儲存

### S3 Pre-signed URL
產生 5 分鐘有效期的上傳連結，避免直接暴露 S3 憑證

### 通知機制
建立工單時發送訊息到 SQS → Lambda 消費訊息 → SNS 發送 Email
