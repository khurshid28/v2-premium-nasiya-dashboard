import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Upload, Package, Tag, Edit, Trash, X } from "tabler-icons-react";
import Card from "components/card";
import CustomSelect from "components/dropdown/CustomSelect";
import Toast from "components/toast/Toast";
import { productApi, Category as ApiCategory, Product as ApiProduct } from "lib/api/product";

// Mock data for merchants and fillials
const MOCK_MERCHANTS = [
  "Texnomart", "Mediapark", "Artel", "Makro", "Olcha", "Uzum Market", 
  "TechnoPlus", "Mediastore", "ElectroShop", "Digital Store", "Smart Shop",
  "MegaTech", "Premium Store", "Express Market", "City Shop", "UzbekTech",
  "Modern Store", "Super Market", "Tech Center", "Best Buy UZ"
];

const MOCK_FILLIALS = [
  "Chilonzor filiali", "Yunusobod filiali", "Sergeli filiali", "Yashnobod filiali",
  "Mirzo Ulug'bek filiali", "Mirobod filiali", "Shayxontohur filiali", "Olmazor filiali",
  "Bektemir filiali", "Uchtepa filiali", "Yakkasaroy filiali", "Hamza filiali",
  "Samarkand filiali", "Buxoro filiali", "Namangan filiali", "Andijon filiali",
  "Farg'ona filiali", "Qo'qon filiali", "Termiz filiali", "Urganch filiali",
  "Nukus filiali", "Jizzax filiali", "Qarshi filiali", "Navoiy filiali",
  "Guliston filiali", "Denov filiali", "Marg'ilon filiali", "Chirchiq filiali",
  "Oltiariq filiali", "Asaka filiali"
];

// Types
type Category = {
  id: number;
  name: string;
  description: string;
  productCount: number;
  image?: string;
  availableFor: {
    merchants: string[];
    fillials: string[];
  };
};

type Product = {
  id: number;
  name: string;
  barcode: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
  stock?: number;
  createdAt: string;
  availableFor: {
    merchants: string[]; // merchant IDs or names
    fillials: string[]; // fillial IDs or names
  };
};

// Mock Categories
const MOCK_CATEGORIES: Category[] = [
  { 
    id: 1, 
    name: "Elektronika", 
    description: "Telefon, televizor va boshqa elektronika", 
    productCount: 15, 
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
    availableFor: { merchants: ["Texnomart", "Mediapark", "Artel"], fillials: ["Chilonzor filiali", "Yunusobod filiali"] }
  },
  { 
    id: 2, 
    name: "Soatlar", 
    description: "Qo'l soatlari va devoriy soatlar", 
    productCount: 8, 
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&h=300&fit=crop",
    availableFor: { merchants: ["Texnomart", "Mediapark"], fillials: ["Chilonzor filiali", "Sergeli filiali"] }
  },
  { 
    id: 3, 
    name: "Uy texnikasi", 
    description: "Muzlatgich, kir yuvish mashinasi va h.k.", 
    productCount: 12, 
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop",
    availableFor: { merchants: ["Artel", "Mediapark"], fillials: ["Yunusobod filiali", "Sergeli filiali"] }
  },
  { 
    id: 4, 
    name: "Mebel", 
    description: "Divan, stul, shkaf va boshqalar", 
    productCount: 6, 
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    availableFor: { merchants: ["Texnomart", "Artel"], fillials: ["Chilonzor filiali"] }
  },
  { 
    id: 5, 
    name: "Kompyuter texnikasi", 
    description: "Noutbuk, planşet, aksessuarlar", 
    productCount: 10, 
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    availableFor: { merchants: ["Texnomart", "Mediapark", "Artel"], fillials: ["Chilonzor filiali", "Yunusobod filiali", "Sergeli filiali"] }
  },
];

