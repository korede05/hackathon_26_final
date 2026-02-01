serve(async (req) => {
  // 1. HANDLE PREFLIGHT (This fixes the "HTTP ok status" error)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userA, userB } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    // ... your fetch to OpenAI here ...
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        /* your existing OpenAI config */
    })
    const result = await aiResponse.json()
    
    // 2. ATTACH HEADERS TO SUCCESS RESPONSE
    return new Response(result.choices[0].message.content, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    // 3. ATTACH HEADERS TO ERROR RESPONSE
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})