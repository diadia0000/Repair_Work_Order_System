import json
import boto3
import os
# --- 設定區 ---
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN') # <--- 貼上你的 SNS ARN
# ------------

sns = boto3.client('sns')

def lambda_handler(event, context):
    # SQS 可能一次傳來多筆紀錄 (Records)
    for record in event['Records']:
        try:
            # 解析 SQS 訊息
            body = json.loads(record['body'])
            print("Processing message:", body)
            
            ticket_id = body.get('ticket_id')
            title = body.get('title')
            
            # 準備 Email 內容
            message_text = f"New Ticket Created!\nID: {ticket_id}\nTitle: {title}\nPlease check the dashboard."
            
            # 發送 SNS
            sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Subject=f"[Alert] New Ticket: {title}",
                Message=message_text
            )
            
        except Exception as e:
            print(f"Error processing record: {str(e)}")
            # 如果失敗，不要回傳錯誤，不然 SQS 會一直重試。
            # 生產環境會用 Dead Letter Queue，這裡先 Pass。
            continue
            
    return {'statusCode': 200, 'body': json.dumps('SQS Processed')}