import json
import boto3
import uuid
from datetime import datetime

# 初始化 AWS 資源 (放外面可以重複利用連線)
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TicketTable') # 記得改成你的 Table 名稱
sqs = boto3.client('sqs')
QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/YourQueue' # 填你的 SQS URL

def lambda_handler(event, context):
    method = event['httpMethod']
    path = event['path']
    
    # 處理 CORS 預檢請求 (這段最重要，不然前端會報錯)
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH,DELETE"
    }
    
    if method == 'OPTIONS':
        return {"statusCode": 200, "headers": headers, "body": ""}

    try:
        if method == 'POST' and path == '/tickets':
            # 1. 解析前端傳來的 JSON
            body = json.loads(event['body'])
            ticket_id = str(uuid.uuid4())
            
            # 2. 準備資料
            item = {
                'ticket_id': ticket_id,
                'title': body['title'],
                'description': body['description'],
                'priority': body['priority'],
                'status': 'Open',
                'created_at': datetime.now().isoformat()
            }
            
            # 3. 寫入 DynamoDB
            table.put_item(Item=item)
            
            # 4. 發送到 SQS (加分項關鍵！)
            sqs.send_message(
                QueueUrl=QUEUE_URL,
                MessageBody=json.dumps({'ticket_id': ticket_id, 'email': body.get('user_email')})
            )
            
            return {
                "statusCode": 200, 
                "headers": headers, 
                "body": json.dumps({"message": "Success", "ticket_id": ticket_id})
            }

        elif method == 'GET' and path == '/tickets':
            # 讀取全部 (Scan 雖然效能不好，但期末作業資料少沒關係)
            response = table.scan()
            return {
                "statusCode": 200, 
                "headers": headers, 
                "body": json.dumps({"items": response.get('Items', [])})
            }
            
        # ... 繼續寫其他 Method (PATCH, DELETE)

    except Exception as e:
        return {
            "statusCode": 500, 
            "headers": headers, 
            "body": json.dumps({"error": str(e)})
        }