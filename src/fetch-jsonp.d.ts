declare module "fetch-jsonp" {
  type FetchJsonpOptions = {
    jsonpCallback?: string;
    jsonpCallbackFunction?: string;
    timeout?: number;
    charset?: string;
    nonce?: string;
  };

  export default function fetchJsonp(
    url: string,
    options?: FetchJsonpOptions,
  ): Promise<Response>;
}
