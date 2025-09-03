import { Product } from '../products/schemas/product.schema';

export function computeUnitMoneyPrice(product: Product): number {
  let price = product.basePrice;
  const now = new Date();
  const withinWindow = (
    (!product.saleStartAt || now >= new Date(product.saleStartAt)) &&
    (!product.saleEndAt || now <= new Date(product.saleEndAt))
  );
  if (product.onSale && withinWindow && product.salePrice != null) {
    price = product.salePrice;
  } else if (product.discountPercent != null && product.discountPercent > 0) {
    price = Math.round(price * (1 - product.discountPercent / 100));
  }
  return price;
}
