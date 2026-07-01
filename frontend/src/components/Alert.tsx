import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  className?: string;
}

const alertConfig: Record<AlertType, { bg: string; border: string; text: string; iconColor: string; icon: React.FC<any> }> = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    iconColor: 'text-red-600',
    icon: AlertCircle,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    iconColor: 'text-green-600',
    icon: CheckCircle2,
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    iconColor: 'text-orange-600',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    iconColor: 'text-blue-600',
    icon: Info,
  },
};

export const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
  if (!message) return null;

  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div 
      role="alert" 
      className={`flex items-start p-3 sm:p-4 rounded-lg border ${config.bg} ${config.border} ${className}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mr-3 mt-0.5 ${config.iconColor}`} />
      <div className={`text-sm font-medium ${config.text}`}>
        {message}
      </div>
    </div>
  );
};
