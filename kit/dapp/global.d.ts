 

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
  }
}

declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module "*.svg?url" {
  const content: any;
  export default content;
}

declare global {
  // eslint-disable-next-line no-var
  var $headers: (() => Promise<Headers>) | undefined;
}

export { };

