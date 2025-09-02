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
