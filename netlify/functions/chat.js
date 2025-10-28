import OpenAI from "openai";
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
const RATE_LIMIT=30,WINDOW=60000;
const cache=new Map();

export default async function handler(req,res){
  if(req.method!=="POST"){res.statusCode=405;return res.end("Method not allowed");}
  const ip=req.headers["x-forwarded-for"]||req.connection.remoteAddress;
  const now=Date.now();
  const arr=cache.get(ip)||[];
  const recent=arr.filter(t=>now-t<WINDOW);
  if(recent.length>=RATE_LIMIT){res.statusCode=429;return res.end("Rate limit exceeded");}
  recent.push(now);cache.set(ip,recent);

  try{
    const {system,messages}=JSON.parse(req.body||"{}");
    if(!Array.isArray(messages))throw new Error("Invalid payload");

    res.writeHead(200,{
      "Content-Type":"text/plain",
      "Transfer-Encoding":"chunked",
      "Cache-Control":"no-store"
    });
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),25000);

    const stream=await openai.chat.completions.create({
      model:"gpt-4o-mini",
      temperature:0.4,
      messages:[{role:"system",content:system},...messages],
      stream:true
    },{signal:controller.signal});

    for await(const chunk of stream){
      const token=chunk.choices?.[0]?.delta?.content||"";
      res.write(token);
    }
    clearTimeout(timeout);
    res.end();
  }catch(e){
    console.error(e);
    if(!res.headersSent)res.writeHead(500,{"Content-Type":"text/plain"});
    res.end("Server error");
  }
}
