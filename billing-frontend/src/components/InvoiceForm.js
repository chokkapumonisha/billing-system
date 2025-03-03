import React, { useState } from "react";

function InvoiceForm() {
    const [invoice, setInvoice] = useState({ customer: "", amount: "" });

    const handleChange = (e) => {
        setInvoice({ ...invoice, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Invoice Submitted:", invoice);
        setInvoice({ customer: "", amount: "" }); // Reset form after submit
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create Invoice</h2>
            <input
                type="text"
                name="customer"
                placeholder="Customer Name"
                value={invoice.customer}
                onChange={handleChange}
                required
            />
            <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={invoice.amount}
                onChange={handleChange}
                required
            />
            <button type="submit">Add Invoice</button>
        </form>
    );
}

export default InvoiceForm;
