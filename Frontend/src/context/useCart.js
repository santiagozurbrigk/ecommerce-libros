import { useContext } from 'react';
import { CartContext } from './CartContextProvider';

export const useCart = () => useContext(CartContext); 