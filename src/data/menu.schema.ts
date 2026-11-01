import { z } from "zod";

export const DaySchema = z.enum(["sun", "mon", "tue", "wed", "thu", "fri", "sat"]);
export const DietSchema = z.enum(["veg", "non-veg"]).nullable();
const hhmm = z.string().regex(/^([01]\d|2[0-4]):[0-5]\d$/);
const positive = z.number().positive();

export const VariantSchema = z
  .object({
    label: z.string().min(1).nullable(),
    price: positive.nullable(),
    priceNote: z.string().min(1).optional(),
    no: z.string().min(1).optional(),
  })
  .strict()
  .refine((v) => v.price !== null || !!v.priceNote, "price is null without a priceNote");

export const ItemSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    no: z.string().min(1).optional(),
    name: z.string().min(1),
    source: z.string().min(1),
    price: positive.nullable().optional(),
    priceNote: z.string().min(1).optional(),
    variants: z.array(VariantSchema).min(1).optional(),
    options: z.string().min(1).optional(),
    availableDays: z.array(DaySchema).min(1).optional(),
    confirm: z.string().optional(),
    diet: DietSchema,
    soldOut: z.boolean().optional(),
    hidden: z.boolean().optional(),
  })
  .strict()
  .refine((i) => !(i.variants && i.price !== undefined), "an item has both price and variants")
  .refine((i) => i.variants || i.price !== undefined, "an item needs either a price or variants")
  .refine((i) => i.price !== null || !!i.priceNote, "price is null without a priceNote");

export const SectionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    image: z.string().min(1).optional(),
    items: z.array(ItemSchema),
  })
  .strict();

export const GroupSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    note: z.string().optional(),
    source: z.string().optional(),
    window: z
      .object({ days: z.array(DaySchema).min(1), from: hhmm, to: hhmm })
      .strict()
      .optional(),
    sections: z.array(SectionSchema).min(1),
  })
  .strict();

export const MenuSchema = z
  .object({
    meta: z
      .object({
        source: z.string(),
        sourceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        currency: z.literal("AED"),
        timezone: z.literal("Asia/Dubai"),
        excluded: z.string(),
      })
      .strict(),
    restaurant: z
      .object({
        name: z.string(),
        nameAr: z.string(),
        logoTaglineMl: z.string(),
        area: z.string(),
        address: z.string(),
        geo: z.object({ lat: z.number(), lng: z.number() }).strict(),
        mapsUrl: z.string().url(),
        hours: z
          .object({
            daily: z.object({ open: hhmm, close: hhmm }).strict(),
            source: z.string(),
          })
          .strict(),
        phones: z
          .array(z.object({ label: z.string(), display: z.string(), tel: z.string() }).strict())
          .min(1),
        whatsapp: z
          .string()
          .regex(/^\d{8,15}$/)
          .nullable(),
        email: z.string().email(),
        freeHomeDelivery: z.boolean(),
      })
      .strict(),
    groups: z.array(GroupSchema).min(1),
  })
  .strict();
