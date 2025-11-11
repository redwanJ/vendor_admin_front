import { api } from '@/lib/axios';
import type {
  StockByLocationDto,
  StockMovementDto,
  AdjustStockDto,
  ReceiveStockDto,
  ShipStockDto,
  TransferStockDto,
  MarkDamagedDto,
} from '@/types/stock';

/**
 * Service for Stock management operations
 */
export const stockService = {
  /**
   * Get stock information for a variant across all locations
   */
  async getStockByVariant(variantId: string): Promise<StockByLocationDto[]> {
    const response = await api.get<StockByLocationDto[]>(`/vendor/stock/variants/${variantId}`);
    return response.data;
  },

  /**
   * Adjust stock quantity (increase or decrease)
   */
  async adjustStock(data: AdjustStockDto): Promise<StockMovementDto> {
    const response = await api.post<StockMovementDto>('/vendor/stock/adjust', data);
    return response.data;
  },

  /**
   * Receive stock into a location
   */
  async receiveStock(data: ReceiveStockDto): Promise<StockMovementDto> {
    const response = await api.post<StockMovementDto>('/vendor/stock/receive', data);
    return response.data;
  },

  /**
   * Ship stock from a location
   */
  async shipStock(data: ShipStockDto): Promise<StockMovementDto> {
    const response = await api.post<StockMovementDto>('/vendor/stock/ship', data);
    return response.data;
  },

  /**
   * Transfer stock between locations
   */
  async transferStock(data: TransferStockDto): Promise<StockMovementDto> {
    const response = await api.post<StockMovementDto>('/vendor/stock/transfer', data);
    return response.data;
  },

  /**
   * Mark stock as damaged
   */
  async markDamaged(data: MarkDamagedDto): Promise<StockMovementDto> {
    const response = await api.post<StockMovementDto>('/vendor/stock/damage', data);
    return response.data;
  },
};
