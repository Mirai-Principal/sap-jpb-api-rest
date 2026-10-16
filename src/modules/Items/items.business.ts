import serviceFacade from "../../services/service.facade";
import { ItemDTO } from "./items.schemas";

export class ItemsBusiness {
    /**
     * Buscar artículos mediante SAP Service Layer por código o descripción.
     */
    async searchItems(search?: string, limit: number = 20): Promise<ItemDTO[]> {
        try {
            const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
            const selectFields = "ItemCode,ItemName,InventoryUOM,DefaultWarehouse,TreeType,Valid,Frozen";

            let endpoint: string;

            if (search && search.trim() !== "") {
                const cleanSearch = search.trim().replace(/'/g, "''").toUpperCase();
                endpoint = `Items?$filter=(contains(ItemCode,'${cleanSearch}') or contains(ItemName,'${cleanSearch}')) and Valid eq 'tYES'&$select=${selectFields}&$orderby=ItemName asc&$top=${safeLimit}`;
            } else
                endpoint = `Items?$filter=Valid eq 'tYES'&$select=${selectFields}&$orderby=ItemName asc&$top=${safeLimit}`;

            const sapResult = (await serviceFacade.serviceLayer.request(
                endpoint,
                "GET",
                undefined,
                { "Prefer": `odata.maxpagesize=${safeLimit}` }
            )) as { value?: ItemDTO[] };

            const items = sapResult?.value || [];

            return items.map((item) => ({
                ...item,
                Uom: item.InventoryUOM || item.Uom,
            }));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener un artículo por su ItemCode mediante SAP Service Layer.
     */
    async getItemByCode(itemCode: string): Promise<ItemDTO | null> {
        try {
            const cleanCode = itemCode.trim().replace(/'/g, "''");
            const selectFields = "ItemCode,ItemName,InventoryUOM,DefaultWarehouse,TreeType,Valid,Frozen";
            const endpoint = `Items('${cleanCode}')?$select=${selectFields}`;

            const item = (await serviceFacade.serviceLayer.request(
                endpoint,
                "GET"
            )) as ItemDTO;

            if (!item || !item.ItemCode) {
                return null;
            }

            return {
                ...item,
                Uom: item.InventoryUOM || item.Uom,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : "";
            if (message.includes("404") || message.includes("Not Found") || message.includes("No matching records found")) {
                return null;
            }
            throw error;
        }
    }
}
