from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory storage (replace with a database in production)
customers = []
purchases = []
invoices = []

# Helper function to generate unique IDs
def generate_id():
    return str(datetime.now().timestamp())

# Routes for Customers
@app.route('/customers', methods=['GET', 'POST'])
def manage_customers():
    if request.method == 'GET':
        return jsonify(customers)
    elif request.method == 'POST':
        data = request.json
        if not data or not all(key in data for key in ['name', 'email', 'phone']):
            abort(400, description="Invalid customer data")
        customer = {
            'id': generate_id(),
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone']
        }
        customers.append(customer)
        return jsonify(customer), 201

# Routes for Purchases
@app.route('/purchases', methods=['GET', 'POST'])
def manage_purchases():
    if request.method == 'GET':
        return jsonify(purchases)
    elif request.method == 'POST':
        data = request.json
        if not data or not all(key in data for key in ['customerId', 'items', 'total']):
            abort(400, description="Invalid purchase data")
        purchase = {
            'id': generate_id(),
            'customerId': data['customerId'],
            'items': data['items'],
            'total': data['total'],
            'timestamp': datetime.now().isoformat()
        }
        purchases.append(purchase)

        # Generate an invoice for the purchase
        invoice = {
            'id': generate_id(),
            'purchaseId': purchase['id'],
            'customerId': purchase['customerId'],
            'total': purchase['total'],
            'status': 'Pending',
            'timestamp': datetime.now().isoformat()
        }
        invoices.append(invoice)

        return jsonify(purchase), 201

# Routes for Invoices
@app.route('/invoices', methods=['GET'])
def get_invoices():
    return jsonify(invoices)

@app.route('/invoices/<invoice_id>/mark-paid', methods=['PUT'])
def mark_invoice_paid(invoice_id):
    invoice = next((inv for inv in invoices if inv['id'] == invoice_id), None)
    if not invoice:
        abort(404, description="Invoice not found")
    invoice['status'] = 'Paid'
    return jsonify(invoice)

# Search Invoices
@app.route('/invoices/search', methods=['GET'])
def search_invoices():
    search_term = request.args.get('q', '').lower()
    if not search_term:
        return jsonify(invoices)
    filtered_invoices = []
    for invoice in invoices:
        customer = next((cust for cust in customers if cust['id'] == invoice['customerId']), None)
        if customer and (search_term in customer['name'].lower() or
                         search_term in customer['email'].lower() or
                         search_term in invoice['purchaseId'].lower()):
            filtered_invoices.append(invoice)
    return jsonify(filtered_invoices)

# Metrics
@app.route('/metrics/total-purchases-today', methods=['GET'])
def total_purchases_today():
    today = datetime.now().date().isoformat()
    count = len([p for p in purchases if datetime.fromisoformat(p['timestamp']).date().isoformat() == today])
    return jsonify({'total_purchases_today': count})

@app.route('/metrics/total-purchases-by-customer/<customer_id>', methods=['GET'])
def total_purchases_by_customer(customer_id):
    count = len([p for p in purchases if p['customerId'] == customer_id])
    return jsonify({'total_purchases_by_customer': count})

# Run the app
if __name__ == '__main__':
    app.run(debug=True)