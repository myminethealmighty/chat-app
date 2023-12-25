import { z } from "zod";

export const addValidator = z.object({
  email: z.string().email(),
});
