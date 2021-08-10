export type CreateDeliveryInput = {
  correlationId: string;
  orderId: string;
};

export type CreateDeliveryOutput = {
  correlationId: string;
  orderId: string;
  deliveryId: string;
};
