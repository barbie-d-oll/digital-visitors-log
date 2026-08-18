import axios from "axios";

import { connectToDB } from "@/lib/db/mongoose";
import Organization from "@/lib/models/organization.model";

interface MsgProps {
  text: string;
  destinations: string[];
  organizationId?: string;
}

const endPoint = `https://api.smsonlinegh.com/v5/message/sms/send`;

function formatGhanaNumber(num: string): string {
  let cleanNum = num.replace(/\D/g, "");

  if (cleanNum.startsWith("0")) {
    cleanNum = "233" + cleanNum.slice(1);
  } else if (cleanNum.startsWith("+233")) {
    cleanNum = cleanNum.slice(1);
  }

  return cleanNum;
}

export async function smsConfig(values: MsgProps) {
  try {
    const { text, destinations, organizationId } = values;
    const formatDestinations = destinations.map((num) => formatGhanaNumber(num));

    let sms_key = process.env.SMS_TOKEN;
    let sender = process.env.SMS_SENDER || "HWS Tech";

    if (organizationId) {
      await connectToDB();
      const org = await Organization.findById(organizationId);

      if (org?.settings?.smsEnabled && org.settings.smsApiKey) {
        sms_key = org.settings.smsApiKey;
        sender = org.settings.smsSenderId || sender;
      }
    }

    if (!sms_key) {
      throw new Error(
        "SMS integration not configured. Please configure SMS in organization settings."
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

    if (response.data?.handshake?.label) {
      const errorLabel = response.data.handshake.label;

      if (errorLabel === "HSHK_OK") {
        return response.data;
      }

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
      throw new Error(errorMessage);
    }

    if (response.status === 200 || response.status === 201) {
      return response.data;
    } else {
      throw new Error("SMS sending failed. Please try again.");
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`SMS Error: ${message}`);
    throw error;
  }
}
