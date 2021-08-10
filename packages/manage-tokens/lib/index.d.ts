export declare function generateAccessToken(
  clientId: string,
  clientSecret: string,
  url: string,
  scopes?: string[],
): Promise<string>;
