import serviceFacade from "../../services/service.facade";


export class ListaMaterialesBusiness {

    async buscarProducto(productDescription: string) {
        try {
            const endpoint = `ProductTrees?$filter=contains(ProductDescription,'${productDescription}')&$select=TreeCode,ProductDescription&$orderby=ProductDescription asc&$top=20`;

            const sapResult = await serviceFacade.serviceLayer.request(
                endpoint,
                "GET",
                undefined,
                { "Prefer": "odata.maxpagesize=500" }
            );
            return sapResult;
        } catch (error) {
            throw error;
        }
    }

    async getListaMaterialesPorProducto(treeCode: string) {
        try {
            const endpoint = `ProductTrees('${treeCode}')`;

            const sapResult = await serviceFacade.serviceLayer.request(
                endpoint,
                "GET",
                undefined,
                { "Prefer": "odata.maxpagesize=500" }
            );
            return sapResult;
        } catch (error) {
            throw error;
        }
    }

    // update Quantity of a ProductTreeLine
    async updateQuantity(TreeCode: string, ChildNum: number, Quantity: number) {
        try {
            const endpoint = `ProductTrees('${TreeCode}')`;
            const sapResult = await serviceFacade.serviceLayer.request(
                endpoint,
                "PATCH",
                {
                    "ProductTreeLines": [
                        {
                            ChildNum,
                            Quantity
                        }
                    ]
                }
            );
            return sapResult;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar una línea (ProductTreeLine) de una Lista de Materiales
    async deleteProductTreeLine(TreeCode: string, ChildNum: number) {
        try {
            // 1. Obtener la lista de materiales actual con sus líneas
            const currentTree = await this.getListaMaterialesPorProducto(TreeCode) as {
                ProductTreeLines?: Array<Record<string, unknown>>;
            };

            const lines = currentTree?.ProductTreeLines || [];

            // 2. Validar que la línea exista
            const lineExists = lines.some((line) => line.ChildNum === ChildNum);
            if (!lineExists) {
                throw new Error(`La línea con ChildNum ${ChildNum} no existe en la lista de materiales ${TreeCode}`);
            }

            // 3. SAP B1 exige que una lista de materiales tenga al menos 1 componente
            if (lines.length <= 1) {
                throw new Error("No se puede eliminar la única línea de la lista de materiales; debe contener al menos un componente.");
            }

            // 4. Filtrar para excluir la línea deseada
            const remainingLines = lines.filter((line) => line.ChildNum !== ChildNum);

            // 5. Enviar PATCH con el header B1S-ReplaceCollectionsOnPatch: true
            const endpoint = `ProductTrees('${TreeCode}')`;
            const sapResult = await serviceFacade.serviceLayer.request(
                endpoint,
                "PATCH",
                {
                    ProductTreeLines: remainingLines,
                },
                {
                    "B1S-ReplaceCollectionsOnPatch": "true",
                }
            );

            return sapResult;
        } catch (error) {
            throw error;
        }
    }

}