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

    // Clave de NVIDIA como variable de entorno (en Vercel: NVIDIA_API_KEY).
    // Nunca escribas la clave directamente en este archivo: el repo es público.
    const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

    if (!NVIDIA_API_KEY) {
      console.error('NVIDIA_API_KEY no está configurada');
      return res.status(500).json({ error: 'Configuración del servidor incorrecta' });
    }

    // Llamar a la API de NVIDIA (compatible con OpenAI)
    // Modelo ligero y rápido: Laguna XS 2.1 de Poolside (solo 3B activos por token)
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "poolside/laguna-xs-2.1",
        messages: messages,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de NVIDIA:', errorData);
      throw new Error(`Error en API de NVIDIA: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Devolver respuesta al frontend
    res.status(200).json(data);

  } catch (error) {
    console.error('Error en /api/chat:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}
