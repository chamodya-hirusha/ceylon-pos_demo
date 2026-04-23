# Ceylon POS - Backend Microservices Architecture

## Overview

This document outlines the complete backend microservices architecture for the Ceylon POS system built with **Spring Boot**. The system follows a microservices architecture pattern with separate services for different business domains, all integrated into one cohesive backend system.

---

## Technology Stack

- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: PostgreSQL / MySQL
- **ORM**: Spring Data JPA / Hibernate
- **API Documentation**: Swagger/OpenAPI 3.0
- **Security**: Spring Security + JWT
- **Service Discovery**: Eureka Server (Netflix OSS)
- **API Gateway**: Spring Cloud Gateway
- **Message Queue**: RabbitMQ / Apache Kafka
- **Caching**: Redis
- **Monitoring**: Spring Boot Actuator + Prometheus + Grafana
- **Build Tool**: Maven / Gradle

---

## Microservices Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│              (Spring Cloud Gateway)                          │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│  Auth Service  │  │   Product   │  │  Sales Service  │
│                │  │   Service   │  │                 │
└────────────────┘  └─────────────┘  └─────────────────┘
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│ Employee Svc   │  │  Inventory  │  │  Return Service │
│                │  │   Service   │  │                 │
└────────────────┘  └─────────────┘  └─────────────────┘
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│  Report Svc    │  │  Payment    │  │  Customer Svc   │
│                │  │   Service   │  │                 │
└────────────────┘  └─────────────┘  └─────────────────┘
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│ Notification   │  │   Config    │  │  Activity Log   │
│    Service     │  │   Service   │  │    Service      │
└────────────────┘  └─────────────┘  └─────────────────┘
```

---

## 1. API Gateway Service

**Purpose**: Single entry point for all client requests, handles routing, authentication, and rate limiting.

### Components

#### Dependencies
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

#### Configuration
- **GatewayConfig.java**: Route definitions
- **CorsConfig.java**: CORS configuration
- **RateLimitConfig.java**: Rate limiting rules
- **JwtAuthFilter.java**: JWT validation filter

#### Routes
- `/api/auth/**` → Auth Service
- `/api/products/**` → Product Service
- `/api/sales/**` → Sales Service
- `/api/inventory/**` → Inventory Service
- `/api/employees/**` → Employee Service
- `/api/returns/**` → Return Service
- `/api/reports/**` → Report Service
- `/api/payments/**` → Payment Service
- `/api/customers/**` → Customer Service
- `/api/activities/**` → Activity Log Service

---

## 2. Authentication & Authorization Service

**Port**: 8081  
**Database**: `auth_db`

### Entities

#### User.java
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String name;
    private String email;
    private String phone;
    private String pin;
    
    @Enumerated(EnumType.STRING)
    private UserRole role; // ADMIN, MANAGER, CASHIER
    
    private boolean active;
    private LocalDateTime joinDate;
    private String sessionId;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<UserSession> sessions;
    
    @OneToMany(mappedBy = "user")
    private List<UserShortcut> shortcuts;
}
```

#### UserSession.java
```java
@Entity
@Table(name = "user_sessions")
public class UserSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String token;
    private LocalDateTime loginTime;
    private LocalDateTime logoutTime;
    private String ipAddress;
    private String deviceInfo;
    private boolean active;
}
```

#### UserShortcut.java
```java
@Entity
@Table(name = "user_shortcuts")
public class UserShortcut {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String shortcutKey;
    private String productId;
}
```

### DTOs

#### LoginRequestDTO.java
```java
public class LoginRequestDTO {
    private String pin;
}
```

#### LoginResponseDTO.java
```java
public class LoginResponseDTO {
    private String token;
    private String refreshToken;
    private UserDTO user;
    private String sessionId;
}
```

#### UserDTO.java
```java
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private String phone;
    private UserRole role;
    private boolean active;
    private LocalDateTime joinDate;
    private Map<String, String> shortcuts;
}
```

### Repositories

#### UserRepository.java
```java
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByPinAndActiveTrue(String pin);
    Optional<User> findByEmailAndActiveTrue(String email);
    List<User> findByActiveTrue();
    List<User> findByRole(UserRole role);
}
```

#### UserSessionRepository.java
```java
@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, String> {
    List<UserSession> findByUserIdAndActiveTrue(String userId);
    Optional<UserSession> findByTokenAndActiveTrue(String token);
    void deleteByUserIdAndActiveTrue(String userId);
}
```

### Services

#### AuthService.java
- `loginByPin(String pin): LoginResponseDTO`
- `logout(String sessionId): void`
- `validateToken(String token): boolean`
- `refreshToken(String refreshToken): LoginResponseDTO`
- `getCurrentUser(String token): UserDTO`

#### UserService.java
- `getAllUsers(): List<UserDTO>`
- `getUserById(String id): UserDTO`
- `createUser(UserDTO userDTO): UserDTO`
- `updateUser(String id, UserDTO userDTO): UserDTO`
- `deleteUser(String id): void`
- `activateUser(String id): void`
- `deactivateUser(String id): void`

### Controllers

#### AuthController.java
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/auth/validate`

#### UserController.java
- `GET /api/auth/users`
- `GET /api/auth/users/{id}`
- `POST /api/auth/users`
- `PUT /api/auth/users/{id}`
- `DELETE /api/auth/users/{id}`
- `PATCH /api/auth/users/{id}/activate`
- `PATCH /api/auth/users/{id}/deactivate`

### Configuration

#### SecurityConfig.java
- JWT token generation and validation
- Password encoding (BCrypt)
- Security filter chain

#### JwtTokenProvider.java
- Token generation
- Token validation
- Extract claims from token

---

## 3. Product Service

**Port**: 8082  
**Database**: `product_db`

### Entities

#### Product.java
```java
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String name;
    private String nameSinhala;
    private String sku;
    private String barcode;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    
    private BigDecimal price;
    private BigDecimal cost;
    private Integer stock;
    
    @Enumerated(EnumType.STRING)
    private ProductUnit unit; // PCS, KG, FT, INCH, BOX, LTR, METER
    
    private Integer minStock;
    private String supplier;
    private String imageUrl;
    private boolean active;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

#### Category.java
```java
@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String name;
    private String nameSinhala;
    private String icon;
    private String color;
    private boolean active;
    
    @OneToMany(mappedBy = "category")
    private List<Product> products;
}
```

### DTOs

#### ProductDTO.java
```java
public class ProductDTO {
    private String id;
    private String name;
    private String nameSinhala;
    private String sku;
    private String barcode;
    private String categoryId;
    private String categoryName;
    private BigDecimal price;
    private BigDecimal cost;
    private Integer stock;
    private ProductUnit unit;
    private Integer minStock;
    private String supplier;
    private String imageUrl;
    private boolean active;
}
```

#### CategoryDTO.java
```java
public class CategoryDTO {
    private String id;
    private String name;
    private String nameSinhala;
    private String icon;
    private String color;
    private boolean active;
    private Integer productCount;
}
```

#### ProductSearchDTO.java
```java
public class ProductSearchDTO {
    private String searchTerm;
    private String categoryId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Boolean lowStock;
    private Boolean active;
}
```

### Repositories

#### ProductRepository.java
```java
@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    Optional<Product> findByBarcode(String barcode);
    Optional<Product> findBySku(String sku);
    List<Product> findByCategoryId(String categoryId);
    List<Product> findByStockLessThanMinStock();
    List<Product> findByActiveTrue();
    
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.nameSinhala) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Product> searchProducts(@Param("search") String search);
}
```

#### CategoryRepository.java
```java
@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByActiveTrue();
    Optional<Category> findByName(String name);
}
```

### Services

#### ProductService.java
- `getAllProducts(): List<ProductDTO>`
- `getProductById(String id): ProductDTO`
- `getProductByBarcode(String barcode): ProductDTO`
- `searchProducts(ProductSearchDTO searchDTO): List<ProductDTO>`
- `createProduct(ProductDTO productDTO): ProductDTO`
- `updateProduct(String id, ProductDTO productDTO): ProductDTO`
- `deleteProduct(String id): void`
- `updateStock(String id, Integer quantity): void`
- `getLowStockProducts(): List<ProductDTO>`

#### CategoryService.java
- `getAllCategories(): List<CategoryDTO>`
- `getCategoryById(String id): CategoryDTO`
- `createCategory(CategoryDTO categoryDTO): CategoryDTO`
- `updateCategory(String id, CategoryDTO categoryDTO): CategoryDTO`
- `deleteCategory(String id): void`

### Controllers

#### ProductController.java
- `GET /api/products`
- `GET /api/products/{id}`
- `GET /api/products/barcode/{barcode}`
- `POST /api/products/search`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- `PATCH /api/products/{id}/stock`
- `GET /api/products/low-stock`

#### CategoryController.java
- `GET /api/categories`
- `GET /api/categories/{id}`
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`

---

## 4. Sales Service

**Port**: 8083  
**Database**: `sales_db`

### Entities

#### Sale.java
```java
@Entity
@Table(name = "sales")
public class Sale {
    @Id
    private String id; // Format: SALE-00001
    
    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL)
    private List<SaleItem> items;
    
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal total;
    
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod; // CASH, CARD, CREDIT
    
    private String cashierId;
    private String cashierName;
    
    private String customerId;
    
    @Enumerated(EnumType.STRING)
    private SaleStatus status; // COMPLETED, RETURNED, PARTIAL_RETURN
    
    @CreatedDate
    private LocalDateTime timestamp;
    
    private String terminalId;
    private String branchId;
}
```

#### SaleItem.java
```java
@Entity
@Table(name = "sale_items")
public class SaleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "sale_id")
    private Sale sale;
    
    private String productId;
    private String productName;
    private String productSku;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal discount;
    private BigDecimal total;
}
```

### DTOs

#### SaleDTO.java
```java
public class SaleDTO {
    private String id;
    private List<SaleItemDTO> items;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal total;
    private PaymentMethod paymentMethod;
    private String cashierId;
    private String cashierName;
    private String customerId;
    private SaleStatus status;
    private LocalDateTime timestamp;
}
```

#### SaleItemDTO.java
```java
public class SaleItemDTO {
    private String productId;
    private String productName;
    private String productSku;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal discount;
    private BigDecimal total;
}
```

#### CreateSaleDTO.java
```java
public class CreateSaleDTO {
    private List<SaleItemDTO> items;
    private BigDecimal discount;
    private PaymentMethod paymentMethod;
    private String customerId;
}
```

### Repositories

#### SaleRepository.java
```java
@Repository
public interface SaleRepository extends JpaRepository<Sale, String> {
    List<Sale> findByCashierId(String cashierId);
    List<Sale> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<Sale> findByStatus(SaleStatus status);
    
    @Query("SELECT s FROM Sale s WHERE s.cashierId = :cashierId AND s.timestamp >= :startDate")
    List<Sale> findByCashierIdAndDate(@Param("cashierId") String cashierId, 
                                       @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT SUM(s.total) FROM Sale s WHERE s.timestamp BETWEEN :start AND :end")
    BigDecimal getTotalSalesBetween(@Param("start") LocalDateTime start, 
                                     @Param("end") LocalDateTime end);
}
```

#### SaleItemRepository.java
```java
@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {
    List<SaleItem> findBySaleId(String saleId);
    
    @Query("SELECT si.productId, SUM(si.quantity) FROM SaleItem si " +
           "WHERE si.sale.timestamp BETWEEN :start AND :end " +
           "GROUP BY si.productId ORDER BY SUM(si.quantity) DESC")
    List<Object[]> getTopSellingProducts(@Param("start") LocalDateTime start, 
                                          @Param("end") LocalDateTime end);
}
```

### Services

#### SaleService.java
- `createSale(CreateSaleDTO saleDTO): SaleDTO`
- `getSaleById(String id): SaleDTO`
- `getAllSales(): List<SaleDTO>`
- `getSalesByCashier(String cashierId): List<SaleDTO>`
- `getSalesByDateRange(LocalDateTime start, LocalDateTime end): List<SaleDTO>`
- `updateSaleStatus(String id, SaleStatus status): void`
- `generateInvoiceNumber(): String`

### Controllers

#### SaleController.java
- `POST /api/sales`
- `GET /api/sales/{id}`
- `GET /api/sales`
- `GET /api/sales/cashier/{cashierId}`
- `GET /api/sales/date-range`
- `PATCH /api/sales/{id}/status`

### Events

#### SaleCreatedEvent.java
```java
public class SaleCreatedEvent {
    private String saleId;
    private List<SaleItemDTO> items;
    private LocalDateTime timestamp;
}
```

---

## 5. Return Service

**Port**: 8084  
**Database**: `return_db`

### Entities

#### ReturnSale.java
```java
@Entity
@Table(name = "return_sales")
public class ReturnSale {
    @Id
    private String id; // Format: RET-00001
    
    private String originalSaleId;
    
    @OneToMany(mappedBy = "returnSale", cascade = CascadeType.ALL)
    private List<ReturnItem> items;
    
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal total;
    
    private String cashierId;
    private String cashierName;
    private String reason;
    
    @CreatedDate
    private LocalDateTime timestamp;
    
    private String terminalId;
    private String branchId;
}
```

#### ReturnItem.java
```java
@Entity
@Table(name = "return_items")
public class ReturnItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "return_sale_id")
    private ReturnSale returnSale;
    
    private String productId;
    private String productName;
    private String productSku;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal discount;
    private BigDecimal total;
}
```

### DTOs

#### ReturnSaleDTO.java
```java
public class ReturnSaleDTO {
    private String id;
    private String originalSaleId;
    private List<ReturnItemDTO> items;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal total;
    private String cashierId;
    private String cashierName;
    private String reason;
    private LocalDateTime timestamp;
}
```

#### CreateReturnDTO.java
```java
public class CreateReturnDTO {
    private String originalSaleId;
    private List<ReturnItemDTO> items;
    private String reason;
}
```

### Repositories

#### ReturnSaleRepository.java
```java
@Repository
public interface ReturnSaleRepository extends JpaRepository<ReturnSale, String> {
    List<ReturnSale> findByOriginalSaleId(String originalSaleId);
    List<ReturnSale> findByCashierId(String cashierId);
    List<ReturnSale> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT SUM(r.total) FROM ReturnSale r WHERE r.timestamp BETWEEN :start AND :end")
    BigDecimal getTotalReturnsBetween(@Param("start") LocalDateTime start, 
                                       @Param("end") LocalDateTime end);
}
```

### Services

#### ReturnService.java
- `createReturn(CreateReturnDTO returnDTO): ReturnSaleDTO`
- `getReturnById(String id): ReturnSaleDTO`
- `getAllReturns(): List<ReturnSaleDTO>`
- `getReturnsByOriginalSale(String saleId): List<ReturnSaleDTO>`
- `getReturnsByCashier(String cashierId): List<ReturnSaleDTO>`
- `generateReturnNumber(): String`

### Controllers

#### ReturnController.java
- `POST /api/returns`
- `GET /api/returns/{id}`
- `GET /api/returns`
- `GET /api/returns/sale/{saleId}`
- `GET /api/returns/cashier/{cashierId}`

### Events

#### ReturnCreatedEvent.java
```java
public class ReturnCreatedEvent {
    private String returnId;
    private String originalSaleId;
    private List<ReturnItemDTO> items;
    private LocalDateTime timestamp;
}
```

---

## 6. Inventory Service

**Port**: 8085  
**Database**: `inventory_db`

### Entities

#### StockMovement.java
```java
@Entity
@Table(name = "stock_movements")
public class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String productId;
    private String productName;
    
    @Enumerated(EnumType.STRING)
    private MovementType type; // SALE, RETURN, ADJUSTMENT, PURCHASE, DAMAGE
    
    private Integer quantity;
    private Integer previousStock;
    private Integer newStock;
    
    private String referenceId; // Sale ID, Return ID, etc.
    private String performedBy;
    private String notes;
    
    @CreatedDate
    private LocalDateTime timestamp;
}
```

#### StockAdjustment.java
```java
@Entity
@Table(name = "stock_adjustments")
public class StockAdjustment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String productId;
    private Integer adjustmentQuantity;
    
    @Enumerated(EnumType.STRING)
    private AdjustmentReason reason; // DAMAGE, THEFT, COUNT_CORRECTION, EXPIRED
    
    private String notes;
    private String performedBy;
    
    @CreatedDate
    private LocalDateTime timestamp;
}
```

### DTOs

#### StockMovementDTO.java
```java
public class StockMovementDTO {
    private String id;
    private String productId;
    private String productName;
    private MovementType type;
    private Integer quantity;
    private Integer previousStock;
    private Integer newStock;
    private String referenceId;
    private String performedBy;
    private LocalDateTime timestamp;
}
```

#### StockAdjustmentDTO.java
```java
public class StockAdjustmentDTO {
    private String productId;
    private Integer adjustmentQuantity;
    private AdjustmentReason reason;
    private String notes;
}
```

### Repositories

#### StockMovementRepository.java
```java
@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, String> {
    List<StockMovement> findByProductId(String productId);
    List<StockMovement> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<StockMovement> findByType(MovementType type);
}
```

#### StockAdjustmentRepository.java
```java
@Repository
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, String> {
    List<StockAdjustment> findByProductId(String productId);
    List<StockAdjustment> findByReason(AdjustmentReason reason);
}
```

### Services

#### InventoryService.java
- `updateStock(String productId, Integer quantity, MovementType type, String referenceId): void`
- `adjustStock(StockAdjustmentDTO adjustmentDTO): void`
- `getStockMovements(String productId): List<StockMovementDTO>`
- `getCurrentStock(String productId): Integer`
- `getLowStockProducts(): List<ProductStockDTO>`

### Controllers

#### InventoryController.java
- `POST /api/inventory/adjust`
- `GET /api/inventory/movements/{productId}`
- `GET /api/inventory/stock/{productId}`
- `GET /api/inventory/low-stock`

### Event Listeners

#### SaleEventListener.java
- Listens to `SaleCreatedEvent`
- Updates stock for sold items

#### ReturnEventListener.java
- Listens to `ReturnCreatedEvent`
- Restocks returned items

---

## 7. Payment Service

**Port**: 8086  
**Database**: `payment_db`

### Entities

#### Payment.java
```java
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String saleId;
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    private PaymentMethod method; // CASH, CARD, CREDIT
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus status; // PENDING, COMPLETED, FAILED, REFUNDED
    
    private String transactionId;
    private String cardLastFour;
    private String cardType;
    
    private BigDecimal amountTendered;
    private BigDecimal changeGiven;
    
    @CreatedDate
    private LocalDateTime timestamp;
}
```

#### CreditAccount.java
```java
@Entity
@Table(name = "credit_accounts")
public class CreditAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String customerId;
    private BigDecimal creditLimit;
    private BigDecimal currentBalance;
    private BigDecimal availableCredit;
    private boolean active;
    
    @OneToMany(mappedBy = "creditAccount")
    private List<CreditTransaction> transactions;
}
```

#### CreditTransaction.java
```java
@Entity
@Table(name = "credit_transactions")
public class CreditTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "credit_account_id")
    private CreditAccount creditAccount;
    
    private String saleId;
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    private TransactionType type; // CHARGE, PAYMENT
    
    @CreatedDate
    private LocalDateTime timestamp;
}
```

### DTOs

#### PaymentDTO.java
```java
public class PaymentDTO {
    private String id;
    private String saleId;
    private BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private String transactionId;
    private BigDecimal amountTendered;
    private BigDecimal changeGiven;
    private LocalDateTime timestamp;
}
```

#### ProcessPaymentDTO.java
```java
public class ProcessPaymentDTO {
    private String saleId;
    private BigDecimal amount;
    private PaymentMethod method;
    private BigDecimal amountTendered;
    private String cardToken;
}
```

### Repositories

#### PaymentRepository.java
```java
@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findBySaleId(String saleId);
    List<Payment> findByStatus(PaymentStatus status);
    List<Payment> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
```

#### CreditAccountRepository.java
```java
@Repository
public interface CreditAccountRepository extends JpaRepository<CreditAccount, String> {
    Optional<CreditAccount> findByCustomerId(String customerId);
    List<CreditAccount> findByActiveTrue();
}
```

### Services

#### PaymentService.java
- `processPayment(ProcessPaymentDTO paymentDTO): PaymentDTO`
- `getPaymentById(String id): PaymentDTO`
- `getPaymentsBySale(String saleId): List<PaymentDTO>`
- `refundPayment(String paymentId): PaymentDTO`

#### CreditService.java
- `getCreditAccount(String customerId): CreditAccountDTO`
- `createCreditAccount(CreateCreditAccountDTO dto): CreditAccountDTO`
- `chargeCreditAccount(String customerId, BigDecimal amount, String saleId): void`
- `paymentToCreditAccount(String customerId, BigDecimal amount): void`

### Controllers

#### PaymentController.java
- `POST /api/payments/process`
- `GET /api/payments/{id}`
- `GET /api/payments/sale/{saleId}`
- `POST /api/payments/{id}/refund`

#### CreditController.java
- `GET /api/payments/credit/{customerId}`
- `POST /api/payments/credit`
- `POST /api/payments/credit/{customerId}/charge`
- `POST /api/payments/credit/{customerId}/payment`

---

## 8. Customer Service

**Port**: 8087  
**Database**: `customer_db`

### Entities

#### Customer.java
```java
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String name;
    private String email;
    private String phone;
    private String address;
    private String nic;
    
    @Enumerated(EnumType.STRING)
    private CustomerType type; // RETAIL, WHOLESALE, CORPORATE
    
    private boolean active;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

### DTOs

#### CustomerDTO.java
```java
public class CustomerDTO {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String nic;
    private CustomerType type;
    private boolean active;
}
```

### Repositories

#### CustomerRepository.java
```java
@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    Optional<Customer> findByPhone(String phone);
    Optional<Customer> findByEmail(String email);
    List<Customer> findByActiveTrue();
    List<Customer> findByType(CustomerType type);
}
```

### Services

#### CustomerService.java
- `getAllCustomers(): List<CustomerDTO>`
- `getCustomerById(String id): CustomerDTO`
- `createCustomer(CustomerDTO customerDTO): CustomerDTO`
- `updateCustomer(String id, CustomerDTO customerDTO): CustomerDTO`
- `deleteCustomer(String id): void`

### Controllers

#### CustomerController.java
- `GET /api/customers`
- `GET /api/customers/{id}`
- `POST /api/customers`
- `PUT /api/customers/{id}`
- `DELETE /api/customers/{id}`

---

## 9. Report Service

**Port**: 8088  
**Database**: `report_db` (Read-only replicas)

### DTOs

#### SalesReportDTO.java
```java
public class SalesReportDTO {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private BigDecimal totalSales;
    private BigDecimal totalReturns;
    private BigDecimal netSales;
    private Integer transactionCount;
    private BigDecimal averageTransactionValue;
    private List<SalesByCashierDTO> salesByCashier;
    private List<SalesByPaymentMethodDTO> salesByPaymentMethod;
}
```

#### InventoryReportDTO.java
```java
public class InventoryReportDTO {
    private Integer totalProducts;
    private Integer lowStockProducts;
    private Integer outOfStockProducts;
    private BigDecimal totalInventoryValue;
    private List<ProductStockDTO> productDetails;
}
```

#### EmployeePerformanceDTO.java
```java
public class EmployeePerformanceDTO {
    private String employeeId;
    private String employeeName;
    private Integer totalSales;
    private BigDecimal totalRevenue;
    private BigDecimal averageSaleValue;
    private Integer totalReturns;
}
```

#### ProductPerformanceDTO.java
```java
public class ProductPerformanceDTO {
    private String productId;
    private String productName;
    private Integer quantitySold;
    private BigDecimal revenue;
    private Integer returnCount;
}
```

#### DailySummaryDTO.java
```java
public class DailySummaryDTO {
    private LocalDate date;
    private BigDecimal openingCash;
    private BigDecimal totalCashSales;
    private BigDecimal totalCardSales;
    private BigDecimal totalCreditSales;
    private BigDecimal totalReturns;
    private BigDecimal expectedCash;
    private BigDecimal actualCash;
    private BigDecimal variance;
}
```

### Services

#### ReportService.java
- `generateSalesReport(LocalDateTime start, LocalDateTime end): SalesReportDTO`
- `generateInventoryReport(): InventoryReportDTO`
- `generateEmployeePerformanceReport(LocalDateTime start, LocalDateTime end): List<EmployeePerformanceDTO>`
- `generateProductPerformanceReport(LocalDateTime start, LocalDateTime end): List<ProductPerformanceDTO>`
- `generateDailySummary(LocalDate date): DailySummaryDTO`
- `exportReportToPDF(String reportType, Map<String, Object> params): byte[]`
- `exportReportToExcel(String reportType, Map<String, Object> params): byte[]`

### Controllers

#### ReportController.java
- `GET /api/reports/sales`
- `GET /api/reports/inventory`
- `GET /api/reports/employee-performance`
- `GET /api/reports/product-performance`
- `GET /api/reports/daily-summary`
- `GET /api/reports/export/pdf`
- `GET /api/reports/export/excel`

---

## 10. Activity Log Service

**Port**: 8089  
**Database**: `activity_db`

### Entities

#### ActivityLog.java
```java
@Entity
@Table(name = "activity_logs")
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Enumerated(EnumType.STRING)
    private ActivityType type; // SALE, RETURN, LOGIN, LOGOUT, PRODUCT_UPDATE, etc.
    
    private String userId;
    private String userName;
    private String description;
    private String referenceId;
    
    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON string
    
    @CreatedDate
    private LocalDateTime timestamp;
    
    private String ipAddress;
}
```

### DTOs

#### ActivityLogDTO.java
```java
public class ActivityLogDTO {
    private String id;
    private ActivityType type;
    private String userId;
    private String userName;
    private String description;
    private String referenceId;
    private Map<String, Object> metadata;
    private LocalDateTime timestamp;
}
```

### Repositories

#### ActivityLogRepository.java
```java
@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, String> {
    List<ActivityLog> findByUserId(String userId);
    List<ActivityLog> findByType(ActivityType type);
    List<ActivityLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT a FROM ActivityLog a WHERE a.userId = :userId AND a.timestamp >= :startDate ORDER BY a.timestamp DESC")
    List<ActivityLog> findRecentActivitiesByUser(@Param("userId") String userId, 
                                                   @Param("startDate") LocalDateTime startDate);
}
```

### Services

#### ActivityLogService.java
- `logActivity(ActivityLogDTO activityDTO): void`
- `getActivitiesByUser(String userId): List<ActivityLogDTO>`
- `getActivitiesByType(ActivityType type): List<ActivityLogDTO>`
- `getActivitiesByDateRange(LocalDateTime start, LocalDateTime end): List<ActivityLogDTO>`

### Controllers

#### ActivityLogController.java
- `GET /api/activities`
- `GET /api/activities/user/{userId}`
- `GET /api/activities/type/{type}`
- `GET /api/activities/date-range`

### Event Listeners

Listens to all major events and logs them:
- `SaleCreatedEvent`
- `ReturnCreatedEvent`
- `UserLoginEvent`
- `UserLogoutEvent`
- `ProductUpdatedEvent`

---

## 11. Configuration Service

**Port**: 8090  
**Database**: `config_db`

### Entities

#### ShopConfiguration.java
```java
@Entity
@Table(name = "shop_configurations")
public class ShopConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String shopName;
    private String branch;
    private String address;
    private String phone;
    private String email;
    private String businessRegistrationNo;
    private String logoUrl;
    private String receiptFooter;
    
    @Enumerated(EnumType.STRING)
    private Currency currency; // LKR, USD, etc.
    
    private BigDecimal taxRate;
    private String timezone;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

#### Terminal.java
```java
@Entity
@Table(name = "terminals")
public class Terminal {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String terminalName;
    private String terminalCode;
    private String branchId;
    private String ipAddress;
    private boolean active;
    
    @CreatedDate
    private LocalDateTime createdAt;
}
```

### DTOs

#### ShopConfigurationDTO.java
```java
public class ShopConfigurationDTO {
    private String id;
    private String shopName;
    private String branch;
    private String address;
    private String phone;
    private String email;
    private String businessRegistrationNo;
    private String logoUrl;
    private String receiptFooter;
    private Currency currency;
    private BigDecimal taxRate;
    private String timezone;
}
```

### Repositories

#### ShopConfigurationRepository.java
```java
@Repository
public interface ShopConfigurationRepository extends JpaRepository<ShopConfiguration, String> {
    Optional<ShopConfiguration> findFirstByOrderByUpdatedAtDesc();
}
```

#### TerminalRepository.java
```java
@Repository
public interface TerminalRepository extends JpaRepository<Terminal, String> {
    Optional<Terminal> findByTerminalCode(String terminalCode);
    List<Terminal> findByActiveTrue();
}
```

### Services

#### ConfigurationService.java
- `getShopConfiguration(): ShopConfigurationDTO`
- `updateShopConfiguration(ShopConfigurationDTO dto): ShopConfigurationDTO`
- `getAllTerminals(): List<TerminalDTO>`
- `registerTerminal(TerminalDTO dto): TerminalDTO`

### Controllers

#### ConfigurationController.java
- `GET /api/config/shop`
- `PUT /api/config/shop`
- `GET /api/config/terminals`
- `POST /api/config/terminals`

---

## 12. Notification Service

**Port**: 8091  
**Database**: `notification_db`

### Entities

#### Notification.java
```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Enumerated(EnumType.STRING)
    private NotificationType type; // LOW_STOCK, SALE_ALERT, SYSTEM_ALERT
    
    private String title;
    private String message;
    private String userId;
    private boolean read;
    
    @CreatedDate
    private LocalDateTime timestamp;
}
```

### DTOs

#### NotificationDTO.java
```java
public class NotificationDTO {
    private String id;
    private NotificationType type;
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime timestamp;
}
```

### Repositories

#### NotificationRepository.java
```java
@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserIdAndReadFalse(String userId);
    List<Notification> findByUserId(String userId);
}
```

### Services

#### NotificationService.java
- `createNotification(NotificationDTO dto): void`
- `getUnreadNotifications(String userId): List<NotificationDTO>`
- `markAsRead(String notificationId): void`
- `sendLowStockAlert(String productId): void`

### Controllers

#### NotificationController.java
- `GET /api/notifications/user/{userId}`
- `GET /api/notifications/unread/{userId}`
- `PATCH /api/notifications/{id}/read`

---

## Common Components Across All Services

### 1. Exception Handling

#### GlobalExceptionHandler.java
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex);
    
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex);
    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex);
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex);
}
```

### 2. Common DTOs

#### ErrorResponse.java
```java
public class ErrorResponse {
    private int status;
    private String message;
    private LocalDateTime timestamp;
    private String path;
}
```

#### PageResponse.java
```java
public class PageResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
}
```

### 3. Logging Configuration

#### LoggingAspect.java
```java
@Aspect
@Component
public class LoggingAspect {
    @Around("execution(* com.ceylonpos.*.controller.*.*(..))")
    public Object logControllerMethods(ProceedingJoinPoint joinPoint);
    
    @Around("execution(* com.ceylonpos.*.service.*.*(..))")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint);
}
```

### 4. Validation

Use Bean Validation (JSR-303) annotations:
- `@NotNull`
- `@NotBlank`
- `@Size`
- `@Min`, `@Max`
- `@Email`
- `@Pattern`

### 5. Mappers

Use MapStruct for DTO-Entity mapping:
```java
@Mapper(componentModel = "spring")
public interface ProductMapper {
    ProductDTO toDTO(Product product);
    Product toEntity(ProductDTO productDTO);
    List<ProductDTO> toDTOList(List<Product> products);
}
```

---

## Database Schema Overview

### Database Naming Convention
- **auth_db**: Users, sessions, shortcuts
- **product_db**: Products, categories
- **sales_db**: Sales, sale items
- **return_db**: Returns, return items
- **inventory_db**: Stock movements, adjustments
- **payment_db**: Payments, credit accounts
- **customer_db**: Customers
- **report_db**: Aggregated data (read replicas)
- **activity_db**: Activity logs
- **config_db**: Shop configuration, terminals
- **notification_db**: Notifications

---

## API Documentation

All services will be documented using **Swagger/OpenAPI 3.0**.

### Swagger Configuration

```java
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Ceylon POS API")
                .version("1.0")
                .description("Point of Sale System API Documentation"))
            .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
            .components(new Components()
                .addSecuritySchemes("Bearer Authentication", 
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
```

Access Swagger UI at: `http://localhost:{port}/swagger-ui.html`

---

## Security Implementation

### JWT Authentication

#### JwtTokenProvider.java
```java
@Component
public class JwtTokenProvider {
    private String secretKey = "your-secret-key";
    private long validityInMilliseconds = 3600000; // 1 hour
    
    public String createToken(String userId, UserRole role);
    public boolean validateToken(String token);
    public String getUserIdFromToken(String token);
    public UserRole getRoleFromToken(String token);
}
```

### Security Filter

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                     HttpServletResponse response, 
                                     FilterChain filterChain);
}
```

### Role-Based Access Control

```java
@PreAuthorize("hasRole('ADMIN')")
public void adminOnlyMethod();

@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public void managerAndAdminMethod();

@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
public void allRolesMethod();
```

---

## Message Queue Integration

### RabbitMQ Configuration

```java
@Configuration
public class RabbitMQConfig {
    public static final String SALES_QUEUE = "sales.queue";
    public static final String RETURN_QUEUE = "return.queue";
    public static final String INVENTORY_QUEUE = "inventory.queue";
    
    @Bean
    public Queue salesQueue() {
        return new Queue(SALES_QUEUE, true);
    }
    
    @Bean
    public Queue returnQueue() {
        return new Queue(RETURN_QUEUE, true);
    }
    
    @Bean
    public Queue inventoryQueue() {
        return new Queue(INVENTORY_QUEUE, true);
    }
}
```

### Event Publishing

```java
@Service
public class EventPublisher {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void publishSaleEvent(SaleCreatedEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.SALES_QUEUE, event);
    }
}
```

---

## Caching Strategy

### Redis Configuration

```java
@Configuration
@EnableCaching
public class RedisConfig {
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .disableCachingNullValues();
        
        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .build();
    }
}
```

### Cacheable Methods

```java
@Cacheable(value = "products", key = "#id")
public ProductDTO getProductById(String id);

@CacheEvict(value = "products", key = "#id")
public void updateProduct(String id, ProductDTO productDTO);

@CacheEvict(value = "products", allEntries = true)
public void clearProductCache();
```

---

## Monitoring & Health Checks

### Actuator Configuration

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
```

### Custom Health Indicators

```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // Check database connectivity
        return Health.up().withDetail("database", "Available").build();
    }
}
```

---

## Deployment Architecture

### Docker Compose Example

```yaml
version: '3.8'

services:
  eureka-server:
    image: ceylon-pos/eureka-server:latest
    ports:
      - "8761:8761"
  
  api-gateway:
    image: ceylon-pos/api-gateway:latest
    ports:
      - "8080:8080"
    depends_on:
      - eureka-server
  
  auth-service:
    image: ceylon-pos/auth-service:latest
    ports:
      - "8081:8081"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/auth_db
    depends_on:
      - postgres
      - eureka-server
  
  product-service:
    image: ceylon-pos/product-service:latest
    ports:
      - "8082:8082"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/product_db
    depends_on:
      - postgres
      - eureka-server
  
  # ... other services
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=ceylonpos
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres-data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

volumes:
  postgres-data:
```

---

## Testing Strategy

### Unit Tests

```java
@SpringBootTest
public class ProductServiceTest {
    @MockBean
    private ProductRepository productRepository;
    
    @Autowired
    private ProductService productService;
    
    @Test
    public void testGetProductById() {
        // Test implementation
    }
}
```

### Integration Tests

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class ProductControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    public void testCreateProduct() throws Exception {
        // Test implementation
    }
}
```

---

## Project Structure

```
ceylon-pos-backend/
├── api-gateway/
│   ├── src/main/java/com/ceylonpos/gateway/
│   │   ├── config/
│   │   ├── filter/
│   │   └── GatewayApplication.java
│   └── pom.xml
├── auth-service/
│   ├── src/main/java/com/ceylonpos/auth/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── config/
│   │   ├── security/
│   │   └── AuthServiceApplication.java
│   └── pom.xml
├── product-service/
│   ├── src/main/java/com/ceylonpos/product/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── mapper/
│   │   └── ProductServiceApplication.java
│   └── pom.xml
├── sales-service/
├── return-service/
├── inventory-service/
├── payment-service/
├── customer-service/
├── report-service/
├── activity-service/
├── config-service/
├── notification-service/
├── eureka-server/
├── common/
│   └── src/main/java/com/ceylonpos/common/
│       ├── dto/
│       ├── exception/
│       ├── util/
│       └── constant/
└── pom.xml (parent)
```

---

## Environment Configuration

### application.yml (Example for Product Service)

```yaml
spring:
  application:
    name: product-service
  datasource:
    url: jdbc:postgresql://localhost:5432/product_db
    username: ceylonpos
    password: password
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  redis:
    host: localhost
    port: 6379
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true

server:
  port: 8082

logging:
  level:
    com.ceylonpos: DEBUG
    org.springframework: INFO
```

---

## API Endpoints Summary

### Authentication Service (Port 8081)
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/auth/users`
- `POST /api/auth/users`
- `PUT /api/auth/users/{id}`
- `DELETE /api/auth/users/{id}`

### Product Service (Port 8082)
- `GET /api/products`
- `GET /api/products/{id}`
- `GET /api/products/barcode/{barcode}`
- `POST /api/products/search`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- `GET /api/categories`
- `POST /api/categories`

### Sales Service (Port 8083)
- `POST /api/sales`
- `GET /api/sales/{id}`
- `GET /api/sales`
- `GET /api/sales/cashier/{cashierId}`
- `GET /api/sales/date-range`

### Return Service (Port 8084)
- `POST /api/returns`
- `GET /api/returns/{id}`
- `GET /api/returns`
- `GET /api/returns/sale/{saleId}`

### Inventory Service (Port 8085)
- `POST /api/inventory/adjust`
- `GET /api/inventory/movements/{productId}`
- `GET /api/inventory/stock/{productId}`
- `GET /api/inventory/low-stock`

### Payment Service (Port 8086)
- `POST /api/payments/process`
- `GET /api/payments/{id}`
- `POST /api/payments/{id}/refund`
- `GET /api/payments/credit/{customerId}`

### Customer Service (Port 8087)
- `GET /api/customers`
- `GET /api/customers/{id}`
- `POST /api/customers`
- `PUT /api/customers/{id}`

### Report Service (Port 8088)
- `GET /api/reports/sales`
- `GET /api/reports/inventory`
- `GET /api/reports/employee-performance`
- `GET /api/reports/product-performance`
- `GET /api/reports/daily-summary`

### Activity Log Service (Port 8089)
- `GET /api/activities`
- `GET /api/activities/user/{userId}`
- `GET /api/activities/type/{type}`

### Configuration Service (Port 8090)
- `GET /api/config/shop`
- `PUT /api/config/shop`
- `GET /api/config/terminals`
- `POST /api/config/terminals`

### Notification Service (Port 8091)
- `GET /api/notifications/user/{userId}`
- `GET /api/notifications/unread/{userId}`
- `PATCH /api/notifications/{id}/read`

---

## Development Roadmap

### Phase 1: Core Services (Weeks 1-4)
1. Setup project structure and parent POM
2. Implement Eureka Server
3. Implement API Gateway
4. Implement Auth Service
5. Implement Product Service
6. Implement Sales Service

### Phase 2: Extended Services (Weeks 5-8)
1. Implement Return Service
2. Implement Inventory Service
3. Implement Payment Service
4. Implement Customer Service

### Phase 3: Reporting & Analytics (Weeks 9-10)
1. Implement Report Service
2. Implement Activity Log Service

### Phase 4: Configuration & Notifications (Weeks 11-12)
1. Implement Configuration Service
2. Implement Notification Service
3. Integration testing
4. Performance optimization

---

## Best Practices

1. **Follow RESTful conventions**
2. **Use DTOs for API communication**
3. **Implement proper exception handling**
4. **Use pagination for list endpoints**
5. **Implement request/response logging**
6. **Use database transactions appropriately**
7. **Implement circuit breakers for inter-service communication**
8. **Use correlation IDs for request tracking**
9. **Implement rate limiting**
10. **Follow SOLID principles**

---

## Conclusion

This comprehensive backend architecture provides a scalable, maintainable, and robust foundation for the Ceylon POS system. Each microservice is designed to handle specific business domains while maintaining loose coupling and high cohesion.

For any questions or clarifications, please refer to the individual service documentation or contact the development team.

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-28  
**Author**: Ceylon POS Development Team
