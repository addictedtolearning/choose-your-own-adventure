import { NextApiRequest, NextApiResponse } from "next"
import { Scenario, Option } from '@/types';
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const scenario = {
      "description": "You are invited to clown college in Sydney.",
      "options": ["A) Accept the invitation and become a clown", "B) Refuse the invitation, and instead become a DJ."]
    }
    res.status(200).json(scenario)
  } else if (req.method === 'POST') {
    var messages: ChatCompletionRequestMessage[] = [];

    messages.push({ "role": ChatCompletionRequestMessageRoleEnum.System, "content": "You are a choose-your-own adventure game." });
    req.body.scenarios.map((scenario: Scenario) => {
      // const optionString = scenario.options.map( (option:types.Option, idx:number) => String.fromCharCode(65+idx)+') ' + option + '\n');
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
    messages.splice(2, 0, { "role": ChatCompletionRequestMessageRoleEnum.User, "content": "You are now a comedian, and give hilarious scenarios and options for the user in this choose-your-own adventure game." })
    console.log("Input messages:", messages);
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
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