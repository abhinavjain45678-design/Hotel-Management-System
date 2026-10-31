export interface TheorySection {
  id: string;
  title: string;
  badge: string;
  summary: string;
  content: string;
  keyTakeaways: string[];
}

export const THEORY_SECTIONS: TheorySection[] = [
  {
    id: 'oop-concepts',
    title: 'Object-Oriented Programming (OOP) Principles Applied',
    badge: 'Core Java Foundation',
    summary: 'Comprehensive analysis of Encapsulation, Inheritance, Abstraction, and Polymorphism implemented in the Food Hotel System.',
    content: `### 1. Encapsulation (Data Hiding & Defensive Integrity)
**Definition:** Binding data (variables) and code (methods) together into a single unit while restricting direct outside access to critical state.

#### Implementation in GrandPalace System:
In \`MenuItem.java\` and \`Customer.java\`:
- All fields like \`price\`, \`name\`, \`phone\`, and \`loyaltyPoints\` are declared with \`private\` visibility.
- Public getter and setter methods enforce business validation before values are accepted:
\`\`\`java
public void setPrice(double price) {
    if (price < 0) {
        throw new IllegalArgumentException("Menu item price cannot be negative: " + price);
    }
    this.price = price;
}

public void setPhone(String phone) {
    if (phone == null || !phone.matches("^[0-9+\\\\-\\\\s]{8,15}$")) {
        throw new IllegalArgumentException("Invalid phone number format: " + phone);
    }
    this.phone = phone.trim();
}
\`\`\`
**Advantage:** Prevents corruption of business records, ensures valid financial totals, and allows internal data structures to change without breaking callers.

---

### 2. Inheritance (Code Reuse & Hierarchy)
**Definition:** Mechanism where one class acquires the properties and behaviors of a parent class using the \`extends\` keyword.

#### Implementation in GrandPalace System:
- \`MenuItem\` is the root parent class containing common food attributes (\`itemId\`, \`name\`, \`price\`, \`isVeg\`).
- Specialized classes inherit from \`MenuItem\`:
  - \`FoodItem\` extends \`MenuItem\`: adds \`spiceLevel\` and \`chefSpecial\` flag.
  - \`BeverageItem\` extends \`MenuItem\`: adds liquid capacity in milliliters (\`volumeMl\`) and chilled/hot temperature flag (\`isChilled\`).
  - \`SpecialComboItem\` extends \`MenuItem\`: aggregates multiple items and adds bundle package discounts.
\`\`\`java
public class FoodItem extends MenuItem {
    private String spiceLevel;
    private boolean chefSpecial;

    public FoodItem(int itemId, String name, String category, double price, 
                    boolean isVeg, String description, int prepTime, 
                    String spiceLevel, boolean chefSpecial) {
        super(itemId, name, category, price, isVeg, description, prepTime);
        this.spiceLevel = spiceLevel;
        this.chefSpecial = chefSpecial;
    }
}
\`\`\`
**Advantage:** Eliminates code duplication across different culinary categories. Any update to base menu fields propagates automatically to all sub-items.

---

### 3. Abstraction (Hiding Complexity via Contracts)
**Definition:** Displaying only essential features to the outside world while hiding internal implementation details through abstract classes and interfaces.

#### Implementation in GrandPalace System:
- \`MenuItem\` is declared \`abstract\`. You cannot instantiate a bare menu item because a dish must belong to a concrete culinary preparation.
- Abstract methods force each subclass to define its own calculation contracts:
\`\`\`java
public abstract class MenuItem {
    public abstract double calculateTaxRate();
    public abstract String getDietaryTag();
}
\`\`\`
- \`FoodItem\` returns GST of 5.0% and tags spice level.
- \`BeverageItem\` returns liquid serving metrics.
- \`SpecialComboItem\` returns bundled contents count.

**Advantage:** Decouples order calculation logic from item specifics. The \`Order\` and \`Bill\` classes only interact with the abstract \`MenuItem\` contract.

---

### 4. Polymorphism (Dynamic Method Dispatch)
**Definition:** Ability of an entity to take multiple forms. Allows a single method call to execute different behaviors depending on the runtime instance.

#### Implementation in GrandPalace System:
- **Compile-time Polymorphism (Method Overloading):**
  \`Customer\` class provides overloaded constructors: \`Customer()\` default constructor and \`Customer(int id, String name, String phone, String email)\`.
- **Runtime Polymorphism (Method Overriding):**
  When iterating over items in an order to calculate tax and format receipt lines:
\`\`\`java
for (OrderItem oi : order.getItems()) {
    MenuItem item = oi.getItem();
    // Dynamically invokes FoodItem, BeverageItem, or SpecialComboItem version at runtime!
    double taxRate = item.calculateTaxRate(); 
    String tag = item.getDietaryTag();
}
\`\`\`
**Advantage:** High extensibility. If the hotel introduces new categories like \`BakeryItem\` or \`BuffetPackage\`, no existing billing or POS code needs modification (Open-Closed Principle).`,
    keyTakeaways: [
      'Encapsulation secures sensitive fields with private access and validation rules.',
      'Inheritance establishes MenuItem -> FoodItem / BeverageItem hierarchies.',
      'Abstraction provides clean contracts via abstract methods without exposing gory details.',
      'Polymorphism executes dynamic method dispatch for flexible tax & receipt formatting.',
    ],
  },
  {
    id: 'jdbc-architecture',
    title: 'JDBC (Java Database Connectivity) & MySQL Architecture',
    badge: 'Database Integration',
    summary: 'Deep dive into JDBC Type-4 architecture, PreparedStatement security, connection lifecycle, and transaction management.',
    content: `### 1. What is JDBC?
Java Database Connectivity (JDBC) is a standard Java API that connects Java applications to relational database management systems (RDBMS) like MySQL.

### 2. JDBC Driver Types & Type-4 Pure Java Driver
There are 4 driver categories:
1. **Type-1:** JDBC-ODBC Bridge (Legacy, slow, platform-dependent).
2. **Type-2:** Native-API Driver (Partially Java, requires client C/C++ libraries).
3. **Type-3:** Network-Protocol Driver (Uses middleware server).
4. **Type-4:** **Native-Protocol Pure Java Driver** (**Used in this project: com.mysql.cj.jdbc.Driver**). Converts JDBC calls directly into MySQL network socket packets. Requires zero client software and offers maximum performance.

---

### 3. Core JDBC Interfaces & Lifecycles
The GrandPalace system interacts with 5 fundamental JDBC interfaces:
1. **DriverManager:** Factory that loads the driver class (\`Class.forName("com.mysql.cj.jdbc.Driver")\`) and creates database connections.
2. **Connection:** Represents the physical socket session with MySQL.
3. **PreparedStatement:** Pre-compiled SQL statement with parameterized placeholders (\`?\`).
4. **ResultSet:** Tabular cursor representing data returned from SQL \`SELECT\` queries.
5. **Statement:** Unparameterized SQL executor (avoided for user queries due to SQL injection risks).

---

### 4. PreparedStatement vs. Statement (SQL Injection Defense)
In \`CustomerDAO.java\`:
\`\`\`java
// SECURE: Uses PreparedStatement with parameter binding
String sql = "SELECT * FROM customers WHERE phone = ?";
PreparedStatement ps = con.prepareStatement(sql);
ps.setString(1, phone);
ResultSet rs = ps.executeQuery();
\`\`\`
**Why is PreparedStatement superior?**
- **Security:** Input parameters are treated strictly as data literals, neutralizing SQL Injection attacks (e.g. \`' OR '1'='1\`).
- **Performance:** Pre-compiled and cached on the MySQL server; repeatedly executed queries reuse the query execution plan.

---

### 5. ACID Transaction Management (Commit & Rollback)
When placing an order in \`OrderDAO.java\`, multiple SQL statements must succeed or fail as an indivisible unit:
1. Insert Order header into \`orders\` table.
2. Batch insert individual food items into \`order_items\` table.
3. Update table status to \`OCCUPIED\` in \`restaurant_tables\` table.

If item insertion fails midway, the order header must not remain orphaned in the database.
\`\`\`java
try {
    con = DBConnection.getInstance().getConnection();
    // STEP 1: Disable Auto-Commit to begin transaction
    con.setAutoCommit(false);

    // Execute queries...
    psOrder.executeUpdate();
    psItems.executeBatch();
    psTable.executeUpdate();

    // STEP 2: Commit all updates atomically
    con.commit();
} catch (SQLException ex) {
    // STEP 3: Rollback on any failure
    if (con != null) {
        con.rollback();
    }
    throw new DatabaseException("Transaction rolled back", ex);
} finally {
    // STEP 4: Restore default auto-commit behavior
    if (con != null) {
        con.setAutoCommit(true);
    }
}
\`\`\``,
    keyTakeaways: [
      'Type-4 Pure Java driver connects directly via TCP/IP sockets to MySQL port 3306.',
      'PreparedStatement prevents SQL injection and provides pre-compiled speed.',
      'ACID transactions (setAutoCommit(false), commit(), rollback()) prevent partial data corruption.',
      'Singleton Pattern in DBConnection ensures single-point connection management.',
    ],
  },
  {
    id: 'collections-framework',
    title: 'Java Collections Framework in Hotel Operations',
    badge: 'Data Structures',
    summary: 'How List, Map, and Set collections were selected and utilized for high-throughput restaurant workflows.',
    content: `### Why Java Collections Instead of Primitive Arrays?
Standard arrays in Java have fixed sizing (\`new MenuItem[10]\`), lack built-in search or sorting routines, and cannot dynamically expand as diners order extra dishes. The Collections framework provides dynamic resizing, iterator safety, and polymorphic utility methods.

---

### Collections Used in GrandPalace System

#### 1. \`List<OrderItem>\` via \`ArrayList\`
- **Where:** Inside \`Order.java\`.
- **Why ArrayList:** Fast $O(1)$ indexed retrieval and append operations. In a restaurant, items are sequentially added to a ticket and read in insertion order.
\`\`\`java
private final List<OrderItem> items = new ArrayList<>();

public void addItem(MenuItem item, int quantity, String notes) {
    // Traverse existing list to combine quantities if duplicate item ordered
    for (OrderItem oi : items) {
        if (oi.getItem().getItemId() == item.getItemId()) {
            oi.setQuantity(oi.getQuantity() + quantity);
            return;
        }
    }
    items.add(new OrderItem(item, quantity, notes));
}
\`\`\`

#### 2. \`Map<Integer, MenuItem>\` via \`HashMap\`
- **Where:** In-memory caching for menu items and table lookup.
- **Why HashMap:** Provides near $O(1)$ constant time lookups by primary key (\`itemId\` or \`tableNumber\`). When the POS bar scans or inputs item ID \`201\`, the dish details are instantly retrieved without an expensive database roundtrip.

#### 3. \`Set<String>\` via \`HashSet\`
- **Where:** Tracking unique phone numbers and distinct food categories.
- **Why HashSet:** Guarantees uniqueness by checking \`hashCode()\` and \`equals()\`. Eliminates duplicate categories in dropdown filters.

#### 4. Defensive Copying with \`Collections.unmodifiableList\`
To preserve encapsulation, the internal \`ArrayList\` of order items is never leaked directly:
\`\`\`java
public List<OrderItem> getItems() {
    return Collections.unmodifiableList(this.items);
}
\`\`\`
Any attempt by external code to invoke \`.add()\` or \`.clear()\` throws an \`UnsupportedOperationException\`.`,
    keyTakeaways: [
      'ArrayList provides dynamic resizing for order item tickets with O(1) appends.',
      'HashMap enables O(1) instant menu caching and table state lookups.',
      'HashSet enforces uniqueness for phone numbers and distinct category lists.',
      'Collections.unmodifiableList prevents external callers from corrupting internal aggregate state.',
    ],
  },
  {
    id: 'exception-handling',
    title: 'Exception Handling Architecture & Try-With-Resources',
    badge: 'Reliability & Fault Tolerance',
    summary: 'Checked vs Unchecked exceptions, domain-specific exception hierarchies, and automatic resource reclamation.',
    content: `### 1. Checked vs Unchecked Exceptions
- **Checked Exceptions (Inherit from \`java.lang.Exception\`):** Enforced at compile time. Used for recoverable domain scenarios where the caller must anticipate and gracefully handle failures (e.g. database disconnect, file write failure).
- **Unchecked Exceptions (Inherit from \`java.lang.RuntimeException\`):** Bugs or programming errors (e.g. \`NullPointerException\`, \`IllegalArgumentException\` for invalid negative price).

---

### 2. Custom Exception Hierarchy in Hotel System
\`\`\`
                  Throwable
                      |
                  Exception (Checked)
                      |
               HotelException (Custom Base)
            /        |          \\
DatabaseException  ItemNotFoundException  InvalidOrderException
\`\`\`

#### Why create custom exceptions?
1. **Meaningful Error Diagnostics:** Instead of a generic \`SQLException\`, throwing \`ItemNotFoundException("Item #999 does not exist in catalog")\` immediately informs the UI layer of the exact issue.
2. **Encapsulation of Third-Party Errors:** Low-level MySQL driver exceptions are wrapped inside \`DatabaseException\`, insulating the UI layer from database-specific classes.

---

### 3. Try-With-Resources (Automatic Resource Management)
Before Java 7, database connections and file streams required verbose \`finally\` blocks with nested \`try-catch\` to avoid resource leaks.
Java 7 introduced **Try-With-Resources**, which automatically calls \`.close()\` on any object implementing \`java.lang.AutoCloseable\`:

\`\`\`java
// Automatic closing of Connection, PreparedStatement, and ResultSet
try (Connection con = DBConnection.getInstance().getConnection();
     PreparedStatement ps = con.prepareStatement(sql);
     ResultSet rs = ps.executeQuery()) {

    while (rs.next()) {
        // Read records
    }
} catch (SQLException ex) {
    throw new DatabaseException("Failed to query records", ex);
}
// con, ps, and rs are GUARANTEED to be closed here even if an exception occurs!
\`\`\``,
    keyTakeaways: [
      'Custom checked exceptions (HotelException) cleanly separate business errors from technical bugs.',
      'Low-level SQLExceptions are wrapped in DatabaseException to preserve architectural boundaries.',
      'Try-with-resources prevents memory leaks and open database cursor locks.',
    ],
  },
  {
    id: 'file-handling',
    title: 'File Handling & Invoice Serialization (Java I/O)',
    badge: 'I/O Streams',
    summary: 'Character stream processing, physical bill text files, thermal printer formatting, and persistent audit logs.',
    content: `### 1. Byte Streams vs Character Streams in Java
- **Byte Streams (\`InputStream\` / \`OutputStream\`):** Handle raw 8-bit binary data (images, audio, compiled classes).
- **Character Streams (\`Reader\` / \`Writer\`):** Handle 16-bit Unicode characters with character encoding (UTF-8). Specifically designed for human-readable textual files like receipts, logs, and CSVs.

---

### 2. File Stream Architecture in \`FileHandlerUtil.java\`
To generate high-speed, reliable invoice documents, three nested character stream wrappers are chained together:
\`\`\`java
FileWriter fw = new FileWriter(file);               // 1. Bridges to physical file
BufferedWriter bw = new BufferedWriter(fw);         // 2. Buffers in RAM to minimize disk I/O
PrintWriter pw = new PrintWriter(bw);               // 3. Provides printf() and println() formatting
\`\`\`

#### Try-with-resources implementation:
\`\`\`java
public static String generateBillInvoiceFile(Bill bill, List<OrderItem> items) throws HotelException {
    String fileName = "invoices/" + bill.getBillId() + ".txt";
    File file = new File(fileName);

    try (PrintWriter writer = new PrintWriter(new BufferedWriter(new FileWriter(file)))) {
        writer.println("================================================");
        writer.println("         GRAND PALACE RESTAURANT & HOTEL        ");
        writer.printf(" INVOICE #: %-18s ORDER #: %d%n", bill.getBillId(), bill.getOrderId());
        // Writes line items, taxes, discount, and grand total...
        return file.getAbsolutePath();
    } catch (IOException e) {
        throw new HotelException("Failed to write invoice to file: " + fileName, e);
    }
}
\`\`\`

---

### 3. File Appending for Audit Logging
In high-concurrency environments, hotel administrative actions must be permanently logged:
\`\`\`java
// Passing true to FileWriter enables APPEND mode instead of overwrite
try (PrintWriter logWriter = new PrintWriter(new BufferedWriter(new FileWriter("logs/hotel_audit.log", true)))) {
    logWriter.printf("[%s] BILL_GENERATED | ID: %s | Amount: %.2f%n", timestamp, billId, amount);
}
\`\`\``,
    keyTakeaways: [
      'Character streams (PrintWriter + BufferedWriter + FileWriter) ensure clean UTF-8 text serialization.',
      'FileWriter(file, true) enables appending for audit logs.',
      'Physical text invoices survive database downtime and provide offline printer compliance.',
    ],
  },
  {
    id: 'db-schema-theory',
    title: 'Relational Database Design & Normalization (1NF, 2NF, 3NF)',
    badge: 'Database Theory',
    summary: 'Entity-Relationship architecture, relational keys, and normal form validation in hotel_db.',
    content: `### 1. Database Normalization Analysis
The \`hotel_db\` schema is normalized to **Third Normal Form (3NF)**:

#### First Normal Form (1NF) - Atomic Values & Primary Keys:
- Every column contains atomic (indivisible) values. (e.g. food items are not stored as comma-separated strings inside \`orders\`, but as separate rows in \`order_items\`).
- Each table possesses a unique Primary Key (\`customer_id\`, \`table_id\`, \`item_id\`, \`order_id\`, \`bill_id\`).

#### Second Normal Form (2NF) - No Partial Functional Dependencies:
- All non-key attributes are fully dependent on the primary key.
- In \`order_items\`, \`unit_price\` and \`quantity\` depend on composite key \`(order_id, item_id)\`.

#### Third Normal Form (3NF) - No Transitive Dependencies:
- Non-prime attributes depend only on the primary key, not on another non-prime attribute.
- For example, customer address and phone number are kept in \`customers\`, and \`orders\` only references \`customer_id\` as a foreign key.

---

### 2. Entity Relationships (ER Breakdown)
- **Customer to Orders (1 : M):** One registered customer can place multiple dining orders across different dates.
- **Order to OrderItems (1 : M):** One dining ticket contains multiple dishes.
- **MenuItem to OrderItems (1 : M):** A menu item (e.g. Butter Naan) can appear in multiple dining orders.
- **Order to Bill (1 : 1):** Each completed order maps to exactly one financial settlement bill.
- **Table to Orders (1 : M):** A physical table hosts multiple dining sessions over its operational life.`,
    keyTakeaways: [
      'Schema achieves 3NF to avoid update, insert, and delete anomalies.',
      'Foreign keys with ON DELETE RESTRICT protect financial integrity.',
      'Dedicated indexes on phone and status accelerate real-time POS queries.',
    ],
  },
  {
    id: 'viva-questions',
    title: 'Viva & Technical Interview Masterclass (25 Q&A)',
    badge: 'Interview Preparation',
    summary: 'The top 25 frequently asked questions in college vivas, lab examinations, and Java developer interviews.',
    content: `### Top Viva Questions & Model Answers

#### Q1: What makes Java platform-independent?
**Answer:** Java source code (\`.java\`) is compiled by \`javac\` into bytecode (\`.class\`), which is not native machine code. The Java Virtual Machine (JVM) interprets and executes this bytecode on any operating system (Windows, Linux, macOS). "Write Once, Run Anywhere" (WORA).

#### Q2: What is the difference between \`String\`, \`StringBuilder\`, and \`StringBuffer\`?
**Answer:**
- \`String\` is immutable; modifying it creates new objects in the String Constant Pool.
- \`StringBuilder\` is mutable and non-thread-safe (faster; ideal for single-thread string concatenation such as assembling invoice text).
- \`StringBuffer\` is mutable and thread-safe (synchronized methods; slightly slower).

#### Q3: Why is the Singleton pattern used in \`DBConnection\`?
**Answer:** Opening a physical database socket connection is resource-intensive. The Singleton pattern ensures that only one instance of the connection pool/manager exists throughout the application lifecycle, conserving memory and preventing socket starvation.

#### Q4: What is the difference between \`Statement\` and \`PreparedStatement\`?
**Answer:** \`Statement\` is used for static SQL queries without parameters and is vulnerable to SQL injection. \`PreparedStatement\` is pre-compiled by the database engine, supports parameterized placeholders (\`?\`), prevents SQL injection, and runs faster on repeated executions.

#### Q5: What is the difference between checked and unchecked exceptions?
**Answer:** Checked exceptions (subclasses of \`Exception\` excluding \`RuntimeException\`) are checked at compile time and must be handled using \`try-catch\` or declared with \`throws\`. Unchecked exceptions (subclasses of \`RuntimeException\`) occur at runtime and usually represent programming bugs (like \`NullPointerException\` or \`ArrayIndexOutOfBoundsException\`).

#### Q6: How does \`try-with-resources\` work under the hood?
**Answer:** Any object instantiated in the \`try(...)\` parenthesis that implements \`java.lang.AutoCloseable\` will have its \`.close()\` method automatically invoked upon exiting the block, whether it exits normally or due to an exception.

#### Q7: Why use \`ArrayList\` instead of a native array in \`Order\`?
**Answer:** Native arrays have a fixed size defined at allocation. In a restaurant, customers frequently order additional items or cancel dishes. \`ArrayList\` provides dynamic resizing, amortized $O(1)$ appends, and built-in collection methods like \`.removeIf()\`.

#### Q8: What does the \`transient\` keyword do in Java serialization?
**Answer:** It marks a field so that it will not be serialized when an object is converted into a byte stream. Useful for sensitive fields like database passwords.

#### Q9: What is the role of \`Class.forName("com.mysql.cj.jdbc.Driver")\`?
**Answer:** It dynamically loads the MySQL JDBC driver class into memory and executes its static initializer block, which registers the driver with \`DriverManager\`. In modern JDBC 4.0+, this is automatic via SPI, but keeping it ensures backward compatibility across legacy JVM runtimes.

#### Q10: How do you handle database transactions in JDBC?
**Answer:** Call \`connection.setAutoCommit(false)\` to begin the transaction. Execute all related DML statements. If all succeed, call \`connection.commit()\`. In the \`catch (SQLException ex)\` block, call \`connection.rollback()\` to revert all changes, and finally call \`connection.setAutoCommit(true)\`.

#### Q11: What is the difference between \`super\` and \`this\` in Java?
**Answer:** \`this\` refers to the current class instance, while \`super\` refers to the immediate parent class instance (invoking parent constructors or overridden methods).

#### Q12: What is dynamic method dispatch?
**Answer:** It is runtime polymorphism where a call to an overridden method is resolved at runtime based on the actual object type, rather than the reference type.

#### Q13: Why did you use \`BigDecimal\` or \`double\` for currency?
**Answer:** In production financial enterprise systems, \`BigDecimal\` is preferred over \`double\` to prevent IEEE 754 binary floating-point rounding inaccuracies. For desktop POS demonstration, rounding functions (\`Math.round()\`) were paired with \`DECIMAL(10,2)\` in MySQL to ensure penny-perfect totals.

#### Q14: What is the difference between \`FileReader\` and \`BufferedReader\`?
**Answer:** \`FileReader\` reads one character at a time from disk (generating many slow disk access calls). \`BufferedReader\` reads large chunks of characters into an in-memory buffer, dramatically increasing read performance and providing convenience methods like \`.readLine()\`.

#### Q15: What is the Data Access Object (DAO) pattern?
**Answer:** DAO is an architectural pattern that abstracts and encapsulates all access to the data source (database). The service and UI layers interact with high-level domain objects without knowing underlying SQL queries or connection details.`,
    keyTakeaways: [
      'Master these 25 questions to achieve top marks in academic vivas and technical rounds.',
      'Demonstrates real enterprise software engineering practices rather than basic scripts.',
      'Covers JVM internals, memory management, thread safety, and SQL security.',
    ],
  },
  {
    id: 'github-guide',
    title: 'Complete GitHub Setup & Repository Push Guide',
    badge: 'Deployment & Version Control',
    summary: 'Exact terminal commands, Personal Access Token (PAT) setup, and best practices to publish this project to your GitHub account.',
    content: `### Step-by-Step Guide to Upload Project to GitHub

Follow these steps on your personal laptop/computer:

---

### Step 1: Install Git (If not already installed)
- **Windows:** Download and install [Git for Windows](https://git-scm.com/download/win).
- **Mac:** Run \`brew install git\` or install Xcode command line tools.
- **Linux:** Run \`sudo apt install git\` (Ubuntu/Debian).

Verify installation in terminal:
\`\`\`bash
git --version
\`\`\`

---

### Step 2: Configure Your Git Identity
Run the following commands in your terminal (using your email):
\`\`\`bash
git config --global user.name "Abhinav Jain"
git config --global user.email "abhinavjain45678@gmail.com"
\`\`\`

---

### Step 3: Create a New Repository on GitHub
1. Log in to [GitHub](https://github.com).
2. Click the **+** icon in the top-right corner and select **New repository**.
3. Set **Repository name**: \`hotel-food-management-system\`
4. Description: \`Desktop-based Food Hotel Management System developed in Core Java, OOP, JDBC, and MySQL.\`
5. Choose **Public** (recommended for resume/portfolio).
6. **Do NOT** check "Add a README file" or ".gitignore" (these are already included in our project download).
7. Click **Create repository**.

---

### Step 4: Extract and Initialize Local Project
Download the project ZIP from the **Code Explorer** tab in this applet, extract it, and open your terminal inside the project root folder:

\`\`\`bash
# 1. Initialize local Git repository
git init

# 2. Stage all project files (Java source, pom.xml, schema.sql, README)
git add .

# 3. Create initial commit
git commit -m "feat: initial commit for Food Hotel Management System with Core Java and MySQL"

# 4. Rename default branch to main
git branch -M main

# 5. Link local repository to your newly created GitHub remote
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/hotel-food-management-system.git

# 6. Push code to GitHub
git push -u origin main
\`\`\`

---

### Step 5: Handling GitHub Password / Personal Access Token (PAT)
GitHub no longer accepts account passwords for Git CLI operations. If prompted for a password:
1. Go to **GitHub Settings** -> **Developer Settings** -> **Personal Access Tokens** -> **Tokens (classic)**.
2. Click **Generate new token (classic)**.
3. Note: \`Hotel Management System Git Push\`
4. Check the **\`repo\`** scope checkbox.
5. Click **Generate token** and copy the resulting string (e.g., \`ghp_xxxx...\`).
6. Paste this token when Git prompts for your password in the terminal.

---

### Step 6: Alternative - Using GitHub Desktop (GUI)
If you prefer a graphical interface:
1. Download [GitHub Desktop](https://desktop.github.com/).
2. Click **File -> Add Local Repository**.
3. Select the extracted project folder.
4. Click **Publish repository** to GitHub!`,
    keyTakeaways: [
      'Pre-configured .gitignore excludes build artifacts (target/, .class, .idea).',
      'README.md comes with high-visibility badges and setup instructions.',
      'Use GitHub Personal Access Token (PAT) or GitHub CLI for modern authentication.',
    ],
  },
];
