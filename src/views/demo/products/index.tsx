import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Upload, Package, Tag, Edit, Trash, X, Download } from "tabler-icons-react";
import Card from "components/card";
import CustomSelect from "components/dropdown/CustomSelect";
import Toast from "components/toast/Toast";
import { productApi, Category as ApiCategory, Product as ApiProduct } from "lib/api/product";
import * as XLSX from 'xlsx';

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
  const [merchants, setMerchants] = useState<any[]>([]);
  const [fillials, setFillials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data from API
  useEffect(() => {
    loadCategories();
    loadProducts();
    loadMerchantsAndFillials();
  }, []);

  const loadMerchantsAndFillials = async () => {
    try {
      const [merchantsRes, fillialsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_BASE || "http://localhost:7777/api/v1"}/merchant/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch(`${process.env.REACT_APP_API_BASE || "http://localhost:7777/api/v1"}/fillial/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
      ]);
      
      const merchantsData = await merchantsRes.json();
      const fillialsData = await fillialsRes.json();
      
      // Handle both array and paginated response formats
      setMerchants(Array.isArray(merchantsData) ? merchantsData : merchantsData.items || []);
      setFillials(Array.isArray(fillialsData) ? fillialsData : fillialsData.items || []);
    } catch (error) {
      console.error('Error loading merchants/fillials:', error);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await productApi.getCategories();
      // Ensure we always set an array
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      // Map _count.products to productCount for compatibility
      const mappedCategories = categoriesData.map((cat: any) => ({
        ...cat,
        productCount: cat._count?.products || 0,
      }));
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]); // Set empty array on error
      setToast({ isOpen: true, message: "Kategoriyalarni yuklashda xatolik", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getProducts();
      // Ensure we always set an array
      const productsData = Array.isArray(response.data) ? response.data : [];
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]); // Set empty array on error
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
  const [importMerchants, setImportMerchants] = useState<number[]>([]);
  const [importFillials, setImportFillials] = useState<number[]>([]);
  const [importMerchantSearch, setImportMerchantSearch] = useState("");
  const [importFilialSearch, setImportFilialSearch] = useState("");
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importCategory, setImportCategory] = useState<number | null>(null);

  // Toggle import merchant and auto-select/deselect its fillials
  const toggleImportMerchant = (merchantId: number) => {
    const isSelected = importMerchants.includes(merchantId);
    
    if (isSelected) {
      // Deselect merchant
      setImportMerchants(importMerchants.filter(m => m !== merchantId));
      // Deselect all fillials belonging to this merchant
      const merchantFillials = fillials.filter(f => f.merchant_id === merchantId).map(f => f.id);
      setImportFillials(importFillials.filter(f => !merchantFillials.includes(f)));
    } else {
      // Select merchant
      setImportMerchants([...importMerchants, merchantId]);
      // Auto-select all fillials belonging to this merchant
      const merchantFillials = fillials.filter(f => f.merchant_id === merchantId).map(f => f.id);
      const newFillials = [...new Set([...importFillials, ...merchantFillials])];
      setImportFillials(newFillials);
    }
  };
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
  const [selectedMerchants, setSelectedMerchants] = useState<number[]>([]);
  const [selectedFillials, setSelectedFillials] = useState<number[]>([]);
  const [merchantSearch, setMerchantSearch] = useState("");
  const [filialSearch, setFilialSearch] = useState("");

  // Toggle merchant and auto-select/deselect its fillials
  const toggleMerchant = (merchantId: number) => {
    const isSelected = selectedMerchants.includes(merchantId);
    
    if (isSelected) {
      // Deselect merchant
      setSelectedMerchants(selectedMerchants.filter(m => m !== merchantId));
      // Deselect all fillials belonging to this merchant
      const merchantFillials = fillials.filter(f => f.merchant_id === merchantId).map(f => f.id);
      setSelectedFillials(selectedFillials.filter(f => !merchantFillials.includes(f)));
    } else {
      // Select merchant
      setSelectedMerchants([...selectedMerchants, merchantId]);
      // Auto-select all fillials belonging to this merchant
      const merchantFillials = fillials.filter(f => f.merchant_id === merchantId).map(f => f.id);
      const newFillials = [...new Set([...selectedFillials, ...merchantFillials])];
      setSelectedFillials(newFillials);
    }
  };

  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [selectedCategoryMerchants, setSelectedCategoryMerchants] = useState<number[]>([]);
  const [selectedCategoryFillials, setSelectedCategoryFillials] = useState<number[]>([]);
  const [categoryMerchantSearch, setCategoryMerchantSearch] = useState("");
  const [categoryFilialSearch, setCategoryFilialSearch] = useState("");

  // Toggle category merchant and auto-select/deselect its fillials
  const toggleCategoryMerchant = (merchantId: number) => {
    const isSelected = selectedCategoryMerchants.includes(merchantId);
    
    if (isSelected) {
      // Deselect merchant
      setSelectedCategoryMerchants(selectedCategoryMerchants.filter(m => m !== merchantId));
      // Deselect all fillials belonging to this merchant
      const merchantFillials = fillials.filter(f => f.merchant_id === merchantId).map(f => f.id);
      setSelectedCategoryFillials(selectedCategoryFillials.filter(f => !merchantFillials.includes(f)));
    } else {
      // Select merchant
      setSelectedCategoryMerchants([...selectedCategoryMerchants, merchantId]);
      // Auto-select all fillials belonging to this merchant
      const merchantFillials = fillials.filter(f => f.merchant_id === merchantId).map(f => f.id);
      const newFillials = [...new Set([...selectedCategoryFillials, ...merchantFillials])];
      setSelectedCategoryFillials(newFillials);
    }
  };

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
          (p as any).barcode?.includes(query) ||
          (p.category?.name || "").toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, priceRange, searchQuery]);

  // Filter categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter((c) =>
      c.name.toLowerCase().includes(query) ||
      (c as any).description?.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  // Handle product form submit
  const handleProductSubmit = async () => {
    if (!productForm.name || !productForm.barcode || !productForm.category || !productForm.price) {
      setToast({ isOpen: true, message: "Iltimos barcha majburiy maydonlarni to'ldiring", type: "error" });
      return;
    }

    try {
      setLoading(true);
      
      // Category ID is already in productForm.category (it's the select value)
      const categoryId = parseInt(productForm.category);
      if (!categoryId || isNaN(categoryId)) {
        setToast({ isOpen: true, message: "Kategoriyani tanlang", type: "error" });
        return;
      }

      const productData = {
        name: productForm.name,
        barcode: productForm.barcode,
        category_id: categoryId,
        price: parseFloat(productForm.price),
        image_url: productForm.image || undefined,
        description: productForm.description || undefined,
        merchant_ids: selectedMerchants,
        fillial_ids: selectedFillials,
      };

      if (editingProduct) {
        // Update existing product
        await productApi.updateProduct(editingProduct.id, productData);
        setToast({ isOpen: true, message: "Mahsulot muvaffaqiyatli yangilandi", type: "success" });
      } else {
        // Create new product
        await productApi.createProduct(productData);
        setToast({ isOpen: true, message: "Mahsulot muvaffaqiyatli qo'shildi", type: "success" });
      }

      // Reload products from API
      await loadProducts();
      
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
    } catch (error: any) {
      console.error('Error saving product:', error);
      setToast({ 
        isOpen: true, 
        message: error.response?.data?.message || "Mahsulotni saqlashda xatolik", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle category form submit
  const handleCategorySubmit = async () => {
    if (!categoryForm.name) {
      setToast({ isOpen: true, message: "Kategoriya nomini kiriting", type: "error" });
      return;
    }

    try {
      setLoading(true);
      
      const categoryData = {
        name: categoryForm.name,
        description: categoryForm.description || undefined,
        image: categoryForm.image || undefined,
        merchant_ids: selectedCategoryMerchants.length > 0 ? selectedCategoryMerchants : undefined,
        fillial_ids: selectedCategoryFillials.length > 0 ? selectedCategoryFillials : undefined,
      };

      if (editingCategory) {
        // Update existing category via API
        await productApi.updateCategory(editingCategory.id, categoryData);
        setToast({ isOpen: true, message: "Kategoriya muvaffaqiyatli yangilandi", type: "success" });
      } else {
        // Create new category via API
        await productApi.createCategory(categoryData);
        setToast({ isOpen: true, message: "Kategoriya muvaffaqiyatli qo'shildi", type: "success" });
      }
      
      // Reload categories from API
      await loadCategories();
      
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "", image: "" });
      setSelectedCategoryMerchants([]);
      setSelectedCategoryFillials([]);
    } catch (error: any) {
      console.error('Error saving category:', error);
      setToast({ 
        isOpen: true, 
        message: error.response?.data?.message || "Kategoriyani saqlashda xatolik", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = (id: number) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setDeleteConfirm({ isOpen: true, type: "product", id, name: product.name });
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      setLoading(true);
      
      if (deleteConfirm.type === "product" && deleteConfirm.id) {
        await productApi.deleteProduct(deleteConfirm.id);
        await loadProducts(); // Reload from API
        setToast({ isOpen: true, message: "Mahsulot muvaffaqiyatli o'chirildi", type: "success" });
      } else if (deleteConfirm.type === "category" && deleteConfirm.id) {
        await productApi.deleteCategory(deleteConfirm.id);
        await loadCategories(); // Reload from API
        setToast({ isOpen: true, message: "Kategoriya muvaffaqiyatli o'chirildi", type: "success" });
      }
      
      setDeleteConfirm({ isOpen: false, type: null, id: null, name: "" });
    } catch (error: any) {
      console.error('Error deleting:', error);
      const errorMsg = error.response?.data?.message || "O'chirishda xatolik";
      setToast({ isOpen: true, message: errorMsg, type: "error" });
      setDeleteConfirm({ isOpen: false, type: null, id: null, name: "" });
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id: number) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      // Check product count from _count field
      const productCount = (category as any)._count?.products || (category as any).productCount || 0;
      if (productCount > 0) {
        setToast({ 
          isOpen: true, 
          message: `Bu kategoriyada ${productCount} ta mahsulot mavjud. Avval mahsulotlarni o'chiring yoki boshqa kategoriyaga o'tkazing.`, 
          type: "error" 
        });
        return;
      }
      setDeleteConfirm({ isOpen: true, type: "category", id, name: category.name });
    }
  };

  // Edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      barcode: (product as any).barcode,
      category: String((product as any).category_id || ""),
      price: product.price.toString(),
      image: (product as any).image_url || (product as any).image || "",
      description: (product as any).description || "",
    });
    // Extract merchant and fillial IDs from the relation arrays
    const merchantIds = (product as any).merchants?.map((m: any) => m.merchant_id) || [];
    const fillialIds = (product as any).fillials?.map((f: any) => f.fillial_id) || [];
    setSelectedMerchants(merchantIds);
    setSelectedFillials(fillialIds);
    setShowProductModal(true);
  };

  // Edit category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: (category as any).description,
      image: (category as any).image || "",
    });
    // Extract merchant and fillial IDs from the relation arrays
    const merchantIds = (category as any).merchants?.map((m: any) => m.merchant_id) || [];
    const fillialIds = (category as any).fillials?.map((f: any) => f.fillial_id) || [];
    setSelectedCategoryMerchants(merchantIds);
    setSelectedCategoryFillials(fillialIds);
    setShowCategoryModal(true);
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    // Create CSV template
    const template = `Nomi,Shtrix kod,Kategoriya,Narx,Tavsif
Samsung Galaxy A54,8801643112233,Elektronika,4500000,5G 128GB 6GB RAM
Apple iPhone 15,0194253234567,Elektronika,15000000,256GB Titanium
LG Muzlatgich,8806098345678,Uy texnikasi,7500000,Side-by-side 600L
MacBook Pro 14,0195949456789,Kompyuter texnikasi,25000000,M3 Pro 18GB RAM
Rolex Submariner,7610270123456,Soatlar,95000000,Avtomatik suv o'tkazmaydigan`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mahsulotlar_template.csv';
    link.click();
    
    setToast({ 
      isOpen: true, 
      message: "Template muvaffaqiyatli yuklandi! Format: Nomi, Shtrix kod, Kategoriya, Narx, Tavsif", 
      type: "success" 
    });
  };

  // Import from Excel - Step 1: Select file and preview
  const handleImportExcelClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        setImportFile(file);
        
        try {
          // Read Excel file
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          setImportPreview(jsonData);
          setShowImportModal(true);
        } catch (error) {
          console.error('Excel file reading error:', error);
          setToast({ 
            isOpen: true, 
            message: "Excel faylni o'qishda xatolik yuz berdi", 
            type: "error" 
          });
        }
      }
    };
    input.click();
  };

  // Old demo data (for reference, can be removed)
  const OLD_DEMO_DATA = [
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

  // Import from Excel - Step 2: Process with selected merchants/fillials
  const handleImportSubmit = async () => {
    if (!importPreview || importPreview.length === 0) {
      setToast({ isOpen: true, message: "Import qilinadigan mahsulotlar yo'q", type: "error" });
      return;
    }

    if (!importCategory) {
      setToast({ isOpen: true, message: "Kategoriyani tanlang", type: "error" });
      return;
    }

    try {
      setLoading(true);
      
      // Map preview data to CreateProductDto format
      const productsToImport = importPreview.map((row) => {
        return {
          name: row["Nomi"] || row["name"] || "",
          barcode: String(row["Shtrix kod"] || row["barcode"] || ""),
          category_id: importCategory, // Use selected category
          price: parseFloat(row["Narx"] || row["price"] || "0"),
          description: row["Tavsif"] || row["description"] || undefined,
          image_url: undefined,
          // For now, mock merchant/fillial IDs
          // In real app, map importMerchants and importFillials to IDs
        };
      });

      // Call bulk import API
      const response = await productApi.bulkImportProducts({
        products: productsToImport,
        default_merchant_ids: importMerchants,
        default_fillial_ids: importFillials,
      });

      console.log('Bulk import response:', response.data);
      
      // Reload products from API
      await loadProducts();
      
      const successCount = (response.data as any).success || productsToImport.length;
      setToast({ 
        isOpen: true, 
        message: `${successCount} ta mahsulot muvaffaqiyatli import qilindi!`, 
        type: "success" 
      });
      
      setShowImportModal(false);
      setImportFile(null);
      setImportMerchants([]);
      setImportFillials([]);
      setImportCategory(null);
      setImportPreview([]);
      setShowProductsListModal(false);
    } catch (error: any) {
      console.error("Import error:", error);
      setToast({ 
        isOpen: true, 
        message: error.response?.data?.message || "Import qilishda xatolik yuz berdi", 
        type: "error" 
      });
    } finally {
      setLoading(false);
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
            onClick={handleDownloadTemplate}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50 dark:border-green-600 dark:bg-navy-800 dark:text-green-400 dark:hover:bg-green-900/20"
          >
            <Download size={18} />
            Template yuklash
          </button>
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
                      {(product as any).image ? (
                        <img src={(product as any).image} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package size={64} className="text-gray-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-navy-700 dark:text-white">{product.name}</h3>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Shtrix:</span> {(product as any).barcode || 'N/A'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Kategoriya:</span> {(product.category as any)?.name || product.category || 'N/A'}
                      </p>
                      {(product as any).description && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{(product as any).description}</p>
                      )}
                      <p className="mt-2 text-lg font-bold text-brand-500">{formatCurrency(product.price)}</p>
                      
                      {/* Availability Info */}
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Mavjudligi:</p>
                        <div className="flex flex-wrap gap-1">
                          {((product as any).availableFor?.merchants || []).slice(0, 2).map((merchant, idx) => (
                            <span key={idx} className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                              {merchant}
                            </span>
                          ))}
                          {((product as any).availableFor?.merchants?.length || 0) > 2 && (
                            <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                              +{((product as any).availableFor?.merchants?.length || 0) - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product as any)}
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
            <div className="mb-5 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Kategoriya qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
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
              {filteredCategories.map((category) => (
                <Card key={category.id} extra="!p-5 hover:shadow-lg transition-shadow">
                  {/* Category Image */}
                  {(category as any).image && (
                    <div className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-navy-700">
                      <img src={(category as any).image} alt={category.name} className="h-full w-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-navy-700 dark:text-white">{category.name}</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{(category as any).description}</p>
                      <p className="mt-3 text-sm font-medium text-brand-500">
                        {(category as any).productCount} ta mahsulot
                      </p>
                      
                      {/* Availability badges */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Mavjud:</p>
                        <div className="flex flex-wrap gap-1">
                          {((category as any).availableFor?.merchants || []).map((merchant, idx) => (
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
                      onClick={() => handleEditCategory(category as any)}
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
                    <option key={c.id} value={c.id}>
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
                    Merchantlar ({selectedMerchants.length}/{merchants.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMerchants.length === merchants.length) {
                        setSelectedMerchants([]);
                      } else {
                        setSelectedMerchants(merchants.map(m => m.id));
                      }
                    }}
                    className="text-xs font-medium text-brand-500 hover:text-brand-600"
                  >
                    {selectedMerchants.length === merchants.length ? "Hammasini olib tashlash" : "Hammasini tanlash"}
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
                    {merchants.filter(m => m.name.toLowerCase().includes(merchantSearch.toLowerCase())).map((merchant) => (
                      <button
                        key={merchant.id}
                        type="button"
                        onClick={() => toggleMerchant(merchant.id)}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          selectedMerchants.includes(merchant.id)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {merchant.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filiallar ({selectedFillials.length}/{fillials.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedFillials.length === fillials.length) {
                        setSelectedFillials([]);
                      } else {
                        setSelectedFillials(fillials.map(f => f.id));
                      }
                    }}
                    className="text-xs font-medium text-brand-500 hover:text-brand-600"
                  >
                    {selectedFillials.length === fillials.length ? "Hammasini olib tashlash" : "Hammasini tanlash"}
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
                    {fillials.filter(f => f.name.toLowerCase().includes(filialSearch.toLowerCase())).map((filial) => (
                      <button
                        key={filial.id}
                        type="button"
                        onClick={() => {
                          if (selectedFillials.includes(filial.id)) {
                            setSelectedFillials(selectedFillials.filter(f => f !== filial.id));
                          } else {
                            setSelectedFillials([...selectedFillials, filial.id]);
                          }
                        }}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          selectedFillials.includes(filial.id)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {filial.name}
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
                    Merchantlar ({selectedCategoryMerchants.length}/{merchants.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCategoryMerchants.length === merchants.length) {
                        setSelectedCategoryMerchants([]);
                      } else {
                        setSelectedCategoryMerchants(merchants.map(m => m.id));
                      }
                    }}
                    className="text-xs font-medium text-brand-500 hover:text-brand-600"
                  >
                    {selectedCategoryMerchants.length === merchants.length ? "Hammasini olib tashlash" : "Hammasini tanlash"}
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
                    {merchants.filter(m => m.name.toLowerCase().includes(categoryMerchantSearch.toLowerCase())).map((merchant) => (
                      <button
                        key={merchant.id}
                        type="button"
                        onClick={() => toggleCategoryMerchant(merchant.id)}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          selectedCategoryMerchants.includes(merchant.id)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {merchant.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filiallar ({selectedCategoryFillials.length}/{fillials.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCategoryFillials.length === fillials.length) {
                        setSelectedCategoryFillials([]);
                      } else {
                        setSelectedCategoryFillials(fillials.map(f => f.id));
                      }
                    }}
                    className="text-xs font-medium text-brand-500 hover:text-brand-600"
                  >
                    {selectedCategoryFillials.length === fillials.length ? "Hammasini olib tashlash" : "Hammasini tanlash"}
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
                    {fillials.filter(f => f.name.toLowerCase().includes(categoryFilialSearch.toLowerCase())).map((filial) => (
                      <button
                        key={filial.id}
                        type="button"
                        onClick={() => {
                          if (selectedCategoryFillials.includes(filial.id)) {
                            setSelectedCategoryFillials(selectedCategoryFillials.filter(f => f !== filial.id));
                          } else {
                            setSelectedCategoryFillials([...selectedCategoryFillials, filial.id]);
                          }
                        }}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          selectedCategoryFillials.includes(filial.id)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {filial.name}
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
                    setImportCategory(null);
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

              {/* Category Selection - Required */}
              <div className="mb-6 rounded-lg border-2 border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                <div className="mb-3">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2">
                    <Tag size={18} />
                    Kategoriya tanlash <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    Barcha mahsulotlar uchun bitta kategoriya tanlanadi
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setImportCategory(cat.id)}
                      className={`rounded-lg border-2 p-3 text-left transition-all ${
                        importCategory === cat.id
                          ? "border-orange-500 bg-orange-500 text-white shadow-lg scale-105"
                          : "border-gray-300 bg-white hover:border-orange-300 hover:bg-orange-50 dark:border-gray-600 dark:bg-navy-700 dark:hover:border-orange-600"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Tag size={14} className={importCategory === cat.id ? "text-white" : "text-orange-500"} />
                        <span className={`text-sm font-semibold ${importCategory === cat.id ? "text-white" : "text-gray-900 dark:text-white"}`}>
                          {cat.name}
                        </span>
                      </div>
                      {cat.description && (
                        <p className={`text-xs line-clamp-1 ${importCategory === cat.id ? "text-orange-100" : "text-gray-500 dark:text-gray-400"}`}>
                          {cat.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
                {!importCategory && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                    ⚠️ Davom etish uchun kategoriya tanlang
                  </p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Merchants Section */}
                <div className="rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Merchantlar</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-brand-500">{importMerchants.length}</span> / {merchants.length} tanlangan
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (importMerchants.length === merchants.length) {
                          setImportMerchants([]);
                        } else {
                          setImportMerchants(merchants.map(m => Number(m.id)));
                        }
                      }}
                      className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400"
                    >
                      {importMerchants.length === merchants.length ? "Tozalash" : "Hammasini tanlash"}
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
                      {merchants.filter(m => m.name.toLowerCase().includes(importMerchantSearch.toLowerCase())).map((merchant) => (
                      <button
                        key={merchant.id}
                        type="button"
                        onClick={() => toggleImportMerchant(merchant.id)}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          importMerchants.includes(merchant.id)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {merchant.name}
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
                        <span className="font-medium text-green-500">{importFillials.length}</span> / {fillials.length} tanlangan
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (importFillials.length === fillials.length) {
                          setImportFillials([]);
                        } else {
                          setImportFillials(fillials.map(f => f.id));
                        }
                      }}
                      className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                    >
                      {importFillials.length === fillials.length ? "Tozalash" : "Hammasini tanlash"}
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
                      {fillials.filter(f => f.name.toLowerCase().includes(importFilialSearch.toLowerCase())).map((filial) => (
                        <button
                          key={filial.id}
                          type="button"
                          onClick={() => {
                            if (importFillials.includes(filial.id)) {
                              setImportFillials(importFillials.filter(f => f !== filial.id));
                            } else {
                              setImportFillials([...importFillials, filial.id]);
                            }
                          }}
                          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                            importFillials.includes(filial.id)
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          {filial.name}
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
                    setImportCategory(null);
                    setImportPreview([]);
                    setShowProductsListModal(false);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleImportSubmit}
                  disabled={!importCategory || loading}
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
