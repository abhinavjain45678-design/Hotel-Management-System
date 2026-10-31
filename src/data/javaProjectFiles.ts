export interface JavaProjectFile {
  path: string;
  name: string;
  category: 'Configuration' | 'Database' | 'Model' | 'DAO' | 'Service' | 'Exception' | 'Util' | 'UI' | 'Docs';
  description: string;
  code: string;
}

export const JAVA_PROJECT_FILES: JavaProjectFile[] = [
  // POM.XML
  {
    path: 'pom.xml',
    name: 'pom.xml',
    category: 'Configuration',
    description: 'Maven configuration containing MySQL Connector/J JDBC driver, FlatLaf modern UI, and JUnit 5.',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.hotel</groupId>
    <artifactId>hotel-food-management-system</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>Hotel Food Management System</name>
    <description>Desktop-based Core Java and MySQL Hotel Management System</description>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- MySQL JDBC Connector Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>8.3.0</version>
        </dependency>

        <!-- Modern FlatLaf Swing Look and Feel -->
        <dependency>
            <groupId>com.formdev</groupId>
            <artifactId>flatlaf</artifactId>
            <version>3.4.1</version>
        </dependency>

        <!-- JUnit 5 for Unit Testing pure services -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>5.10.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Maven Jar Plugin with Main-Class Manifest -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.3.0</version>
                <configuration>
                    <archive>
                        <manifest>
                            <mainClass>com.hotel.Main</mainClass>
                        </manifest>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`,
  },

  // DATABASE SCHEMA
  {
    path: 'database/schema.sql',
    name: 'schema.sql',
    category: 'Database',
    description: 'Complete MySQL DDL schema with relational tables, foreign key constraints, indexes, and seed records.',
    code: `-- =================================================================
-- HOTEL FOOD MANAGEMENT SYSTEM - MYSQL RELATIONAL SCHEMA
-- Database: hotel_db
-- =================================================================

CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

-- 1. Customers Table (Customer Record Management)
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    loyalty_points INT DEFAULT 0,
    total_visits INT DEFAULT 1,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Restaurant Tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
    table_id INT AUTO_INCREMENT PRIMARY KEY,
    table_number INT NOT NULL UNIQUE,
    seating_capacity INT NOT NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'BILLING') DEFAULT 'AVAILABLE',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Menu Items Table (Supports Polymorphic Categories)
CREATE TABLE IF NOT EXISTS menu_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category ENUM('Starters', 'Main Course', 'Breads', 'Beverages', 'Desserts', 'Combos') NOT NULL,
    price DECIMAL(8, 2) NOT NULL,
    is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    preparation_time INT DEFAULT 15,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Orders Table (Header Record)
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    table_number INT NOT NULL,
    customer_id INT,
    status ENUM('PENDING', 'IN_KITCHEN', 'SERVED', 'BILLED', 'CANCELLED') DEFAULT 'PENDING',
    subtotal DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Order Items Table (Many-to-One with Orders & Menu Items)
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(8, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    notes VARCHAR(255),
    CONSTRAINT fk_oi_order FOREIGN KEY (order_id) 
        REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_oi_menu_item FOREIGN KEY (item_id) 
        REFERENCES menu_items(item_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6. Bills Table (Financial Settlement & Tax Compliance)
CREATE TABLE IF NOT EXISTS bills (
    bill_id VARCHAR(50) PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    table_number INT NOT NULL,
    customer_id INT,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    taxable_amount DECIMAL(10, 2) NOT NULL,
    cgst DECIMAL(8, 2) NOT NULL,
    sgst DECIMAL(8, 2) NOT NULL,
    total_tax DECIMAL(8, 2) NOT NULL,
    payable_amount DECIMAL(10, 2) NOT NULL,
    payment_mode ENUM('Cash', 'UPI', 'Credit Card', 'Debit Card') NOT NULL,
    cashier VARCHAR(100) DEFAULT 'Admin',
    file_invoice_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bill_order FOREIGN KEY (order_id) 
        REFERENCES orders(order_id) ON DELETE RESTRICT,
    CONSTRAINT fk_bill_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Create Indexes for fast lookup
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_menu_category ON menu_items(category);

-- Sample Data Seeding
INSERT INTO restaurant_tables (table_number, seating_capacity, status) VALUES
(1, 2, 'AVAILABLE'),
(2, 4, 'AVAILABLE'),
(3, 4, 'AVAILABLE'),
(4, 6, 'AVAILABLE'),
(5, 2, 'AVAILABLE'),
(6, 8, 'AVAILABLE'),
(7, 4, 'AVAILABLE'),
(8, 4, 'AVAILABLE');

INSERT INTO menu_items (name, category, price, is_veg, description, preparation_time) VALUES
('Paneer Tikka Charcoal', 'Starters', 260.00, TRUE, 'Fresh cottage cheese cubes chargrilled in tandoor', 15),
('Crispy Salt & Pepper Corn', 'Starters', 190.00, TRUE, 'Golden sweet corn tossed with oriental peppers', 10),
('Mughlai Chicken Seekh Kebab', 'Starters', 320.00, FALSE, 'Minced chicken skewered with royal spices', 20),
('Paneer Butter Masala', 'Main Course', 280.00, TRUE, 'Creamy tomato-cashew satin gravy with paneer', 20),
('Dal Makhani Heritage', 'Main Course', 240.00, TRUE, 'Black lentils simmered overnight with white butter', 15),
('Murgh Makhani (Butter Chicken)', 'Main Course', 360.00, FALSE, 'Tandoori chicken in satin butter gravy', 22),
('Hyderabadi Chicken Dum Biryani', 'Main Course', 340.00, FALSE, 'Fragrant basmati rice cooked on dum with chicken', 25),
('Butter Naan', 'Breads', 50.00, TRUE, 'Clay oven baked flatbread with butter', 6),
('Garlic & Herb Naan', 'Breads', 65.00, TRUE, 'Tandoori naan topped with chopped charred garlic', 7),
('Royal Kesariya Sweet Lassi', 'Beverages', 90.00, TRUE, 'Thick churned yogurt infused with saffron and pistachios', 5),
('Shahi Gulab Jamun (2 Pcs)', 'Desserts', 80.00, TRUE, 'Golden milk dumplings soaked in cardamom syrup', 5),
('Royal Maharaja Thali', 'Combos', 399.00, TRUE, 'Full feast platter with paneer, dal, naans, rice, sweet', 20);

INSERT INTO customers (name, phone, email, loyalty_points, total_visits, total_spent) VALUES
('Vikram Malhotra', '9820112233', 'vikram.m@gmail.com', 340, 14, 9840.00),
('Pooja Agarwal', '9819445566', 'pooja.a@outlook.com', 180, 8, 5200.00),
('Rohan Deshmukh', '9876501234', 'rohan.d@gmail.com', 520, 22, 16750.00);`,
  },

  // MAIN.JAVA
  {
    path: 'src/main/java/com/hotel/Main.java',
    name: 'Main.java',
    category: 'Configuration',
    description: 'Application entry point. Initializes FlatLaf theme, tests JDBC connection, and launches the desktop Swing GUI.',
    code: `package com.hotel;

import com.formdev.flatlaf.FlatLightLaf;
import com.hotel.dao.DBConnection;
import com.hotel.ui.HotelManagementGUI;

import javax.swing.*;
import java.awt.*;

/**
 * Main Entry Point for Food Hotel Management System
 * Developed with Core Java, Swing, and JDBC/MySQL.
 */
public class Main {
    public static void main(String[] args) {
        // 1. Set modern Swing Look & Feel (FlatLaf)
        try {
            UIManager.setLookAndFeel(new FlatLightLaf());
        } catch (Exception e) {
            System.err.println("Notice: FlatLaf theme could not be loaded, using system fallback.");
        }

        // 2. Asynchronously check JDBC Database Connectivity
        SwingUtilities.invokeLater(() -> {
            try {
                System.out.println("==================================================");
                System.out.println("   GRAND PALACE HOTEL MANAGEMENT SYSTEM v1.0.0    ");
                System.out.println("   Core Java + MySQL JDBC Architecture            ");
                System.out.println("==================================================");

                // Initialize JDBC Singleton Connection
                boolean dbConnected = DBConnection.getInstance().testConnection();
                if (dbConnected) {
                    System.out.println("[INFO] Successfully established JDBC connection to MySQL Database.");
                } else {
                    System.out.println("[WARN] MySQL server unavailable. Running with active In-Memory Fallback Store.");
                }

                // 3. Launch the Swing Desktop User Interface
                HotelManagementGUI gui = new HotelManagementGUI();
                gui.setVisible(true);

            } catch (Exception ex) {
                JOptionPane.showMessageDialog(null, 
                    "Application Error: " + ex.getMessage(), 
                    "Startup Exception", 
                    JOptionPane.ERROR_MESSAGE);
                ex.printStackTrace();
            }
        });
    }
}`,
  },

  // MODEL: MENUITEM.JAVA (ABSTRACTION & ENCAPSULATION)
  {
    path: 'src/main/java/com/hotel/model/MenuItem.java',
    name: 'MenuItem.java',
    category: 'Model',
    description: 'Abstract base class demonstrating Abstraction and Encapsulation with protected/private fields and abstract pricing logic.',
    code: `package com.hotel.model;

import java.io.Serializable;

/**
 * Abstract Base Class representing a restaurant menu item.
 * Demonstrates:
 * - ABSTRACTION: Cannot be instantiated directly; provides template for subclasses.
 * - ENCAPSULATION: Private attributes with getters/setters and defensive validation.
 */
public abstract class MenuItem implements Serializable {
    private static final long serialVersionUID = 1L;

    private int itemId;
    private String name;
    private String category;
    private double price;
    private boolean isVeg;
    private String description;
    private int preparationTimeMinutes;
    private boolean available;

    // Default Constructor
    public MenuItem() {
        this.available = true;
    }

    // Parameterized Constructor
    public MenuItem(int itemId, String name, String category, double price, 
                    boolean isVeg, String description, int preparationTimeMinutes) {
        this.itemId = itemId;
        this.name = name;
        this.category = category;
        setPrice(price); // Encapsulated validation
        this.isVeg = isVeg;
        this.description = description;
        this.preparationTimeMinutes = preparationTimeMinutes;
        this.available = true;
    }

    // Abstract method: polymorphic pricing or discount calculation
    public abstract double calculateTaxRate();

    public abstract String getDietaryTag();

    // Encapsulated Getters and Setters with Validation
    public int getItemId() {
        return itemId;
    }

    public void setItemId(int itemId) {
        this.itemId = itemId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Menu item name cannot be empty.");
        }
        this.name = name.trim();
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        if (price < 0) {
            throw new IllegalArgumentException("Price cannot be negative: " + price);
        }
        this.price = price;
    }

    public boolean isVeg() {
        return isVeg;
    }

    public void setVeg(boolean veg) {
        isVeg = veg;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getPreparationTimeMinutes() {
        return preparationTimeMinutes;
    }

    public void setPreparationTimeMinutes(int preparationTimeMinutes) {
        this.preparationTimeMinutes = preparationTimeMinutes;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    @Override
    public String toString() {
        return String.format("[%d] %s (%s) - ₹%.2f %s", 
            itemId, name, category, price, isVeg ? "[VEG]" : "[NON-VEG]");
    }
}`,
  },

  // MODEL: FOODITEM.JAVA (INHERITANCE)
  {
    path: 'src/main/java/com/hotel/model/FoodItem.java',
    name: 'FoodItem.java',
    category: 'Model',
    description: 'Subclass inheriting from MenuItem representing cooked food, adding spice level and chef recommendation.',
    code: `package com.hotel.model;

/**
 * Concrete Subclass inheriting from MenuItem.
 * Demonstrates:
 * - INHERITANCE: Inherits core attributes and behaviors from MenuItem.
 * - POLYMORPHISM: Implements calculateTaxRate() and getDietaryTag().
 */
public class FoodItem extends MenuItem {
    private String spiceLevel; // Mild, Medium, Spicy, Extra Hot
    private boolean chefSpecial;

    public FoodItem(int itemId, String name, String category, double price, 
                    boolean isVeg, String description, int preparationTimeMinutes, 
                    String spiceLevel, boolean chefSpecial) {
        super(itemId, name, category, price, isVeg, description, preparationTimeMinutes);
        this.spiceLevel = spiceLevel;
        this.chefSpecial = chefSpecial;
    }

    @Override
    public double calculateTaxRate() {
        // Standard Restaurant GST rate is 5.0%
        return 5.0;
    }

    @Override
    public String getDietaryTag() {
        return isVeg() ? "VEG - SPICE: " + spiceLevel : "NON-VEG - SPICE: " + spiceLevel;
    }

    public String getSpiceLevel() {
        return spiceLevel;
    }

    public void setSpiceLevel(String spiceLevel) {
        this.spiceLevel = spiceLevel;
    }

    public boolean isChefSpecial() {
        return chefSpecial;
    }

    public void setChefSpecial(boolean chefSpecial) {
        this.chefSpecial = chefSpecial;
    }
}`,
  },

  // MODEL: BEVERAGEITEM.JAVA (INHERITANCE)
  {
    path: 'src/main/java/com/hotel/model/BeverageItem.java',
    name: 'BeverageItem.java',
    category: 'Model',
    description: 'Subclass inheriting from MenuItem for drinks with volume, serving temperature, and caffeine info.',
    code: `package com.hotel.model;

/**
 * Concrete Subclass inheriting from MenuItem for Beverages.
 * Demonstrates:
 * - INHERITANCE: Specializes MenuItem with liquid volume and temperature attributes.
 */
public class BeverageItem extends MenuItem {
    private int volumeMl;
    private boolean isChilled;

    public BeverageItem(int itemId, String name, double price, String description, 
                        int volumeMl, boolean isChilled) {
        super(itemId, name, "Beverages", price, true, description, 5);
        this.volumeMl = volumeMl;
        this.isChilled = isChilled;
    }

    @Override
    public double calculateTaxRate() {
        return 5.0;
    }

    @Override
    public String getDietaryTag() {
        return isChilled ? "CHILLED BEVERAGE (" + volumeMl + " ml)" : "HOT BEVERAGE (" + volumeMl + " ml)";
    }

    public int getVolumeMl() {
        return volumeMl;
    }

    public void setVolumeMl(int volumeMl) {
        this.volumeMl = volumeMl;
    }

    public boolean isChilled() {
        return isChilled;
    }

    public void setChilled(boolean chilled) {
        isChilled = chilled;
    }
}`,
  },

  // MODEL: SPECIALCOMBOITEM.JAVA (POLYMORPHISM)
  {
    path: 'src/main/java/com/hotel/model/SpecialComboItem.java',
    name: 'SpecialComboItem.java',
    category: 'Model',
    description: 'Subclass demonstrating Polymorphism, bundling multiple menu items with bundled discount rates.',
    code: `package com.hotel.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Demonstrates:
 * - POLYMORPHISM & COMPOSITION: Bundles items and applies package discount.
 * - COLLECTIONS: Uses List<MenuItem> to hold bundle elements.
 */
public class SpecialComboItem extends MenuItem {
    private final List<MenuItem> bundledItems;
    private double bundleDiscountPercentage;

    public SpecialComboItem(int itemId, String name, double price, String description, 
                            double bundleDiscountPercentage) {
        super(itemId, name, "Combos", price, true, description, 20);
        this.bundledItems = new ArrayList<>();
        this.bundleDiscountPercentage = bundleDiscountPercentage;
    }

    public void addBundledItem(MenuItem item) {
        this.bundledItems.add(item);
    }

    public List<MenuItem> getBundledItems() {
        return Collections.unmodifiableList(bundledItems);
    }

    @Override
    public double calculateTaxRate() {
        return 5.0; // Food GST
    }

    @Override
    public String getDietaryTag() {
        return "VALUE COMBO (" + bundledItems.size() + " ITEMS)";
    }

    public double getBundleDiscountPercentage() {
        return bundleDiscountPercentage;
    }

    public void setBundleDiscountPercentage(double bundleDiscountPercentage) {
        this.bundleDiscountPercentage = bundleDiscountPercentage;
    }
}`,
  },

  // MODEL: CUSTOMER.JAVA
  {
    path: 'src/main/java/com/hotel/model/Customer.java',
    name: 'Customer.java',
    category: 'Model',
    description: 'Encapsulated entity for customer record management, tracking visits, spending, and loyalty points.',
    code: `package com.hotel.model;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Customer Model Entity
 * Demonstrates Encapsulation and Data Validation.
 */
public class Customer implements Serializable {
    private static final long serialVersionUID = 1L;

    private int customerId;
    private String name;
    private String phone;
    private String email;
    private int loyaltyPoints;
    private int totalVisits;
    private double totalSpent;
    private LocalDateTime registeredAt;

    public Customer() {
        this.loyaltyPoints = 0;
        this.totalVisits = 1;
        this.totalSpent = 0.0;
        this.registeredAt = LocalDateTime.now();
    }

    public Customer(int customerId, String name, String phone, String email) {
        this();
        this.customerId = customerId;
        setName(name);
        setPhone(phone);
        this.email = email;
    }

    // Business Logic: Award points based on bill amount (1 point per ₹50 spent)
    public void recordPurchase(double billAmount) {
        if (billAmount > 0) {
            this.totalSpent += billAmount;
            this.totalVisits += 1;
            int pointsEarned = (int) (billAmount / 50.0);
            this.loyaltyPoints += pointsEarned;
        }
    }

    public boolean redeemPoints(int pointsToRedeem) {
        if (pointsToRedeem > 0 && pointsToRedeem <= this.loyaltyPoints) {
            this.loyaltyPoints -= pointsToRedeem;
            return true;
        }
        return false;
    }

    // Encapsulated Getters & Setters
    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.trim().length() < 2) {
            throw new IllegalArgumentException("Customer name must have at least 2 characters.");
        }
        this.name = name.trim();
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        if (phone == null || !phone.matches("^[0-9+\\\\-\\\\s]{8,15}$")) {
            throw new IllegalArgumentException("Invalid phone number format: " + phone);
        }
        this.phone = phone.trim();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getLoyaltyPoints() {
        return loyaltyPoints;
    }

    public void setLoyaltyPoints(int loyaltyPoints) {
        this.loyaltyPoints = Math.max(0, loyaltyPoints);
    }

    public int getTotalVisits() {
        return totalVisits;
    }

    public void setTotalVisits(int totalVisits) {
        this.totalVisits = totalVisits;
    }

    public double getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(double totalSpent) {
        this.totalSpent = totalSpent;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    @Override
    public String toString() {
        return String.format("%s (%s) - Visits: %d, Points: %d", 
            name, phone, totalVisits, loyaltyPoints);
    }
}`,
  },

  // MODEL: RESTAURANTTABLE.JAVA
  {
    path: 'src/main/java/com/hotel/model/RestaurantTable.java',
    name: 'RestaurantTable.java',
    category: 'Model',
    description: 'Represents a physical dining table with capacity, status, and occupancy tracking.',
    code: `package com.hotel.model;

import java.io.Serializable;

/**
 * Restaurant Table Entity
 */
public class RestaurantTable implements Serializable {
    public enum TableStatus {
        AVAILABLE, OCCUPIED, RESERVED, BILLING
    }

    private int tableId;
    private int tableNumber;
    private int seatingCapacity;
    private TableStatus status;
    private Integer currentOrderId;
    private String assignedCustomerName;

    public RestaurantTable(int tableId, int tableNumber, int seatingCapacity) {
        this.tableId = tableId;
        this.tableNumber = tableNumber;
        this.seatingCapacity = seatingCapacity;
        this.status = TableStatus.AVAILABLE;
    }

    public int getTableId() {
        return tableId;
    }

    public void setTableId(int tableId) {
        this.tableId = tableId;
    }

    public int getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(int tableNumber) {
        this.tableNumber = tableNumber;
    }

    public int getSeatingCapacity() {
        return seatingCapacity;
    }

    public void setSeatingCapacity(int seatingCapacity) {
        this.seatingCapacity = seatingCapacity;
    }

    public TableStatus getStatus() {
        return status;
    }

    public void setStatus(TableStatus status) {
        this.status = status;
    }

    public Integer getCurrentOrderId() {
        return currentOrderId;
    }

    public void setCurrentOrderId(Integer currentOrderId) {
        this.currentOrderId = currentOrderId;
    }

    public String getAssignedCustomerName() {
        return assignedCustomerName;
    }

    public void setAssignedCustomerName(String assignedCustomerName) {
        this.assignedCustomerName = assignedCustomerName;
    }
}`,
  },

  // MODEL: ORDER.JAVA & ORDERITEM.JAVA
  {
    path: 'src/main/java/com/hotel/model/Order.java',
    name: 'Order.java',
    category: 'Model',
    description: 'Order aggregate managing active food line items using Java Collections (ArrayList).',
    code: `package com.hotel.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Order entity demonstrating Collections Framework (ArrayList).
 */
public class Order implements Serializable {
    public enum OrderStatus {
        PENDING, IN_KITCHEN, SERVED, BILLED, CANCELLED
    }

    private int orderId;
    private int tableNumber;
    private Customer customer;
    private OrderStatus status;
    private final List<OrderItem> items; // Java Collections usage
    private LocalDateTime createdAt;

    public Order() {
        this.items = new ArrayList<>();
        this.status = OrderStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public Order(int orderId, int tableNumber, Customer customer) {
        this();
        this.orderId = orderId;
        this.tableNumber = tableNumber;
        this.customer = customer;
    }

    // Add item to collections with duplicate consolidation
    public void addItem(MenuItem item, int quantity, String notes) {
        if (quantity <= 0) return;
        for (OrderItem oi : items) {
            if (oi.getItem().getItemId() == item.getItemId()) {
                oi.setQuantity(oi.getQuantity() + quantity);
                return;
            }
        }
        items.add(new OrderItem(item, quantity, notes));
    }

    public void removeItem(int itemId) {
        items.removeIf(oi -> oi.getItem().getItemId() == itemId);
    }

    public double calculateSubtotal() {
        double sum = 0.0;
        for (OrderItem oi : items) {
            sum += oi.getLineTotal();
        }
        return sum;
    }

    public List<OrderItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public int getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(int tableNumber) {
        this.tableNumber = tableNumber;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}`,
  },
  {
    path: 'src/main/java/com/hotel/model/OrderItem.java',
    name: 'OrderItem.java',
    category: 'Model',
    description: 'Individual line item inside an order, holding MenuItem reference and quantity.',
    code: `package com.hotel.model;

import java.io.Serializable;

/**
 * Line item inside an Order.
 */
public class OrderItem implements Serializable {
    private MenuItem item;
    private int quantity;
    private String notes;

    public OrderItem(MenuItem item, int quantity, String notes) {
        this.item = item;
        this.quantity = quantity;
        this.notes = notes;
    }

    public double getLineTotal() {
        return item.getPrice() * quantity;
    }

    public MenuItem getItem() {
        return item;
    }

    public void setItem(MenuItem item) {
        this.item = item;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = Math.max(1, quantity);
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}`,
  },

  // MODEL: BILL.JAVA
  {
    path: 'src/main/java/com/hotel/model/Bill.java',
    name: 'Bill.java',
    category: 'Model',
    description: 'Financial settlement entity with GST calculations (CGST/SGST), discount logic, and payment mode.',
    code: `package com.hotel.model;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Financial Bill entity. Encapsulates tax compliance and billing math.
 */
public class Bill implements Serializable {
    public static final double CGST_RATE = 2.5; // 2.5% CGST
    public static final double SGST_RATE = 2.5; // 2.5% SGST

    private String billId;
    private int orderId;
    private int tableNumber;
    private Customer customer;
    private double subtotal;
    private double discountPercent;
    private double discountAmount;
    private double taxableAmount;
    private double cgst;
    private double sgst;
    private double totalTax;
    private double payableAmount;
    private String paymentMode; // Cash, UPI, Credit Card
    private String cashier;
    private LocalDateTime generatedAt;

    public Bill(String billId, int orderId, int tableNumber, Customer customer, 
                double subtotal, double discountPercent, String paymentMode) {
        this.billId = billId;
        this.orderId = orderId;
        this.tableNumber = tableNumber;
        this.customer = customer;
        this.subtotal = subtotal;
        this.discountPercent = discountPercent;
        this.paymentMode = paymentMode;
        this.cashier = "Admin (Desk POS)";
        this.generatedAt = LocalDateTime.now();

        // Perform Calculations
        computeFinancials();
    }

    private void computeFinancials() {
        this.discountAmount = (this.subtotal * Math.max(0, this.discountPercent)) / 100.0;
        this.taxableAmount = Math.max(0, this.subtotal - this.discountAmount);
        this.cgst = Math.round(((taxableAmount * CGST_RATE) / 100.0) * 100.0) / 100.0;
        this.sgst = Math.round(((taxableAmount * SGST_RATE) / 100.0) * 100.0) / 100.0;
        this.totalTax = this.cgst + this.sgst;
        double exactTotal = this.taxableAmount + this.totalTax;
        this.payableAmount = Math.round(exactTotal);
    }

    // Getters
    public String getBillId() { return billId; }
    public int getOrderId() { return orderId; }
    public int getTableNumber() { return tableNumber; }
    public Customer getCustomer() { return customer; }
    public double getSubtotal() { return subtotal; }
    public double getDiscountPercent() { return discountPercent; }
    public double getDiscountAmount() { return discountAmount; }
    public double getTaxableAmount() { return taxableAmount; }
    public double getCgst() { return cgst; }
    public double getSgst() { return sgst; }
    public double getTotalTax() { return totalTax; }
    public double getPayableAmount() { return payableAmount; }
    public String getPaymentMode() { return paymentMode; }
    public String getCashier() { return cashier; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
}`,
  },

  // DAO: DBCONNECTION.JAVA (JDBC SINGLETON)
  {
    path: 'src/main/java/com/hotel/dao/DBConnection.java',
    name: 'DBConnection.java',
    category: 'DAO',
    description: 'Singleton JDBC Connection manager ensuring single connection pool and graceful fallback.',
    code: `package com.hotel.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Singleton Pattern for MySQL Database Connection Management.
 * Demonstrates:
 * - DESIGN PATTERNS: Thread-safe Singleton.
 * - JDBC: Loading Type-4 driver and managing java.sql.Connection lifecycle.
 */
public class DBConnection {
    private static volatile DBConnection instance;
    private Connection connection;

    // MySQL Database Configuration parameters
    private static final String DB_URL = "jdbc:mysql://localhost:3306/hotel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "root";

    // Private Constructor prevents external instantiation
    private DBConnection() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("[ERROR] MySQL JDBC Driver class not found in classpath: " + e.getMessage());
        }
    }

    // Thread-safe Double-Checked Locking Singleton
    public static DBConnection getInstance() {
        if (instance == null) {
            synchronized (DBConnection.class) {
                if (instance == null) {
                    instance = new DBConnection();
                }
            }
        }
        return instance;
    }

    /**
     * Obtains an active SQL Connection. Reconnects if closed.
     */
    public synchronized Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
        }
        return connection;
    }

    /**
     * Test connection availability
     */
    public boolean testConnection() {
        try (Connection con = getConnection()) {
            return con != null && !con.isClosed();
        } catch (SQLException e) {
            return false;
        }
    }

    public synchronized void closeConnection() {
        if (connection != null) {
            try {
                connection.close();
                System.out.println("[INFO] JDBC Connection closed cleanly.");
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}`,
  },

  // DAO: MENUITEMDAO.JAVA
  {
    path: 'src/main/java/com/hotel/dao/MenuItemDAO.java',
    name: 'MenuItemDAO.java',
    category: 'DAO',
    description: 'Data Access Object for Menu Items using PreparedStatement and ResultSet mapping.',
    code: `package com.hotel.dao;

import com.hotel.exception.DatabaseException;
import com.hotel.model.FoodItem;
import com.hotel.model.MenuItem;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) for Menu Items.
 * Demonstrates:
 * - JDBC PreparedStatements (preventing SQL Injection)
 * - ResultSet processing
 * - Exception handling wrapping SQLExceptions into custom DatabaseException.
 */
public class MenuItemDAO {

    public List<MenuItem> getAllMenuItems() throws DatabaseException {
        List<MenuItem> list = new ArrayList<>();
        String sql = "SELECT * FROM menu_items WHERE is_available = TRUE ORDER BY category, name";

        try (Connection con = DBConnection.getInstance().getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(mapResultSetToMenuItem(rs));
            }
        } catch (SQLException ex) {
            throw new DatabaseException("Failed to fetch menu items from MySQL database", ex);
        }
        return list;
    }

    public MenuItem getMenuItemById(int itemId) throws DatabaseException {
        String sql = "SELECT * FROM menu_items WHERE item_id = ?";
        try (Connection con = DBConnection.getInstance().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, itemId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToMenuItem(rs);
                }
            }
        } catch (SQLException ex) {
            throw new DatabaseException("Error retrieving menu item #" + itemId, ex);
        }
        return null;
    }

    public boolean addMenuItem(MenuItem item) throws DatabaseException {
        String sql = "INSERT INTO menu_items (name, category, price, is_veg, description, preparation_time, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = DBConnection.getInstance().getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, item.getName());
            ps.setString(2, item.getCategory());
            ps.setDouble(3, item.getPrice());
            ps.setBoolean(4, item.isVeg());
            ps.setString(5, item.getDescription());
            ps.setInt(6, item.getPreparationTimeMinutes());
            ps.setBoolean(7, item.isAvailable());

            int affectedRows = ps.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = ps.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        item.setItemId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
            return false;
        } catch (SQLException ex) {
            throw new DatabaseException("Failed to insert new menu item: " + item.getName(), ex);
        }
    }

    private MenuItem mapResultSetToMenuItem(ResultSet rs) throws SQLException {
        int id = rs.getInt("item_id");
        String name = rs.getString("name");
        String category = rs.getString("category");
        double price = rs.getDouble("price");
        boolean isVeg = rs.getBoolean("is_veg");
        String desc = rs.getString("description");
        int prepTime = rs.getInt("preparation_time");

        // Factory polymorphism mapping
        return new FoodItem(id, name, category, price, isVeg, desc, prepTime, "Medium", false);
    }
}`,
  },

  // DAO: CUSTOMERDAO.JAVA
  {
    path: 'src/main/java/com/hotel/dao/CustomerDAO.java',
    name: 'CustomerDAO.java',
    category: 'DAO',
    description: 'Data Access Object for customer lookups by phone, insertion, and updating loyalty points.',
    code: `package com.hotel.dao;

import com.hotel.exception.DatabaseException;
import com.hotel.model.Customer;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Customer DAO handling CRM and loyalty persistence.
 */
public class CustomerDAO {

    public Customer findByPhone(String phone) throws DatabaseException {
        String sql = "SELECT * FROM customers WHERE phone = ?";
        try (Connection con = DBConnection.getInstance().getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, phone.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Customer c = new Customer();
                    c.setCustomerId(rs.getInt("customer_id"));
                    c.setName(rs.getString("name"));
                    c.setPhone(rs.getString("phone"));
                    c.setEmail(rs.getString("email"));
                    c.setLoyaltyPoints(rs.getInt("loyalty_points"));
                    c.setTotalVisits(rs.getInt("total_visits"));
                    c.setTotalSpent(rs.getDouble("total_spent"));
                    return c;
                }
            }
        } catch (SQLException ex) {
            throw new DatabaseException("Error finding customer by phone: " + phone, ex);
        }
        return null;
    }

    public Customer createOrUpdateCustomer(Customer customer) throws DatabaseException {
        Customer existing = findByPhone(customer.getPhone());
        if (existing != null) {
            // Update existing customer stats
            String updateSql = "UPDATE customers SET name = ?, email = ?, loyalty_points = ?, total_visits = ?, total_spent = ? WHERE customer_id = ?";
            try (Connection con = DBConnection.getInstance().getConnection();
                 PreparedStatement ps = con.prepareStatement(updateSql)) {

                ps.setString(1, customer.getName());
                ps.setString(2, customer.getEmail());
                ps.setInt(3, customer.getLoyaltyPoints());
                ps.setInt(4, customer.getTotalVisits());
                ps.setDouble(5, customer.getTotalSpent());
                ps.setInt(6, existing.getCustomerId());
                ps.executeUpdate();
                customer.setCustomerId(existing.getCustomerId());
                return customer;
            } catch (SQLException ex) {
                throw new DatabaseException("Failed to update customer record", ex);
            }
        } else {
            // Insert new customer
            String insertSql = "INSERT INTO customers (name, phone, email, loyalty_points, total_visits, total_spent) VALUES (?, ?, ?, ?, ?, ?)";
            try (Connection con = DBConnection.getInstance().getConnection();
                 PreparedStatement ps = con.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {

                ps.setString(1, customer.getName());
                ps.setString(2, customer.getPhone());
                ps.setString(3, customer.getEmail());
                ps.setInt(4, customer.getLoyaltyPoints());
                ps.setInt(5, customer.getTotalVisits());
                ps.setDouble(6, customer.getTotalSpent());

                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        customer.setCustomerId(keys.getInt(1));
                    }
                }
                return customer;
            } catch (SQLException ex) {
                throw new DatabaseException("Failed to register new customer: " + customer.getName(), ex);
            }
        }
    }

    public List<Customer> getAllCustomers() throws DatabaseException {
        List<Customer> list = new ArrayList<>();
        String sql = "SELECT * FROM customers ORDER BY total_spent DESC";
        try (Connection con = DBConnection.getInstance().getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Customer c = new Customer();
                c.setCustomerId(rs.getInt("customer_id"));
                c.setName(rs.getString("name"));
                c.setPhone(rs.getString("phone"));
                c.setEmail(rs.getString("email"));
                c.setLoyaltyPoints(rs.getInt("loyalty_points"));
                c.setTotalVisits(rs.getInt("total_visits"));
                c.setTotalSpent(rs.getDouble("total_spent"));
                list.add(c);
            }
        } catch (SQLException ex) {
            throw new DatabaseException("Failed to fetch customer records", ex);
        }
        return list;
    }
}`,
  },

  // DAO: ORDERDAO.JAVA (TRANSACTION MANAGEMENT)
  {
    path: 'src/main/java/com/hotel/dao/OrderDAO.java',
    name: 'OrderDAO.java',
    category: 'DAO',
    description: 'Demonstrates ACID transactions in JDBC with setAutoCommit(false), commit(), and rollback().',
    code: `package com.hotel.dao;

