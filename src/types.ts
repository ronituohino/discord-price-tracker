export function assertUnreachable(_: never): never {
  throw new Error("Didn't expect to get here");
}

// This is directly from the database, which does not contain the price points
export type Product = {
  id: number;
  userId: number;
  name: string;
  url: string;
  price: string;
  createdAt: string;
};

export type PricePoint = {
  price: string;
  createdAt: string;
};

export type ProductWithFullHistory = {
  id: number;
  userId: number;
  name: string;
  url: string;
  pricePoints: [PricePoint];
  createdAt: string;
};
