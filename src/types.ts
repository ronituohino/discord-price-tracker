export function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}

export type Product = {
  id: number;
  userId: number;
  name: string;
  price: string;
  url: string;
  createdAt: string;
};
