import { useEffect, useState } from "react";
import {
  ActionFunctionArgs,
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaCreditCard, FaSpinner, FaTrashAlt } from "react-icons/fa";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export const loader = async () => {
  try {
    const response = await apiFetch("/cart");
    if (!response) {
      throw new Error("Failed to fetch cart!");
    }
    const { data } = await response.json();
    return data || {};
  } catch {
    return redirect("/login");
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const itemId = formData.get("itemId");

  try {
    switch (actionType) {
      case "updateQuantity": {
        const quantity = formData.get("quantity");
        await apiFetch(
          `/cart/item/${itemId}`,
          {
            method: "PATCH",
            payload: {
              quantity: Number(quantity),
            },
          },
          (error) => {
            throw new Error(error.message || "Failed to update quantity.");
          }
        );
        return { status: 200 };
      }

      case "remove": {
        await apiFetch(
          `/cart/item/${itemId}`,
          {
            method: "DELETE",
          },
          (error) => {
            throw new Error(error.message || "Failed to delete item.");
          }
        );
        return { status: 200 };
      }

      case "checkout": {
        const response = await apiFetch(
          "/cart/checkout",
          {
            method: "POST",
          },
          (error) => {
            throw new Error(error.message || "Checkout failed.");
          }
        );
        const { order } = await response.json();
        return { status: 200, order };
      }

      default:
        throw new Error("Unknown action type.");
    }
  } catch (error: Error | any) {
    toast.error(
      error.message || "Oops! Something went wrong. Please try again."
    );
    return { status: 500 };
  }
};

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const carts = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [tempQuantities, setTempQuantities] = useState<{ [key: string]: number }>({});
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useDocumentTitle('Cart');

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setTempQuantities((prev) => ({ ...prev, [itemId]: quantity }));

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const id = setTimeout(async () => {
      const formData = new FormData();
      formData.append("actionType", "updateQuantity");
      formData.append("itemId", itemId);
      formData.append("quantity", quantity.toString());

      const response = await action({
        request: new Request("", {
          method: "POST",
          body: formData,
        }),
        params: {},
      });

      if (response.status === 200) {
        navigate(`/carts`, { replace: true });
      }
    }, 500);

    setTimeoutId(id);
  };

  const handleRemoveItem = async (itemId: string) => {
    setLoadingItemId(itemId);

    const formData = new FormData();
    formData.append("actionType", "remove");
    formData.append("itemId", itemId);

    const response = await action({
      request: new Request("", { method: "POST", body: formData }),
      params: {},
    });

    setLoadingItemId(null);

    if (response.status === 200) {
      toast.success("Item deleted successfully.");
      navigate(`/carts`, { replace: true });
    }
  };

  const handleCheckout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to proceed with checkout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#986B54",
      confirmButtonText: "Yes, checkout",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setIsCheckingOut(true);

      const formData = new FormData();
      formData.append("actionType", "checkout");

      const response = await action({
        request: new Request("", { method: "POST", body: formData }),
        params: {},
      });

      if (response.status === 200) {
        const { id } = response.order;
        toast.success("Checkout successful!");
        navigate(`/order/${id}`);
      }

      setIsCheckingOut(false);
    }
  };

  useEffect(() => {
    if (location.state && location.state.scrollPosition) {
      window.scrollTo(0, location.state.scrollPosition);
      sessionStorage.removeItem("scrollPosition");
    }
  }, [location]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-start">Your Cart</h1>
      {carts.cart.items.length === 0 ? (
        <p className="text-xl font-semibold text-gray-600 text-center py-40">
          No items in the cart.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {carts.cart.items.map((item: any) => (
            <Card key={item.id} className="shadow-lg border rounded-lg">
              <CardContent className="flex flex-col md:flex-row md:items-center w-full p-4">
                <img
                  src={
                    item.product.image_url[0] ||
                    `https://placehold.co/150x150?text=${encodeURIComponent(
                      item.product.name
                    )}`
                  }
                  alt={item.product.name}
                  className="w-32 h-32 object-cover rounded-md mb-4 md:mb-0 md:mr-4 cursor-pointer mx-auto md:mx-0"
                  onClick={() => navigate(`/product/${item.product.slug}`)}
                />
                <div className="flex-grow mb-4 md:mb-0 text-center md:text-left flex flex-col justify-center">
                  <h2
                    className="text-lg font-semibold cursor-pointer mb-1"
                    onClick={() => navigate(`/product/${item.product.slug}`)}
                  >
                    {item.product.name}
                  </h2>
                  <p className="text-md text-gray-600">
                    Rp {item.product.price.toLocaleString("id-ID")} x{" "}
                    {tempQuantities[item.id] || item.quantity}
                  </p>
                  {item.product.stock_qty === 0 || !item.product.isAvailable ? (
                    <Badge
                      variant="outline"
                      className="mt-2 inline-block text-xs py-1 px-2 w-max self-center md:self-start"
                    >
                      Out of Stock
                    </Badge>
                  ) : null}
                </div>
                <div className="flex flex-col items-center md:items-start md:ml-4">
                  <div className="flex items-center mb-2">
                    <Button
                      className="bg-gray-300 text-black hover:bg-gray-400 w-8 h-8 flex items-center justify-center rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(
                          item.id,
                          Math.max((tempQuantities[item.id] || item.quantity) - 1, 1)
                        );
                      }}
                      disabled={
                        (tempQuantities[item.id] || item.quantity) <= 1 ||
                        item.product.stock_qty === 0 ||
                        !item.product.isAvailable
                      }
                    >
                      -
                    </Button>
                    <input
                      type="number"
                      value={tempQuantities[item.id] || item.quantity}
                      min="1"
                      className="input-no-spinner mx-2 text-xl w-12 text-center border border-gray-300 rounded"
                      onChange={(e) => {
                        const newQuantity = Math.max(Number(e.target.value), 1);
                        handleQuantityChange(item.id, newQuantity);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      disabled={
                        item.product.stock_qty === 0 ||
                        item.product.stock_qty <= item.quantity ||
                        !item.product.isAvailable
                      }
                    />
                    <Button
                      className="bg-gray-300 text-black hover:bg-gray-400 w-8 h-8 flex items-center justify-center rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(item.id, (tempQuantities[item.id] || item.quantity) + 1);
                      }}
                      disabled={
                        item.product.stock_qty <= (tempQuantities[item.id] || item.quantity) ||
                        item.product.stock_qty === 0 ||
                        !item.product.isAvailable
                      }
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    className="bg-red-500 text-white hover:bg-red-600 w-full md:w-32 py-2 mt-4 md:mt-0"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={loadingItemId === item.id}
                  >
                    {loadingItemId === item.id ? (
                      <FaSpinner className="animate-spin mr-1" />
                    ) : (
                      <FaTrashAlt className="mr-1" />
                    )}
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center mt-6">
              <div className="text-lg font-semibold">
                Total: Rp {carts.total.toLocaleString("id-ID")}
              </div>
              <Button
                className="bg-blue-500 text-white hover:bg-blue-600 py-3 px-6"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard className="mr-2" /> Checkout
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
