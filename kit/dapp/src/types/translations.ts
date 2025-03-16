export interface IntlMessages {
  auth: {
    'wallet-security': {
      'verification-required': string;
      'verification-description': string;
      'setup-pincode': string;
      'pincode-instruction': string;
    };
    'pincode-form': {
      'name-label': string;
      'pincode-label': string;
      'setting-up': string;
      submit: string;
    };
  };
}

export type MessageKeys<T, Prefix extends string = ''> = T extends string
  ? `${Prefix}${T}`
  : {
      [K in keyof T]: MessageKeys<T[K], `${Prefix}${K & string}.`>;
    }[keyof T];

export type NamespaceKeys<T, N extends keyof T = keyof T> = N extends string
  ? `${N}.${MessageKeys<T[N]>}`
  : never;
