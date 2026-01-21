package ec.edu.espe.orderservice.service;

import ec.edu.espe.orderservice.dto.CreateOrderRequest;
import ec.edu.espe.orderservice.dto.OrderItemDto;
import ec.edu.espe.orderservice.dto.OrderResponse;
import ec.edu.espe.orderservice.event.OrderCreatedEvent;
import ec.edu.espe.orderservice.event.OrderItemEvent;
import ec.edu.espe.orderservice.messaging.OrderEventProducer;
import ec.edu.espe.orderservice.model.Order;
import ec.edu.espe.orderservice.model.OrderItem;
import ec.edu.espe.orderservice.model.OrderStatus;
import ec.edu.espe.orderservice.repository.OrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderEventProducer orderEventProducer;

    public OrderService(OrderRepository orderRepository, OrderEventProducer orderEventProducer) {
        this.orderRepository = orderRepository;
        this.orderEventProducer = orderEventProducer;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Creating new order for customer: {}", request.getCustomerId());

        // Crear la orden
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentReference(request.getPaymentReference());
        order.setStatus(OrderStatus.PENDING);

        // Agregar items a la orden
        for (OrderItemDto itemDto : request.getItems()) {
            OrderItem item = new OrderItem();
            item.setProductId(itemDto.getProductId());
            item.setQuantity(itemDto.getQuantity());
            order.addItem(item);
        }

        // Guardar en base de datos
        Order savedOrder = orderRepository.save(order);
        log.info("Order saved with ID: {}", savedOrder.getOrderId());

        // Publicar evento OrderCreated
        OrderCreatedEvent event = createOrderCreatedEvent(savedOrder);
        orderEventProducer.publishOrderCreatedEvent(event);

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(String orderId) {
        log.info("Fetching order with ID: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        return mapToResponse(order);
    }

    @Transactional
    public void confirmOrder(String orderId) {
        log.info("Confirming order: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        log.info("Order {} confirmed", orderId);
    }

    @Transactional
    public void cancelOrder(String orderId, String reason) {
        log.info("Cancelling order: {} with reason: {}", orderId, reason);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(reason);
        orderRepository.save(order);
        log.info("Order {} cancelled", orderId);
    }

    private OrderCreatedEvent createOrderCreatedEvent(Order order) {
        List<OrderItemEvent> itemEvents = order.getItems().stream()
                .map(item -> new OrderItemEvent(item.getProductId(), item.getQuantity()))
                .collect(Collectors.toList());

        OrderCreatedEvent event = new OrderCreatedEvent();
        event.setEventType("OrderCreated");
        event.setOrderId(order.getOrderId());
        event.setItems(itemEvents);
        event.setCorrelationId(UUID.randomUUID().toString());

        return event;
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(item -> new OrderItemDto(item.getProductId(), item.getQuantity()))
                .collect(Collectors.toList());

        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId());
        response.setCustomerId(order.getCustomerId());
        response.setItems(itemDtos);
        response.setShippingAddress(order.getShippingAddress());
        response.setPaymentReference(order.getPaymentReference());
        response.setStatus(order.getStatus());
        response.setCancellationReason(order.getCancellationReason());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        return response;
    }
}