import com.hotel.exception.DatabaseException;
import com.hotel.model.Order;
import com.hotel.model.OrderItem;

import java.sql.*;

/**
 * Order DAO Demonstrating Transaction Management.
 * Critical Interview Concept:
 * - con.setAutoCommit(false)
 * - con.commit()
 * - con.rollback() in catch block
 */
public class OrderDAO {

    public int saveOrder(Order order) throws DatabaseException {
        String insertOrderSql = "INSERT INTO orders (table_number, customer_id, status, subtotal) VALUES (?, ?, ?, ?)";
        String insertItemSql = "INSERT INTO order_items (order_id, item_id, quantity, unit_price, line_total, notes) VALUES (?, ?, ?, ?, ?, ?)";
        String updateTableSql = "UPDATE restaurant_tables SET status = 'OCCUPIED' WHERE table_number = ?";

        Connection con = null;
        try {
            con = DBConnection.getInstance().getConnection();
            // 1. Begin Database Transaction
            con.setAutoCommit(false);

            int orderId = 0;
            try (PreparedStatement psOrder = con.prepareStatement(insertOrderSql, Statement.RETURN_GENERATED_KEYS)) {
                psOrder.setInt(1, order.getTableNumber());
                if (order.getCustomer() != null && order.getCustomer().getCustomerId() > 0) {
                    psOrder.setInt(2, order.getCustomer().getCustomerId());
                } else {
                    psOrder.setNull(2, Types.INTEGER);
                }
                psOrder.setString(3, order.getStatus().name());
                psOrder.setDouble(4, order.calculateSubtotal());
                psOrder.executeUpdate();

                try (ResultSet keys = psOrder.getGeneratedKeys()) {
                    if (keys.next()) {
                        orderId = keys.getInt(1);
                        order.setOrderId(orderId);
                    }
                }
            }

            // 2. Batch insert individual order items
            try (PreparedStatement psItems = con.prepareStatement(insertItemSql)) {
                for (OrderItem oi : order.getItems()) {
                    psItems.setInt(1, orderId);
                    psItems.setInt(2, oi.getItem().getItemId());
                    psItems.setInt(3, oi.getQuantity());
                    psItems.setDouble(4, oi.getItem().getPrice());
                    psItems.setDouble(5, oi.getLineTotal());
                    psItems.setString(6, oi.getNotes() != null ? oi.getNotes() : "");
                    psItems.addBatch();
                }
                psItems.executeBatch();
            }

            // 3. Mark Table as Occupied
            try (PreparedStatement psTable = con.prepareStatement(updateTableSql)) {
                psTable.setInt(1, order.getTableNumber());
                psTable.executeUpdate();
            }

            // 4. Commit all operations as atomic unit
            con.commit();
            System.out.println("[TRANSACTION] Order #" + orderId + " committed successfully.");
            return orderId;

        } catch (SQLException ex) {
            // Rollback on any failure
            if (con != null) {
                try {
                    con.rollback();
                    System.err.println("[ROLLBACK] Transaction rolled back due to error: " + ex.getMessage());
                } catch (SQLException rbEx) {
                    rbEx.printStackTrace();
                }
            }
            throw new DatabaseException("Failed to persist order in transaction", ex);
        } finally {
            if (con != null) {
                try {
                    con.setAutoCommit(true); // Reset auto-commit state
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}`,
  },

  // DAO: BILLDAO.JAVA
  {
    path: 'src/main/java/com/hotel/dao/BillDAO.java',
    name: 'BillDAO.java',
    category: 'DAO',
    description: 'Data Access Object for recording settled bills and calculating daily sales aggregations.',
    code: `package com.hotel.dao;

import com.hotel.exception.DatabaseException;
import com.hotel.model.Bill;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for Bills and Financial Audits.
 */
public class BillDAO {

    public boolean recordBill(Bill bill, String fileInvoicePath) throws DatabaseException {
        String insertBillSql = "INSERT INTO bills (bill_id, order_id, table_number, customer_id, subtotal, " +
                "discount_percent, discount_amount, taxable_amount, cgst, sgst, total_tax, payable_amount, " +
                "payment_mode, cashier, file_invoice_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        String updateOrderSql = "UPDATE orders SET status = 'BILLED' WHERE order_id = ?";
        String updateTableSql = "UPDATE restaurant_tables SET status = 'AVAILABLE' WHERE table_number = ?";

        Connection con = null;
        try {
            con = DBConnection.getInstance().getConnection();
            con.setAutoCommit(false);

            try (PreparedStatement ps = con.prepareStatement(insertBillSql)) {
                ps.setString(1, bill.getBillId());
                ps.setInt(2, bill.getOrderId());
                ps.setInt(3, bill.getTableNumber());
                if (bill.getCustomer() != null && bill.getCustomer().getCustomerId() > 0) {
                    ps.setInt(4, bill.getCustomer().getCustomerId());
                } else {
                    ps.setNull(4, java.sql.Types.INTEGER);
                }
                ps.setDouble(5, bill.getSubtotal());
                ps.setDouble(6, bill.getDiscountPercent());
                ps.setDouble(7, bill.getDiscountAmount());
                ps.setDouble(8, bill.getTaxableAmount());
                ps.setDouble(9, bill.getCgst());
                ps.setDouble(10, bill.getSgst());
                ps.setDouble(11, bill.getTotalTax());
                ps.setDouble(12, bill.getPayableAmount());
                ps.setString(13, bill.getPaymentMode());
                ps.setString(14, bill.getCashier());
                ps.setString(15, fileInvoicePath);
                ps.executeUpdate();
            }

            try (PreparedStatement psOrder = con.prepareStatement(updateOrderSql)) {
                psOrder.setInt(1, bill.getOrderId());
                psOrder.executeUpdate();
            }

            try (PreparedStatement psTable = con.prepareStatement(updateTableSql)) {
                psTable.setInt(1, bill.getTableNumber());
                psTable.executeUpdate();
            }

            con.commit();
            return true;
        } catch (SQLException ex) {
            if (con != null) {
                try { con.rollback(); } catch (SQLException e) { e.printStackTrace(); }
            }
            throw new DatabaseException("Failed to record bill #" + bill.getBillId(), ex);
        } finally {
            if (con != null) {
                try { con.setAutoCommit(true); } catch (SQLException ignored) {}
            }
        }
    }

    public double getDailyRevenue() throws DatabaseException {
        String sql = "SELECT SUM(payable_amount) FROM bills WHERE DATE(created_at) = CURDATE()";
        try (Connection con = DBConnection.getInstance().getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getDouble(1);
            }
        } catch (SQLException ex) {
            throw new DatabaseException("Failed to query daily revenue", ex);
        }
        return 0.0;
    }
}`,
  },

  // SERVICE: ORDERSERVICE.JAVA
  {
    path: 'src/main/java/com/hotel/service/OrderService.java',
    name: 'OrderService.java',
    category: 'Service',
    description: 'Business service orchestrating order processing, validation, discount logic, and file bill generation.',
    code: `package com.hotel.service;

import com.hotel.dao.BillDAO;
import com.hotel.dao.CustomerDAO;
import com.hotel.dao.OrderDAO;
import com.hotel.exception.HotelException;
import com.hotel.exception.InvalidOrderException;
import com.hotel.model.Bill;
import com.hotel.model.Customer;
import com.hotel.model.Order;
import com.hotel.util.FileHandlerUtil;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service Layer for Order Processing and Billing.
 * Decouples Controller/UI from Data Layer.
 */
public class OrderService {
    private final OrderDAO orderDAO;
    private final BillDAO billDAO;
    private final CustomerDAO customerDAO;

    public OrderService() {
        this.orderDAO = new OrderDAO();
        this.billDAO = new BillDAO();
        this.customerDAO = new CustomerDAO();
    }

    public int placeNewOrder(Order order) throws HotelException {
        if (order.getItems().isEmpty()) {
            throw new InvalidOrderException("Cannot place order with 0 items.");
        }
        if (order.getTableNumber() <= 0) {
            throw new InvalidOrderException("Invalid table number specified: " + order.getTableNumber());
        }

        // If customer is attached, save or update customer details
        if (order.getCustomer() != null) {
            Customer c = customerDAO.createOrUpdateCustomer(order.getCustomer());
            order.setCustomer(c);
        }

        return orderDAO.saveOrder(order);
    }

    public Bill generateAndSettleBill(Order order, double discountPercent, String paymentMode) throws HotelException {
        String billId = "BILL-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        Bill bill = new Bill(billId, order.getOrderId(), order.getTableNumber(), 
                             order.getCustomer(), order.calculateSubtotal(), discountPercent, paymentMode);

        // 1. Save Bill invoice to disk using File Handling
        String filePath = FileHandlerUtil.generateBillInvoiceFile(bill, order.getItems());

        // 2. Persist in MySQL via DAO
        billDAO.recordBill(bill, filePath);

        // 3. Update customer loyalty if available
        if (order.getCustomer() != null) {
            order.getCustomer().recordPurchase(bill.getPayableAmount());
            customerDAO.createOrUpdateCustomer(order.getCustomer());
        }

        return bill;
    }
}`,
  },

  // EXCEPTION CLASSES
  {
    path: 'src/main/java/com/hotel/exception/HotelException.java',
    name: 'HotelException.java',
    category: 'Exception',
    description: 'Base checked exception for the hotel domain.',
    code: `package com.hotel.exception;

/**
 * Base custom checked exception.
 * Demonstrates Java Exception Handling hierarchy.
 */
public class HotelException extends Exception {
    public HotelException(String message) {
        super(message);
    }

    public HotelException(String message, Throwable cause) {
        super(message, cause);
    }
}`,
  },
  {
    path: 'src/main/java/com/hotel/exception/ItemNotFoundException.java',
    name: 'ItemNotFoundException.java',
    category: 'Exception',
    description: 'Specific exception thrown when menu items or orders cannot be located.',
    code: `package com.hotel.exception;

public class ItemNotFoundException extends HotelException {
    public ItemNotFoundException(String message) {
        super(message);
    }
}`,
  },
  {
    path: 'src/main/java/com/hotel/exception/InvalidOrderException.java',
    name: 'InvalidOrderException.java',
    category: 'Exception',
    description: 'Thrown when business validation on order fails.',
    code: `package com.hotel.exception;

public class InvalidOrderException extends HotelException {
    public InvalidOrderException(String message) {
        super(message);
    }
}`,
  },
  {
    path: 'src/main/java/com/hotel/exception/DatabaseException.java',
    name: 'DatabaseException.java',
    category: 'Exception',
    description: 'Wraps SQL exceptions to maintain abstraction between layers.',
    code: `package com.hotel.exception;

public class DatabaseException extends HotelException {
    public DatabaseException(String message, Throwable cause) {
        super(message, cause);
    }
}`,
  },

  // UTIL: FILEHANDLERUTIL.JAVA (FILE I/O)
  {
    path: 'src/main/java/com/hotel/util/FileHandlerUtil.java',
    name: 'FileHandlerUtil.java',
    category: 'Util',
    description: 'Handles physical file operations: writing ASCII invoices to disk, sales audit logging, and customer export.',
    code: `package com.hotel.util;

import com.hotel.exception.HotelException;
import com.hotel.model.Bill;
import com.hotel.model.Customer;
import com.hotel.model.OrderItem;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * File Handling Utility Class.
 * Demonstrates:
 * - Character Streams: FileWriter, BufferedWriter, PrintWriter
 * - Java NIO (Paths, Files.createDirectories)
 * - Try-with-resources for automatic resource closing
 * - File audit logs
 */
public class FileHandlerUtil {
    private static final String INVOICE_DIR = "invoices";
    private static final String AUDIT_LOG_FILE = "logs/hotel_audit.log";

    static {
        try {
            Files.createDirectories(Paths.get(INVOICE_DIR));
            Files.createDirectories(Paths.get("logs"));
        } catch (IOException e) {
            System.err.println("Could not create storage directories: " + e.getMessage());
        }
    }

    /**
     * Generates a permanent text invoice file on disk.
     */
    public static String generateBillInvoiceFile(Bill bill, List<OrderItem> items) throws HotelException {
        String fileName = INVOICE_DIR + File.separator + bill.getBillId() + ".txt";
        File file = new File(fileName);

        // Character stream with try-with-resources
        try (PrintWriter writer = new PrintWriter(new BufferedWriter(new FileWriter(file)))) {
            writer.println("================================================");
            writer.println("         GRAND PALACE RESTAURANT & HOTEL         ");
            writer.println("        NH-48, Heritage Way, Sector 12          ");
            writer.println("             GSTIN: 07AAAAA0000A1Z5             ");
            writer.println("              Phone: +91 98765 43210            ");
            writer.println("================================================");
            writer.printf(" INVOICE #: %-18s ORDER #: %d%n", bill.getBillId(), bill.getOrderId());
            writer.printf(" DATE/TIME: %s%n", bill.getGeneratedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            writer.printf(" TABLE NO : Table %d%n", bill.getTableNumber());
            if (bill.getCustomer() != null) {
                writer.printf(" CUSTOMER : %s (%s)%n", bill.getCustomer().getName(), bill.getCustomer().getPhone());
            } else {
                writer.println(" CUSTOMER : Walk-In Guest");
            }
            writer.printf(" CASHIER  : %s%n", bill.getCashier());
            writer.println("------------------------------------------------");
            writer.println(" ITEM                     QTY   PRICE      TOTAL");
            writer.println("------------------------------------------------");

            for (OrderItem oi : items) {
                String name = oi.getItem().getName();
                if (name.length() > 22) name = name.substring(0, 20) + "..";
                writer.printf(" %-23s %3d x %4.0f = %9.2f%n", 
                    name, oi.getQuantity(), oi.getItem().getPrice(), oi.getLineTotal());
            }

            writer.println("------------------------------------------------");
            writer.printf(" Subtotal:                                ₹%8.2f%n", bill.getSubtotal());
            writer.printf(" Discount Applied:                       -₹%8.2f%n", bill.getDiscountAmount());
            writer.printf(" Taxable Amount:                          ₹%8.2f%n", bill.getTaxableAmount());
            writer.printf(" CGST (2.5%%):                             ₹%8.2f%n", bill.getCgst());
            writer.printf(" SGST (2.5%%):                             ₹%8.2f%n", bill.getSgst());
            writer.println("================================================");
            writer.printf(" NET PAYABLE AMOUNT:                      ₹%8.2f%n", bill.getPayableAmount());
            writer.printf(" PAYMENT MODE: %s [PAID]%n", bill.getPaymentMode().toUpperCase());
            writer.println("================================================");
            writer.println("   THANK YOU FOR DINING WITH US! VISIT AGAIN!   ");
            writer.println("        Powered by Core Java & MySQL POS        ");
            writer.println("================================================");

            // Log event to file audit
            logAuditEvent(String.format("BILL_GENERATED | ID: %s | Table: %d | Amount: %.2f", 
                bill.getBillId(), bill.getTableNumber(), bill.getPayableAmount()));

            return file.getAbsolutePath();

        } catch (IOException e) {
            throw new HotelException("Failed to write invoice to file: " + fileName, e);
        }
    }

    /**
     * Appends audit events to logs/hotel_audit.log.
     */
    public static synchronized void logAuditEvent(String message) {
        try (PrintWriter logWriter = new PrintWriter(new BufferedWriter(new FileWriter(AUDIT_LOG_FILE, true)))) {
            String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            logWriter.printf("[%s] %s%n", time, message);
        } catch (IOException e) {
            System.err.println("Could not append to audit log: " + e.getMessage());
        }
    }

    /**
     * Exports customer records to a CSV file.
     */
    public static void exportCustomersToCsv(List<Customer> customers, String exportFilePath) throws IOException {
        try (PrintWriter writer = new PrintWriter(new BufferedWriter(new FileWriter(exportFilePath)))) {
            writer.println("ID,Name,Phone,Email,LoyaltyPoints,TotalVisits,TotalSpent");
            for (Customer c : customers) {
                writer.printf("%d,\"%s\",\"%s\",\"%s\",%d,%d,%.2f%n",
                    c.getCustomerId(), c.getName(), c.getPhone(), 
                    c.getEmail() != null ? c.getEmail() : "",
                    c.getLoyaltyPoints(), c.getTotalVisits(), c.getTotalSpent());
            }
        }
    }
}`,
  },

  // UTIL: RECEIPTPRINTER.JAVA
  {
    path: 'src/main/java/com/hotel/util/ReceiptPrinter.java',
    name: 'ReceiptPrinter.java',
    category: 'Util',
    description: 'Formats bills for thermal printers and console output.',
    code: `package com.hotel.util;

import com.hotel.model.Bill;
import com.hotel.model.OrderItem;

import java.util.List;

/**
 * Utility for formatting thermal printer receipts and console outputs.
 */
public class ReceiptPrinter {

    public static void printToConsole(Bill bill, List<OrderItem> items) {
        System.out.println("----------------------------------------------");
        System.out.println("          GRAND PALACE RECEIPT SUMMARY        ");
        System.out.println("Bill ID: " + bill.getBillId());
        System.out.println("Table: " + bill.getTableNumber());
        System.out.println("Payable: ₹" + bill.getPayableAmount());
        System.out.println("Payment: " + bill.getPaymentMode());
        System.out.println("----------------------------------------------");
    }
}`,
  },

  // UI: HOTELMANAGEMENTGUI.JAVA (DESKTOP SWING GUI)
  {
    path: 'src/main/java/com/hotel/ui/HotelManagementGUI.java',
    name: 'HotelManagementGUI.java',
    category: 'UI',
    description: 'Complete Java Swing Desktop GUI featuring tabbed navigation for POS, Tables, Billing, Customers, Menu, and Sales Reports.',
    code: `package com.hotel.ui;

import com.hotel.dao.CustomerDAO;
import com.hotel.dao.MenuItemDAO;
import com.hotel.model.*;
import com.hotel.service.OrderService;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

/**
 * Desktop-based Swing Graphical User Interface (GUI)
 * Features:
 * - Tabbed navigation (POS, Table Layout, Billing & Invoices, Customer Records, Menu Management)
 * - Real-time JTable updates
 * - Modal dialogs for order settlement and bill generation
 */
public class HotelManagementGUI extends JFrame {
    private final OrderService orderService;
    private final MenuItemDAO menuItemDAO;
    private final CustomerDAO customerDAO;

    private JTabbedPane mainTabs;
    private JTable menuTable;
    private JTable currentOrderTable;
    private DefaultTableModel orderTableModel;
    private JLabel lblSubtotal;
    private JLabel lblGrandTotal;
    private JComboBox<Integer> cmbTableSelect;

    public HotelManagementGUI() {
        this.orderService = new OrderService();
        this.menuItemDAO = new MenuItemDAO();
        this.customerDAO = new CustomerDAO();

        initializeWindow();
        buildUI();
    }

    private void initializeWindow() {
        setTitle("GrandPalace Hotel Management System | Core Java & MySQL");
        setSize(1200, 800);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
    }

    private void buildUI() {
        // Main Container
        JPanel rootPanel = new JPanel(new BorderLayout());

        // Header Banner
        JPanel headerPanel = new JPanel(new BorderLayout());
        headerPanel.setBackground(new Color(30, 41, 59));
        headerPanel.setBorder(BorderFactory.createEmptyBorder(15, 20, 15, 20));

        JLabel titleLabel = new JLabel("GrandPalace Food Hotel POS & Management System");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        titleLabel.setForeground(Color.WHITE);

        JLabel subLabel = new JLabel("Core Java 17 | JDBC MySQL Architecture | OOP & File I/O");
        subLabel.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        subLabel.setForeground(new Color(148, 163, 184));

        headerPanel.add(titleLabel, BorderLayout.WEST);
        headerPanel.add(subLabel, BorderLayout.EAST);
        rootPanel.add(headerPanel, BorderLayout.NORTH);

        // Tabbed Pane
        mainTabs = new JTabbedPane();
        mainTabs.setFont(new Font("Segoe UI", Font.BOLD, 14));

        mainTabs.addTab("  Point of Sale (POS)  ", createPOSTab());
        mainTabs.addTab("  Table Floor Layout  ", createTableLayoutTab());
        mainTabs.addTab("  Customer Directory  ", createCustomerTab());
        mainTabs.addTab("  Menu & Pricing  ", createMenuTab());
        mainTabs.addTab("  Sales & Invoices  ", createReportsTab());

        rootPanel.add(mainTabs, BorderLayout.CENTER);
        add(rootPanel);
    }

    private JPanel createPOSTab() {
        JPanel posPanel = new JPanel(new GridLayout(1, 2, 10, 10));
        posPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        // Left: Menu catalog
        JPanel leftPanel = new JPanel(new BorderLayout(5, 5));
        leftPanel.setBorder(BorderFactory.createTitledBorder("Menu Catalog"));

        String[] cols = {"ID", "Name", "Category", "Price (₹)", "Dietary"};
        DefaultTableModel menuModel = new DefaultTableModel(cols, 0);
        menuTable = new JTable(menuModel);
        leftPanel.add(new JScrollPane(menuTable), BorderLayout.CENTER);

        JButton btnAddToOrder = new JButton("Add Selected Item to Order (+)");
        btnAddToOrder.setBackground(new Color(16, 185, 129));
        btnAddToOrder.setForeground(Color.WHITE);
        leftPanel.add(btnAddToOrder, BorderLayout.SOUTH);

        // Right: Current Order Cart & Checkout
        JPanel rightPanel = new JPanel(new BorderLayout(5, 5));
        rightPanel.setBorder(BorderFactory.createTitledBorder("Active Order & Billing"));

        // Order meta panel
        JPanel orderMeta = new JPanel(new FlowLayout(FlowLayout.LEFT));
        orderMeta.add(new JLabel("Select Table:"));
        cmbTableSelect = new JComboBox<>(new Integer[]{1, 2, 3, 4, 5, 6, 7, 8});
        orderMeta.add(cmbTableSelect);
        rightPanel.add(orderMeta, BorderLayout.NORTH);

        String[] orderCols = {"Item", "Qty", "Price", "Total"};
        orderTableModel = new DefaultTableModel(orderCols, 0);
        currentOrderTable = new JTable(orderTableModel);
        rightPanel.add(new JScrollPane(currentOrderTable), BorderLayout.CENTER);

        // Checkout & Total Bar
        JPanel checkoutPanel = new JPanel(new GridLayout(3, 1, 5, 5));
        lblSubtotal = new JLabel("Subtotal: ₹0.00 | GST (5%): ₹0.00");
        lblGrandTotal = new JLabel("Net Payable: ₹0.00");
        lblGrandTotal.setFont(new Font("Segoe UI", Font.BOLD, 16));

        JButton btnGenerateBill = new JButton("Generate Bill & Print Receipt (File I/O)");
        btnGenerateBill.setBackground(new Color(59, 130, 246));
        btnGenerateBill.setForeground(Color.WHITE);

        checkoutPanel.add(lblSubtotal);
        checkoutPanel.add(lblGrandTotal);
        checkoutPanel.add(btnGenerateBill);
        rightPanel.add(checkoutPanel, BorderLayout.SOUTH);

        posPanel.add(leftPanel);
        posPanel.add(rightPanel);
        return posPanel;
    }

    private JPanel createTableLayoutTab() {
        JPanel panel = new JPanel(new GridLayout(2, 4, 15, 15));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        for (int i = 1; i <= 8; i++) {
            JButton tableBtn = new JButton("<html><center><h2>Table " + i + "</h2><p>Capacity: 4 Seats</p><b style='color:green'>AVAILABLE</b></center></html>");
            tableBtn.setBackground(new Color(241, 245, 249));
            panel.add(tableBtn);
        }
        return panel;
    }

    private JPanel createCustomerTab() {
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15));
        JLabel lbl = new JLabel("Customer Record Management (CRM) - Search by Phone / Manage Loyalty Points");
        lbl.setFont(new Font("Segoe UI", Font.BOLD, 14));
        panel.add(lbl, BorderLayout.NORTH);

        String[] cols = {"Customer ID", "Full Name", "Phone", "Email", "Loyalty Points", "Total Visits", "Total Spent (₹)"};
        DefaultTableModel model = new DefaultTableModel(cols, 0);
        model.addRow(new Object[]{1, "Vikram Malhotra", "9820112233", "vikram.m@gmail.com", 340, 14, "9,840.00"});
        model.addRow(new Object[]{2, "Pooja Agarwal", "9819445566", "pooja.a@outlook.com", 180, 8, "5,200.00"});
        model.addRow(new Object[]{3, "Rohan Deshmukh", "9876501234", "rohan.d@gmail.com", 520, 22, "16,750.00"});

        panel.add(new JScrollPane(new JTable(model)), BorderLayout.CENTER);
        return panel;
    }

    private JPanel createMenuTab() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.add(new JLabel("Menu & Catalog Management - Update pricing and recipe parameters"), BorderLayout.NORTH);
        return panel;
    }

