package ec.edu.espe.orderservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockRejectedEvent {

    private String eventType = "StockRejected";
    private String orderId;
    private String reason;
    private String correlationId;
}
