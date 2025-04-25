import React from 'react';
import { Link } from 'wouter';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';
import { CartItemWithProduct } from '@shared/schema';

const CartSidebar: React.FC = () => {
  const { cart, closeCart, updateCartItem, removeCartItem } = useCart();
  
  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCartItem(itemId);
    } else {
      updateCartItem(itemId, newQuantity);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={closeCart}
        ></div>
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-auto">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Shopping cart</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-3 h-7"
                    onClick={closeCart}
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  </Button>
                </div>

                <div className="mt-8">
                  <div className="flow-root">
                    {cart.items.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-gray-500">Your cart is empty</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={closeCart}
                        >
                          Continue Shopping
                        </Button>
                      </div>
                    ) : (
                      <ul role="list" className="-my-6 divide-y divide-gray-200">
                        {cart.items.map((item) => (
                          <li key={item.id} className="py-6 flex">
                            <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                              <img 
                                src={item.product.imageUrl || ''} 
                                alt={item.product.name} 
                                className="w-full h-full object-center object-cover"
                              />
                            </div>

                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>
                                    <Link href={`/product/${item.product.slug}`}>
                                      <a>{item.product.name}</a>
                                    </Link>
                                  </h3>
                                  <p className="ml-4">{formatCurrency(item.product.price)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  {item.product.description?.substring(0, 30)}
                                  {item.product.description && item.product.description.length > 30 ? '...' : ''}
                                </p>
                              </div>
                              <div className="flex-1 flex items-end justify-between text-sm">
                                <div className="flex items-center space-x-3">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 rounded-full p-0"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <p className="text-gray-500">
                                    Qty <span>{item.quantity}</span>
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6 rounded-full p-0"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>

                                <Button
                                  variant="link"
                                  className="font-medium text-primary p-0 h-auto"
                                  onClick={() => removeCartItem(item.id)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {cart.items.length > 0 && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>{formatCurrency(cart.subtotal)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                  <div className="mt-6">
                    <Link href="/checkout">
                      <a className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-blue-700 transition-colors">
                        Checkout
                      </a>
                    </Link>
                  </div>
                  <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                    <p>
                      or{" "}
                      <Button 
                        variant="link" 
                        className="text-primary font-medium hover:text-blue-700 p-0 h-auto" 
                        onClick={closeCart}
                      >
                        Continue Shopping<span aria-hidden="true"> &rarr;</span>
                      </Button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
