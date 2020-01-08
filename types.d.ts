declare module 'laag' {
  interface OfflineServer {
    server: any;
    stop: () => Promise<void>;
    url: string;
  }

  interface Params {
    includeFiles?: Array<string>;
    isMultiFolders?: boolean;
    stagePath?: string;
  }

  export function init(path: string, params?: Params): Promise<OfflineServer>;
}
