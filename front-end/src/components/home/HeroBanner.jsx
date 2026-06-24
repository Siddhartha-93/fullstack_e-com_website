import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllProducts } from "../../api/productApi.js";
import heroImg from "../../assets/hero-chicken.jpg";

const INTERVAL_MS = 5000; 

export default function HeroBanner() {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState(0);

  const goToRandomProduct = useCallback(() => {
    if (products.length === 0) return;
    setActive((current) => {
      let next = Math.floor(Math.random() * products.length);
      if (products.length > 1 && next === current) {
        next = (current + 1) % products.length;
      }
      return next;
    });
  }, [products]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchAllProducts();
        const productsWithImages = response.data.products.filter((p) => p.images && p.images.length > 0);
        console.log("HeroBanner loaded products:", productsWithImages);
        setProducts(productsWithImages);
      } catch (error) {
        console.error("HeroBanner product load failed:", error);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(goToRandomProduct, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [goToRandomProduct]);

  const activeProduct = products[active];
  const heroImage = activeProduct?.images?.[0]?.url || heroImg;
  const heroAlt = activeProduct?.name || "Fresh meat delivery hero image";

  return (
    <header className="relative px-6 py-12 lg:py-20 animate-reveal">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
        <div className="w-full md:w-1/2 space-y-6">
          <span className="inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Store to Door — within 1hr
          </span>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-balance leading-[0.9]">
            Just 🤔 Think <br />
            <span className="font-serif italic font-medium text-primary lowercase">
              We Deliver.
            </span>
          </h1>
          <p className="max-w-[42ch] text-muted-foreground text-pretty text-lg">
            Store To Your Doorstep. Free cash-on delivery in every order. Your order we deliver,
           Daily item to Branded Product within 1 hour at your doorstep .
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="bg-primary text-primary-foreground px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
            >
              Shop all cuts
            </Link>
            <Link
              to="/orders"
              className="border border-foreground px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
            >
              Track an order
            </Link>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <img
            src={heroImage}
            alt={heroAlt}
            width={1280}
            height={960}
            className="w-full aspect-[4/3] object-cover rounded-2xl ring-1 ring-black/5"
          />
        </div>
      </div>
    </header>
  );
}
