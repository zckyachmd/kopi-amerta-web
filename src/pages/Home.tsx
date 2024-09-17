import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FaCartPlus, FaArrowRight, FaSpinner } from "react-icons/fa";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  slug: string;
  image_url: string;
}

interface ApiResponse {
  status: string;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
    };
  };
}

const imageSlides = [
  { imageUrl: "https://placehold.co/1920x1080?text=Slider+1", url: "/page1" },
  { imageUrl: "https://placehold.co/1920x1080?text=Slider+2", url: "/page2" },
  { imageUrl: "https://placehold.co/1920x1080?text=Slider+3", url: "/page3" },
];

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = import.meta.env.VITE_APP_API_BASEURL;
      const queryParams = new URLSearchParams({
        limit: "6",
        sorts: JSON.stringify({ createdAt: "desc" }),
      });
      const url = `${baseUrl}/products?${queryParams.toString()}`;

      try {
        const response = await axios.get<ApiResponse>(url);
        setProducts(response.data.data.products);
        setLoading(false);
      } catch {
        setError("Failed to fetch products");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-600" />
      </div>
    );
  }

  return (
    <>
      {/* Slider */}
      {imageSlides.length > 0 && (
        <div className="mb-12">
          <Slider
            imageSlides={imageSlides}
            autoplayDelay={4000}
            prevButtonText="Prev"
            nextButtonText="Next"
          />
        </div>
      )}

      {/* Products */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          Discover Our Exquisite Coffee Collection
        </h1>
        {products.length === 0 ? (
          <p className="text-xl font-semibold text-gray-600 text-center mt-6">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.slug}`}
                className="block"
              >
                <Card className="shadow-sm rounded-sm overflow-hidden border border-gray-300">
                  <CardContent className="p-0">
                    <div className="w-full h-60">
                      <img
                        src={
                          product.image_url ||
                          "https://placehold.co/150x150?text=No+Image"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-gray-700">
                        Rp {product.price.toLocaleString("id-ID")}
                      </p>
                      <Button className="mt-2 w-full bg-[#986B54] hover:bg-[#8c5b43] text-white py-2">
                        <FaCartPlus className="w-6 h-6 mr-2" /> Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        {!error && products.length > 0 && (
          <div className="text-center mt-6">
            <Link to="/products">
              <Button className="bg-[#986B54] text-white hover:bg-[#8c5b43] px-6 py-3 rounded-full">
                <span className="mr-2">
                  Browse Our Entire Coffee Collection
                </span>
                <FaArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
