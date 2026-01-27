import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Store, User, Lock, KeyRound, ChevronRight, AlertCircle, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../LanguageToggle';

type LoginMode = 'select' | 'admin' | 'cashier';

const LoginPage: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { loginByPin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');

      if (newPin.length === 4) {
        if (loginByPin(newPin)) {
          // Success - navigation is handled by the useEffect or automatic redirect in App.tsx
          // But we can also do it here for immediate feedback
          // The roles are retrieved from AuthContext after login
          // We'll trust the user will be redirected by AppRoutes, but let's be explicit
          // Actually, let's just wait a tiny bit for the context to update
          setTimeout(() => {
            // The redirect logic in App.tsx handle this, but let's force it if needed
          }, 100);
        } else {
          setError(t('invalid_pin'));
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handlePinClear = () => {
    setPin('');
    setError('');
  };

  const handlePinBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo and Language */}
        <div className="text-center mb-10 relative">
          <div className="absolute -top-12 right-0">
            <LanguageToggle />
          </div>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary text-primary-foreground mb-4 shadow-pos-primary">
            <Store className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{t('app_name')}</h1>
          <p className="text-muted-foreground mt-2">{t('modern_pos_tagline')}</p>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary text-secondary-foreground mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t('enter_pin')}</h2>
          <p className="text-muted-foreground mt-1">{t('enter_pin_msg')}</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 ${pin.length > i
                ? 'bg-primary border-primary'
                : 'bg-secondary border-border'
                } ${error && 'border-destructive animate-pulse'}`}
            >
              {pin.length > i && (
                <div className="w-4 h-4 rounded-full bg-primary-foreground" />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-destructive mb-4 animate-fade-in">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === 'C') handlePinClear();
                else if (key === '⌫') handlePinBackspace();
                else handlePinInput(key);
              }}
              className={`pos-keypad-btn ${key === 'C' ? 'text-destructive' : ''
                } ${key === '⌫' ? 'text-muted-foreground' : ''}`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Demo credentials */}
        <div className="mt-12 p-4 bg-accent/50 rounded-2xl border border-border/50 text-center">
          <p className="text-xs text-muted-foreground font-medium mb-1">Demo PINs:</p>
          <p className="text-[10px] text-muted-foreground">Admin: 0000 | Manager: 9999 | Cashier: 1234</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
