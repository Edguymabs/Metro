import React from 'react';
import { getStatusBadgeClass, translateStatus } from '../utils/format';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`badge ${getStatusBadgeClass(status)}`}>
      {translateStatus(status)}
    </span>
  );
};

export default StatusBadge;

