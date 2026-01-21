package ec.edu.espe.orderservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreatedEvent {

    private String eventType = "OrderCreated";
    private String orderId;
    private List<OrderItemEvent> items;
    private String correlationId;
}
