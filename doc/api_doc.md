# Repair Work Order System - API Documentation

## Overview

Backend API 基於 AWS Lambda + API Gateway 構建，提供修繕工單的 CRUD 操作。透過 SQS 與 SNS 實現非同步通知功能。

---

## Architecture

```
API Gateway → Lambda (TicketAPIHandler) → DynamoDB (TicketTable)
                                       ↓
                                    SQS Queue
                                       ↓
                              Lambda (TicketNotificationWorker)
                                       ↓
                                    SNS → Email
```

---

## Endpoints

### 1. Create Ticket

**Method:** `POST` `/tickets`

**Request Body:**
```json
{
  "title": "冷氣故障",
  "description": "307 教室冷氣無法啟動",
  "priority": "High",
  "user_email": "student@school.edu.tw"
}
```

**Response:** `200 OK`
```json
{
  "message": "Success",
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Flow:**
1. 生成 UUID 作為工單 ID
2. 寫入 DynamoDB (狀態預設為 Open)
3. 發送訊息到 SQS Queue 供通知 Worker 處理

---

### 2. Get All Tickets

**Method:** `GET` `/tickets`

**Response:** `200 OK`
```json
[
  {
    "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "冷氣故障",
    "description": "307 教室冷氣無法啟動",
    "priority": "High",
    "status": "Open",
    "created_at": "2025-12-06T14:30:00.000000",
    "user_email": "student@school.edu.tw"
  }
]
```

**Note:** 使用 DynamoDB Scan，回傳所有工單。

---

### 3. Delete Ticket

**Method:** `DELETE` `/tickets`

**Request Body:**
```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:** `200 OK`
```json
{
  "message": "Deleted"
}
```

---

## CORS Configuration

所有 Response 包含以下 Headers：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

OPTIONS 預檢請求直接回傳 200。

---

## AWS Services

### DynamoDB (TicketTable)

| Field         | Type   | Notes                         |
| ------------- | ------ | ----------------------------- |
| `ticket_id`   | String | Partition Key (UUID)          |
| `title`       | String | 工單標題                      |
| `description` | String | 詳細說明                      |
| `priority`    | String | High / Medium / Low           |
| `status`      | String | Open / In Progress / Resolved |
| `created_at`  | String | ISO 8601 格式時間戳           |
| `user_email`  | String | 報告人 Email                  |

### SQS Queue (TicketQueue)

工單建立時觸發，訊息內容：

```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "冷氣故障",
  "email": "student@school.edu.tw",
  "type": "TICKET_CREATED"
}
```

### SNS Topic (TicketNotificationTopic)

接收 SQS 訊息，以 Email 通知用戶。

---

## Error Handling

| Status | Response                         | Cause                   |
| ------ | -------------------------------- | ----------------------- |
| `400`  | `{"error": "Missing ticket_id"}` | DELETE 請求缺少必要參數 |
| `404`  | `{"error": "Not Found"}`         | 路由不存在              |
| `500`  | `{"error": "..."}`               | 伺服器錯誤              |

---

## Implementation Notes

1. **Decimal Encoding:** DynamoDB 返回的數值使用 `decimal.Decimal` 型別，需透過自訂 JSONEncoder 轉換為 Float。

2. **SQS 訊息格式:** 一次可能收到多筆紀錄，需迴圈處理 `event['Records']`。

3. **Lambda 冷啟動:** 首次調用可能有 1-2 秒延遲。生產環境可使用 Provisioned Concurrency 優化。

4. **Scan vs Query:** 當前使用 Scan 遍歷全表。若資料量大，應改用 Query + GSI。

---

## Testing with curl

```bash
# 建立工單
curl -X POST https://your-api-endpoint/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"冷氣故障","priority":"High","user_email":"test@example.com"}'

# 查詢所有工單
curl -X GET https://your-api-endpoint/tickets

# 刪除工單
curl -X DELETE https://your-api-endpoint/tickets \
  -H "Content-Type: application/json" \
  -d '{"ticket_id":"your-ticket-id"}'

# OPTIONS 預檢
curl -X OPTIONS https://your-api-endpoint/tickets
```

---

## Configuration Required

| 項目          | 位置                        | 說明                |
| ------------- | --------------------------- | ------------------- |
| SQS_QUEUE_URL | TicketAPIHandler.py         | SQS Queue URL       |
| TABLE_NAME    | TicketAPIHandler.py         | DynamoDB Table 名稱 |
| SNS_TOPIC_ARN | TicketNotificationWorker.py | SNS Topic ARN       |

需在環境變數或程式碼中設定上述參數。
