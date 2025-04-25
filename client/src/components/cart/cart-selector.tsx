import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";

interface CartSelectorProps {
  onCartSelected: (cartId: number) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  showCreateCart?: boolean;
  buttonText?: string;
}

export default function CartSelector({
  onCartSelected,
  trigger,
  title = "Select a Cart",
  description = "Choose which cart you want to use",
  showCreateCart = true,
  buttonText = "Use This Cart",
}: CartSelectorProps) {
  const { carts, activeCartId, createNewCart } = useCart();
  const [selectedCartId, setSelectedCartId] = useState<string>(activeCartId?.toString() || "");
  const [showNewCartInput, setShowNewCartInput] = useState(false);
  const [newCartName, setNewCartName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectedCartChange = (value: string) => {
    if (value === "new") {
      setShowNewCartInput(true);
    } else {
      setShowNewCartInput(false);
      setSelectedCartId(value);
    }
  };

  const handleCreateCart = () => {
    if (newCartName.trim()) {
      createNewCart(newCartName.trim());
      setNewCartName("");
      setShowNewCartInput(false);
      // Dialog will be closed by the useEffect in the parent when carts are updated
    }
  };

  const handleSubmit = () => {
    if (selectedCartId) {
      onCartSelected(parseInt(selectedCartId));
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Select Cart</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {showNewCartInput ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="New Cart Name"
                value={newCartName}
                onChange={(e) => setNewCartName(e.target.value)}
                className="col-span-3"
              />
              <Button 
                onClick={handleCreateCart} 
                disabled={!newCartName.trim()}
              >
                Create
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowNewCartInput(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Select 
              value={selectedCartId}
              onValueChange={handleSelectedCartChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a cart" />
              </SelectTrigger>
              <SelectContent>
                {carts.map(cart => (
                  <SelectItem key={cart.id} value={cart.id.toString()}>
                    {cart.name} {cart.isDefault && "(Default)"}
                  </SelectItem>
                ))}
                {showCreateCart && (
                  <SelectItem value="new">+ Create New Cart</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!selectedCartId || showNewCartInput}>
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}