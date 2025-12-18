import { ResourcesConfig } from 'aws-amplify';

export const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_M33EMjkq9',
      userPoolClientId: '6cq6sr2ji1q4ebvsm9174qiphi',
    }
  }
};