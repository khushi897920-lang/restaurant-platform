// src/data/menu.js
// Static menu data — no API call needed, imported directly into components
//
// isFeatured: true → dish appears on Landing page hero section (7 total)
// id format: <category_prefix>_<3-digit-number>
//
// To use:
//   import { menuData } from "../data/menu"
//   const featured = menuData.categories.flatMap(c => c.items).filter(i => i.isFeatured)
//   const allItems = menuData.categories.flatMap(c => c.items)
//   const item = allItems.find(i => i.id === "str_001")

export const menuData = {
  categories: [
    {
      name: "Starters",
      items: [
        { id: "str_001", name: "Paneer Tikka",        price: 249, isFeatured: true  },
        { id: "str_002", name: "Hara Bhara Kebab",    price: 199, isFeatured: false },
        { id: "str_003", name: "Crispy Corn",          price: 189, isFeatured: false },
        { id: "str_004", name: "Veg Spring Roll",      price: 179, isFeatured: false },
        { id: "str_005", name: "Veg Manchurian Dry",   price: 229, isFeatured: false },
        { id: "str_006", name: "Cheese Balls",         price: 249, isFeatured: true  },
        { id: "str_007", name: "Tandoori Mushroom",    price: 239, isFeatured: false },
        { id: "str_008", name: "Corn Cheese Nuggets",  price: 219, isFeatured: false },
      ]
    },
    {
      name: "Soups",
      items: [
        { id: "sop_001", name: "Tomato Soup",             price: 129, isFeatured: false },
        { id: "sop_002", name: "Sweet Corn Soup",          price: 139, isFeatured: false },
        { id: "sop_003", name: "Hot and Sour Soup",        price: 149, isFeatured: false },
        { id: "sop_004", name: "Manchow Soup",             price: 149, isFeatured: false },
        { id: "sop_005", name: "Cream of Mushroom Soup",   price: 159, isFeatured: false },
      ]
    },
    {
      name: "Indian Main Course",
      items: [
        { id: "imc_001", name: "Paneer Butter Masala", price: 299, isFeatured: true  },
        { id: "imc_002", name: "Kadai Paneer",         price: 289, isFeatured: false },
        { id: "imc_003", name: "Shahi Paneer",         price: 309, isFeatured: false },
        { id: "imc_004", name: "Palak Paneer",         price: 279, isFeatured: false },
        { id: "imc_005", name: "Mix Veg",              price: 259, isFeatured: false },
        { id: "imc_006", name: "Veg Kolhapuri",        price: 279, isFeatured: false },
        { id: "imc_007", name: "Malai Kofta",          price: 299, isFeatured: true  },
        { id: "imc_008", name: "Dal Makhani",          price: 249, isFeatured: false },
        { id: "imc_009", name: "Dal Tadka",            price: 219, isFeatured: false },
        { id: "imc_010", name: "Aloo Jeera",           price: 199, isFeatured: false },
      ]
    },
    {
      name: "Biryani & Rice",
      items: [
        { id: "br_001", name: "Veg Biryani",              price: 279, isFeatured: true  },
        { id: "br_002", name: "Paneer Biryani",            price: 309, isFeatured: false },
        { id: "br_003", name: "Hyderabadi Veg Biryani",   price: 319, isFeatured: false },
        { id: "br_004", name: "Jeera Rice",                price: 179, isFeatured: false },
        { id: "br_005", name: "Steam Rice",                price: 149, isFeatured: false },
        { id: "br_006", name: "Veg Pulao",                 price: 229, isFeatured: false },
      ]
    },
    {
      name: "Chinese",
      items: [
        { id: "chn_001", name: "Veg Hakka Noodles",      price: 239, isFeatured: false },
        { id: "chn_002", name: "Schezwan Noodles",        price: 249, isFeatured: false },
        { id: "chn_003", name: "Veg Fried Rice",          price: 229, isFeatured: false },
        { id: "chn_004", name: "Schezwan Fried Rice",     price: 249, isFeatured: false },
        { id: "chn_005", name: "Paneer Chilli Gravy",     price: 279, isFeatured: false },
        { id: "chn_006", name: "Veg Manchurian Gravy",    price: 259, isFeatured: false },
      ]
    },
    {
      name: "Breads",
      items: [
        { id: "brd_001", name: "Butter Naan",     price: 49,  isFeatured: false },
        { id: "brd_002", name: "Garlic Naan",     price: 69,  isFeatured: false },
        { id: "brd_003", name: "Tandoori Roti",   price: 29,  isFeatured: false },
        { id: "brd_004", name: "Butter Roti",     price: 39,  isFeatured: false },
        { id: "brd_005", name: "Lachha Paratha",  price: 69,  isFeatured: false },
        { id: "brd_006", name: "Stuffed Kulcha",  price: 89,  isFeatured: false },
      ]
    },
    {
      name: "South Indian",
      items: [
        { id: "si_001", name: "Masala Dosa",          price: 149, isFeatured: true  },
        { id: "si_002", name: "Plain Dosa",            price: 119, isFeatured: false },
        { id: "si_003", name: "Mysore Masala Dosa",   price: 169, isFeatured: false },
        { id: "si_004", name: "Idli Sambar",           price: 109, isFeatured: false },
        { id: "si_005", name: "Medu Vada",             price: 129, isFeatured: false },
      ]
    },
    {
      name: "Desserts",
      items: [
        { id: "des_001", name: "Gulab Jamun",                    price: 99,  isFeatured: false },
        { id: "des_002", name: "Rasmalai",                       price: 119, isFeatured: false },
        { id: "des_003", name: "Brownie with Ice Cream",         price: 149, isFeatured: true  },
        { id: "des_004", name: "Kulfi",                          price: 89,  isFeatured: false },
        { id: "des_005", name: "Hot Gulab Jamun with Ice Cream", price: 139, isFeatured: false },
      ]
    },
    {
      name: "Beverages",
      items: [
        { id: "bev_001", name: "Cold Coffee",      price: 149, isFeatured: false },
        { id: "bev_002", name: "Mango Shake",      price: 139, isFeatured: false },
        { id: "bev_003", name: "Sweet Lassi",      price: 99,  isFeatured: false },
        { id: "bev_004", name: "Fresh Lime Soda",  price: 89,  isFeatured: false },
        { id: "bev_005", name: "Virgin Mojito",    price: 119, isFeatured: false },
      ]
    }
  ]
}

// ─── Helpers ────────────────────────────────────────────────────────────────
// Pre-flattened list of all items — useful for searching and cart lookups

export const allItems = menuData.categories.flatMap(c => c.items)

// 7 featured dishes for the landing page hero section
export const featuredItems = allItems.filter(i => i.isFeatured)

// Find one item by id — used in CartContext.getOrderPayload and totalAmount
export const findItemById = (id) => allItems.find(i => i.id === id)