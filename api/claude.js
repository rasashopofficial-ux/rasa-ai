console.log("ANTHROPIC_KEY exists:", !!process.env.ANTHROPIC_KEY);

const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    console.log("KEY VALUE:", process.env.ANTHROPIC_KEY?.slice(0,15));'x-api-key': process.env.ANTHROPIC_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify(req.body),
});
