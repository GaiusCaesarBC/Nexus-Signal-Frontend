import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import './NotificationCenter.css';

const NotificationCenter = ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, onDeleteNotification }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'price_alert':
        return '💰';
      case 'prediction_expiry':
        return '⏰';
      case 'portfolio_milestone':
        return '🎯';
      case 'price_change':
        return '📈';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'price_alert':
        return '#10b981';
      case 'prediction_expiry':
        return '#f59e0b';
      case 'portfolio_milestone':
        return '#6c5ce7';
      case 'price_change':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (date) => {
    const notifDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now - notifDate) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return format(notifDate, 'MMM d, h:mm a');
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-header">
        <div>
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className="unread-count-text">{unreadCount} unread</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            className="mark-all-read-btn"
            onClick={onMarkAllAsRead}
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <span className="no-notif-icon">🔔</span>
            <p>No notifications yet</p>
            <small>You'll see alerts and updates here</small>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div
                className="notification-icon"
                style={{ background: getNotificationColor(notification.type) }}
              >
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{formatDate(notification.createdAt)}</div>
              </div>

              <div className="notification-actions">
                {!notification.read && <div className="unread-dot"></div>}
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNotification(notification._id);
                  }}
                  title="Delete notification"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="notification-footer">
          <a href="/alerts" className="view-all-link">
            View all alerts
          </a>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;