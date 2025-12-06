import { fetchAuthSession } from 'aws-amplify/auth';

// API 配置檔案
// 從 AWS Console -> API Gateway -> Stages -> prod -> Invoke URL 取得
export const API_BASE_URL = 'https://hf8t3ei3bk.execute-api.us-east-1.amazonaws.com/dev';

export const API_ENDPOINTS = {
  tickets: '/tickets',
  ticketById: (id: string) => `/tickets/${id}`,
};

/**
 * 通用 API 請求函數
 * 自動處理 JSON 格式和錯誤處理
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`[API] ${options.method || 'GET'} ${url}`);

  // 取得目前的 Auth Token
  let token = '';
  try {
    const session = await fetchAuthSession();
    token = session.tokens?.idToken?.toString() || '';
  } catch (e) {
    console.log('No auth session found');
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token, // 加入 Token
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // 如果無法解析錯誤訊息，使用預設訊息
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
