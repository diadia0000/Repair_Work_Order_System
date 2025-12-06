### 專案：IT 報修工單系統 (Serverless Ticket System)

**通用規則：**

1.  **Request Headers:** 前端呼叫所有 API 時，必須帶上 `Authorization: Bearer <Cognito_ID_Token>` (如果 Cognito 卡關，先不做這條也能跑)。
2.  **CORS:** 後端所有回應都會包含 `Access-Control-Allow-Origin: *`。

-----

### 1\. 資料模型 (Ticket Object)

這是我們資料庫儲存的核心結構，前端顯示列表時也是用這個格式。

```json
{
  "ticket_id": "uuid-1234-5678",      // 由後端生成
  "user_id": "user_cognito_sub",      // 從 Token 或前端傳來
  "title": "伺服器無法連線",           // 標題
  "description": "嘗試 SSH 連線時...", // 詳細內容
  "priority": "High",                 // High, Medium, Low
  "status": "Open",                   // Open, Processing, Closed
  "created_at": "2025-12-06T10:00:00Z" // ISO 8601 時間格式
}
```

-----

### 2\. API 介面定義

#### A. 建立工單 (Create Ticket) - **最重要 (觸發 SQS)**

  * **Method:** `POST`
  * **Path:** `/tickets`
  * **前端傳送 (Request Body):**
    ```json
    {
      "title": "實驗室印表機卡紙",
      "description": "已經重開機過，顯示錯誤代碼 E01",
      "priority": "Medium",
      "user_email": "student@example.com" // 用來發 SNS Email 通知
    }
    ```
  * **後端回應 (Response):** `200 OK`
    ```json
    {
      "message": "Ticket created successfully",
      "ticket_id": "uuid-1234-5678"
    }
    ```
    *(後端備註：收到這個請求後，Lambda 會寫入 DynamoDB，並同時發送訊息給 SQS，前端不用管 SQS，只要顯示成功即可。)*

-----

#### B. 查詢所有工單 (Get All Tickets)

  * **Method:** `GET`
  * **Path:** `/tickets`
  * **前端傳送:** (無 Body)
  * **後端回應 (Response):** `200 OK`
    ```json
    {
      "count": 2,
      "items": [
        {
          "ticket_id": "uuid-1",
          "title": "印表機卡紙",
          "priority": "Medium",
          "status": "Open",
          "created_at": "..."
        },
        {
          "ticket_id": "uuid-2",
          "title": "無法上網",
          "priority": "High",
          "status": "Closed",
          "created_at": "..."
        }
      ]
    }
    ```

-----

#### C. 查詢單筆詳情 (Get One Ticket)

  * **Method:** `GET`
  * **Path:** `/tickets/{ticket_id}` (例如: `/tickets/uuid-1`)
  * **後端回應 (Response):** `200 OK`
    ```json
    {
      "ticket_id": "uuid-1",
      "title": "印表機卡紙",
      "description": "詳細描述...",
      "priority": "Medium",
      "status": "Open",
      "created_at": "...",
      "logs": ["Created at ...", "Admin viewed at ..."] // 選填，若有做歷程紀錄
    }
    ```

-----

#### D. 更新工單狀態 (Update Ticket) - 管理員用

  * **Method:** `PATCH` (或 PUT)
  * **Path:** `/tickets/{ticket_id}`
  * **前端傳送 (Request Body):**
    ```json
    {
      "status": "Closed",       // 改狀態
      "admin_comment": "已修復"  // 選填，管理員回覆
    }
    ```
  * **後端回應 (Response):** `200 OK`
    ```json
    {
      "message": "Ticket updated",
      "ticket_id": "uuid-1",
      "new_status": "Closed"
    }
    ```

-----

#### E. 刪除工單 (Delete Ticket)

  * **Method:** `DELETE`
  * **Path:** `/tickets/{ticket_id}`
  * **後端回應 (Response):** `200 OK`
    ```json
    {
      "message": "Ticket deleted successfully"
    }
    ```

-----
