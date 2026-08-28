import type { MenuCategory } from "@/lib/types";
import type { OrderFulfillment } from "@/lib/whatsapp";

export type WhatsAppConversionType = "order" | "rental" | "single" | "general";

export type CategoryInteraction = "click" | "scroll";

export type AnalyticsEventPayload =
  | {
      event: "page_view";
      page_path: string;
      page_title: string;
      page_location: string;
    }
  | {
      event: "session_attribution";
      landing_page: string;
      landing_src?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
      utm_term?: string;
      referrer?: string;
    }
  | {
      event: "menu_category_view";
      category: MenuCategory;
      interaction: CategoryInteraction;
    }
  | {
      event: "product_view";
      product_id: string;
      product_name: string;
      category: MenuCategory;
      price: number;
    }
  | {
      event: "add_to_cart";
      product_id: string;
      product_name: string;
      category: MenuCategory;
      price: number;
      quantity: number;
      cart_value: number;
      cart_items: number;
    }
  | {
      event: "remove_from_cart";
      product_id: string;
      product_name: string;
      category: MenuCategory;
      price: number;
      quantity: number;
      cart_value: number;
      cart_items: number;
    }
  | {
      event: "cart_open";
      cart_value: number;
      cart_items: number;
    }
  | {
      event: "cart_checkout_start";
      cart_value: number;
      cart_items: number;
    }
  | {
      event: "cart_checkout_details";
      complements_count: number;
      has_customer_name: boolean;
      cart_value: number;
      cart_items: number;
    }
  | {
      event: "cart_fulfillment_select";
      fulfillment: OrderFulfillment;
      is_scheduled: boolean;
      cart_value: number;
      cart_items: number;
    }
  | {
      event: "whatsapp_click";
      source: string;
      type: WhatsAppConversionType;
      fulfillment?: OrderFulfillment;
      cart_value?: number;
      cart_items?: number;
      product_name?: string;
      cta_location?: string;
    }
  | {
      event: "conversion_page_view";
      source: string;
      type: WhatsAppConversionType;
      fulfillment?: OrderFulfillment;
      product_name?: string;
    }
  | {
      event: "whatsapp_redirect";
      source: string;
      type: WhatsAppConversionType;
      fulfillment?: OrderFulfillment;
      cart_value?: number;
      cart_items?: number;
      product_name?: string;
    }
  | {
      event: "whatsapp_open";
      source: string;
      type: WhatsAppConversionType;
      auto_open: boolean;
      fulfillment?: OrderFulfillment;
    }
  | {
      event: "rental_inquiry_click";
      source: "eventos";
      cta_location: "hero" | "footer";
    }
  | {
      event: "cta_click";
      cta_label: string;
      cta_destination: string;
      cta_location: string;
    }
  | {
      event: "outbound_click";
      link_url: string;
      link_text: string;
    };

export type AnalyticsEventName = AnalyticsEventPayload["event"];

export type AnalyticsEvent = AnalyticsEventPayload;
