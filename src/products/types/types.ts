export interface IProductRecord {
  // ID: number;
  // ModelID: number;
  // AdditionalSpecifications: string | null;
  // Specifications: any;
  // ModelName: string;
  // VendorName: string;
  // CategoryName: string;
  // CategoryURL: string;
  // PriceVendor: string | null;
  // PriceModelName: string | null;
  // FullSizeCaption: string | null;
  // PriceAdditionalSpecs: string | null;
  // Season: number | null;
  // Indexes: string | null;
  // Runflat: boolean | null;
  // Spikes: boolean | null;
  // WholePrice: number | null;
  // Quantity: number | null;
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


// {
//   "id": "bc31e091-edd7-4f45-9ae5-3025db1ccb69",
//   "productId": 81625,
//   "customerId": 66,
//   "customerName": "YarShinTorg",
//   "category": "Легковые автошины",
//   "categoryId": 1,
//   "name": "(Лето) ARIVO ULTRA ARZ5 255/30R24 XL, 97W",
//   "price": 12851.0000,
//   "quantity": 12,
//   "reserved": 0,
//   "customerPoint": "Склад Яр",
//   "code": "2EAR222F",
//   "season": "Лето",
//   "comment": "",
//   "model": {
//       "id": 46126,
//       "name": "ULTRA ARZ5",
//       "vendorId": 220,
//       "photos": []
//   }
// }






export interface IResponseProductsRows {
  success: boolean;
  data: IProductRecord[];
  count: number;
  page: number | string;
  limit: number | string;
  totalPages: number;
}





