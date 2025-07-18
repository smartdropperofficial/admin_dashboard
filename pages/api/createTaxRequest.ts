import type { NextApiRequest, NextApiResponse } from "next";
import { OrderTaxAmazon } from "@/types/OrderTaxAmazon";
import { decryptData } from "@/utils/encryption";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const encryptedPayload = req.body;
      const payload = JSON.parse(decryptData(encryptedPayload as string));

      if (payload) {
        const zincOrderObject = generateTaxOrderObject(payload?.order!);

        const headers = new Headers();
        headers.append(
          "Authorization",
          `Basic ${Buffer.from(`${process.env.ZINC_API_KEY!}:`).toString(
            "base64"
          )}`
        );

        headers.append("Content-Type", "application/json");

        const response = await fetch(`${process.env.ZINC_API_URL}/orders`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(zincOrderObject!),
        });

        const zincResponse: any = await response.json();

        if (zincResponse._type === "error") {
          res.status(400).json({});
        } else {
          res.status(201).json(zincResponse!);
        }
      } else {
        res.status(401).json({});
      }
    } catch {
      res.status(400).json({});
    }
  }
}

const generateTaxOrderObject = (payload: any): OrderTaxAmazon | null => {
  try {
    return {
      idempotency_key: payload.order_id,
      retailer: "amazon",
      addax: true,
      products: payload.products,
      max_price: 0,

      shipping_address: {
        first_name: payload.shipping_info.first_name,
        last_name: payload.shipping_address.last_name,
        address_line1: payload.shipping_address.address_line1,
        address_line2: payload.shipping_address.address_line2,
        zip_code: payload.shipping_address.zip_code,
        city: payload.shipping_address.city,
        state: payload.shipping_address.state,
        country: payload.shipping_address.country,
        phone_number: payload.shipping_address.phone_number,
      },
      webhooks: {
        request_succeeded: `${process.env.MAILER_WEBHOOK!}/request-succeeded`,
        request_failed: `${process.env.MAILER_WEBHOOK!}/request-failed`,
        tracking_obtained: `${process.env.MAILER_WEBHOOK!}/tracking`,
      },
      shipping: {
        order_by: "price",
        max_days: 10,
        max_price: 1000,
      },
      is_gift: false,
    };
  } catch (error) {
    console.log("🚀 ~ generateAmazonOrderObject ~ error:", error);
    return null;
  }
};

// Example create an order request on ZINC API

// curl "https://api.zinc.io/v1/orders" \
//   -u <client_token>: \
//   -d '{
//   "retailer": "amazon",
//   "products": [
//     {
//       "product_id": "B0016NHH56",
//       "quantity": 1
//     }
//   ],
//   "max_price": 2300,
//   "shipping_address": {
//     "first_name": "Tim",
//     "last_name": "Beaver",
//     "address_line1": "77 Massachusetts Avenue",
//     "address_line2": "",
//     "zip_code": "02139",
//     "city": "Cambridge",
//     "state": "MA",
//     "country": "US",
//     "phone_number": "5551230101"
//   },
//   "is_gift": true,
//   "gift_message": "Here is your package, Tim! Enjoy!",
//   "shipping": {
//     "order_by": "price",
//     "max_days": 5,
//     "max_price": 1000
//   },
//   "payment_method": {
//     "name_on_card": "Ben Bitdiddle",
//     "number": "5555555555554444",
//     "security_code": "123",
//     "expiration_month": 1,
//     "expiration_year": 2020,
//     "use_gift": false
//   },
//   "billing_address": {
//     "first_name": "William",
//     "last_name": "Rogers",
//     "address_line1": "84 Massachusetts Ave",
//     "address_line2": "",
//     "zip_code": "02139",
//     "city": "Cambridge",
//     "state": "MA",
//     "country": "US",
//     "phone_number": "5551234567"
//   },
//   "retailer_credentials": {
//     "email": "timbeaver@gmail.com",
//     "password": "myRetailerPassword",
//     "totp_2fa_key": "3DE4 3ERE 23WE WIKJ GRSQ VOBG CO3D METM 2NO2 OGUX Z7U4 DP2H UYMA"
//   },
//   "webhooks": {
//     "request_succeeded": "http://example.com/zinc/request_succeeded",
//     "request_failed": "http://example.com/zinc/requrest_failed",
//     "tracking_obtained": "http://example.com/zinc/tracking_obtained"
//   },
//   "client_notes": {
//     "our_internal_order_id": "abc123",
//     "any_other_field": ["any value"]
//   }
// }'
// Example create an order response

// {
//   "request_id": "3f1c939065cf58e7b9f0aea70640dffc"
// }
