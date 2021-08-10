import AWS from 'aws-sdk';
import { Handler } from 'aws-lambda';

type DeleteParametersRequest = AWS.SSM.DeleteParametersRequest;

export const handler: Handler = async (): Promise<void> => {
  // Note: this lambda is invoked from the sls remove to remove the app client settings from SSM.
  try {
    console.log('Removing the app client settings which had previously been deployed');

    const ssm = new AWS.SSM();
    const stage = process.env.STAGE as string;

    const payload: DeleteParametersRequest = {
      Names: [`/serverless-auth/${stage}/client-id`, `/serverless-auth/${stage}/client-secret`],
    };

    await ssm.deleteParameters(payload).promise();
  } catch (error: any) {
    console.error(error.message);
    throw error;
  }
};
