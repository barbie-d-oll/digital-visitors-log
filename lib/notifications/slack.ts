/**
 * Slack/Teams notification service.
 * Sends messages via incoming webhooks.
 * Works with both Slack and Microsoft Teams webhook URLs.
 */

interface SlackNotificationParams {
  webhookUrl: string;
  visitorName: string;
  visitorCompany?: string;
  purpose: string;
  hostName: string;
  checkInTime: Date;
}

export async function sendSlackNotification(params: SlackNotificationParams): Promise<boolean> {
  const { webhookUrl, visitorName, visitorCompany, purpose, hostName, checkInTime } = params;

  if (!webhookUrl) return false;

  const time = checkInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const isTeams = webhookUrl.includes("microsoft.com") || webhookUrl.includes("office.com");

  try {
    if (isTeams) {
      // Microsoft Teams Adaptive Card format
      const teamsPayload = {
        type: "message",
        attachments: [
          {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
              $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
              type: "AdaptiveCard",
              version: "1.4",
              body: [
                {
                  type: "TextBlock",
                  text: "🏢 Visitor Arrival",
                  weight: "Bolder",
                  size: "Medium",
                },
                {
                  type: "FactSet",
                  facts: [
                    { title: "Visitor", value: visitorName },
                    ...(visitorCompany ? [{ title: "Company", value: visitorCompany }] : []),
                    { title: "Purpose", value: purpose },
                    { title: "Host", value: hostName },
                    { title: "Time", value: time },
                  ],
                },
                {
                  type: "TextBlock",
                  text: "Please head to reception to greet your visitor.",
                  wrap: true,
                  size: "Small",
                  color: "Accent",
                },
              ],
            },
          },
        ],
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamsPayload),
      });

      return response.ok;
    } else {
      // Slack Block Kit format
      const slackPayload = {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🏢 Visitor Arrival",
              emoji: true,
            },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Visitor:*\n${visitorName}` },
              { type: "mrkdwn", text: `*Host:*\n${hostName}` },
              ...(visitorCompany
                ? [{ type: "mrkdwn", text: `*Company:*\n${visitorCompany}` }]
                : []),
              { type: "mrkdwn", text: `*Purpose:*\n${purpose}` },
              { type: "mrkdwn", text: `*Arrived:*\n${time}` },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "Please head to reception to greet your visitor.",
              },
            ],
          },
        ],
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackPayload),
      });

      return response.ok;
    }
  } catch (error) {
    console.error("Slack/Teams notification error:", error);
    return false;
  }
}
