import json
import boto3
import uuid
import decimal
import hashlib
import base64
import re
from datetime import datetime
from botocore.exceptions import ClientError
import os
# --- 設定區 ---
SQS_QUEUE_URL = os.environ.get('SQS_QUEUE_URL')
TABLE_NAME = os.environ.get('TABLE_NAME', 'TicketTable')
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
# -----------------------------------

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)
sqs = boto3.client('sqs')
s3 = boto3.client('s3')

# 處理 DynamoDB Decimal 轉 JSON 的輔助類別
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def get_user_claims(headers):
    """
    從 Authorization Header 解析 JWT Token (簡單解碼)
    注意：在生產環境中，應該驗證簽章 (Signature)
    """
    auth = headers.get('Authorization') or headers.get('authorization')
    if not auth:
        return {}
    
    try:
        # Token 格式通常是 "Bearer <token>" 或直接 "<token>"
        token = auth.replace('Bearer ', '')
        # JWT 是 header.payload.signature
        parts = token.split('.')
        if len(parts) < 2:
            return {}
            
        payload_part = parts[1]
        # Base64 padding
        payload_part += '=' * (-len(payload_part) % 4)
        claims = json.loads(base64.b64decode(payload_part))
        return claims
    except Exception as e:
        print(f"Token decode error: {e}")
        return {}

