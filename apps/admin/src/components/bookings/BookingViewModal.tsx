import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '../../services/api';
import { BookingDetailDialog } from './BookingDetailDialog';

export const BookingViewModal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewId = searchParams.get('view');

  const { data, isLoading } = useQuery({
    queryKey: ['booking', 'admin-view', viewId],
    queryFn: () =>
      orpc.booking.getBookingById({ id: viewId! }),
    enabled: !!viewId,
  });

  const handleClose = () => {
    setSearchParams((prev) => {
      prev.delete('view');
      return prev;
    }, { replace: true });
  };

  const booking = data;

  // Mostramos o modal apenas se existir viewId
  return (
    <BookingDetailDialog
      open={!!viewId}
      onClose={handleClose}
      booking={booking || null}
      isLoading={isLoading}
    />
  );
};
