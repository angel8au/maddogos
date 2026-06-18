import { defineField, defineType } from "sanity";

export const siteConfigType = defineType({
  name: "siteConfig",
  title: "Configuración del sitio",
  type: "document",
  fields: [
    defineField({
      name: "whatsappNumber",
      title: "Número WhatsApp",
      type: "string",
      description: "Formato: 526671900771",
      validation: (rule) =>
        rule.regex(/^52\d{10}$/, { name: "E.164 MX" }),
    }),
    defineField({
      name: "whatsappMessage",
      title: "Mensaje default WA",
      type: "string",
      initialValue: "Hola, quiero hacer un pedido",
    }),
    defineField({
      name: "address",
      title: "Dirección",
      type: "string",
    }),
    defineField({
      name: "deliveryZone",
      title: "Zona de cobertura delivery",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "openingHours",
      title: "Horario",
      type: "string",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook URL",
      type: "url",
    }),
    defineField({
      name: "sauceOptions",
      title: "Salsas disponibles",
      type: "array",
      of: [{ type: "string" }],
      description: "Opciones de salsa para alitas y boneless",
      initialValue: [
        "BBQ",
        "Red Hot",
        "Teriyaki",
        "MadDogos Sauce",
        "Mango Habanero",
      ],
    }),
  ],
});
