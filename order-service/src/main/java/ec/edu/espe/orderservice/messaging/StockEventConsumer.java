package ec.edu.espe.orderservice.messaging;

import ec.edu.espe.orderservice.event.StockRejectedEvent;
import ec.edu.espe.orderservice.event.StockReservedEvent;
import ec.edu.espe.orderservice.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class StockEventConsumer {

    private final OrderService orderService;

    public StockEventConsumer(OrderService orderService) {
        this.orderService = orderService;
    }

    @RabbitListener(queues = "${rabbitmq.queue.stock-reserved}")
    public void handleStockReserved(StockReservedEvent event) {
        log.info("Received StockReserved event for order: {}", event.getOrderId());
        try {
            orderService.confirmOrder(event.getOrderId());
            log.info("Order {} confirmed successfully", event.getOrderId());
        } catch (Exception e) {
            log.error("Error processing StockReserved event for order {}: {}", 
                    event.getOrderId(), e.getMessage(), e);
        }
    }

    @RabbitListener(queues = "${rabbitmq.queue.stock-rejected}")
    public void handleStockRejected(StockRejectedEvent event) {
        log.info("Received StockRejected event for order: {}", event.getOrderId());
        try {
            orderService.cancelOrder(event.getOrderId(), event.getReason());
            log.info("Order {} cancelled with reason: {}", event.getOrderId(), event.getReason());
        } catch (Exception e) {
            log.error("Error processing StockRejected event for order {}: {}", 
                    event.getOrderId(), e.getMessage(), e);
        }
    }
}
