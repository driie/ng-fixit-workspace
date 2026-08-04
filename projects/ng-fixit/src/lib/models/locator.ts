export interface BoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Locator {
  cssPath: string;
  boundingBox: BoundingBox;
  nearbyText?: string;
  pageUrl?: string;
}
