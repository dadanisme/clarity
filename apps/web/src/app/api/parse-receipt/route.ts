import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { base64Image, mimeType, userOrder, userCategories } = body;

    if (!base64Image) {
      return NextResponse.json(
        { error: "Base64 image is required" },
        { status: 400 }
      );
    }

    if (!mimeType) {
      return NextResponse.json(
        { error: "MIME type is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Define the structured output schema
    const schema = {
      description: "Receipt parsing result with items and metadata",
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          description: "Array of items found in the receipt",
          items: {
            type: Type.OBJECT,
            properties: {
              amount: {
                type: Type.NUMBER,
                description: "Price before discount",
                nullable: false,
              },
              discount: {
                type: Type.NUMBER,
                description: "Per-item discount amount",
                nullable: true,
              },
              tax: {
                type: Type.NUMBER,
                description: "Proportional share of tax",
                nullable: false,
              },
              serviceFee: {
                type: Type.NUMBER,
                description: "Service fee amount",
                nullable: false,
              },
              category: {
                type: Type.STRING,
                description: "Item category (Food, Drink, etc.)",
                nullable: false,
              },
              description: {
                type: Type.STRING,
                description: "Item name/description",
                nullable: false,
              },
            },
            required: [
              "amount",
              "discount",
              "tax",
              "serviceFee",
              "category",
              "description",
            ],
          },
        },
        timestamp: {
          type: Type.STRING,
          description: "Receipt timestamp",
          nullable: true,
        },
        rounding: {
          type: Type.NUMBER,
          description: "Rounding adjustment amount",
          nullable: false,
        },
        total: {
          type: Type.NUMBER,
          description: "Total amount",
          nullable: false,
        },
        currency: {
          type: Type.STRING,
          description: "Currency code",
          nullable: false,
        },
        note: {
          type: Type.STRING,
          description: "Human-readable summary",
          nullable: false,
        },
      },
      required: ["items", "timestamp", "rounding", "total", "currency", "note"],
    };

    // Parse user categories
    const categories = userCategories || [];
    const categoryNames = categories
      .map((cat: { name: string }) => cat.name)
      .join(", ");

    // System instructions
    const systemInstructions = `You are a receipt image parser for a money management app.

The user will upload a photo of a receipt and may optionally type a list of the items they personally ordered, for example:  
"mie diskon, lemon, cup"

Your job is to:

1. Visually analyze the receipt image
2. Identify only the items that match what the user ordered
3. For each matched item:
   - Extract the item price before discount
   - Extract any printed per-item discount shown directly beneath the item
   - Distribute any printed tax (e.g. "PB1", "PPN") proportionally across the matched items
4. Extract the timestamp from the printed receipt, if available
5. Extract any printed rounding adjustment (e.g., "Pembulatan")
6. Do not fabricate values — only extract what is printed
7. Return a valid JSON response following the exact format below
8. Be aware of local number formatting. Prices in Indonesian receipts often use periods (.) as thousand separators, not decimal points. For example, "Rp 29.090" means twenty-nine thousand ninety (29090), not 29.09. Normalize all such prices to standard numeric form before calculation.

📌 Field Guidelines:

- items[]:
  - Only include items that clearly match what the user typed
  - amount: Price before discount
  - discount: Printed per-item discount or null if none
  - tax: Proportional share of any printed global tax value
  - serviceFee: Always 0 unless clearly printed on the receipt
  - category: MUST be one of the user's available categories: ${
    categoryNames ||
    "Food, Drink, Transport, Shopping, Entertainment, Health, Education, Utilities, Groceries"
  }
  - description: Printed name of the item
  - If an item is printed with a quantity (e.g. "x2","2" then item name or total price for multiple units), and the user did not specify quantity, assume they ordered only one unit. Divide the price and proportional adjustments accordingly.

- timestamp: Receipt time, in ISO 8601 format if possible. Else use printed format like "05-07-2025 11:37".
- rounding: Printed rounding adjustment, or 0 if not shown
- total: Calculated as the sum of (amount - discount + tax + serviceFee) for each item, plus rounding
- currency: Use "IDR" unless another symbol is clearly printed
- note: Human-readable summary. Mention which items were matched, which were not found, and how tax and rounding were applied

🚫 DO NOT:
- Include unmatched items
- Fabricate discount, service fee, or tax
- Guess missing values
- Respond with extra commentary or markdown
- Use categories that are not in the user's list

Respond with valid JSON only.`;

    // User prompt
    const userPrompt = `User ordered: ${userOrder || "All items"}

Please parse this receipt image and extract the relevant information.`;

    // Generate content with structured output
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            { text: userPrompt },
            {
              inlineData: {
                mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemInstructions,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = result.text || "";

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse response as JSON" },
        { status: 500 }
      );
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Error parsing receipt:", error);
    return NextResponse.json(
      { error: "Failed to parse receipt" },
      { status: 500 }
    );
  }
}
