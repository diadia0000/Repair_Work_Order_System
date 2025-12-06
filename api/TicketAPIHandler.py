import json
import boto3
import uuid
import decimal
from datetime import datetime
from botocore.exceptions import ClientError

# --- 設定區 (請換成你剛剛建立的數值) ---
SQS_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/463414760499/TicketQueue' # <--- 貼上你的 SQS URL
TABLE_NAME = 'TicketTable'
# -----------------------------------

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)
sqs = boto3.client('sqs')

# 處理 DynamoDB Decimal 轉 JSON 的輔助類別
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    print("Received event:", json.dumps(event)) # Debug 用
    
    # 1. 處理 CORS (讓 React 可以呼叫)
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
    
    # 如果是 OPTIONS 預檢請求，直接回傳 200
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    method = event.get('httpMethod')
    path = event.get('path')
    
    try:
        # --- Create (POST) ---
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            ticket_id = str(uuid.uuid4())
            timestamp = datetime.now().isoformat()
            
            item = {
                'ticket_id': ticket_id,
                'title': body.get('title', 'No Title'),
                'description': body.get('description', ''),
                'priority': body.get('priority', 'Low'),
                'status': 'Open',
                'created_at': timestamp,
                'user_email': body.get('user_email', '') # 用來通知
            }
            
            # 寫入 DynamoDB
            table.put_item(Item=item)
            
            # 發送訊息到 SQS (加分項)
            if item['user_email']:
                msg_body = {
                    'ticket_id': ticket_id,
                    'title': item['title'],
                    'email': item['user_email'],
                    'type': 'TICKET_CREATED'
                }
                sqs.send_message(
                    QueueUrl=SQS_QUEUE_URL,
                    MessageBody=json.dumps(msg_body)
                )
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Success', 'ticket_id': ticket_id})
            }

        # --- Read All (GET) ---
        elif method == 'GET':
            # 這裡簡化直接 Scan (正式環境通常不建議，但作業可接受)
            response = table.scan()
            items = response.get('Items', [])
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(items, cls=DecimalEncoder)
            }
            
        # --- Delete (DELETE) ---
        # 假設路徑是 /tickets/123，但 API Gateway 可能沒設好 Proxy，
        # 我們先假設 ticket_id 放在 QueryString 或 Body 傳進來比較保險
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            ticket_id = body.get('ticket_id')
            
            if ticket_id:
                table.delete_item(Key={'ticket_id': ticket_id})
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'message': 'Deleted'})}
            else:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Missing ticket_id'})}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
    
    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not Found'})}