import AWS from 'aws-sdk';
import { Handler } from 'aws-lambda';

type DescribeUserPoolClientRequest = AWS.CognitoIdentityServiceProvider.DescribeUserPoolClientRequest;
type DescribeUserPoolClientResponse = AWS.CognitoIdentityServiceProvider.DescribeUserPoolClientResponse;
type PutParameterRequest = AWS.SSM.PutParameterRequest;

export const handler: Handler = async (): Promise<void> => {
  // Note: this lambda is invoked from the end of the sls deploy using hooks and scripts
  // to deploy the app client settings to SSM. This is a workaround as it is not
  // supported in CloudFormation:

  // "ClientSecret attribute not supported at this time, please use the CLI or Console to retrieve this value"
  try {
    console.log('Getting the app client settings which have just been deployed');

    const identity = new AWS.CognitoIdentityServiceProvider();
    const ssm = new AWS.SSM();

    // pulling in the environment variables for the lambda
    const clientId = process.env.APP_CLIENT_ID as string;
    const userPoolId = process.env.USER_POOL_ID as string;
    const stage = process.env.STAGE as string;

    const params: DescribeUserPoolClientRequest = {
      ClientId: clientId,
      UserPoolId: userPoolId,
    };

    // get the user pool details so we can get the secret value
    const { UserPoolClient: userPoolClient }: DescribeUserPoolClientResponse = await identity
      .describeUserPoolClient(params)
      .promise();

    if (!userPoolClient) throw new Error('Userpool client not found');

    const clientSecret = userPoolClient.ClientSecret as string;

    // this pushes the app client secret to ssm so we can utilise it in the orders stack
    const clientSecretPayload: PutParameterRequest = {
      Name: `/serverless-auth/${stage}/client-secret`,
      Value: clientSecret,
      Type: 'SecureString',
      Overwrite: true,
    };

    await ssm.putParameter(clientSecretPayload).promise();

    // this pushes the client ID to ssm so we can utilise it in the orders stack
    const clientIdPayload: PutParameterRequest = {
      Name: `/serverless-auth/${stage}/client-id`,
      Value: clientId,
      Type: 'SecureString',
      Overwrite: true,
    };

    await ssm.putParameter(clientIdPayload).promise();
  } catch (error: any) {
    console.error(error.message);
    throw error;
  }
};
