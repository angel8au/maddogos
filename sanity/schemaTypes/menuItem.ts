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
    defineField({
      name: "customizationType",
      title: "Tipo de personalización",
      type: "string",
      options: {
        list: [
          { title: "Ninguna", value: "none" },
          { title: "Ingredientes (checkbox)", value: "ingredients" },
          { title: "Salsa obligatoria", value: "sauce" },
          { title: "Extras con precio", value: "extras" },
        ],
      },
      initialValue: "none",
    }),
    defineField({
      name: "sauceRequired",
      title: "Salsa obligatoria",
      type: "boolean",
      description: "El cliente debe elegir salsa antes de agregar (alitas, boneless)",
      initialValue: false,
    }),
    defineField({
      name: "linkedExtras",
      title: "Extras disponibles",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "menuItem" }],
          options: {
            filter: "category == $cat",
            filterParams: { cat: "extras" },
          },
        },
      ],
      description: "Extras que el cliente puede agregar a este producto",
    }),
    defineField({
      name: "ingredients",
      title: "Ingredientes personalizables",
      type: "array",
      description:
        "Ingredientes que el cliente puede incluir o quitar (ej. hamburguesas). Dejar vacío si no aplica.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Nombre",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "includedByDefault",
              title: "Incluido por defecto",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: { title: "name", included: "includedByDefault" },
            prepare({ title, included }) {
              return {
                title,
                subtitle: included ? "Incluido por defecto" : "Opcional",
              };
            },
          },
        },
      ],
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
