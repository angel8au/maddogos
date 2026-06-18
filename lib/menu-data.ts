import type { MenuCategory, MenuItem } from "@/lib/types";

type SeedItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  badge?: string;
  featured?: boolean;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const items: SeedItem[] = [
  // Hot Dogs
  { id: "easy-dog", name: "Easy Dog", description: "Salchicha de pavo con tocino", price: 70, category: "hot-dogs" },
  { id: "easy-dog-especial", name: "Easy Dog Especial", description: "Easy Dog envuelto en queso manchego y jamón de pavo", price: 80, category: "hot-dogs" },
  { id: "easy-dog-jumbo", name: "Easy Dog Especial Jumbo", description: "Salchicha jumbo de pavo envuelta en tocino, queso manchego y jamón de pavo", price: 100, category: "hot-dogs" },
  { id: "chilli-dog", name: "Chilli Dog", description: "Salchicha de puerco con queso y chile jalapeño, envuelto en queso manchego y jamón de pavo", price: 95, category: "hot-dogs" },
  { id: "perro-bacon", name: "Perro Bacon", description: "Salchicha de puerco con queso y tocino, envuelto en queso manchego y jamón de pavo", price: 95, category: "hot-dogs" },
  { id: "beef-dog", name: "Beef Dog", description: "Salchicha de res con queso y perejil, envuelto en queso manchego y jamón de pavo", price: 100, category: "hot-dogs" },
  { id: "maddogo-especial", name: "Maddogo Especial", description: "Salchicha de mezcla especial de carne de res y tocino, envuelta en tocino, queso manchego, jamón de pavo y cebolla asada", price: 100, category: "hot-dogs", badge: "Lo más pedido", featured: true },

  // Hamburguesas
  { id: "mad-burguer", name: "Mad Burguer", description: "Mezcla especial de carne con salsa, queso gouda, jamón, lechuga, tomate y cebolla", price: 155, category: "hamburguesas", badge: "Lo más pedido", featured: true },
  { id: "madbon-burguer", name: "MadBon Burguer", description: "Boneless bañados en salsa con queso gouda, jamón, lechuga, tomate y cebolla", price: 155, category: "hamburguesas" },
  { id: "mad-double-burguer", name: "MadDouble Burguer", description: "Mezcla especial doble con salsa, queso gouda, jamón, lechuga, tomate y cebolla", price: 185, category: "hamburguesas" },
  { id: "madburguer-hawaiana", name: "MadBurguer Hawaiana", description: "Carne y tocino con salsa, piña, guacamole, queso manchego, jamón, lechuga, tomate y cebolla asada", price: 185, category: "hamburguesas" },
  { id: "madburguer-camaron", name: "MadBurguer Camarón", description: "Camarones asados al pastor en costra de queso, lechuga, tomate, cebolla asada, pan brioche, aderezo chipotle spicy", price: 180, category: "hamburguesas" },
  { id: "smash-madburger", name: "Smash MadBurger", description: "Doble carne 200gr estilo smash, queso americano, tocino, pepinillos, pan brioche, aderezo especial", price: 180, category: "hamburguesas" },
  { id: "lowcarb-burguer", name: "LowCarb Burguer", description: "Sin papas. Lechuga romana con carne y tocino, queso manchego, jamón, lechuga, tomate, cebolla asada, vegetales y guacamole", price: 155, category: "hamburguesas", badge: "Sin papas" },
  { id: "lowcarb-double", name: "LowCarb Double Burguer", description: "Sin papas. LowCarb con doble carne, doble queso, doble jamón, vegetales y guacamole", price: 185, category: "hamburguesas", badge: "Sin papas" },
  { id: "mad-cheese-burguer", name: "Mad Cheese Burguer", description: "200gr carne rellena de queso americano, jamón, tocino, lechuga, tomate y cebolla", price: 185, category: "hamburguesas" },
  { id: "mad-west-burguer", name: "Mad West Burguer", description: "Carne y tocino con BBQ, queso manchego, jamón, 4 aros de cebolla, tocino frito en BBQ", price: 185, category: "hamburguesas" },
  { id: "in-n-out-burguer", name: "IN-N-OUT Burguer", description: "Pan brioche, mayonesa, lechuga romana, carne, queso americano, tomate, cebolla cruda, pepinillos, aderezo style", price: 180, category: "hamburguesas" },

  // Alitas
  { id: "orden-alitas", name: "Orden de Alitas", description: "10 pzas con salsa de elección y vegetales", price: 155, category: "alitas", badge: "Lo más pedido", featured: true },
  { id: "alitas-especiales", name: "Orden de Alitas Especiales", description: "Orden de alitas con papas gratinadas", price: 175, category: "alitas" },
  { id: "alitas-salvajes", name: "Alitas Salvajes", description: "10 pzas con papas salvajes", price: 195, category: "alitas" },

  // Boneless
  { id: "orden-boneless", name: "Orden de Boneless", description: "10 pzas con salsa de elección y vegetales", price: 155, category: "boneless" },
  { id: "boneless-especiales", name: "Orden de Boneless Especiales", description: "Boneless con papas gratinadas", price: 175, category: "boneless" },
  { id: "boneless-salvajes", name: "Boneless Salvajes", description: "10 pzas con papas salvajes", price: 195, category: "boneless" },

  // Papas
  { id: "papas-francesa", name: "Papas a la Francesa", description: "Papas naturales a la francesa", price: 80, category: "papas" },
  { id: "papas-curly", name: "Papas Curly Lemonpepper", description: "Papas curly con pimienta y limón", price: 80, category: "papas" },
  { id: "papas-animal", name: "Orden de Papas Animal Fries", description: "Papas con queso manchego, tocino frito y aderezo IN-N-OUT", price: 100, category: "papas" },
  { id: "papas-salvajes", name: "Papas Salvajes", description: "Papas con jamón de pavo, queso manchego y salchicha de jalapeño", price: 100, category: "papas" },
  { id: "aros-cebolla", name: "Orden de Aros de Cebolla", description: "8 aros de cebolla con papas a la francesa", price: 110, category: "papas" },

  // Conos
  { id: "madcono-chico", name: "MadCono Chico", description: "Media orden de boneless en papas curly lemonpepper, queso de nachos y ranch", price: 125, category: "conos" },
  { id: "madcono-grande", name: "MadCono Grande", description: "Orden de boneless en papas curly lemonpepper, queso de nachos y ranch", price: 175, category: "conos", badge: "Lo más pedido", featured: true },
  { id: "madcono-salvaje", name: "MadCono Salvaje", description: "Orden de boneless en papas curly lemonpepper, queso de nachos, ranch y topping de papas salvajes", price: 200, category: "conos" },

  // Charolas
  { id: "charola-burguer", name: "Charola MadCombo Burguer", description: "1 MadBurguer, alitas, boneless, vegetales, papas y 2 bebidas", price: 450, category: "charolas" },
  { id: "charola-dogos", name: "Charola MadCombo Dogos", description: "2 Hot Dogs (no BeefDog), alitas, boneless, vegetales, papas y 2 bebidas", price: 450, category: "charolas" },
  { id: "charola-especial", name: "Charola Especial MadDogos", description: "1 Hawaiana/MadWest/MadDouble, alitas, boneless, vegetales, papas y 2 bebidas", price: 480, category: "charolas" },

  // Combos
  { id: "combo-dr-alitas", name: "Combo Dr Alitas", description: "1 Hot Dog + papas + ½ orden de alitas", price: 160, category: "combos" },
  { id: "combo-dr-boneless", name: "Combo Dr Boneless", description: "1 Hot Dog + papas + ½ orden de boneless", price: 160, category: "combos" },
  { id: "combo-2-bacon", name: "Combo 2 Perro Bacon", description: "2 Perro Bacon (sin papas)", price: 160, category: "combos" },
  { id: "combo-2-chilli", name: "Combo 2 Chilli Dog", description: "2 Chilli Dog (sin papas)", price: 160, category: "combos" },
  { id: "combo-bacon-chilli", name: "Combo Perro Bacon + Chilli Dog", description: "1 Perro Bacon + 1 Chilli Dog (sin papas)", price: 160, category: "combos" },
  { id: "combo-3-easy", name: "Combo 3 Easy Dog", description: "3 Easy Dog (sin papas)", price: 160, category: "combos" },

  // Extras
  { id: "extra-animal", name: "Aderezo Animal Style", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-chile", name: "Chile Amarillo 3 pzas", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-guacamole", name: "Guacamole 2 oz", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-gratinado", name: "Gratinado de Papas", description: "Extra para acompañar tu orden", price: 25, category: "extras" },
  { id: "extra-ranch", name: "Aderezo Ranch", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-bbq", name: "Salsa BBQ", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-redhot", name: "Salsa Red Hot", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-teriyaki", name: "Salsa Teriyaki", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-maddogos", name: "MadDogos Sauce", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-nachos", name: "Queso de Nachos", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-mango", name: "Salsa Mango Habanero", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-aro", name: "Aro de Cebolla 1 pza", description: "Extra para acompañar tu orden", price: 15, category: "extras" },
  { id: "extra-papas", name: "Papas Salvajes o Animal Style", description: "Extra para acompañar tu orden", price: 65, category: "extras" },
  { id: "extra-combo-dr", name: "Combo DR", description: "Extra para acompañar tu orden", price: 75, category: "extras" },

  // Bebidas
  { id: "bebida-fresa", name: "Fresa Limón", description: "Agua fresca 500ml", price: 25, category: "bebidas" },
  { id: "bebida-naranjita", name: "Naranjita", description: "Agua fresca 500ml", price: 25, category: "bebidas" },
  { id: "bebida-jazmin", name: "Té de Jazmín", description: "Agua fresca 500ml", price: 25, category: "bebidas" },
  { id: "bebida-coca-500", name: "Coca-Cola 500ml", description: "Refresco 500ml", price: 25, category: "bebidas" },
  { id: "bebida-coca-600", name: "Coca-Cola 600ml", description: "Refresco 600ml", price: 30, category: "bebidas" },
  { id: "bebida-limonada", name: "Limonada", description: "Agua fresca 500ml", price: 25, category: "bebidas" },
  { id: "bebida-jamaica", name: "Jamaica", description: "Agua fresca 500ml", price: 25, category: "bebidas" },
  { id: "bebida-hielo", name: "Vaso con Hielo", description: "Vaso con hielo", price: 5, category: "bebidas" },
];

const orderByCategory = new Map<MenuCategory, number>();

export const categoryLabels: Record<MenuCategory, string> = {
  "hot-dogs": "Hot Dogs",
  hamburguesas: "Hamburguesas",
  alitas: "Alitas",
  boneless: "Boneless",
  papas: "Papas y Entradas",
  conos: "Conos",
  charolas: "Charolas",
  combos: "Combos",
  extras: "Extras",
  bebidas: "Bebidas",
};

export const categoryOrder: MenuCategory[] = [
  "hot-dogs",
  "hamburguesas",
  "alitas",
  "boneless",
  "papas",
  "conos",
  "charolas",
  "combos",
  "extras",
  "bebidas",
];

export const menuSeed = items.map((item) => {
  const order = (orderByCategory.get(item.category) ?? 0) + 1;
  orderByCategory.set(item.category, order);
  return { ...item, order };
});

export const fallbackMenuItems: MenuItem[] = menuSeed.map((item) => ({
  _id: item.id,
  name: item.name,
  slug: slugify(item.name),
  description: item.description,
  price: item.price,
  category: item.category,
  badge: item.badge,
  featured: item.featured ?? false,
  order: item.order,
}));
