export const CART_STORAGE_KEY = "griferia_leo_cart";

export type StoredProduct = {
  id: string;
  name: string;
  type: string;
  price: number;
  stock: number;
  description?: string | null;
  main_image_url?: string | null;
};

export type StoredCartItem = {
  product: StoredProduct;
  quantity: number;
};
