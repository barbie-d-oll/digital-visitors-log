import axios from "axios";
// import { connectToDB } from "@/lib/connection/mongoose";
// import Integration from "@/lib/models/integration.model";

interface MsgProps {
  text: string;
  destinations: string[];
}

const endPoint = `https://api.smsonlinegh.com/v5/message/sms/send`;

// 
function formatGhanaNumber(num: string): string {
  // Remove spaces, plus signs, and non-numeric characters
  let cleanNum = num.replace(/\D/g, "");

  if (cleanNum.startsWith("0")) {
    // Convert local number (e.g., 0551234567 → 233551234567)
    cleanNum = "233" + cleanNum.slice(1);
  } else if (cleanNum.startsWith("233")) {
    // Already correct
    cleanNum = cleanNum;
  } else if (cleanNum.startsWith("+233")) {
    // Remove +
    cleanNum = cleanNum.slice(1);
  }

  return cleanNum;
}



export async function smsConfig(values: MsgProps) {
  try {
    const { text, destinations } = values;
    const formatDestinations = destinations.map ( (num)=> formatGhanaNumber(num));


    const sms_key = process.env.SMS_TOKEN;
    const sender = "HWS Tech";

    // Check Integration model first if organizationId is provided
    // if (organizationId) {
    // //   await connectToDB();
    //   const smsIntegration = await Integration.findOne({
    //     organizationId,
    //     provider: "smsonlinegh",
    //     category: "sms",
    //     status: "connected",
    //   });

    //   if (smsIntegration?.credentials?.apiKey) {
    //     // Clean up API key if it has SMS_TOKEN= prefix
    //     sms_key = smsIntegration.credentials.apiKey
    //       .replace(/^SMS_TOKEN=/i, "")
    //       .trim();
    //     sender = smsIntegration.credentials.senderId || sender;
    //   }
    // }

    if (!sms_key) {
      throw new Error(
        "SMS integration not configured. Please configure SMS in Integrations settings.",
      );
    }

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Key ${sms_key}`,
    };

    const msgData = {
      text,
      type: 0,
      sender,
      destinations: formatDestinations,
    };

    const response = await axios.post(endPoint, msgData, { headers });

    // Check for SMS Online GH specific error responses
    if (response.data?.handshake?.label) {
      const errorLabel = response.data.handshake.label;

      // HSHK_OK means success
      if (errorLabel === "HSHK_OK") {
        console.log(`✅ SMS Sent Successfully:`, response.data);
        return response.data;
      }

      // Map error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        HSHK_ERR_UA_AUTH:
          "Invalid SMS API key. Please check your SMS integration credentials.",
        HSHK_ERR_UA_INSUFF_CREDIT:
          "Insufficient SMS credits in your SMS Online GH account.",
        HSHK_ERR_UA_INVALID_SENDER:
          "Invalid sender ID. Please check your sender ID configuration.",
        HSHK_ERR_UA_INVALID_DEST:
          "Invalid phone number(s). Please check the recipient phone numbers.",
      };

      const errorMessage =
        errorMessages[errorLabel] || `SMS sending failed: ${errorLabel}`;
      console.error(`❌ SMS Failed: ${errorMessage}`, response.data);
      throw new Error(errorMessage);
    }

    if (response.status === 200 || response.status === 201) {
      console.log(`✅ SMS Sent Successfully: ${JSON.stringify(response.data)}`);
      return response.data;
    } else {
      console.error(`❌ SMS Failed: ${JSON.stringify(response.data)}`);
      throw new Error("SMS sending failed. Please try again.");
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`❌ SMS Error: ${message}`);
    throw error;
  }
}
