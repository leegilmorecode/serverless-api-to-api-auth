import axios from 'axios';
import { decode } from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { generateAccessToken } from '@acme/manage-tokens';
import { CreateDeliveryInput, CreateDeliveryOutput } from '@deliveries-types';

export const handler: APIGatewayProxyHandler = async ({ body }: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    // you would typically validate this with JSON schema but this is just a basic example
    if (!body) throw new Error('missing body');

    // generate a correlationId for our logging, as well as an orderId for the new order
    const correlationId = uuid();
    const orderId = uuid();

    // these would typically come from a confif file where they are null checked
    const domainName = process.env.USERPOOL_DOMAIN_NAME as string;
    const clientSecret = process.env.CLIENT_SECRET as string;
    const clientId = process.env.CLIENT_ID as string;
    const deliveriesAPI = process.env?.DELIVERIES_API_URL as string;

    console.log(`correlationId - ${correlationId} - generating token against ${domainName}`);

    // generate an access token for the delivies API
    const accessToken = await generateAccessToken(clientId, clientSecret, domainName);

    // we should NEVER log the access token - but for this example lets look at the contents of it decoded
    const decoded = decode(accessToken, { complete: true });

    console.log(`correlationId - ${correlationId} - our access token contents: ${JSON.stringify(decoded)}`);

    // create the payload for the create delivery endpoint
    const delivery: CreateDeliveryInput = {
      correlationId,
      orderId,
    };

    console.log(`correlationId - ${correlationId} - calling the deliveries API with: ${JSON.stringify(delivery)}`);

    // call the deliveries API to create the delivery slot
    const { data } = await axios.request({
      url: '/deliveries',
      method: 'post',
      baseURL: `${deliveriesAPI}`,
      headers: {
        Authorization: accessToken,
      },
      data: delivery,
    });

    const { deliveryId }: CreateDeliveryOutput = data;

    console.log(
      `correlationId - ${correlationId} - delivery slot successfully created for deliveryId ${deliveryId} and orderId ${orderId}`,
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          message: { correlationId, orderId, deliveryId },
        },
        null,
        2,
      ),
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
