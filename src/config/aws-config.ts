import { ResourcesConfig } from 'aws-amplify';

export const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      // 腳本會動態替換 PLACEHOLDER 字串
      userPoolId: 'PLACEHOLDER_USER_POOL_ID',
      userPoolClientId: 'PLACEHOLDER_CLIENT_ID',
    }
  }
};