// Mock Products
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Samsung Galaxy S23",
    barcode: "8801643891234",
    category: "Elektronika",
    price: 8500000,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop",
    description: "128GB, 8GB RAM",
    stock: 15,
    createdAt: "2024-11-15",
    availableFor: { merchants: ["Texnomart", "Mediapark"], fillials: ["Chilonzor filiali", "Yunusobod filiali"] },
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    barcode: "0194253234567",
    category: "Elektronika",
    price: 15000000,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop",
    description: "256GB, Titanium",
    stock: 8,
    createdAt: "2024-11-20",
    availableFor: { merchants: ["Texnomart", "Artel"], fillials: ["Chilonzor filiali", "Sergeli filiali"] },
  },
  {
    id: 3,
    name: "Rolex Submariner",
    barcode: "7610270123456",
    category: "Soatlar",
    price: 95000000,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop",
    description: "Avtomatik, suv o'tkazmaydigan",
    stock: 2,
    createdAt: "2024-11-10",
    availableFor: { merchants: ["Mediapark"], fillials: ["Chilonzor filiali"] },
  },
  {
    id: 4,
    name: "Apple Watch Series 9",
    barcode: "0195949123456",
    category: "Soatlar",
    price: 5500000,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop",
    description: "45mm, GPS + Cellular",
    stock: 12,
    createdAt: "2024-11-18",
    availableFor: { merchants: ["Texnomart", "Mediapark"], fillials: ["Sergeli filiali", "Yunusobod filiali"] },
  },
  {
    id: 5,
    name: "Samsung 65\" QLED TV",
    barcode: "8806094234567",
    category: "Elektronika",
    price: 12000000,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
    description: "4K, Smart TV",
    stock: 5,
    createdAt: "2024-11-12",
    availableFor: { merchants: ["Artel", "Mediapark"], fillials: ["Chilonzor filiali", "Yunusobod filiali"] },
  },
  {
    id: 6,
    name: "LG Muzlatgich",
    barcode: "8806098345678",
    category: "Uy texnikasi",
    price: 7500000,
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop",
    description: "Side-by-side, 600L",
    stock: 7,
    createdAt: "2024-11-08",
    availableFor: { merchants: ["Artel", "Mediapark"], fillials: ["Yunusobod filiali", "Sergeli filiali"] },
  },
  {
    id: 7,
    name: "MacBook Pro 14\"",
    barcode: "0195949456789",
    category: "Kompyuter texnikasi",
    price: 25000000,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    description: "M3 Pro, 18GB RAM, 512GB SSD",
    stock: 4,
    createdAt: "2024-11-22",
    availableFor: { merchants: ["Texnomart", "Mediapark", "Artel"], fillials: ["Chilonzor filiali", "Yunusobod filiali", "Sergeli filiali"] },
  },
  {
    id: 8,
    name: "Divan \"Lux\"",
    barcode: "4607156567890",
    category: "Mebel",
    price: 4500000,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    description: "3 kishilik, teri",
    stock: 3,
    createdAt: "2024-11-05",
    availableFor: { merchants: ["Texnomart"], fillials: ["Chilonzor filiali"] },
  },
  {
    id: 9,
    name: "Sony Wireless Headphones",
    barcode: "4548736123456",
    category: "Elektronika",
    price: 2500000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    description: "Noise Cancelling, Bluetooth",
    stock: 20,
    createdAt: "2024-11-25",
    availableFor: { merchants: ["Texnomart", "Mediapark"], fillials: ["Chilonzor filiali", "Yunusobod filiali", "Sergeli filiali"] },
  },
  {
    id: 10,
    name: "Kir yuvish mashinasi Bosch",
    barcode: "4242002987654",
    category: "Uy texnikasi",
    price: 5500000,
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=400&fit=crop",
    description: "8kg, A++ energiya sinfi",
    stock: 6,
    createdAt: "2024-11-14",
    availableFor: { merchants: ["Artel", "Mediapark"], fillials: ["Yunusobod filiali", "Sergeli filiali"] },
  },
  {
    id: 11,
    name: "iPad Air",
    barcode: "0194252123456",
    category: "Kompyuter texnikasi",
    price: 7500000,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    description: "64GB, Wi-Fi, 10.9\"",
    stock: 10,
    createdAt: "2024-11-16",
    availableFor: { merchants: ["Texnomart", "Artel"], fillials: ["Chilonzor filiali", "Yunusobod filiali"] },
  },
  {
    id: 12,
    name: "Chandon soati",
    barcode: "6901234567890",
    category: "Soatlar",
    price: 1200000,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop",
    description: "Klassik dizayn, teri kayish",
    stock: 25,
    createdAt: "2024-11-19",
    availableFor: { merchants: ["Texnomart", "Mediapark"], fillials: ["Chilonzor filiali", "Sergeli filiali"] },
  },
  {
    id: 13,
    name: "LG Muzlatgich",
    barcode: "8806098765432",
    category: "Uy texnikasi",
    price: 6800000,
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop",
    description: "No Frost, 350L",
    stock: 8,
    createdAt: "2024-11-20",
    availableFor: { merchants: ["Artel", "Mediapark"], fillials: ["Yunusobod filiali", "Sergeli filiali"] },
  },
  {
    id: 14,
    name: "Canon EOS 90D",
    barcode: "4549292134567",
    category: "Elektronika",
    price: 12000000,
    image: "https://images.unsplash.com/photo-1606980707009-6e57e1dabd89?w=400&h=400&fit=crop",
    description: "32.5MP, DSLR",
    stock: 5,
    createdAt: "2024-11-21",
    availableFor: { merchants: ["Texnomart"], fillials: ["Chilonzor filiali"] },
  },
  {
    id: 15,
    name: "PlayStation 5",
    barcode: "0711719825432",
    category: "Elektronika",
    price: 9500000,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop",
    description: "825GB SSD, 2 ta joystik",
    stock: 12,
    createdAt: "2024-11-22",
    availableFor: { merchants: ["Texnomart", "Mediapark", "Artel"], fillials: ["Chilonzor filiali", "Yunusobod filiali"] },
  },
  {
    id: 16,
    name: "Nike Air Max",
    barcode: "0887224598765",
    category: "Elektronika",
    price: 1500000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    description: "42 razmer, Original",
    stock: 20,
    createdAt: "2024-11-23",
    availableFor: { merchants: ["Mediapark"], fillials: ["Sergeli filiali"] },
  },
  {
    id: 17,
    name: "Dyson V15",
    barcode: "5025155098765",
    category: "Uy texnikasi",
    price: 4500000,
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=400&fit=crop",
    description: "Simsiz changyutgich",
    stock: 7,
    createdAt: "2024-11-24",
    availableFor: { merchants: ["Texnomart", "Artel"], fillials: ["Chilonzor filiali", "Yunusobod filiali"] },
  },
  {
    id: 18,
    name: "JBL Flip 6",
    barcode: "6925281987654",
    category: "Elektronika",
    price: 850000,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    description: "Bluetooth kolonka, suv o'tkazmaydi",
    stock: 30,
    createdAt: "2024-11-25",
    availableFor: { merchants: ["Texnomart", "Mediapark"], fillials: ["Chilonzor filiali", "Yunusobod filiali", "Sergeli filiali"] },
  },
  {
    id: 19,
    name: "Xiaomi Mi Band 8",
    barcode: "6934177798765",
    category: "Soatlar",
    price: 450000,
    image: "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=400&h=400&fit=crop",
    description: "Fitness tracker, AMOLED",
    stock: 50,
    createdAt: "2024-11-26",
    availableFor: { merchants: ["Texnomart", "Mediapark", "Artel"], fillials: ["Chilonzor filiali", "Yunusobod filiali"] },
  },
  {
    id: 20,
    name: "Tefal Air Fryer",
    barcode: "3045386598765",
    category: "Uy texnikasi",
    price: 1800000,
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop",
    description: "4.2L, yog'siz qovurish",
    stock: 15,
    createdAt: "2024-11-27",
    availableFor: { merchants: ["Artel"], fillials: ["Sergeli filiali"] },
  },
  {
    id: 21,
    name: "Dell XPS 13",
    barcode: "8843854398765",
    category: "Kompyuter texnikasi",
    price: 18000000,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop",
    description: "i7, 16GB RAM, 512GB SSD",
    stock: 4,
    createdAt: "2024-11-28",
    availableFor: { merchants: ["Texnomart"], fillials: ["Chilonzor filiali"] },
  },
  {
    id: 22,
    name: "Samsung QLED 65\"",
    barcode: "8806092098765",
    category: "Elektronika",
    price: 22000000,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
    description: "4K, Smart TV, HDR",
    stock: 6,
    createdAt: "2024-11-29",
    availableFor: { merchants: ["Texnomart", "Mediapark"], fillials: ["Chilonzor filiali", "Yunusobod filiali"] },
  },
  {
    id: 23,
    name: "Rolex Submariner",
    barcode: "7612345098765",
    category: "Soatlar",
    price: 35000000,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop",
    description: "Automatic, suv o'tkazmaydi",
    stock: 2,
    createdAt: "2024-11-30",
    availableFor: { merchants: ["Mediapark"], fillials: ["Yunusobod filiali"] },
  },
  {
    id: 24,
    name: "Philips Hue Lampa",
    barcode: "8718696598765",
    category: "Elektronika",
    price: 350000,
    image: "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400&h=400&fit=crop",
    description: "Smart LED, RGB",
    stock: 40,
    createdAt: "2024-12-01",
    availableFor: { merchants: ["Texnomart", "Artel"], fillials: ["Chilonzor filiali", "Sergeli filiali"] },
  },
  {
    id: 25,
    name: "Nespresso Coffee Machine",
    barcode: "7630039598765",
    category: "Uy texnikasi",
    price: 2500000,
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop",
    description: "Kapsula kofe mashinasi",
    stock: 10,
    createdAt: "2024-12-02",
    availableFor: { merchants: ["Mediapark", "Artel"], fillials: ["Yunusobod filiali", "Sergeli filiali"] },
  },
  {
    id: 26,
    name: "GoPro Hero 12",
    barcode: "8185589098765",
    category: "Elektronika",
    price: 5500000,
    image: "https://images.unsplash.com/photo-1606503825485-306281a5643d?w=400&h=400&fit=crop",
    description: "5.3K video, suv o'tkazmaydi",
    stock: 8,
    createdAt: "2024-12-03",
    availableFor: { merchants: ["Texnomart"], fillials: ["Chilonzor filiali"] },
  },
  {
    id: 27,
    name: "Logitech MX Master 3",
    barcode: "0971035398765",
    category: "Kompyuter texnikasi",
    price: 950000,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
    description: "Simsiz sichqoncha",
    stock: 25,
    createdAt: "2024-12-04",
    availableFor: { merchants: ["Texnomart", "Mediapark"], fillials: ["Chilonzor filiali", "Yunusobod filiali"] },
  },
  {
    id: 28,
    name: "Kindle Paperwhite",
    barcode: "8471504398765",
    category: "Elektronika",
    price: 1800000,
    image: "https://images.unsplash.com/photo-1592422746551-d98d1f81de42?w=400&h=400&fit=crop",
    description: "E-reader, suv o'tkazmaydi",
    stock: 18,
    createdAt: "2024-12-05",
    availableFor: { merchants: ["Mediapark"], fillials: ["Sergeli filiali"] },
  },
  {
    id: 29,
    name: "Bose QuietComfort 45",
    barcode: "1718743598765",
    category: "Elektronika",
    price: 3500000,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop",
    description: "Noise canceling naushnik",
    stock: 12,
    createdAt: "2024-12-05",
    availableFor: { merchants: ["Texnomart", "Artel"], fillials: ["Chilonzor filiali", "Yunusobod filiali"] },
  },
  {
    id: 30,
    name: "Xiaomi Robot Vacuum",
    barcode: "6934177808765",
    category: "Uy texnikasi",
    price: 3200000,
    image: "https://images.unsplash.com/photo-1563968743333-044cef800494?w=400&h=400&fit=crop",
    description: "Robot changyutgich, LiDAR",
    stock: 9,
    createdAt: "2024-12-06",
    availableFor: { merchants: ["Texnomart", "Mediapark", "Artel"], fillials: ["Chilonzor filiali", "Yunusobod filiali", "Sergeli filiali"] },
  },
];

