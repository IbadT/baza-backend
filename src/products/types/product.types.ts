export interface IProductFilters {
  category?: string;
  brand?: string | string[];
  season?: string | string[];
  spikes?: boolean;
  runFlat?: boolean;
  priceMin?: number;
  priceMax?: number;
  minQuantity?: number;
  width1?: number;
  height1?: number;
  diameter1?: number;
  width2?: number;
  height2?: number;
  diameter2?: number;
  search?: string;
}

export interface IProductSortOptions {
  sortBy: string;
  customOrderBy?: string;
}

export interface IProductPagination {
  page: number;
  limit: number;
}

export interface IProductQueryOptions {
  filters: IProductFilters;
  sort: IProductSortOptions;
  pagination: IProductPagination;
  xDomain: string;
}

export interface IProductModel {
  id: string;
  productId: number;
  customerId: number;
  customerName: string;
  category: string;
  categoryId: number;
  name: string;
  price: number;
  quantity: number;
  reserved: number;
  customerPoint: string;
  code: string;
  season: string;
  comment: string;
  model: {
    id: number;
    name: string;
    vendorId: number;
    photos: string[];
  };
  // vendorId: number;
  // photos: string[];
}

export interface IProductWheelModel {
  id: string;
  productId: number;
  customerId: number;
  customerName: string;
  category: string;
  categoryId: number;
  name: string;
  price: number;
  quantity: number;
  reserved: number;
  customerPoint: string;
  code: string;
  season: string;
  comment: string;
  model: {
    id: number;
    name: string;
    vendorId: number;
    photos: string[];
  };
}
