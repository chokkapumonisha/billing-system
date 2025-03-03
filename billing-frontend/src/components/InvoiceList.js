import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

function InvoiceList() {
    const [invoices, setInvoices] = useState([]);

    // Fetch invoices from the backend
    useEffect(() => {
        fetch("http://localhost:5000/invoices")
            .then((response) => response.json())
            .then((data) => setInvoices(data))
            .catch((error) => console.error("Error fetching invoices:", error));
    }, []);

    // Generate PDF function
    const generatePDF = async () => {
        const response = await fetch("http://localhost:5000/get_invoices");
        const invoices = await response.json();
    
        const doc = new jsPDF();
        doc.text("Invoice Report", 20, 10);
    
        // Ensure autoTable is used correctly
        autoTable(doc, {
            head: [["#", "Invoice Name", "Amount"]],
            body: invoices.map((inv, index) => [index + 1, inv[1], `$${inv[2]}`]),
        });
    
        doc.save("invoices.pdf");
    };    

    // Send invoice email function
    const sendInvoiceEmail = async (email) => {
        const response = await fetch("http://localhost:5000/send_invoice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();
        alert(result.message || result.error);
    };

    return (
        <div>
            <h2>Invoice List</h2>
            <button onClick={generatePDF} style={{ marginBottom: "10px" }}>Generate PDF</button>
            <ul>
                {invoices.map((invoice) => (
                    <li key={invoice.id}>
                        {invoice.customer_name} - ${invoice.amount}
                        <button onClick={() => sendInvoiceEmail("customer@example.com")} style={{ marginLeft: "10px" }}>
                            Send Email
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default InvoiceList;