type TabType = "products" | "categories";

export default function Products() {
  const [activeTab, setActiveTab] = useState<TabType>("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  
  // API State
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data from API
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await productApi.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setToast({ isOpen: true, message: "Kategoriyalarni yuklashda xatolik", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      setToast({ isOpen: true, message: "Mahsulotlarni yuklashda xatolik", type: "error" });
    } finally {
      setLoading(false);
    }
  };
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMerchants, setImportMerchants] = useState<string[]>([]);
  const [importFillials, setImportFillials] = useState<string[]>([]);
  const [importMerchantSearch, setImportMerchantSearch] = useState("");
  const [importFilialSearch, setImportFilialSearch] = useState("");
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [showProductsListModal, setShowProductsListModal] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: "", type: "success" as "main" | "success" | "error" });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: "product" | "category" | null; id: number | null; name: string }>({ 
    isOpen: false, 
    type: null, 
    id: null, 
    name: "" 
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Product form
  const [productForm, setProductForm] = useState({
    name: "",
    barcode: "",
    category: "",
    price: "",
    image: "",
    description: "",
  });
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [selectedFillials, setSelectedFillials] = useState<string[]>([]);
  const [merchantSearch, setMerchantSearch] = useState("");
  const [filialSearch, setFilialSearch] = useState("");

  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [selectedCategoryMerchants, setSelectedCategoryMerchants] = useState<string[]>([]);
  const [selectedCategoryFillials, setSelectedCategoryFillials] = useState<string[]>([]);
  const [categoryMerchantSearch, setCategoryMerchantSearch] = useState("");
  const [categoryFilialSearch, setCategoryFilialSearch] = useState("");

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category?.name === selectedCategory || String(p.category_id) === selectedCategory);
    }

    if (priceRange !== "all") {
      if (priceRange === "0-5") {
        filtered = filtered.filter((p) => p.price >= 0 && p.price < 5000000);
      } else if (priceRange === "5-10") {
        filtered = filtered.filter((p) => p.price >= 5000000 && p.price < 10000000);
      } else if (priceRange === "10-20") {
        filtered = filtered.filter((p) => p.price >= 10000000 && p.price < 20000000);
      } else if (priceRange === "20+") {
        filtered = filtered.filter((p) => p.price >= 20000000);
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.barcode.includes(query) ||
          (p.category?.name || "").toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, priceRange, searchQuery]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  // Handle product form submit
  const handleProductSubmit = () => {
    if (!productForm.name || !productForm.barcode || !productForm.category || !productForm.price) {
      setToast({ isOpen: true, message: "Iltimos barcha majburiy maydonlarni to'ldiring", type: "error" });
      return;
    }

    if (editingProduct) {
      // Update existing product
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: productForm.name,
                barcode: productForm.barcode,
                category: productForm.category,
                price: parseFloat(productForm.price),
                image: productForm.image,
                description: productForm.description,
                availableFor: {
                  merchants: selectedMerchants,
                  fillials: selectedFillials,
                },
              }
            : p
        )
      );
    } else {
      // Add new product
      const newProduct: Product = {
        id: Math.max(...products.map((p) => p.id)) + 1,
        name: productForm.name,
        barcode: productForm.barcode,
        category: productForm.category,
        price: parseFloat(productForm.price),
        image: productForm.image,
        description: productForm.description,
        createdAt: new Date().toISOString().split("T")[0],
        availableFor: {
          merchants: selectedMerchants,
          fillials: selectedFillials,
        },
      };
      setProducts([...products, newProduct]);
    }

    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm({
      name: "",
      barcode: "",
      category: "",
      price: "",
      image: "",
      description: "",
    });
    setSelectedMerchants([]);
    setSelectedFillials([]);
  };

  // Handle category form submit
  const handleCategorySubmit = () => {
    if (!categoryForm.name) {
      setToast({ isOpen: true, message: "Kategoriya nomini kiriting", type: "error" });
      return;
    }

    if (editingCategory) {
      // Update existing category
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: categoryForm.name,
                description: categoryForm.description,
                image: categoryForm.image,
                availableFor: {
                  merchants: selectedCategoryMerchants,
                  fillials: selectedCategoryFillials,
                },
              }
            : c
        )
      );
    } else {
      // Add new category
      const newCategory: Category = {
        id: Math.max(...categories.map((c) => c.id)) + 1,
        name: categoryForm.name,
        description: categoryForm.description,
        productCount: 0,
        image: categoryForm.image,
        availableFor: {
          merchants: selectedCategoryMerchants,
          fillials: selectedCategoryFillials,
        },
      };
      setCategories([...categories, newCategory]);
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "", image: "" });
    setSelectedCategoryMerchants([]);
    setSelectedCategoryFillials([]);
  };

  // Delete product
  const handleDeleteProduct = (id: number) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setDeleteConfirm({ isOpen: true, type: "product", id, name: product.name });
    }
  };

  // Confirm delete
  const confirmDelete = () => {
    if (deleteConfirm.type === "product" && deleteConfirm.id) {
      setProducts(products.filter((p) => p.id !== deleteConfirm.id));
      setToast({ isOpen: true, message: "Mahsulot muvaffaqiyatli o'chirildi", type: "success" });
    } else if (deleteConfirm.type === "category" && deleteConfirm.id) {
      setCategories(categories.filter((c) => c.id !== deleteConfirm.id));
      setToast({ isOpen: true, message: "Kategoriya muvaffaqiyatli o'chirildi", type: "success" });
    }
    setDeleteConfirm({ isOpen: false, type: null, id: null, name: "" });
  };

  // Delete category
  const handleDeleteCategory = (id: number) => {
    const category = categories.find((c) => c.id === id);
    if (category && category.productCount > 0) {
      setToast({ isOpen: true, message: "Bu kategoriyada mahsulotlar mavjud. Avval mahsulotlarni o'chiring.", type: "error" });
      return;
    }
    if (category) {
      setDeleteConfirm({ isOpen: true, type: "category", id, name: category.name });
    }
  };

  // Edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      price: product.price.toString(),
      image: product.image || "",
      description: product.description || "",
    });
    setSelectedMerchants(product.availableFor.merchants);
    setSelectedFillials(product.availableFor.fillials);
    setShowProductModal(true);
  };

  // Edit category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      image: category.image || "",
    });
    setSelectedCategoryMerchants(category.availableFor.merchants);
    setSelectedCategoryFillials(category.availableFor.fillials);
    setShowCategoryModal(true);
  };

  // Import from Excel - Step 1: Select file and preview
  const handleImportExcelClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        setImportFile(file);
        
        // For demo: automatically load demo data
        const demoImportData = [
          { "Nomi": "Samsung Galaxy A54", "Shtrix kod": "8801643112233", "Kategoriya": "Elektronika", "Narx": "4500000", "Tavsif": "5G, 128GB, 6GB RAM" },
          { "Nomi": "Artel TV 43\"", "Shtrix kod": "4820285123456", "Kategoriya": "Elektronika", "Narx": "3200000", "Tavsif": "Smart TV, Full HD" },
          { "Nomi": "LG Konditsioner", "Shtrix kod": "8806098123456", "Kategoriya": "Uy texnikasi", "Narx": "5500000", "Tavsif": "Inverter, 12000 BTU" },
          { "Nomi": "Apple AirPods Pro", "Shtrix kod": "0194252234567", "Kategoriya": "Elektronika", "Narx": "2800000", "Tavsif": "Noise canceling" },
          { "Nomi": "Bosch Elektr choynak", "Shtrix kod": "4242002345678", "Kategoriya": "Uy texnikasi", "Narx": "450000", "Tavsif": "1.7L, 2200W" },
          { "Nomi": "HP LaserJet Printer", "Shtrix kod": "0190781456789", "Kategoriya": "Kompyuter texnikasi", "Narx": "3500000", "Tavsif": "Wi-Fi, duplex" },
          { "Nomi": "Sony WH-1000XM5", "Shtrix kod": "4548736567890", "Kategoriya": "Elektronika", "Narx": "4200000", "Tavsif": "Premium naushnik" },
          { "Nomi": "Xiaomi Redmi Note 13", "Shtrix kod": "6934177678901", "Kategoriya": "Elektronika", "Narx": "2900000", "Tavsif": "128GB, 8GB RAM" },
          { "Nomi": "Tefal Blender", "Shtrix kod": "3045386789012", "Kategoriya": "Uy texnikasi", "Narx": "850000", "Tavsif": "600W, 1.5L" },
          { "Nomi": "Logitech Webcam C920", "Shtrix kod": "0971035890123", "Kategoriya": "Kompyuter texnikasi", "Narx": "950000", "Tavsif": "Full HD 1080p" },
          { "Nomi": "Samsung Galaxy Watch 6", "Shtrix kod": "8806094901234", "Kategoriya": "Soatlar", "Narx": "3200000", "Tavsif": "44mm, GPS, LTE" },
          { "Nomi": "Dyson Hair Dryer", "Shtrix kod": "5025155012345", "Kategoriya": "Uy texnikasi", "Narx": "4500000", "Tavsif": "Supersonic, tez qurituvchi" },
          { "Nomi": "Canon Pixma Printer", "Shtrix kod": "4549292123456", "Kategoriya": "Kompyuter texnikasi", "Narx": "1200000", "Tavsif": "Print, scan, copy" },
          { "Nomi": "JBL Charge 5", "Shtrix kod": "6925281234567", "Kategoriya": "Elektronika", "Narx": "1450000", "Tavsif": "Bluetooth speaker, IP67" },
          { "Nomi": "Philips Air Purifier", "Shtrix kod": "8718696345678", "Kategoriya": "Uy texnikasi", "Narx": "2800000", "Tavsif": "HEPA filter, 60m²" },
          { "Nomi": "Asus ROG Gaming Mouse", "Shtrix kod": "4711081456789", "Kategoriya": "Kompyuter texnikasi", "Narx": "650000", "Tavsif": "RGB, 12000 DPI" },
          { "Nomi": "Xiaomi Smart Band 8", "Shtrix kod": "6934177567890", "Kategoriya": "Soatlar", "Narx": "420000", "Tavsif": "AMOLED, fitness tracker" },
          { "Nomi": "Artel Microwave 20L", "Shtrix kod": "4820285678901", "Kategoriya": "Uy texnikasi", "Narx": "950000", "Tavsif": "700W, Digital" },
          { "Nomi": "Kingston USB Flash 128GB", "Shtrix kod": "0740617789012", "Kategoriya": "Kompyuter texnikasi", "Narx": "180000", "Tavsif": "USB 3.2, 100MB/s" },
          { "Nomi": "Sony PlayStation Portal", "Shtrix kod": "0711719890123", "Kategoriya": "Elektronika", "Narx": "2500000", "Tavsif": "Remote player" },
          { "Nomi": "Braun Electric Shaver", "Shtrix kod": "4210201901234", "Kategoriya": "Elektronika", "Narx": "1850000", "Tavsif": "Series 9, wet/dry" },
          { "Nomi": "TP-Link WiFi Router", "Shtrix kod": "6935364012345", "Kategoriya": "Kompyuter texnikasi", "Narx": "550000", "Tavsif": "AC1200, dual band" },
          { "Nomi": "Xiaomi Mi Robot Mop", "Shtrix kod": "6934177123456", "Kategoriya": "Uy texnikasi", "Narx": "2200000", "Tavsif": "Smart mop, app control" },
          { "Nomi": "Fossil Smartwatch", "Shtrix kod": "4053858234567", "Kategoriya": "Soatlar", "Narx": "2800000", "Tavsif": "Wear OS, GPS" },
          { "Nomi": "Philips Iron", "Shtrix kod": "8718696345679", "Kategoriya": "Uy texnikasi", "Narx": "380000", "Tavsif": "Steam, ceramic" },
          { "Nomi": "Lenovo Bluetooth Keyboard", "Shtrix kod": "0195891456780", "Kategoriya": "Kompyuter texnikasi", "Narx": "420000", "Tavsif": "Wireless, slim" },
          { "Nomi": "Samsung Galaxy Buds 2", "Shtrix kod": "8806094567891", "Kategoriya": "Elektronika", "Narx": "1200000", "Tavsif": "ANC, wireless charging" },
          { "Nomi": "Tefal Multicooker", "Shtrix kod": "3045386678902", "Kategoriya": "Uy texnikasi", "Narx": "1650000", "Tavsif": "6L, 45 programs" },
          { "Nomi": "Western Digital HDD 2TB", "Shtrix kod": "0718037789013", "Kategoriya": "Kompyuter texnikasi", "Narx": "950000", "Tavsif": "External, USB 3.0" },
          { "Nomi": "Casio Digital Watch", "Shtrix kod": "4549526890124", "Kategoriya": "Soatlar", "Narx": "280000", "Tavsif": "Water resistant, alarm" },
          { "Nomi": "Bosch Food Processor", "Shtrix kod": "4242002901235", "Kategoriya": "Uy texnikasi", "Narx": "2100000", "Tavsif": "800W, multifunctional" },
          { "Nomi": "Razer Gaming Headset", "Shtrix kod": "8886419012346", "Kategoriya": "Elektronika", "Narx": "1850000", "Tavsif": "7.1 surround, RGB" },
          { "Nomi": "Seagate SSD 1TB", "Shtrix kod": "0763649123457", "Kategoriya": "Kompyuter texnikasi", "Narx": "1450000", "Tavsif": "External, 1000MB/s" },
          { "Nomi": "LG Soundbar", "Shtrix kod": "8806098234568", "Kategoriya": "Elektronika", "Narx": "3500000", "Tavsif": "5.1 channel, Dolby Atmos" },
          { "Nomi": "Xiaomi Smart Scale", "Shtrix kod": "6934177345679", "Kategoriya": "Elektronika", "Narx": "320000", "Tavsif": "Body composition, app" },
          { "Nomi": "Artel Toaster", "Shtrix kod": "4820285456780", "Kategoriya": "Uy texnikasi", "Narx": "280000", "Tavsif": "2 slice, 7 levels" },
          { "Nomi": "Anker Power Bank 20000mAh", "Shtrix kod": "0848061567891", "Kategoriya": "Elektronika", "Narx": "450000", "Tavsif": "Fast charging, USB-C" },
          { "Nomi": "Microsoft Wireless Mouse", "Shtrix kod": "0889842678902", "Kategoriya": "Kompyuter texnikasi", "Narx": "280000", "Tavsif": "Bluetooth, ergonomic" },
          { "Nomi": "Garmin Fitness Watch", "Shtrix kod": "0753759789013", "Kategoriya": "Soatlar", "Narx": "4200000", "Tavsif": "GPS, heart rate" },
          { "Nomi": "Philips Electric Toothbrush", "Shtrix kod": "8718696890124", "Kategoriya": "Elektronika", "Narx": "850000", "Tavsif": "Sonic, 2 modes" },
          { "Nomi": "Asus Laptop Backpack", "Shtrix kod": "4711081901235", "Kategoriya": "Kompyuter texnikasi", "Narx": "350000", "Tavsif": "15.6\", waterproof" },
          { "Nomi": "Samsung Microwave 23L", "Shtrix kod": "8806094012346", "Kategoriya": "Uy texnikasi", "Narx": "1250000", "Tavsif": "Solo, 800W" },
          { "Nomi": "Xiaomi Mi Speaker", "Shtrix kod": "6934177123457", "Kategoriya": "Elektronika", "Narx": "650000", "Tavsif": "Bluetooth 5.0, 16W" },
          { "Nomi": "Logitech Wireless Keyboard", "Shtrix kod": "0971035234568", "Kategoriya": "Kompyuter texnikasi", "Narx": "550000", "Tavsif": "Silent keys, 3 year battery" },
          { "Nomi": "Apple Watch SE", "Shtrix kod": "0194252345679", "Kategoriya": "Soatlar", "Narx": "4500000", "Tavsif": "GPS, 40mm, health features" },
          { "Nomi": "Tefal Electric Grill", "Shtrix kod": "3045386456780", "Kategoriya": "Uy texnikasi", "Narx": "1450000", "Tavsif": "2000W, non-stick" },
          { "Nomi": "Sony Bluetooth Speaker", "Shtrix kod": "4548736567891", "Kategoriya": "Elektronika", "Narx": "1850000", "Tavsif": "Extra bass, 24h battery" },
          { "Nomi": "SanDisk Memory Card 256GB", "Shtrix kod": "0619659678902", "Kategoriya": "Kompyuter texnikasi", "Narx": "320000", "Tavsif": "MicroSD, UHS-I" },
          { "Nomi": "LG Vacuum Cleaner", "Shtrix kod": "8806098789013", "Kategoriya": "Uy texnikasi", "Narx": "2800000", "Tavsif": "Bagless, 2000W" },
          { "Nomi": "Huawei Smart Band 7", "Shtrix kod": "6942103890124", "Kategoriya": "Soatlar", "Narx": "380000", "Tavsif": "1.47\" AMOLED, SpO2" },
          { "Nomi": "Beko Refrigerator 300L", "Shtrix kod": "8690842901235", "Kategoriya": "Uy texnikasi", "Narx": "5500000", "Tavsif": "No Frost, A++ energy" },
          { "Nomi": "Xiaomi Mi Box S", "Shtrix kod": "6934177012346", "Kategoriya": "Elektronika", "Narx": "850000", "Tavsif": "4K HDR, Android TV" },
          { "Nomi": "Corsair Gaming RAM 16GB", "Shtrix kod": "0843591123457", "Kategoriya": "Kompyuter texnikasi", "Narx": "950000", "Tavsif": "DDR4, 3200MHz, RGB" },
          { "Nomi": "Artel Washing Machine 7kg", "Shtrix kod": "4820285234568", "Kategoriya": "Uy texnikasi", "Narx": "4200000", "Tavsif": "Front load, A++" },
          { "Nomi": "Beats Studio Buds", "Shtrix kod": "0194252345680", "Kategoriya": "Elektronika", "Narx": "1650000", "Tavsif": "ANC, wireless" },
          { "Nomi": "Dell Wireless Mouse", "Shtrix kod": "8843854456791", "Kategoriya": "Kompyuter texnikasi", "Narx": "320000", "Tavsif": "Compact, 3 buttons" },
          { "Nomi": "Citizen Eco-Drive Watch", "Shtrix kod": "4974375567802", "Kategoriya": "Soatlar", "Narx": "3500000", "Tavsif": "Solar powered, sapphire" },
        ];
        
        setImportPreview(demoImportData);
        setShowImportModal(true);
      }
    };
    input.click();
  };

  // Import from Excel - Step 2: Process with selected merchants/fillials
  const handleImportSubmit = () => {
    if (!importPreview || importPreview.length === 0) return;

    try {
      // For demo: use preview data directly
      const importedProducts: Product[] = importPreview.map((row, index) => ({
        id: Math.max(...products.map((p) => p.id), 0) + index + 1,
        name: row["Nomi"] || row["name"] || "",
        barcode: row["Shtrix kod"] || row["barcode"] || "",
        category: row["Kategoriya"] || row["category"] || "",
        price: parseFloat(row["Narx"] || row["price"] || "0"),
        description: row["Tavsif"] || row["description"] || "",
        stock: 10, // Default stock for demo
        image: "", // Demo mode: no images
        createdAt: new Date().toISOString().split("T")[0],
        availableFor: {
          merchants: importMerchants.length > 0 ? importMerchants : ["Texnomart"],
          fillials: importFillials.length > 0 ? importFillials : ["Chilonzor filiali"],
        },
      }));

      setProducts([...products, ...importedProducts]);
      setToast({ isOpen: true, message: `Demo: ${importedProducts.length} ta mahsulot muvaffaqiyatli qo'shildi!`, type: "success" });
      setShowImportModal(false);
      setImportFile(null);
      setImportMerchants([]);
      setImportFillials([]);
      setImportPreview([]);
      setShowProductsListModal(false);
    } catch (error) {
      console.error("Import error:", error);
      setToast({ isOpen: true, message: "Import qilishda xatolik yuz berdi", type: "error" });
    }
  };

  return (
    <div className="mt-3">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Mahsulotlar</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Mahsulotlar va kategoriyalarni boshqarish
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleImportExcelClick}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-700"
          >
            <Upload size={18} />
            Excel dan import
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Card extra="!p-5">
        <div className="mb-5 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "products"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Package size={18} />
            Mahsulotlar ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "categories"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Tag size={18} />
            Kategoriyalar ({categories.length})
          </button>
        </div>

        {activeTab === "products" ? (
          <>
            {/* Filters */}
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Qidiruv (nom, shtrix kod)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-navy-800 dark:text-white"
                />
              </div>
              <CustomSelect
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Kategoriya"
                options={[
                  { value: "all", label: "Barcha kategoriyalar" },
                  ...categories.map((c) => ({ value: c.name, label: c.name })),
                ]}
                className="min-w-[200px]"
              />
              <CustomSelect
                value={priceRange}
                onChange={setPriceRange}
                placeholder="Narx oralig'i"
                options={[
                  { value: "all", label: "Barcha narxlar" },
                  { value: "0-5", label: "0 - 5 mln" },
                  { value: "5-10", label: "5 - 10 mln" },
                  { value: "10-20", label: "10 - 20 mln" },
                  { value: "20+", label: "20 mln+" },
                ]}
                className="min-w-[180px]"
              />
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: "",
                    barcode: "",
                    category: "",
                    price: "",
                    image: "",
                    description: "",
                  });
                  setSelectedMerchants([]);
                  setSelectedFillials([]);
                  setShowProductModal(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 whitespace-nowrap"
              >
                <Plus size={18} />
                Mahsulot qo'shish
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} extra="!p-4 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col h-full">
                    {/* Product Image */}
                    <div className="mb-3 flex h-48 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-navy-700">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package size={64} className="text-gray-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-navy-700 dark:text-white">{product.name}</h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Shtrix:</span> {product.barcode}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Kategoriya:</span> {product.category}
                      </p>
                      {product.description && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{product.description}</p>
                      )}
                      <p className="mt-2 text-lg font-bold text-brand-500">{formatCurrency(product.price)}</p>
                      
                      {/* Availability Info */}
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Mavjudligi:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.availableFor.merchants.slice(0, 2).map((merchant, idx) => (
                            <span key={idx} className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                              {merchant}
                            </span>
                          ))}
                          {product.availableFor.merchants.length > 2 && (
                            <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                              +{product.availableFor.merchants.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-700"
                      >
                        <Edit size={16} />
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center justify-center rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-600 dark:bg-navy-800 dark:hover:bg-red-900/20"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-12 text-center">
                <Package size={64} className="mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">Mahsulotlar topilmadi</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Categories */}
            <div className="mb-5 flex justify-end">
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: "", description: "", image: "" });
                  setShowCategoryModal(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                <Plus size={18} />
                Kategoriya qo'shish
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id} extra="!p-5 hover:shadow-lg transition-shadow">
                  {/* Category Image */}
                  {category.image && (
                    <div className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-navy-700">
                      <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-navy-700 dark:text-white">{category.name}</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                      <p className="mt-3 text-sm font-medium text-brand-500">
                        {category.productCount} ta mahsulot
                      </p>
                      
                      {/* Availability badges */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Mavjud:</p>
                        <div className="flex flex-wrap gap-1">
                          {category.availableFor.merchants.map((merchant, idx) => (
                            <span key={idx} className="inline-block px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
                              {merchant}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-700"
                    >
                      <Edit size={16} />
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="flex items-center justify-center rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-600 dark:bg-navy-800 dark:hover:bg-red-900/20"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 dark:bg-navy-800">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                {editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
              </h2>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                  placeholder="Samsung Galaxy S23"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Shtrix kod <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productForm.barcode}
                  onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                  placeholder="8801643891234"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kategoriya <span className="text-red-500">*</span>
                </label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">Tanlang</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Narx (so'm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                  placeholder="8500000"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rasm URL
                </label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Merchantlar ({selectedMerchants.length}/{MOCK_MERCHANTS.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMerchants.length === MOCK_MERCHANTS.length) {
                        setSelectedMerchants([]);
                      } else {
                        setSelectedMerchants(MOCK_MERCHANTS);
                      }
                    }}
                    className="text-xs font-medium text-brand-500 hover:text-brand-600"
                  >
                    {selectedMerchants.length === MOCK_MERCHANTS.length ? "Hammasini olib tashlash" : "Hammasini tanlash"}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={merchantSearch}
                  onChange={(e) => setMerchantSearch(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                />
                <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-navy-700">
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_MERCHANTS.filter(m => m.toLowerCase().includes(merchantSearch.toLowerCase())).map((merchant) => (
                      <button
                        key={merchant}
                        type="button"
                        onClick={() => {
                          if (selectedMerchants.includes(merchant)) {
                            setSelectedMerchants(selectedMerchants.filter(m => m !== merchant));
                          } else {
                            setSelectedMerchants([...selectedMerchants, merchant]);
                          }
                        }}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          selectedMerchants.includes(merchant)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {merchant}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filiallar ({selectedFillials.length}/{MOCK_FILLIALS.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedFillials.length === MOCK_FILLIALS.length) {
                        setSelectedFillials([]);
                      } else {
                        setSelectedFillials(MOCK_FILLIALS);
                      }
                    }}
                    className="text-xs font-medium text-brand-500 hover:text-brand-600"
                  >
                    {selectedFillials.length === MOCK_FILLIALS.length ? "Hammasini olib tashlash" : "Hammasini tanlash"}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={filialSearch}
                  onChange={(e) => setFilialSearch(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                />
                <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-navy-700">
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_FILLIALS.filter(f => f.toLowerCase().includes(filialSearch.toLowerCase())).map((filial) => (
                      <button
                        key={filial}
                        type="button"
                        onClick={() => {
                          if (selectedFillials.includes(filial)) {
                            setSelectedFillials(selectedFillials.filter(f => f !== filial));
                          } else {
                            setSelectedFillials([...selectedFillials, filial]);
                          }
                        }}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          selectedFillials.includes(filial)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {filial}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tavsif
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                  placeholder="128GB, 8GB RAM"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleProductSubmit}
                className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                {editingProduct ? "Saqlash" : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-navy-800">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                {editingCategory ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
              </h2>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                  placeholder="Elektronika"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tavsif
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                  placeholder="Telefon, televizor va boshqa elektronika"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rasm URL
                </label>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                  placeholder="https://example.com/category.jpg"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Merchantlar ({selectedCategoryMerchants.length}/{MOCK_MERCHANTS.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCategoryMerchants.length === MOCK_MERCHANTS.length) {
                        setSelectedCategoryMerchants([]);
                      } else {
                        setSelectedCategoryMerchants(MOCK_MERCHANTS);
                      }
                    }}
                    className="text-xs font-medium text-brand-500 hover:text-brand-600"
                  >
                    {selectedCategoryMerchants.length === MOCK_MERCHANTS.length ? "Hammasini olib tashlash" : "Hammasini tanlash"}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={categoryMerchantSearch}
                  onChange={(e) => setCategoryMerchantSearch(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                />
                <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-navy-700">
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_MERCHANTS.filter(m => m.toLowerCase().includes(categoryMerchantSearch.toLowerCase())).map((merchant) => (
                      <button
                        key={merchant}
                        type="button"
                        onClick={() => {
                          if (selectedCategoryMerchants.includes(merchant)) {
                            setSelectedCategoryMerchants(selectedCategoryMerchants.filter(m => m !== merchant));
                          } else {
                            setSelectedCategoryMerchants([...selectedCategoryMerchants, merchant]);
                          }
                        }}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          selectedCategoryMerchants.includes(merchant)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {merchant}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filiallar ({selectedCategoryFillials.length}/{MOCK_FILLIALS.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCategoryFillials.length === MOCK_FILLIALS.length) {
                        setSelectedCategoryFillials([]);
                      } else {
                        setSelectedCategoryFillials(MOCK_FILLIALS);
                      }
                    }}
                    className="text-xs font-medium text-brand-500 hover:text-brand-600"
                  >
                    {selectedCategoryFillials.length === MOCK_FILLIALS.length ? "Hammasini olib tashlash" : "Hammasini tanlash"}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={categoryFilialSearch}
                  onChange={(e) => setCategoryFilialSearch(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                />
                <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-navy-700">
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_FILLIALS.filter(f => f.toLowerCase().includes(categoryFilialSearch.toLowerCase())).map((filial) => (
                      <button
                        key={filial}
                        type="button"
                        onClick={() => {
                          if (selectedCategoryFillials.includes(filial)) {
                            setSelectedCategoryFillials(selectedCategoryFillials.filter(f => f !== filial));
                          } else {
                            setSelectedCategoryFillials([...selectedCategoryFillials, filial]);
                          }
                        }}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          selectedCategoryFillials.includes(filial)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {filial}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCategorySubmit}
                className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                {editingCategory ? "Saqlash" : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-navy-800">
            <div className="sticky top-0 z-10 bg-white p-6 pb-4 dark:bg-navy-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                    Excel Import - Sozlamalar
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Mahsulotlar qaysi merchant va filiallarda ko'rsatilishini belgilang
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportMerchants([]);
                    setImportFillials([]);
                    setImportMerchantSearch("");
                    setImportFilialSearch("");
                    setImportPreview([]);
                    setShowProductsListModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 pt-4">
              {/* File Info */}
              <div className="mb-6 rounded-lg bg-white p-4 dark:bg-navy-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-500 p-2">
                    <Upload size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {importFile?.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {importPreview.length > 0 ? `${importPreview.length} ta mahsulot topildi` : "Fayl yuklanmoqda..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products Preview Summary */}
              {importPreview.length > 0 && (
                <div className="mb-6 rounded-lg border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                        Mahsulotlar ro'yxati ({importPreview.length} ta)
                      </h3>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                        Import qilinadigan mahsulotlarni ko'rish
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProductsListModal(true)}
                      className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 transition-colors"
                    >
                      Ko'rish
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {/* Merchants Section */}
                <div className="rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Merchantlar</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-brand-500">{importMerchants.length}</span> / {MOCK_MERCHANTS.length} tanlangan
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (importMerchants.length === MOCK_MERCHANTS.length) {
                          setImportMerchants([]);
                        } else {
                          setImportMerchants(MOCK_MERCHANTS);
                        }
                      }}
                      className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400"
                    >
                      {importMerchants.length === MOCK_MERCHANTS.length ? "Tozalash" : "Hammasini tanlash"}
                    </button>
                  </div>
                  <div className="relative mb-3">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Merchant qidirish..."
                      value={importMerchantSearch}
                      onChange={(e) => setImportMerchantSearch(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-navy-900">
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_MERCHANTS.filter(m => m.toLowerCase().includes(importMerchantSearch.toLowerCase())).map((merchant) => (
                      <button
                        key={merchant}
                        type="button"
                        onClick={() => {
                          if (importMerchants.includes(merchant)) {
                            setImportMerchants(importMerchants.filter(m => m !== merchant));
                          } else {
                            setImportMerchants([...importMerchants, merchant]);
                          }
                        }}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          importMerchants.includes(merchant)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {merchant}
                      </button>
                    ))}
                    </div>
                  </div>
                </div>

                {/* Fillials Section */}
                <div className="rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Filiallar</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-green-500">{importFillials.length}</span> / {MOCK_FILLIALS.length} tanlangan
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (importFillials.length === MOCK_FILLIALS.length) {
                          setImportFillials([]);
                        } else {
                          setImportFillials(MOCK_FILLIALS);
                        }
                      }}
                      className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                    >
                      {importFillials.length === MOCK_FILLIALS.length ? "Tozalash" : "Hammasini tanlash"}
                    </button>
                  </div>
                  <div className="relative mb-3">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filial qidirish..."
                      value={importFilialSearch}
                      onChange={(e) => setImportFilialSearch(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-navy-900">
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_FILLIALS.filter(f => f.toLowerCase().includes(importFilialSearch.toLowerCase())).map((filial) => (
                        <button
                          key={filial}
                          type="button"
                          onClick={() => {
                            if (importFillials.includes(filial)) {
                              setImportFillials(importFillials.filter(f => f !== filial));
                            } else {
                              setImportFillials([...importFillials, filial]);
                            }
                          }}
                          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                            importFillials.includes(filial)
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          {filial}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportMerchants([]);
                    setImportFillials([]);
                    setImportMerchantSearch("");
                    setImportFilialSearch("");
                    setImportPreview([]);
                    setShowProductsListModal(false);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleImportSubmit}
                  disabled={importMerchants.length === 0 && importFillials.length === 0}
                  className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products List Modal - Separate Full Modal */}
      {showProductsListModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-navy-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white p-6 dark:bg-navy-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-brand-500 p-2">
                  <Package size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                    Import qilinadigan mahsulotlar
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Jami {importPreview.length} ta mahsulot
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProductsListModal(false)}
                className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Products List */}
            <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {importPreview.map((row, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-purple-400 hover:shadow-md dark:border-gray-700 dark:bg-navy-700"
                  >
                    {/* Number Badge */}
                    <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600 dark:bg-purple-900/50 dark:text-purple-300">
                      {index + 1}
                    </div>

                    {/* Product Info */}
                    <div className="pr-10">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                        {row["Nomi"] || row["name"] || "Nomsiz mahsulot"}
                      </h3>
                      
                      <div className="mb-3 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Shtrix kod:</span>
                          <span className="font-mono text-xs">{row["Shtrix kod"] || row["barcode"] || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Kategoriya:</span>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {row["Kategoriya"] || row["category"] || "Kategoriyasiz"}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 border-t border-gray-200 pt-3 dark:border-gray-600">
                        <span className="text-2xl font-bold text-brand-500">
                          {parseFloat(row["Narx"] || row["price"] || "0").toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">so'm</span>
                      </div>

                      {/* Description if available */}
                      {(row["Tavsif"] || row["description"]) && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {row["Tavsif"] || row["description"]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-navy-900">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ushbu mahsulotlar tanlangan merchant va filiallarda mavjud bo'ladi
                </p>
                <button
                  onClick={() => setShowProductsListModal(false)}
                  className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-navy-800">
            {/* Header */}
            <div className="border-b border-gray-200 bg-red-50 p-6 dark:border-gray-700 dark:bg-red-900/20">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-500 p-2">
                  <Trash size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
                    O'chirishni tasdiqlang
                  </h2>
                  <p className="text-sm text-red-600 dark:text-red-500">
                    Bu amalni qaytarib bo'lmaydi!
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">"{deleteConfirm.name}"</span> {deleteConfirm.type === "product" ? "mahsulotini" : "kategoriyasini"} o'chirishni xohlaysizmi?
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-navy-900">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null, name: "" })}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-700"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
        duration={3000}
      />
    </div>
  );
}
