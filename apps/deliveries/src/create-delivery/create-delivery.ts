import { v4 as uuid } from 'uuid';
import { APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { CreateDeliveryOutput } from '@deliveries-types';

export const handler: APIGatewayProxyHandler = async ({ body }: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!body) throw new Error('missing body'); // you would typically validate this with JSON schema but this is just a basic example

    const { orderId, correlationId } = JSON.parse(body);
    const deliveryId = uuid();

    // we are only logging here to show what success looks like with a valid token - we are not doing any business logic etc
    console.log(`correlationId - ${correlationId} - delivery ID ${deliveryId} created for order ID ${orderId}`);

    const createdDelivery: CreateDeliveryOutput = {
      deliveryId,
      orderId,
      correlationId,
    };

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createdDelivery, null, 2),
    };
  } catch (error: any) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify('An error has been generated', null, 2),
    };
  }
};
