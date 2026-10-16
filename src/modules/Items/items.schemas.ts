export interface Item { //material
    ItemCode: string;
    ItemName: string;
    InventoryUOM?: string;
    Uom?: string;
    DefaultWarehouse?: string;
    TreeType?: string;
    Valid?: string;
    Frozen?: string;
}

export type ItemDTO = Item;
