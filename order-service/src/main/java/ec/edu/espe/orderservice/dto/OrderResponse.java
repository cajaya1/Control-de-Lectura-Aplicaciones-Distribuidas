package ec.edu.espe.orderservice.dto;

import ec.edu.espe.orderservice.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private String orderId;
    private String customerId;
    private List<OrderItemDto> items;
    private String shippingAddress;
    private String paymentReference;
    private OrderStatus status;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
