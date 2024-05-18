import { NextApiRequest, NextApiResponse } from "next"
import { Scenario, Option } from '@/types';
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

if(!process.env.PROMPT_DESCRIPTION) {
  throw new Error("Need to set environment variable: PROMPT_DESCRIPTION")
}
if(!process.env.PROMPT_OPTION_1) {
  throw new Error("Need to set environment variable: PROMPT_OPTION_1")
}
if(!process.env.PROMPT_OPTION_2) {
  throw new Error("Need to set environment variable: PROMPT_OPTION_2")
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const scenario = {
      "description": process.env.PROMPT_DESCRIPTION,
      "options": [process.env.PROMPT_OPTION_1, process.env.PROMPT_OPTION_2]
    }
    res.status(200).json(scenario)
  } else if (req.method === 'POST') {
    var messages: ChatCompletionRequestMessage[] = [];

    messages.push({ "role": ChatCompletionRequestMessageRoleEnum.System, "content": "You are a choose-your-own adventure game. The game should be entertaining, silly and include puns." });
    req.body.scenarios.map((scenario: Scenario) => {
      const optionString = scenario.options.join('\n');

      messages.push({
        "role": ChatCompletionRequestMessageRoleEnum.Assistant,
        "content": scenario.description + "\nDo you:\n" + optionString
      });
      messages.push({
        "role": ChatCompletionRequestMessageRoleEnum.User,
        "content": scenario.chosenOption || 'No option chosen'
      });
    })
    console.log("Input messages:", messages);
    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages,
    });

    const message = completion.data.choices[0].message?.content;
    if (!message)
      return;
    console.log("Output message: ", message);
    const DESCRIPTION_REGEX = /^(.*)\n/g;
    const OPTIONS_REGEX = /[A-Z]\) (.*)/g;
    const match = DESCRIPTION_REGEX.exec(message);
    if (!match || match.length === 0)
      return;
    var description = match[0]
    var options = Array.from(message.matchAll(OPTIONS_REGEX)).map(match => match[0]);
    var scenario = {
      description,
      options
    }

    res.status(200).json(scenario);
  }
}