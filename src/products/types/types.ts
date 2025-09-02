export interface IProductRecord {
  ID: number;
  ModelID: number;
  AdditionalSpecifications: string | null;
  Specifications: any;
  ModelName: string;
  VendorName: string;
  CategoryName: string;
  CategoryURL: string;
  PriceVendor: string | null;
  PriceModelName: string | null;
  FullSizeCaption: string | null;
  PriceAdditionalSpecs: string | null;
  Season: number | null;
  Indexes: string | null;
  Runflat: boolean | null;
  Spikes: boolean | null;
  WholePrice: number | null;
  Quantity: number | null;
}

export interface IResponseRows {
  success: boolean;
  data: IProductRecord[];
  count: number;
  page: number | string;
  limit: number | string;
  totalPages: number;
}
