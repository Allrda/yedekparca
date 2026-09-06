from typing import List, Dict

class StockSyncEngine:
    """
    Yerel stok/fiyat verisi ile OEM katalog verisini eşleştiren senkronizasyon motoru.
    """

    def __init__(self, local_inventory: Dict[str, Dict]):
        # Yerel Stok Deposu (Gerçek senaryoda SQL query veya Pandas ile Excel'den okunur)
        self.inventory = local_inventory

    def match_and_build_output(self, vin: str, catalog_parts: List[Dict[str, str]]) -> Dict:
        """
        OEM parçalarını yerel stok verisiyle JOIN ederek JSON formatlı nihai yanıtı hazırlar.
        """
        final_parts = []

        for part in catalog_parts:
            oem = part.get("oem_code")
            
            # Yerel stokta eşleştirme (JOIN işlemi)
            stock_info = self.inventory.get(oem, None)

            if stock_info:
                in_stock = stock_info.get("qty", 0) > 0
                stock_qty = stock_info.get("qty", 0)
                price = stock_info.get("price", 0.0)
            else:
                in_stock = False
                stock_qty = 0
                price = 0.0

            final_parts.append({
                "oem_code": oem,
                "part_name": part.get("part_name"),
                "category": part.get("category", "Genel"),
                "in_stock": in_stock,
                "stock_qty": stock_qty,
                "price": float(price)
            })

        return {
            "vin": vin.upper(),
            "total_parts_found": len(final_parts),
            "parts": final_parts
        }