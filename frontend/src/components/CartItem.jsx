import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  formatINR,
  formatShortDate,
  getTomorrowDateStr,
  getNextDayStr,
} from '../utils/formatters';
import { resolveImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageUrl';

export default function CartItem({ item, index, onUpdateQuantity, onUpdateDates, onRemove }) {
  const [imgSrc, setImgSrc] = useState(() => resolveImageUrl(item.image));
  const [editingDates, setEditingDates] = useState(false);
  const [startDate, setStartDate] = useState(item.startDate || getTomorrowDateStr());
  const [endDate, setEndDate] = useState(item.endDate || getNextDayStr(startDate));
  const [dateError, setDateError] = useState('');

  const isRent = item.type === 'rent';
  const qty = Number(item.quantity || 1);
  const days = Number(item.rentalDays || 1);
  const deposit = Number(item.securityDeposit || 0);
  const unitTotal = isRent ? Number(item.price) * days + deposit : Number(item.price);
  const lineTotal = unitTotal * qty;

  const minStartDate = getTomorrowDateStr();
  const minEndDate = getNextDayStr(startDate);

  const handleSaveDates = () => {
    setDateError('');
    const ok = onUpdateDates(index, startDate, endDate);
    if (!ok) {
      setDateError('End date must be after start date');
      return;
    }
    setEditingDates(false);
  };

  return (
    <div className="rensell-panel p-3 p-sm-4 mb-3">
      <div className="row g-3 align-items-center">
        {/* Thumbnail */}
        <div className="col-auto">
          <Link to={`/products/${item._id}`}>
            <img
              src={imgSrc}
              alt={item.name}
              onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
              className="rounded-3 border object-fit-cover"
              style={{ width: '92px', height: '92px' }}
            />
          </Link>
        </div>

        {/* Details */}
        <div className="col">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
            <span className={isRent ? 'badge-rensell-rent' : 'badge-rensell-sale'}>
              {isRent ? 'Rent' : 'Buy'}
            </span>
            {item.category && (
              <span className="badge text-bg-light text-capitalize text-muted">{item.category}</span>
            )}
          </div>

          <Link to={`/products/${item._id}`} className="text-decoration-none">
            <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
          </Link>

          <div className="text-muted small mb-2">
            {formatINR(item.price)}
            {isRent ? ' / day' : ' each'}
          </div>

          {/* Rental Dates Display & Editor */}
          {isRent && (
            <div className="mt-2">
              {!editingDates ? (
                <div className="d-inline-flex flex-wrap align-items-center gap-2 bg-light border rounded-3 px-3 py-1 small">
                  <i className="bi bi-calendar3 text-rensell-secondary" />
                  <span className="fw-semibold">
                    {formatShortDate(item.startDate)} – {formatShortDate(item.endDate)}
                  </span>
                  <span className="badge text-bg-secondary">{days} Day{days > 1 ? 's' : ''}</span>
                  <button
                    type="button"
                    onClick={() => setEditingDates(true)}
                    className="btn btn-link btn-sm p-0 text-rensell-primary fw-semibold text-decoration-none ms-1"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="bg-light border rounded-3 p-2 mt-1">
                  <div className="row g-2 align-items-end">
                    <div className="col-6 col-sm-4">
                      <label className="form-label small fw-bold text-muted mb-1">Start</label>
                      <input
                        type="date"
                        min={minStartDate}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="form-control form-control-sm"
                      />
                    </div>
                    <div className="col-6 col-sm-4">
                      <label className="form-label small fw-bold text-muted mb-1">End</label>
                      <input
                        type="date"
                        min={minEndDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="form-control form-control-sm"
                      />
                    </div>
                    <div className="col-12 col-sm-4 d-flex gap-1">
                      <button type="button" onClick={handleSaveDates} className="btn btn-rensell btn-sm flex-grow-1">
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDates(false);
                          setDateError('');
                        }}
                        className="btn btn-outline-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  {dateError && <div className="text-danger small mt-1 fw-semibold">{dateError}</div>}
                </div>
              )}
            </div>
          )}

          {/* Quantity Controls */}
          <div className="d-flex align-items-center gap-3 mt-3">
            <div className="input-group input-group-sm" style={{ width: '115px' }}>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => onUpdateQuantity(index, Math.max(1, qty - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                <i className="bi bi-dash" />
              </button>
              <span className="form-control text-center fw-bold bg-white">{qty}</span>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => onUpdateQuantity(index, qty + 1)}
                aria-label="Increase quantity"
              >
                <i className="bi bi-plus" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="btn btn-sm btn-outline-danger rounded-3 d-inline-flex align-items-center gap-1"
            >
              <i className="bi bi-trash" />
              <span>Remove</span>
            </button>
          </div>
        </div>

        {/* Line Price Summary */}
        <div className="col-12 col-sm-auto text-sm-end border-top border-sm-0 pt-2 pt-sm-0">
          <div className="fs-5 fw-bold text-dark">{formatINR(lineTotal)}</div>
          {isRent && deposit > 0 && (
            <div className="text-warning-emphasis small fw-semibold">
              Incl. {formatINR(deposit * qty)} refundable deposit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
