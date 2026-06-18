import { defineField, defineType } from "sanity";

const categories = [
  { title: "Hot Dogs", value: "hot-dogs" },
  { title: "Hamburguesas", value: "hamburguesas" },
  { title: "Alitas", value: "alitas" },
  { title: "Boneless", value: "boneless" },
  { title: "Conos", value: "conos" },
  { title: "Charolas", value: "charolas" },
  { title: "Combos", value: "combos" },
  { title: "Orden de Papas", value: "papas" },
  { title: "Extras", value: "extras" },
  { title: "Bebidas", value: "bebidas" },
];

export const menuItemType = defineType({
  name: "menuItem",
  title: "Producto del menú",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      title: "Precio (MXN)",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "image",
      title: "Imagen",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "category",
      title: "Categoría",
      type: "string",
      options: { list: categories },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "badge",
      title: "Badge",
      type: "string",
      options: {
        list: ["Lo más pedido", "Nuevo", "Promo", "Picante", "Sin papas"],
      },
    }),
    defineField({
      name: "available",
      title: "Disponible",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Destacado en Home",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Orden en el menú",
      type: "number",
    }),
  ],
  orderings: [
    {
      title: "Categoría",
      name: "categoryAsc",
      by: [
        { field: "category", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "category", media: "image" },
  },
});
