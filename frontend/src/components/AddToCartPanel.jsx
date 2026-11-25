import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import {
  formatINR,
  getTomorrowDateStr,
  getNextDayStr,
  calculateRentalDays,
  calculateSecurityDeposit,
} from '../utils/formatters';

export default function AddToCartPanel({ product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isRental = product.type === 'rent';
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentalDays, setRentalDays] = useState(0);

  const securityDeposit = isRental ? calculateSecurityDeposit(product.originalPrice) : 0;

  useEffect(() => {
    if (startDate && endDate) {
      const days = calculateRentalDays(startDate, endDate);
      setRentalDays(days > 0 ? days : 0);
    } else {
      setRentalDays(0);
    }
  }, [startDate, endDate]);

  const validateRental = () => {
    if (!isRental) return true;
    if (!startDate || !endDate) {
      showToast('Please select rental start and end dates', 'error');
      return false;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      showToast('End date must be after start date', 'error');
      return false;
    }
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    if (start < todayMidnight) {
      showToast('Start date cannot be in the past', 'error');
      return false;
    }
    return true;
  };

  const handleAdd = () => {
    if (!validateRental()) return;
    addToCart(
      product,
      isRental
        ? {
            startDate,
            endDate,
            rentalDays: rentalDays || 1,
            securityDeposit,
          }
        : null
    );
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleBuyOrRentNow = () => {
    if (!validateRental()) return;
    addToCart(
      product,
      isRental
        ? {
            startDate,
            endDate,
            rentalDays: rentalDays || 1,
            securityDeposit,
          }
        : null
    );
    navigate('/cart');
  };

  const minStartDate = getTomorrowDateStr();
  const minEndDate = startDate ? getNextDayStr(startDate) : minStartDate;

  return (
    <div className="d-grid gap-3">
      {isRental && (
        <div className="bg-light border rounded-4 p-3 p-sm-4">
          <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-calendar-range text-rensell-secondary" />
            Select Rental Period
          </h6>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <label htmlFor="rentStart" className="form-label small fw-bold text-muted mb-1">
                Start Date
              </label>
              <input
                id="rentStart"
                type="date"
                min={minStartDate}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-control form-control-sm rounded-3"
              />
            </div>
            <div className="col-6">
              <label htmlFor="rentEnd" className="form-label small fw-bold text-muted mb-1">
                End Date
              </label>
              <input
                id="rentEnd"
                type="date"
                min={minEndDate}
                value={endDate}
                disabled={!startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-control form-control-sm rounded-3"
              />
            </div>
          </div>

          {rentalDays > 0 && (
            <div className="bg-white rounded-3 p-3 border small d-grid gap-2">
              <div className="d-flex justify-content-between text-muted">
                <span>
                  Daily Rate &times; {rentalDays} day{rentalDays > 1 ? 's' : ''}
                </span>
                <span className="fw-semibold text-dark">{formatINR(product.price * rentalDays)}</span>
              </div>
              <div className="d-flex justify-content-between text-muted">
                <span>
                  Security Deposit{' '}
                  <i
                    className="bi bi-info-circle"
                    title="20% refundable deposit returned within 48h of safe return"
                  />
                </span>
                <span className="fw-semibold text-warning-emphasis">{formatINR(securityDeposit)}</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-2 fw-bold">
                <span className="text-dark">Upfront Total</span>
                <span className="text-rensell-primary fs-6">
                  {formatINR(product.price * rentalDays + securityDeposit)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="row g-2">
        <div className="col-6">
          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-warning text-dark fw-bold w-100 py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-cart-plus-fill" />
            <span>Add to Cart</span>
          </button>
        </div>
        <div className="col-6">
          <button
            type="button"
            onClick={handleBuyOrRentNow}
            className="btn btn-rensell w-100 py-2.5 d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-lightning-charge-fill" />
            <span>{isRental ? 'Rent Now' : 'Buy Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
