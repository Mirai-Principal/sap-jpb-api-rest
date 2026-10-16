export interface ProductTreeLine {
    ItemCode: string;
    Quantity: number;
    Warehouse?: string;
    StageID?: number;
    Price?: number;
    PriceList?: number;
    [key: string]: unknown;
}