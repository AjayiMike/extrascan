export type Result<T> =
    | {
          data: T;
          error?: never;
      }
    | {
          data?: never;
          error: { message: string };
      };
