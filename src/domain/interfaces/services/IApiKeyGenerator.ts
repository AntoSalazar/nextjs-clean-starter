export interface GeneratedApiKey {
  rawKey: string;
  prefix: string;
  hash: string;
}

export interface IApiKeyGenerator {
  generate(): Promise<GeneratedApiKey>;
  hash(key: string): Promise<string>;
  verify(key: string, hash: string): Promise<boolean>;
}
