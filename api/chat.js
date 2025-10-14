export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { messages } = req.body;

    // Validar que hay mensajes
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Mensajes requeridos' });
    }

    // Tu clave privada como variable de entorno
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY no está configurada');
      return res.status(500).json({ error: 'Configuración del servidor incorrecta' });
    }

    // Llamar a la API de Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2-instruct-0905",
        messages: messages,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de Groq:', errorData);
      throw new Error(`Error en API de Groq: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Devolver respuesta al frontend
    res.status(200).json(data);

  } catch (error) {
    console.error('Error en /api/chat:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}