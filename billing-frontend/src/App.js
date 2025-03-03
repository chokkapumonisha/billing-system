import React, { useState } from "react";
import jsPDF from "jspdf";
import "./App.css";

function App() {
  const [customers, setCustomers] = useState([]); // Store customers
  const [purchases, setPurchases] = useState([]); // Store purchases
  const [invoices, setInvoices] = useState([]); // Store invoices
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" }); // For new customer
  const [selectedCustomerId, setSelectedCustomerId] = useState(""); // For selected customer
  const [newPurchase, setNewPurchase] = useState({ items: [], total: 0 }); // For new purchase
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality
  const [viewMode, setViewMode] = useState("billing"); // Billing, Invoices, or Customer History
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false); // For Add Customer Modal

  // Generate unique IDs
  const generateId = () => Date.now().toString();

  // Add a new customer
  const addCustomer = () => {
    if (newCustomer.name.trim() && newCustomer.email.trim() && newCustomer.phone.trim()) {
      const customer = {
        id: generateId(),
        ...newCustomer,
      };
      setCustomers([...customers, customer]);
      setNewCustomer({ name: "", email: "", phone: "" });
      setShowAddCustomerModal(false); // Close modal after adding
    }
  };

  // Add a new purchase
  const addPurchase = () => {
    if (selectedCustomerId && newPurchase.items.length > 0) {
      const purchase = {
        id: generateId(),
        customerId: selectedCustomerId,
        items: newPurchase.items,
        total: newPurchase.total,
        timestamp: new Date(), // Store as Date object
      };
      setPurchases([...purchases, purchase]);

      // Generate invoice automatically
      const invoice = {
        id: generateId(),
        purchaseId: purchase.id,
        customerId: selectedCustomerId,
        total: purchase.total,
        status: "Pending",
        timestamp: new Date(), // Store as Date object
      };
      setInvoices([...invoices, invoice]);

      setNewPurchase({ items: [], total: 0 });
    }
  };

  // Add an item to the purchase
  const addItemToPurchase = () => {
    const itemName = prompt("Enter item name:");
    const quantity = parseFloat(prompt("Enter quantity:"));
    const price = parseFloat(prompt("Enter price per unit:"));
    if (itemName && quantity && price) {
      const itemTotal = quantity * price;
      setNewPurchase((prev) => ({
        items: [...prev.items, { itemName, quantity, price, itemTotal }],
        total: prev.total + itemTotal,
      }));
    }
  };

  // Mark invoice as paid
  const markAsPaid = (invoiceId) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === invoiceId ? { ...invoice, status: "Paid" } : invoice
      )
    );
  };

  // Generate PDF for an invoice
  const generateInvoicePDF = (invoice) => {
    const customer = customers.find((c) => c.id === invoice.customerId);
    const purchase = purchases.find((p) => p.id === invoice.purchaseId);

    const doc = new jsPDF();
    doc.text("Invoice Details", 20, 10);
    doc.text(`Invoice ID: ${invoice.id}`, 20, 20);
    doc.text(`Purchase ID: ${invoice.purchaseId}`, 20, 30);
    doc.text(`Customer Name: ${customer.name}`, 20, 40);
    doc.text(`Email: ${customer.email}`, 20, 50);
    doc.text(`Phone: ${customer.phone}`, 20, 60);

    let yPos = 80;
    doc.text("Items Purchased:", 20, yPos);
    yPos += 10;
    purchase.items.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.itemName} - ${item.quantity} x $${item.price} = $${item.itemTotal}`,
        20,
        yPos
      );
      yPos += 10;
    });

    doc.text(`Total Amount: $${invoice.total}`, 20, yPos + 10);
    doc.text(`Status: ${invoice.status}`, 20, yPos + 20);

    doc.save(`invoice_${invoice.id}.pdf`);
  };

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter((invoice) => {
    const customer = customers.find((c) => c.id === invoice.customerId);
    return (
      customer &&
      (customer.name.includes(searchTerm) ||
        customer.email.includes(searchTerm) ||
        invoice.purchaseId.includes(searchTerm))
    );
  });

  // Get total purchases today
  const getTotalPurchasesToday = () => {
    const today = new Date().toLocaleDateString();
    return purchases.filter((p) => new Date(p.timestamp).toLocaleDateString() === today)
      .length;
  };

  // Get total purchases by a customer
  const getTotalPurchasesByCustomer = (customerId) => {
    return purchases.filter((p) => p.customerId === customerId).length;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">Billing System Dashboard</header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button
          className={`nav-button ${viewMode === "billing" ? "active" : ""}`}
          onClick={() => setViewMode("billing")}
        >
          Billing
        </button>
        <button
          className={`nav-button ${viewMode === "invoices" ? "active" : ""}`}
          onClick={() => setViewMode("invoices")}
        >
          Invoices
        </button>
        <button
          className={`nav-button ${viewMode === "history" ? "active" : ""}`}
          onClick={() => setViewMode("history")}
        >
          Customer History
        </button>
      </nav>

      {/* Content Based on View Mode */}
      <div className="content">
        {viewMode === "billing" ? (
          /* Billing Section */
          <>
            <h3>Billing</h3>

            {/* Customer Selection */}
            <div className="customer-section">
              <h4>Customer Details</h4>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="customer-list-item"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>

              {/* Add New Customer Button */}
              <button
                onClick={() => setShowAddCustomerModal(true)}
                className="action-button"
              >
                Add New Customer
              </button>
            </div>

            {/* Purchase Form */}
            <div className="purchase-form">
              <h4>Add Purchase</h4>
              <button onClick={addItemToPurchase} className="action-button">
                Add Item
              </button>
              <div className="items-list">
                {newPurchase.items.map((item, index) => (
                  <div key={index} className="item">
                    <span>
                      {item.itemName} - {item.quantity} x ${item.price} = $
                      {item.itemTotal}
                    </span>
                  </div>
                ))}
              </div>
              <p>Total: ${newPurchase.total}</p>
              <button onClick={addPurchase} className="action-button">
                Confirm Purchase
              </button>
            </div>
          </>
        ) : viewMode === "invoices" ? (
          /* Invoices Section */
          <>
            <h3>Invoices</h3>

            {/* Invoice Search */}
            <div className="search-bar">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Customer Name, Email, or Purchase ID"
                className="search-input"
              />
            </div>

            {/* Display Invoices */}
            <div className="invoice-list">
              {filteredInvoices.map((invoice) => {
                const customer = customers.find((c) => c.id === invoice.customerId);
                return (
                  <div key={invoice.id} className="invoice-item">
                    <span>
                      Invoice ID: {invoice.id} - Customer: {customer?.name} - Total: $
                      {invoice.total} - Status: {invoice.status}
                    </span>
                    <button
                      onClick={() => generateInvoicePDF(invoice)}
                      className="download-button"
                    >
                      Download PDF
                    </button>
                    {invoice.status === "Pending" && (
                      <button
                        onClick={() => markAsPaid(invoice.id)}
                        className="mark-paid-button"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Customer History Section */
          <>
            <h3>Customer Purchase History</h3>

            {/* Customer Selection */}
            <div className="customer-section">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="customer-list-item"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Display Customer Purchases */}
            {selectedCustomerId && (
              <div className="purchase-history">
                <h4>Purchases by {customers.find((c) => c.id === selectedCustomerId)?.name}</h4>
                {purchases
                  .filter((p) => p.customerId === selectedCustomerId)
                  .map((purchase) => (
                    <div key={purchase.id} className="purchase-item">
                      <span>
                        Purchase ID: {purchase.id} - Total: ${purchase.total} - Date:{" "}
                        {purchase.timestamp.toLocaleString()} {/* Format the Date object */}
                      </span>
                      <div className="items-list">
                        {purchase.items.map((item, index) => (
                          <div key={index} className="item">
                            <span>
                              {item.itemName} - {item.quantity} x ${item.price} = $
                              {item.itemTotal}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {/* Dashboard Metrics */}
        <div className="metrics">
          <h3>Metrics</h3>
          <p>Total Purchases Today: {getTotalPurchasesToday()}</p>
          {selectedCustomerId && (
            <p>
              Total Purchases by Customer:{" "}
              {getTotalPurchasesByCustomer(selectedCustomerId)}
            </p>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Customer</h3>
            <input
              type="text"
              value={newCustomer.name}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, name: e.target.value })
              }
              placeholder="Name"
              className="invoice-input"
            />
            <input
              type="email"
              value={newCustomer.email}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, email: e.target.value })
              }
              placeholder="Email"
              className="invoice-input"
            />
            <input
              type="tel"
              value={newCustomer.phone}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, phone: e.target.value })
              }
              placeholder="Phone"
              className="invoice-input"
            />
            <button onClick={addCustomer} className="action-button">
              Add Customer
            </button>
            <button
              onClick={() => setShowAddCustomerModal(false)}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;