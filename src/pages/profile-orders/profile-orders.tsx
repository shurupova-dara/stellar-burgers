import {
  fetchUserOrders,
  selectOrdersLoading,
  selectUserOrders,
} from '@slices/ordersSlice';
import { Preloader } from '@ui';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

import { useDispatch, useSelector } from '@services/store';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector(selectUserOrders);
  const isLoading = useSelector(selectOrdersLoading);

  useEffect(() => {
    void dispatch(fetchUserOrders());
  }, [dispatch]);

  if (isLoading) {
    return <Preloader />;
  }

  return <ProfileOrdersUI orders={orders} />;
};