def lambda_handler(event, context):
    print("Received event:", json.dumps(event)) # Debug 用
    
    # 1. 處理 CORS (讓 React 可以呼叫)
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE, PATCH",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
    
    # 如果是 OPTIONS 預檢請求，直接回傳 200
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    method = event.get('httpMethod')
    path = event.get('path')
    
    # 解析使用者身分
    user_claims = get_user_claims(event.get('headers', {}))
    user_email = user_claims.get('email')
    # 注意：cognito:groups 可能是 list 或 string，視 token 內容而定
    raw_groups = user_claims.get('cognito:groups', [])
    if isinstance(raw_groups, str):
        user_groups = [raw_groups]
    else:
        user_groups = raw_groups
        
    is_admin = 'Admin' in user_groups
    
    print(f"User: {user_email}, Groups: {user_groups}, IsAdmin: {is_admin}")

    try:
        # --- Create (POST) ---
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')

            # === 註冊 (Register) ===
            if action == 'register':
                email = body.get('email')
                password = body.get('password')
                name = body.get('name', 'User')
                
                if not email or not password:
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Missing email or password'})}
                
                # 密碼強度檢查 (後端雙重驗證)
                # 必須包含：至少8字元、大寫字母、小寫字母、數字、特殊符號
                if len(password) < 8:
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Password must be at least 8 characters'})}

                if not re.search(r'[A-Z]', password):
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Password must contain at least one uppercase letter'})}

                if not re.search(r'[a-z]', password):
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Password must contain at least one lowercase letter'})}

                if not re.search(r'[0-9]', password):
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Password must contain at least one number'})}

                if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?`~]', password):
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Password must contain at least one symbol (!@#$%^&* etc.)'})}

                user_id = f"USER#{email}"
                
                # 檢查是否已存在
                existing = table.get_item(Key={'ticket_id': user_id})
                if 'Item' in existing:
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'User already exists'})}
                
                # 密碼雜湊 (Hash)
                # 使用 SHA-256 + Email 作為簡易 Salt
                salt = email.lower()
                hashed_password = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

                item = {
                    'ticket_id': user_id,
                    'user_email': email, # 統一欄位名稱
                    'password': hashed_password, # 儲存雜湊後的密碼
                    'user_name': name, # 統一欄位名稱
                    'type': 'user',
                    'created_at': datetime.now().isoformat()
                }
                table.put_item(Item=item)
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'message': 'User registered successfully'})}

            # === 登入 (Login) ===
            elif action == 'login':
                email = body.get('email')
                password = body.get('password')
                
                user_id = f"USER#{email}"
                response = table.get_item(Key={'ticket_id': user_id})
                
                if 'Item' not in response:
                    return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'User not found'})}
                
                user = response['Item']
                
                # 驗證密碼
                salt = email.lower()
                hashed_input = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
                
                # 相容性檢查：如果舊密碼是明文 (長度通常較短，SHA256 是 64 字元)，則直接比對
                # 注意：這只是過渡期邏輯，建議清空舊資料
                stored_password = user.get('password')
                
                if len(stored_password) < 64: # 假設舊密碼是明文
                     if stored_password != password:
                        return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Invalid password'})}
                else:
                    if stored_password != hashed_input:
                        return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Invalid password'})}
                
                # 取得使用者資料 (相容舊資料 email/name 與新資料 user_email/user_name)
                return_email = user.get('user_email', user.get('email'))
                return_name = user.get('user_name', user.get('name'))

                return {
                    'statusCode': 200, 
                    'headers': headers, 
                    'body': json.dumps({
                        'message': 'Login successful',
                        'user': {
                            'email': return_email,
                            'name': return_name
                        }
                    })
                }

            # === 取得 S3 上傳 URL (Get Upload URL) ===
            elif action == 'get_upload_url':
                file_name = body.get('file_name')
                file_type = body.get('file_type')
                
                if not file_name or not file_type:
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Missing file_name or file_type'})}
                
                # 產生唯一的檔案名稱 (避免覆蓋)
                # 格式: tickets/{uuid}/{timestamp}_{filename}
                unique_id = str(uuid.uuid4())
                timestamp = int(datetime.now().timestamp())
                object_key = f"tickets/{unique_id}/{timestamp}_{file_name}"
                
                try:
                    # 產生 Pre-signed URL
                    presigned_url = s3.generate_presigned_url(
                        'put_object',
                        Params={
                            'Bucket': S3_BUCKET_NAME,
                            'Key': object_key,
                            'ContentType': file_type
                        },
                        ExpiresIn=300 # URL 有效期 5 分鐘
                    )
                    
                    # 回傳上傳 URL 和最終的圖片 URL
                    # 注意：如果 Bucket 不是公開的，讀取時也需要 Pre-signed URL (這裡假設是公開讀取或透過 CloudFront)
                    # 或是之後讀取時再動態產生 GetObject 的 Pre-signed URL
                    image_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{object_key}"
                    
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps({
                            'upload_url': presigned_url,
                            'image_url': image_url,
                            'key': object_key
                        })
                    }
                except Exception as e:
                    print(f"S3 Presign Error: {e}")
                    return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': 'Failed to generate upload URL'})}

            # === 建立工單 (Create Ticket) ===
            # 預設行為 (無 action 或 action='create_ticket')
            ticket_id = str(uuid.uuid4())
            timestamp = datetime.now().isoformat()
            
            item = {
                'ticket_id': ticket_id,
                'title': body.get('title', 'No Title'),
                'description': body.get('description', ''),
                'priority': body.get('priority', 'Low'),
                'status': 'Open',
                'created_at': timestamp,
                'user_email': body.get('user_email', ''), # 用來通知
                'user_name': body.get('user_name', ''), # 顯示用
                'images': body.get('images', []), # 儲存圖片 Base64
                'type': 'ticket' # 標記為工單
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
                try:
                    sqs.send_message(
                        QueueUrl=SQS_QUEUE_URL,
                        MessageBody=json.dumps(msg_body)
                    )
                except Exception as e:
                    print(f"SQS Error: {e}")
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Success', 'ticket_id': ticket_id})
            }

        # --- Read All (GET) ---
        elif method == 'GET':
            # 這裡簡化直接 Scan (正式環境通常不建議，但作業可接受)
            response = table.scan()
            all_items = response.get('Items', [])
            
            # 過濾掉使用者資料 (只回傳工單)
            # 判斷標準：ticket_id 不以 USER# 開頭，或者 type == 'ticket' (舊資料可能沒 type，所以用 USER# 判斷較準)
            items = [i for i in all_items if not i.get('ticket_id', '').startswith('USER#')]
            
            # 標準化回應格式
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'count': len(items),
                    'items': items
                }, cls=DecimalEncoder)
            }
            
        # --- Update (PUT/PATCH) ---
        elif method == 'PUT' or method == 'PATCH':
            # 權限檢查：只有 Admin 可以修改狀態
            if not is_admin:
                return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Permission denied: Only Admin can update status'})}

            # 假設路徑是 /tickets/123，但 API Gateway 可能沒設好 Proxy
            # 我們支援從 Body 讀取 ticket_id
            body = json.loads(event.get('body', '{}'))
            
            # 嘗試從 pathParameters 獲取 ticket_id (如果 API Gateway 有設定 {id})
            path_params = event.get('pathParameters')
            ticket_id = None
            if path_params:
                # 嘗試抓 id 或 ticket_id，看你在 API Gateway 怎麼命名的
                ticket_id = path_params.get('id') or path_params.get('ticket_id')

            if not ticket_id:
                ticket_id = body.get('ticket_id')
            
            if not ticket_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Missing ticket_id'})}

            # 更新欄位 (目前只支援 status)
            new_status = body.get('status')
            if new_status:
                table.update_item(
                    Key={'ticket_id': ticket_id},
                    UpdateExpression="set #s = :s",
                    ExpressionAttributeNames={'#s': 'status'},
                    ExpressionAttributeValues={':s': new_status},
                    ReturnValues="UPDATED_NEW"
                )
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'message': 'Updated', 'status': new_status})}
            else:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'No fields to update'})}

        # --- Delete (DELETE) ---
        elif method == 'DELETE':
            # [修正 1] 安全地解析 Body，防止 DELETE 請求沒有 Body 時報錯
            raw_body = event.get('body')
            body = json.loads(raw_body) if raw_body else {}
            
            # 嘗試從 pathParameters 獲取 ticket_id
            path_params = event.get('pathParameters')
            ticket_id = path_params.get('id') if path_params else body.get('ticket_id')
            
            if ticket_id:
                # 權限檢查：Admin 或 Owner 才能刪除
                try:
                    response = table.get_item(Key={'ticket_id': ticket_id})
                    item = response.get('Item')
                    
                    if not item:
                        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Ticket not found'})}
                    
                    # [修正 2] 確保變數存在，防止 None 比較錯誤
                    owner_email = item.get('user_email')
                    # 這裡的 user_email 來自最上面的 JWT 解析
                    is_owner = user_email and (user_email == owner_email)
                    
                    if not (is_admin or is_owner):
                        return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Permission denied: Only Admin or Owner can delete'})}
                        
                    table.delete_item(Key={'ticket_id': ticket_id})
                    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'message': 'Deleted'})}
                except Exception as e:
                    print(f"Delete error: {str(e)}") # 建議把錯誤印出來，去 CloudWatch 比較好查
                    return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': f'Delete failed: {str(e)}'})}
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