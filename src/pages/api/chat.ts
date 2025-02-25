// import type { NextApiRequest, NextApiResponse } from 'next';
// import  Configuration, {OpenAI} from 'openai';

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAI(configuration);

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     try {
//       const { message } = req.body;
//       const completion = await openai.createChatCompletion({
//         model: 'gpt-3.5-turbo',
//         messages: [{ role: 'user', content: message }],
//       });

//       const reply = completion.data.choices[0]?.message?.content || '';
//       res.status(200).json({ reply });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ reply: 'Error occurred while processing your request.' });
//     }
//   } else {
//     res.status(405).json({ message: 'Method not allowed' });
//   }
// }
