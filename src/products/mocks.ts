import { IResponseProductsRows, IProductRecord } from './types/types';

const mockRecord: IProductRecord = {
  id: 'bc31e091-edd7-4f45-9ae5-3025db1ccb69',
  productId: 81625,
  customerId: 66,
  customerName: 'YarShinTorg',
  category: 'Легковые автошины',
  categoryId: 1,
  name: '(Лето) ARIVO ULTRA ARZ5 255/30R24 XL, 97W',
  price: 12851.00,
  quantity: 12,
  reserved: 0,
  customerPoint: 'Склад Яр',
  code: '2EAR222F',
  season: 'Лето',
  comment: '',
  model: {
    id: 46126,
    name: 'ULTRA ARZ5',
    vendorId: 220,
    photos: [],
  },
};

export const productsData: IResponseProductsRows = {
  count: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
  success: true,
  data: [mockRecord],
};
