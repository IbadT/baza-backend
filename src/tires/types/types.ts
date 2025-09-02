// popular sizes
export interface IResponsePopularSize {
  popularSizes: IPopularSize[];
}

export interface ISize {
  width: number;
  aspectRatio: number;
  popularity: number;
}

export interface IPopularSize {
  diameter: number;
  sizes: ISize[];
}

// popular brands
export interface IResponsePopularBrands {
  popularBrands: IBrand[];
}

export interface IBrand {
  id: string;
  name: string;
  popularity: number;
  logoUrl: string;
}

// popular brand models
export interface IBrandInfo {
  id: string;
  name: string;
  logoUrl: string;
}

export interface IResponsePopularBrandModels {
  brand: IBrandInfo;
  models: IBrandModel[];
}

export interface IBrandModel extends Pick<IBrand, 'id' | 'name'> {
  imageUrl: string;
  season: string;
}
