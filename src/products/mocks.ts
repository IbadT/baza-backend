import { IResponseRows, IProductRecord } from './types/types';

const mockRecord: IProductRecord = {
  ID: 1,
  ModelID: 1,
  AdditionalSpecifications: 'чёрно-перлам',
  Specifications: null,
  ModelName: 'MR106 MB',
  VendorName: 'REPLAY',
  CategoryName: 'Легковые диски',
  CategoryURL: 'wheels',
  PriceVendor: null,
  PriceModelName: null,
  FullSizeCaption: null,
  PriceAdditionalSpecs: null,
  Season: null,
  Indexes: null,
  Runflat: null,
  Spikes: null,
  WholePrice: null,
  Quantity: null,
};

export const productsData: IResponseRows = {
  count: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
  success: true,
  data: [mockRecord],
};
