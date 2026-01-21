package ec.edu.espe.orderservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.orders}")
    private String ordersExchange;

    @Value("${rabbitmq.queue.order-created}")
    private String orderCreatedQueue;

    @Value("${rabbitmq.queue.stock-reserved}")
    private String stockReservedQueue;

    @Value("${rabbitmq.queue.stock-rejected}")
    private String stockRejectedQueue;

    @Value("${rabbitmq.routing-key.order-created}")
    private String orderCreatedRoutingKey;

    @Value("${rabbitmq.routing-key.stock-reserved}")
    private String stockReservedRoutingKey;

    @Value("${rabbitmq.routing-key.stock-rejected}")
    private String stockRejectedRoutingKey;

    // Exchange
    @Bean
    public TopicExchange ordersExchange() {
        return new TopicExchange(ordersExchange);
    }

    // Queues
    @Bean
    public Queue orderCreatedQueue() {
        return new Queue(orderCreatedQueue, true);
    }

    @Bean
    public Queue stockReservedQueue() {
        return new Queue(stockReservedQueue, true);
    }

    @Bean
    public Queue stockRejectedQueue() {
        return new Queue(stockRejectedQueue, true);
    }

    // Bindings
    @Bean
    public Binding orderCreatedBinding() {
        return BindingBuilder
                .bind(orderCreatedQueue())
                .to(ordersExchange())
                .with(orderCreatedRoutingKey);
    }

    @Bean
    public Binding stockReservedBinding() {
        return BindingBuilder
                .bind(stockReservedQueue())
                .to(ordersExchange())
                .with(stockReservedRoutingKey);
    }

    @Bean
    public Binding stockRejectedBinding() {
        return BindingBuilder
                .bind(stockRejectedQueue())
                .to(ordersExchange())
                .with(stockRejectedRoutingKey);
    }

    // Message Converter
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // RabbitTemplate
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
