import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AlertContext = createContext(null);

function AlertModal({ message, title, type, onClose }) {
  const buttonRef = useRef(null);

  let iconClass = 'fa-circle-info';
  let iconColor = 'var(--clr-primary)';
  let glowColor = 'rgba(108, 99, 255, 0.2)';
  let circleBg = 'rgba(108, 99, 255, 0.1)';
  let borderTopColor = 'var(--clr-primary)';

  if (type === 'error') {
    iconClass = 'fa-triangle-exclamation';
    iconColor = 'var(--clr-accent)';
    glowColor = 'rgba(255, 107, 107, 0.2)';
    circleBg = 'rgba(255, 107, 107, 0.1)';
    borderTopColor = 'var(--clr-accent)';
  } else if (type === 'success') {
    iconClass = 'fa-circle-check';
    iconColor = 'var(--clr-green)';
    glowColor = 'rgba(74, 222, 128, 0.2)';
    circleBg = 'rgba(74, 222, 128, 0.1)';
    borderTopColor = 'var(--clr-green)';
  }

  useEffect(() => {
    if (buttonRef.current) buttonRef.current.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal" 
        role="dialog" 
        aria-modal="true" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '400px',
          padding: '32px 28px 28px 28px',
          textAlign: 'center',
          borderTop: `4px solid ${borderTopColor}`,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div 
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: circleBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.85rem',
            marginBottom: '20px',
            boxShadow: `0 0 20px ${glowColor}`
          }}
        >
          <i className={`fas ${iconClass}`}></i>
        </div>

        <h2 
          style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--clr-text)',
            marginBottom: '12px',
            marginTop: '0'
          }}
        >
          {title}
        </h2>

        <p 
          style={{
            color: 'var(--clr-muted)',
            fontSize: '0.925rem',
            lineHeight: '1.6',
            marginBottom: '28px',
            wordBreak: 'break-word'
          }}
        >
          {message}
        </p>

        <button 
          ref={buttonRef}
          type="button" 
          className="btn btn-primary" 
          onClick={onClose}
          style={{ 
            minWidth: '130px', 
            justifyContent: 'center',
            boxShadow: 'var(--glow-primary)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 24px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export function AlertProvider({ children }) {
  const [alertConfig, setAlertConfig] = useState(null);

  const showAlert = (message, title = 'Notification', type = 'info') => {
    setAlertConfig({ message, title, type });
  };

  const closeAlert = () => {
    setAlertConfig(null);
  };

  useEffect(() => {
    window.alert = (message) => {
      const msgStr = String(message);
      const lower = msgStr.toLowerCase();
      
      let type = 'info';
      let title = 'System Notification';
      
      if (lower.includes('error') || lower.includes('large') || lower.includes('failed') || lower.includes('invalid')) {
        type = 'error';
        title = 'Attention Required';
      } else if (lower.includes('success') || lower.includes('🎉') || lower.includes('soon') || lower.includes('created')) {
        type = 'success';
        title = 'Notice';
      }
      
      showAlert(msgStr, title, type);
    };
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alertConfig && (
        <AlertModal
          message={alertConfig.message}
          title={alertConfig.title}
          type={alertConfig.type}
          onClose={closeAlert}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
