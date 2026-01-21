package ec.edu.espe.orderservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockReservedEvent {

    private String eventType = "StockReserved";
    private String orderId;
    private List<OrderItemEvent> reservedItems;
    private String correlationId;
}