    private JPanel createReportsTab() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.add(new JLabel("Financial Invoices & Daily Sales Audits generated by FileHandlerUtil"), BorderLayout.NORTH);
        return panel;
    }
}`,
  },

  // README.MD (GITHUB READY)
  {
    path: 'README.md',
    name: 'README.md',
    category: 'Docs',
    description: 'Comprehensive GitHub README with project overview, architecture, OOP breakdown, prerequisites, setup instructions, and database configuration.',
    code: `# 🏨 GrandPalace Food Hotel Management System
> **A complete Desktop-based Restaurant & Hotel Management Application built with Core Java, OOP Principles, JDBC, and MySQL.**

[![Java 17](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JDBC](https://img.shields.io/badge/JDBC-Type--4%20Driver-007396?style=for-the-badge&logo=java&logoColor=white)](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge)](LICENSE)

---

## 📌 Project Overview
The **Food Hotel Management System** is an enterprise-ready desktop solution engineered to streamline restaurant floor operations:
1. **Food Order Processing & POS**: Interactive menu selection, order customization, line item notes, and kitchen routing.
2. **Table Management**: Real-time visual tracking of table occupancy (\`AVAILABLE\`, \`OCCUPIED\`, \`RESERVED\`, \`BILLING\`).
3. **Automated Billing & Tax Compliance**: Real-time calculation of Subtotals, Discounts, CGST (2.5%), SGST (2.5%), and Net Payable rounding.
4. **Customer Record Management (CRM)**: Customer profiles, phone index lookups, visit counters, and automatic loyalty point calculation.
5. **Physical Invoice Generation (File I/O)**: Automatically serializes detailed ASCII bills to \`/invoices/BILL_XXX.txt\` and logs events to audit trails.
6. **Relational MySQL Database**: Robust persistence with Data Access Object (DAO) architecture, \`PreparedStatement\` defense against SQL injection, and ACID transactions.

---

## 🏗️ Technical Architecture & OOP Principles

### 1. Encapsulation
- All entity attributes (\`MenuItem\`, \`Customer\`, \`Bill\`, \`Order\`) use \`private\` access modifiers.
- Defensive mutators validate business inputs (e.g., negative prices, invalid phone formats, blank names) before assignment.

### 2. Inheritance
- Base class \`MenuItem\` is extended by specialized children:
  - \`FoodItem\` (adds spice level, chef special attributes)
  - \`BeverageItem\` (adds volume in ml, temperature flag)
  - \`SpecialComboItem\` (adds item bundling logic and package discounts)

### 3. Abstraction
- \`MenuItem\` is declared as an \`abstract\` class with abstract methods:
  - \`calculateTaxRate()\`
  - \`getDietaryTag()\`
- Subclasses are forced to provide category-specific implementations while hiding internal calculation complexities.

### 4. Polymorphism
- Dynamic method dispatch: \`Order\` computes bill amounts uniformly over \`MenuItem\` references without knowing whether an item is a \`FoodItem\`, \`BeverageItem\`, or \`SpecialComboItem\`.

### 5. Java Collections Framework
- \`java.util.List\` & \`ArrayList\`: Stores order line items dynamically as customers add or remove dishes.
- \`java.util.Map\` & \`HashMap\`: Fast $O(1)$ menu catalog caching and table status tracking.
- \`java.util.Set\` & \`HashSet\`: Maintains unique customer contact numbers and dietary tags.

### 6. Exception Handling
- Robust hierarchy of custom checked exceptions (\`HotelException\`, \`DatabaseException\`, \`InvalidOrderException\`).
- Use of \`try-with-resources\` ensures automatic closing of database connections (\`Connection\`, \`PreparedStatement\`, \`ResultSet\`) and file streams (\`PrintWriter\`, \`BufferedWriter\`).

### 7. File Handling (Java I/O)
- Character stream writers (\`FileWriter\`, \`BufferedWriter\`, \`PrintWriter\`) create printable thermal receipt files stored in the \`/invoices/\` directory.
- Audit trail logs appended to \`logs/hotel_audit.log\`.

---

## 🗄️ Database Schema (\`hotel_db\`)
\`\`\`
+-------------------+       +---------------+       +------------------+
|     CUSTOMERS     | 1   M |    ORDERS     | 1   M |   ORDER_ITEMS    |
|-------------------|-------|---------------|-------|------------------|
| PK customer_id    |       | PK order_id   |       | PK order_item_id |
|    name           |       | FK customer_id|       | FK order_id      |
|    phone (UNIQUE) |       |    table_no   |       | FK item_id       |
|    loyalty_points |       |    status     |       |    quantity      |
+-------------------+       |    subtotal   |       |    unit_price    |
                            +---------------+       +------------------+
                                   | 1
                                   | 1
                            +---------------+       +------------------+
                            |     BILLS     |       |    MENU_ITEMS    |
                            |---------------|       |------------------|
                            | PK bill_id    |       | PK item_id       |
                            | FK order_id   |       |    name          |
                            |    taxable    |       |    category      |
                            |    cgst/sgst  |       |    price         |
                            |    payable    |       |    is_veg        |
                            +---------------+       +------------------+
\`\`\`

---

## 🚀 Setup & Execution Guide

### Prerequisites
1. **Java Development Kit (JDK 17 or higher)**
2. **Apache Maven (3.8+)**
3. **MySQL Server (8.0+)**

### Step 1: Clone Repository
\`\`\`bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/hotel-food-management-system.git
cd hotel-food-management-system
\`\`\`

### Step 2: Initialize MySQL Database
1. Open MySQL CLI or MySQL Workbench.
2. Execute the included SQL script:
\`\`\`bash
mysql -u root -p < database/schema.sql
\`\`\`
*(Update DB password in \`src/main/java/com/hotel/dao/DBConnection.java\` if different from \`root\`)*

### Step 3: Build with Maven
\`\`\`bash
mvn clean compile
\`\`\`

### Step 4: Run the Application
\`\`\`bash
mvn exec:java -Dexec.mainClass="com.hotel.Main"
\`\`\`
Or package into an executable JAR:
\`\`\`bash
mvn package
java -jar target/hotel-food-management-system-1.0.0.jar
\`\`\`

---

## 👨‍💻 Author & Contributions
- **Developer:** Abhinav Jain
- **Email:** abhinavjain45678@gmail.com
- **Core Competencies:** Core Java, Object-Oriented Design, MySQL, JDBC, Swing POS Architecture.
`,
  },
];
