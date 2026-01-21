package ec.edu.espe.orderservice.messaging;

import ec.edu.espe.orderservice.event.OrderCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class OrderEventProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.orders}")
    private String ordersExchange;

    @Value("${rabbitmq.routing-key.order-created}")
    private String orderCreatedRoutingKey;

    public OrderEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishOrderCreatedEvent(OrderCreatedEvent event) {
        log.info("Publishing OrderCreated event for order: {}", event.getOrderId());
        rabbitTemplate.convertAndSend(ordersExchange, orderCreatedRoutingKey, event);
        log.info("OrderCreated event published successfully");
    }
}
