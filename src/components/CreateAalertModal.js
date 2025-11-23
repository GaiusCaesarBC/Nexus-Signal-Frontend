import React, { useState } from 'react';
import './CreateAlertModal.css';

const CreateAlertModal = ({ isOpen, onClose, onCreateAlert }) => {
  const [formData, setFormData] = useState({
    type: 'price_above',
    symbol: '',
    assetType: 'stock',
    targetPrice: '',
    percentageChange: '',
    notificationMethods: {
      inApp: true,
      email: false,
      push: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notify_')) {
      const method = name.replace('notify_', '');
      setFormData(prev => ({
        ...prev,
        notificationMethods: {
          ...prev.notificationMethods,
          [method]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.symbol.trim()) {
      setError('Please enter a symbol');
      return;
    }

    if (formData.type.includes('price') && !formData.targetPrice) {
      setError('Please enter a target price');
      return;
    }

    if (formData.type.includes('percentage') && !formData.percentageChange) {
      setError('Please enter a percentage change');
      return;
    }

    try {
      setLoading(true);

      const alertData = {
        type: formData.type,
        symbol: formData.symbol.toUpperCase(),
        assetType: formData.assetType,
        notificationMethods: formData.notificationMethods
      };

      if (formData.type.includes('price')) {
        alertData.targetPrice = parseFloat(formData.targetPrice);
      }

      if (formData.type.includes('percentage')) {
        alertData.percentageChange = parseFloat(formData.percentageChange);
      }

      await onCreateAlert(alertData);
      
      // Reset form
      setFormData({
        type: 'price_above',
        symbol: '',
        assetType: 'stock',
        targetPrice: '',
        percentageChange: '',
        notificationMethods: {
          inApp: true,
          email: false,
          push: false
        }
      });
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Alert</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="alert-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Alert Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-control"
            >
              <option value="price_above">Price Above</option>
              <option value="price_below">Price Below</option>
              <option value="percentage_gain">Percentage Gain</option>
              <option value="percentage_loss">Percentage Loss</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Symbol</label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="e.g., AAPL, BTC"
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>Asset Type</label>
              <select
                name="assetType"
                value={formData.assetType}
                onChange={handleChange}
                className="form-control"
              >
                <option value="stock">Stock</option>
                <option value="crypto">Crypto</option>
              </select>
            </div>
          </div>

          {formData.type.includes('price') && (
            <div className="form-group">
              <label>Target Price</label>
              <input
                type="number"
                name="targetPrice"
                value={formData.targetPrice}
                onChange={handleChange}
                placeholder="e.g., 150.00"
                step="0.01"
                className="form-control"
                required
              />
            </div>
          )}

          {formData.type.includes('percentage') && (
            <div className="form-group">
              <label>Percentage Change (%)</label>
              <input
                type="number"
                name="percentageChange"
                value={formData.percentageChange}
                onChange={handleChange}
                placeholder="e.g., 10"
                step="0.1"
                className="form-control"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Notification Methods</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="notify_inApp"
                  checked={formData.notificationMethods.inApp}
                  onChange={handleChange}
                />
                In-App
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="notify_email"
                  checked={formData.notificationMethods.email}
                  onChange={handleChange}
                />
                Email
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="notify_push"
                  checked={formData.notificationMethods.push}
                  onChange={handleChange}
                  disabled
                />
                Push (Coming Soon)
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAlertModal;