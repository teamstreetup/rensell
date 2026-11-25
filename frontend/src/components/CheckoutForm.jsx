export default function CheckoutForm({
  formData,
  onChange,
  paymentMethod,
  onPaymentMethodChange,
  errors = {},
}) {
  return (
    <div className="d-grid gap-4">
      {/* Step 1: Delivery Address */}
      <div className="rensell-panel p-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <span className="badge bg-rensell-gradient rounded-circle p-2" style={{ width: '28px', height: '28px' }}>
            1
          </span>
          <h5 className="fw-bold text-dark mb-0">Delivery Address Details</h5>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label htmlFor="fullName" className="form-label small fw-bold text-muted text-uppercase">
              Full Name *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={onChange}
              placeholder="Atharv Jadhav"
              className={`form-control rounded-3 ${errors.fullName ? 'is-invalid' : ''}`}
              required
            />
            {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
          </div>

          <div className="col-12 col-md-6">
            <label htmlFor="email" className="form-label small fw-bold text-muted text-uppercase">
              Email (for receipt)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={onChange}
              placeholder="you@mitaoe.ac.in"
              className={`form-control rounded-3 ${errors.email ? 'is-invalid' : ''}`}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="col-12">
            <label htmlFor="phone" className="form-label small fw-bold text-muted text-uppercase">
              Phone Number (10 digits) *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              maxLength={10}
              value={formData.phone}
              onChange={onChange}
              placeholder="9876543210"
              className={`form-control rounded-3 ${errors.phone ? 'is-invalid' : ''}`}
              required
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>

          <div className="col-12">
            <label htmlFor="address" className="form-label small fw-bold text-muted text-uppercase">
              Shipping Address *
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={onChange}
              placeholder="Street name, hostel/building, flat or room number..."
              className={`form-control rounded-3 ${errors.address ? 'is-invalid' : ''}`}
              required
            />
            {errors.address && <div className="invalid-feedback">{errors.address}</div>}
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="city" className="form-label small fw-bold text-muted text-uppercase">
              City *
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={onChange}
              placeholder="Pune"
              className={`form-control rounded-3 ${errors.city ? 'is-invalid' : ''}`}
              required
            />
            {errors.city && <div className="invalid-feedback">{errors.city}</div>}
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="state" className="form-label small fw-bold text-muted text-uppercase">
              State *
            </label>
            <input
              id="state"
              name="state"
              type="text"
              value={formData.state}
              onChange={onChange}
              placeholder="Maharashtra"
              className={`form-control rounded-3 ${errors.state ? 'is-invalid' : ''}`}
              required
            />
            {errors.state && <div className="invalid-feedback">{errors.state}</div>}
          </div>

          <div className="col-12 col-md-4">
            <label htmlFor="pincode" className="form-label small fw-bold text-muted text-uppercase">
              Pincode (6 digits) *
            </label>
            <input
              id="pincode"
              name="pincode"
              type="text"
              maxLength={6}
              value={formData.pincode}
              onChange={onChange}
              placeholder="412105"
              className={`form-control rounded-3 ${errors.pincode ? 'is-invalid' : ''}`}
              required
            />
            {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
          </div>
        </div>
      </div>

      {/* Step 2: Payment Method */}
      <div className="rensell-panel p-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <span className="badge bg-rensell-gradient rounded-circle p-2" style={{ width: '28px', height: '28px' }}>
            2
          </span>
          <h5 className="fw-bold text-dark mb-0">Select Payment Method</h5>
        </div>

        <div className="d-grid gap-3">
          <label
            className={`border rounded-4 p-3 d-flex align-items-center gap-3 cursor-pointer ${
              paymentMethod === 'razorpay' ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle bg-white'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="razorpay"
              checked={paymentMethod === 'razorpay'}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="form-check-input mt-0"
            />
            <div className="flex-grow-1">
              <div className="fw-bold text-dark">Online Payment (Razorpay)</div>
              <div className="text-muted small">Pay instantly via UPI, Credit/Debit Card, or Netbanking</div>
            </div>
            <span className="badge text-bg-primary px-3 py-2">
              <i className="bi bi-credit-card-2-front me-1" /> Razorpay
            </span>
          </label>

          <label
            className={`border rounded-4 p-3 d-flex align-items-center gap-3 ${
              paymentMethod === 'cod' ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle bg-white'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="form-check-input mt-0"
            />
            <div className="flex-grow-1">
              <div className="fw-bold text-dark">Cash on Delivery (COD)</div>
              <div className="text-muted small">Pay cash or scan QR when your order arrives</div>
            </div>
            <span className="badge text-bg-success px-3 py-2">
              <i className="bi bi-cash-coin me-1" /> COD
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
